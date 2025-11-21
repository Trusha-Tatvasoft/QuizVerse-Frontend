import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { SnackbarService } from '../../../../../../../shared/service/snackbar/snackbar.service';
import { ValidationErrorService } from '../../../../../../../shared/service/validation-error/validation-error.service';
import { DynamicFormField } from '../../../../../../../shared/interfaces/dynamic-form-field.interface';
import { FilledButtonComponent } from '../../../../../../../shared/components/filled-button/filled-button.component';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import {
  importQuestionFromWebFormFields,
  uploadButtonConfig,
} from '../../../../configs/question-pool-dialog.config';
import {
  fetchContentFromUrlMessages,
  platformMessages,
} from '../../../../../../../utils/constants';
import { generateQueButtonConfig } from '../../../../configs/question-pool.config';
import {
  GenerateQuizRequest,
  GenerateQuestionFromWebUrlRequest,
} from '../../../../interfaces/question-pool-ai-tab.interface';
import { filter, Subject, takeUntil } from 'rxjs';
import { AiQuestionTabComponent } from '../../ai-question-tab.component';
import { QuestionPoolService } from '../../../../../../../services/admin/question-pool/question-pool.service';
import { QuestionPoolListData } from '../../../../interfaces/question-pool-list-data.interface';
import { ImportQuestionPreviewComponent } from '../../../manual-question-tab/components/import-question-preview/import-question-preview.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { QuestionFormDialogComponent } from '../../../question-form-dialog/question-form-dialog.component';

@Component({
  selector: 'app-from-web-page',
  imports: [
    FilledButtonComponent,
    ReactiveFormsModule,
    MatInputModule,
    MatIconModule,
    CommonModule,
  ],
  templateUrl: './from-web-page.component.html',
  styleUrl: './from-web-page.component.scss',
})
export class FromWebPageComponent {
  uploadForm!: FormGroup;

  fields: DynamicFormField[] = importQuestionFromWebFormFields;
  uploadButton = uploadButtonConfig;
  generateBtnConfig = { ...generateQueButtonConfig, isDisabled: true };

  quizConfig: GenerateQuizRequest | null = null;

  private readonly destroy$ = new Subject<void>();
  private readonly fb = inject(FormBuilder);
  private readonly snackbar = inject(SnackbarService);
  private readonly validationErrorService = inject(ValidationErrorService);
  private readonly aiComponent = inject(AiQuestionTabComponent);
  private readonly questionPoolService = inject(QuestionPoolService);
  private readonly dialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef<QuestionFormDialogComponent>);

  ngOnInit(): void {
    this.buildForm();

    // Subscribe to quizConfig changes
    this.aiComponent.quizConfig$
      .pipe(
        takeUntil(this.destroy$),
        filter((config): config is GenerateQuizRequest => config !== null),
      )
      .subscribe((config) => {
        this.quizConfig = config;
        this.updateGenerateButtonState();
      });

    // Subscribe to form changes to enable/disable button dynamically
    this.uploadForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateGenerateButtonState();
    });
  }

  generateQuestion(): void {
    const urlControl = this.uploadForm.get('url');
    if (!urlControl?.valid) {
      urlControl?.markAsTouched();
      this.snackbar.showError(
        platformMessages.errorTitle,
        fetchContentFromUrlMessages.enterValidUrl,
      );
      return;
    }

    if (!this.quizConfig || !this.quizConfig.questionSpec?.length) {
      this.snackbar.showError(platformMessages.errorTitle, platformMessages.aiConfigRequired);
      return;
    }

    const requestPayload: GenerateQuestionFromWebUrlRequest = {
      ...this.quizConfig,
      url: urlControl.value,
    };

    this.questionPoolService.getQuestionsUsingWebUrl(requestPayload).subscribe({
      next: (response) => {
        if (response.result) {
          this.snackbar.showSuccess(
            platformMessages.successTitle,
            fetchContentFromUrlMessages.questionGeneratedSuccess,
          );
          this.openPreviewDialog(response.data);
        }
      },
      error: (err) => {
        const message = err?.error?.message || fetchContentFromUrlMessages.questionGeneratedFailed;
        this.snackbar.showError(platformMessages.errorTitle, message);
      },
    });
  }

  getError(fieldName: string): string | null {
    const control = this.uploadForm.get(fieldName);
    if (!control) return null;
    const field = this.fields.find((f) => f.name === fieldName);
    const messages = field?.validationMessages ?? {};
    return this.validationErrorService.getErrorMessage(control, messages, fieldName);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateGenerateButtonState(): void {
    const urlControl = this.uploadForm.get('url');
    const isUrlValid = !!urlControl && urlControl.valid;
    const hasConfig = !!this.quizConfig?.questionSpec?.length;

    this.generateBtnConfig = {
      ...generateQueButtonConfig,
      isDisabled: !(isUrlValid && hasConfig),
    };
  }

  private buildForm() {
    this.uploadForm = this.fb.group({});
    this.fields.forEach((field) => {
      this.uploadForm.addControl(
        field.name,
        this.fb.control('', (field.validators as ValidatorFn[]) || []),
      );
    });
  }

  private openPreviewDialog(questions: QuestionPoolListData[]) {
    const dialogRef = this.dialog.open(ImportQuestionPreviewComponent, {
      minWidth: '50vw',
      maxWidth: '100vw',
      maxHeight: '90vh',
      data: questions,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.dialogRef.close(true);
      }
    });
  }
}
