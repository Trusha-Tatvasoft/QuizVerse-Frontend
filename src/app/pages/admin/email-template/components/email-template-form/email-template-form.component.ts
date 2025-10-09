import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FilledButtonComponent } from '../../../../../shared/components/filled-button/filled-button.component';
import { OutlineButtonComponent } from '../../../../../shared/components/outline-button/outline-button.component';
import {
  submitButtonConfig,
  cancelButtonConfig,
  emailTemplateFormFields,
  previewButtonConfig,
  noteButtonConfig,
} from '../../configs/email-template-form.config';
import { ValidationErrorService } from '../../../../../shared/service/validation-error/validation-error.service';
import { CommonModule } from '@angular/common';
import { EmailTemplatePreviewDialogComponent } from '../email-template-preview-dialog/email-template-preview-dialog.component';
import { EmailTemplatesResponseDto } from '../../configs/email-template.component.config';
import { Subject, takeUntil } from 'rxjs';
import { EmailTemplateService } from '../../../../../services/admin/email-templates/email-template.service';
import {
  getEmailTemplateHtml,
  hasEmailTemplateWrapper,
} from '../../../../../utils/get-email-template-header.utils';
import { bodyPlaceholdersValidator } from './email-template-form.validator';
import { EmailTemplateType } from '../../../../../shared/enums/email-template.enum';
import { EmailTemplatesRequest } from '../../interfaces/email-template-request.interface';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { platformMessages } from '../../../../../utils/constants';

@Component({
  selector: 'app-email-template-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    OutlineButtonComponent,
    FilledButtonComponent,
    CommonModule,
    MatTooltipModule,
  ],
  templateUrl: './email-template-form.component.html',
  styleUrl: './email-template-form.component.scss',
})
export class EmailTemplateFormComponent implements OnInit, OnDestroy {
  submitBtn = submitButtonConfig;
  cancelBtn = cancelButtonConfig;
  previewBtn = previewButtonConfig;
  notesBtn = noteButtonConfig;
  fields = emailTemplateFormFields;
  showNotes = false;

  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<EmailTemplateFormComponent>);
  private readonly matDialog = inject(MatDialog);
  private readonly emailTemplateService = inject(EmailTemplateService);
  private readonly data = inject(MAT_DIALOG_DATA);
  private readonly validationErrorService = inject(ValidationErrorService);
  private readonly snackbar = inject(SnackbarService);

  private readonly destroy$ = new Subject<void>();

  mode = this.data?.mode || 'create';
  form = this.fb.group({});

  ngOnInit(): void {
    this.buildForm();

    this.form
      .get('templateType')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.form.get('body')?.updateValueAndValidity();
      });

    if (this.mode === 'edit' && this.data?.templateData) {
      this.patchFormWithTemplate(this.data.templateData);
    }
  }

  buildForm() {
    this.form = this.fb.group({});

    this.fields.forEach((field) => {
      const validators = [...((field.validators as ValidatorFn[]) || [])];

      if (field.name === 'body') {
        validators.push(
          bodyPlaceholdersValidator(() => {
            const value = this.form.get('templateType')?.value;
            return value !== undefined ? (value as EmailTemplateType) : null;
          }),
        );
      }

      this.form.addControl(field.name, this.fb.control('', validators));
    });
  }

  patchFormWithTemplate(data: EmailTemplatesRequest): void {
    if ('status' in data) {
      data.status = Boolean(data.status);
    }
    this.form.patchValue(data);
    this.form.get('body')?.updateValueAndValidity();
  }

  getError(fieldName: string): string | null {
    const control = this.form.get(fieldName);
    if (!control) return null;

    if (control.errors?.['missingPlaceholders']) {
      return `Missing placeholders: ${control.errors['missingPlaceholders']}`;
    }

    const field = this.fields.find((f) => f.name === fieldName);
    const messages = field?.validationMessages ?? {};

    return this.validationErrorService.getErrorMessage(control, messages, fieldName);
  }

  saveEmailTemplate() {
    if (this.form.valid) {
      const template: EmailTemplatesRequest = this.form.value as EmailTemplatesRequest;

      if (this.mode === 'edit' && this.data?.templateData.id) {
        template.id = this.data.templateData.id;
      } else {
        template.status = true; // active
      }

      template.body = this.wrapBodyIfNeeded(template.body || '');

      this.emailTemplateService
        .addOrEditEmailTemplate(template)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            this.snackbar.showSuccess(platformMessages.successTitle, res.message);
            this.dialogRef.close(true);
          },
          error: (err) => {
            this.snackbar.showError(
              platformMessages.errorTitle,
              err?.error?.message || platformMessages.failedToSaveTemplate,
            );
          },
        });
    } else {
      this.form.markAllAsTouched();
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  openPreviewDialog(): void {
    if (this.form.valid) {
      const template: EmailTemplatesResponseDto = this.form.value as EmailTemplatesResponseDto;

      template.body = this.wrapBodyIfNeeded(template.body || '');

      this.matDialog.open(EmailTemplatePreviewDialogComponent, {
        minWidth: '60vw',
        maxWidth: '100vw',
        data: template,
      });
    } else {
      this.form.markAllAsTouched();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  wrapBodyIfNeeded(body: string): string {
    if (!body) return '';
    if (!hasEmailTemplateWrapper(body)) {
      body = getEmailTemplateHtml(body);
      body = body.replace(/\n/g, '').replace(/\r/g, '').replace(/\s+/g, ' ').trim();
    }
    return body;
  }
}
