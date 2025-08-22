import { Component, inject } from '@angular/core';
import { OutlineButtonComponent } from '../../../../../../../shared/components/outline-button/outline-button.component';
import {
  downloadCsvBtn,
  downloadExcelBtn,
  importQuestionFormFields,
  uploadButtonConfig,
} from '../../../../configs/question-pool-dialog.config';
import { cancelButtonConfig, submitButtonConfig } from '../../../../configs/question-pool.config';
import { FilledButtonComponent } from '../../../../../../../shared/components/filled-button/filled-button.component';
import { MatIconModule } from '@angular/material/icon';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { QuestionFormDialogComponent } from '../../../question-form-dialog/question-form-dialog.component';
import { QuestionPoolService } from '../../../../../../../services/admin/question-pool/question-pool.service';
import { ImportQuestionPreviewComponent } from '../import-question-preview/import-question-preview.component';
import { QuestionPoolListData } from '../../../../interfaces/question-pool-list-data.interface';
import { Observable } from 'rxjs';
import { SnackbarService } from '../../../../../../../shared/service/snackbar/snackbar.service';
import { MatInputModule } from '@angular/material/input';
import { EndPoints } from '../../../../../../../shared/enums/end-point.enum';
import {
  allowedImportQuestionFileTypes,
  platformMessages,
} from '../../../../../../../utils/constants';
import { DynamicFormField } from '../../../../../../../shared/interfaces/dynamic-form-field.interface';
import { ValidationErrorService } from '../../../../../../../shared/service/validation-error/validation-error.service';

@Component({
  selector: 'app-import-question-form',
  imports: [
    OutlineButtonComponent,
    FilledButtonComponent,
    MatIconModule,
    ReactiveFormsModule,
    MatInputModule,
  ],
  templateUrl: './import-question-form.component.html',
  styleUrl: './import-question-form.component.scss',
})
export class ImportQuestionFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef<QuestionFormDialogComponent>);
  private readonly questionPoolService = inject(QuestionPoolService);
  private readonly snackbar = inject(SnackbarService);
  private readonly validationErrorService = inject(ValidationErrorService);

  // Button configs
  downloadCsvBtn = downloadCsvBtn;
  downloadExcelBtn = downloadExcelBtn;
  uploadButton = uploadButtonConfig;
  submitBtn = submitButtonConfig;
  cancelBtn = cancelButtonConfig;

  // Form group
  uploadForm!: FormGroup;
  fileFormatError: boolean = false;
  fileFormatErrorMessage: string = '';

  // Selected file
  selectedFile: File | null = null;
  fields: DynamicFormField[] = importQuestionFormFields;

  ngOnInit(): void {
    this.buildForm();
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

  getError(fieldName: string): string | null {
    const control = this.uploadForm.get(fieldName);
    if (!control) return null;

    const field = this.fields.find((f) => f.name === fieldName);
    const messages = field?.validationMessages ?? {};

    return this.validationErrorService.getErrorMessage(control, messages, fieldName);
  }

  DownloadCsv() {
    this.downloadFile(`${EndPoints.DownloardSampleCsv}`);
  }

  DownloadExcel() {
    this.downloadFile(`${EndPoints.DownloardSampleExcel}`);
  }

  private downloadFile(fileUrl: string) {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileUrl.split('/').pop() || 'file';
    link.click();
  }

  FileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input?.files?.length) {
      const file = input.files[0];
      const fileName = file.name.toLowerCase();
      const control = this.uploadForm.get('file');
      const allowedTypes = allowedImportQuestionFileTypes;

      control?.setErrors(null);

      // allowed extensions check
      if (!allowedTypes.includes(file.type)) {
        control?.setErrors({ fileType: true });
        control?.markAsTouched();
        this.selectedFile = null;
        return;
      }

      this.selectedFile = file;
      this.uploadForm.patchValue({ file });

      let request$: Observable<QuestionPoolListData[]>;
      if (fileName.endsWith('.csv')) {
        request$ = this.questionPoolService.previewQuestionsFromCsv(file);
      } else {
        request$ = this.questionPoolService.previewQuestionsFromExcel(file);
      }

      request$.subscribe({
        next: (questions) => {
          this.openPreviewDialog(questions);
        },
        error: (err) => this.snackbar.showError('Error', err.error.message),
      });
    }
  }

  clearSelectedFile(fileInput: HTMLInputElement) {
    this.selectedFile = null;
    this.uploadForm.patchValue({ file: null });
    fileInput.value = '';
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

  get displayFileName(): string {
    if (this.selectedFile?.name) {
      return this.selectedFile.name;
    }
    const fileValue = this.uploadForm.get('file')?.value;
    if (typeof fileValue === 'string') {
      return fileValue.split('/').pop() || 'No file chosen';
    }
    return 'No file chosen';
  }
}
