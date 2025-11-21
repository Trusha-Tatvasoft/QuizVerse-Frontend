import { Component, inject } from '@angular/core';
import { FilledButtonComponent } from '../../../../../../../shared/components/filled-button/filled-button.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { DynamicFormField } from '../../../../../../../shared/interfaces/dynamic-form-field.interface';
import { promptTextAreaFormFields } from '../../../../configs/question-pool-dialog.config';
import { generateQueButtonConfig } from '../../../../configs/question-pool.config';
import {
  GenerateQuestionFromPromptRequest,
  GenerateQuizRequest,
} from '../../../../interfaces/question-pool-ai-tab.interface';
import { filter, Subject, takeUntil } from 'rxjs';
import { SnackbarService } from '../../../../../../../shared/service/snackbar/snackbar.service';
import { ValidationErrorService } from '../../../../../../../shared/service/validation-error/validation-error.service';
import { AiQuestionTabComponent } from '../../ai-question-tab.component';
import { QuestionPoolService } from '../../../../../../../services/admin/question-pool/question-pool.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { QuestionFormDialogComponent } from '../../../question-form-dialog/question-form-dialog.component';
import { QuestionPoolListData } from '../../../../interfaces/question-pool-list-data.interface';
import { ImportQuestionPreviewComponent } from '../../../manual-question-tab/components/import-question-preview/import-question-preview.component';
import {
  generateQuestionFormTextPromptMessages,
  platformMessages,
} from '../../../../../../../utils/constants';

@Component({
  selector: 'app-from-text',
  imports: [
    FilledButtonComponent,
    ReactiveFormsModule,
    MatInputModule,
    MatIconModule,
    CommonModule,
  ],
  templateUrl: './from-text.component.html',
  styleUrl: './from-text.component.scss',
})
export class FromTextComponent {
  promptForm!: FormGroup;
  promptText: string = '';
  fields: DynamicFormField[] = promptTextAreaFormFields;
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
    this.promptForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateGenerateButtonState();
    });
  }

  generateQuestion(): void {
    const promptControl = this.promptForm.get('prompt');
    if (!promptControl?.valid) {
      promptControl?.markAsTouched();
      this.snackbar.showError(
        platformMessages.errorTitle,
        generateQuestionFormTextPromptMessages.enterValidPrompt,
      );
      return;
    }

    if (!this.quizConfig || !this.quizConfig.questionSpec?.length) {
      this.snackbar.showError(platformMessages.errorTitle, platformMessages.aiConfigRequired);
      return;
    }

    const requestPayload: GenerateQuestionFromPromptRequest = {
      ...this.quizConfig,
      prompt: promptControl.value?.trim(),
    };

    // TODO: Call backend API with requestPayload here
    this.questionPoolService.generateQuestionsFromTextPrompt(requestPayload).subscribe({
      next: (response) => {
        this.snackbar.showSuccess(
          platformMessages.successTitle,
          generateQuestionFormTextPromptMessages.questionGeneratedSuccess,
        );
        this.openPreviewDialog(response.data);
      },
      error: (err) => {
        const message =
          err?.error?.message || generateQuestionFormTextPromptMessages.questionGeneratedFailed;
        this.snackbar.showError(platformMessages.errorTitle, message);
      },
    });
  }

  getError(fieldName: string): string | null {
    const control = this.promptForm.get(fieldName);
    if (!control) return null;
    const field = this.fields.find((f) => f.name === fieldName);
    const messages = field?.validationMessages ?? {};
    return this.validationErrorService.getErrorMessage(control, messages, fieldName);
  }

  updateGenerateButtonState(): void {
    const promptControl = this.promptForm.get('prompt');
    const isPromptValid = !!promptControl && promptControl.valid;
    const hasConfig = !!this.quizConfig?.questionSpec?.length;

    this.generateBtnConfig = {
      ...generateQueButtonConfig,
      isDisabled: !(isPromptValid && hasConfig),
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildForm() {
    this.promptForm = this.fb.group({});
    this.fields.forEach((field) => {
      this.promptForm.addControl(
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
