import { Component, inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { SnackbarService } from '../../../../../../../shared/service/snackbar/snackbar.service';
import { ValidationErrorService } from '../../../../../../../shared/service/validation-error/validation-error.service';
import { DynamicFormField } from '../../../../../../../shared/interfaces/dynamic-form-field.interface';
import { FilledButtonComponent } from '../../../../../../../shared/components/filled-button/filled-button.component';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import {
  importPdfFormFields,
  uploadButtonConfig,
} from '../../../../configs/question-pool-dialog.config';
import { allowedPDFType, platformMessages } from '../../../../../../../utils/constants';
import { generateQueButtonConfig } from '../../../../configs/question-pool.config';
import {
  GenerateQuizRequest,
  GenerateQuizFromPDFRequest,
} from '../../../../interfaces/question-pool-ai-tab.interface';
import { filter, Subject, takeUntil } from 'rxjs';
import { AiQuestionTabComponent } from '../../ai-question-tab.component';

@Component({
  selector: 'app-from-pdf',
  imports: [
    FilledButtonComponent,
    ReactiveFormsModule,
    MatInputModule,
    MatIconModule,
    CommonModule,
  ],
  templateUrl: './from-pdf.component.html',
  styleUrl: './from-pdf.component.scss',
})
export class FromPdfComponent {
  @Input() pdfFileSelected?: (file: File | null) => void;

  uploadForm!: FormGroup;
  selectedFile: File | null = null;

  fields: DynamicFormField[] = importPdfFormFields;
  uploadButton = uploadButtonConfig;
  generateBtnConfig = { ...generateQueButtonConfig, isDisabled: true };

  quizConfig: GenerateQuizRequest | null = null;

  private readonly destroy$ = new Subject<void>();

  private readonly fb = inject(FormBuilder);
  private readonly snackbar = inject(SnackbarService);
  private readonly validationErrorService = inject(ValidationErrorService);
  private readonly aiComponent = inject(AiQuestionTabComponent);

  ngOnInit(): void {
    this.buildForm();

    this.aiComponent.quizConfig$
      .pipe(
        takeUntil(this.destroy$),
        filter((config): config is GenerateQuizRequest => config !== null),
      )
      .subscribe((config) => {
        this.quizConfig = config;
        this.updateGenerateButtonState();
      });
  }

  get displayFileName(): string {
    return this.selectedFile?.name || 'No file chosen';
  }

  fileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input?.files?.length) {
      const file = input.files[0];
      const control = this.uploadForm.get('file');
      const allowedTypes = allowedPDFType;

      control?.setErrors(null);

      if (!allowedTypes.includes(file.type) || !file.name.toLowerCase().endsWith('.pdf')) {
        control?.setErrors({ fileType: true });
        control?.markAsTouched();
        this.selectedFile = null;
        this.pdfFileSelected?.(null);
        this.updateGenerateButtonState();
        return;
      }

      this.selectedFile = file;
      this.uploadForm.patchValue({ file });
      this.pdfFileSelected?.(file);
      this.updateGenerateButtonState();
    }
  }

  clearSelectedFile(fileInput: HTMLInputElement) {
    this.selectedFile = null;
    this.uploadForm.patchValue({ file: null });
    fileInput.value = '';
    this.pdfFileSelected?.(null);
    this.updateGenerateButtonState();
  }

  generateQuestion(): void {
    if (!this.selectedFile) {
      this.snackbar.showError(platformMessages.errorTitle, platformMessages.uploadFileRequired);
      return;
    }

    if (!this.quizConfig || !this.quizConfig.questionSpec?.length) {
      this.snackbar.showError(platformMessages.errorTitle, platformMessages.aiConfigRequired);
      return;
    }

    const requestPayload: GenerateQuizFromPDFRequest = {
      ...this.quizConfig,
      prompt: this.selectedFile,
    };

    // call to BE service here
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
    this.generateBtnConfig = {
      ...generateQueButtonConfig,
      isDisabled: !this.selectedFile || !this.quizConfig?.questionSpec?.length,
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
}
