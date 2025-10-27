import { Validators } from '@angular/forms';
import { ButtonConfig } from '../../../../shared/interfaces/button-config.interface';
import { ConfirmationDialogData } from '../../../../shared/interfaces/confirmation-dialog.interface';
import { DynamicFormField } from '../../../../shared/interfaces/dynamic-form-field.interface';
import { EmailTemplateType } from '../../../../shared/enums/email-template.enum';

export const emailTemplateFormFields: DynamicFormField[] = [
  {
    name: 'templateType',
    label: 'Template Type*',
    type: 'select',
    placeholder: 'Select template type',
    icon: 'category',
    options: Object.keys(EmailTemplateType)
      .filter((k) => isNaN(Number(k)) === true)
      .map((key) => ({
        label: key.replace(/([A-Z])/g, ' $1').trim(),
        value: EmailTemplateType[key as keyof typeof EmailTemplateType],
      })),
    validators: [Validators.required],
    validationMessages: {
      required: 'Template type is required.',
    },
  },
  {
    name: 'title',
    label: 'Template Title*',
    type: 'text',
    placeholder: 'Internal title for this template',
    icon: 'title',
    validators: [
      Validators.required,
      Validators.maxLength(255),
      Validators.pattern(/^[A-Za-z0-9][A-Za-z0-9 .,!?\-_@#]*$/),
    ],
    validationMessages: {
      required: 'Template title is required.',
      maxlength: 'Must not exceed 255 characters.',
      pattern: 'Must start with a letter or number.',
    },
  },
  {
    name: 'subject',
    label: 'Email Subject*',
    type: 'text',
    placeholder: 'Email subject line',
    icon: 'subject',
    validators: [Validators.required, Validators.pattern(/^[A-Za-z0-9][A-Za-z0-9 .,!?\-_@#]*$/)],
    validationMessages: {
      required: 'Email subject is required.',
      pattern: 'Must start with a letter or number.',
    },
  },
  {
    name: 'body',
    label: 'Email Body*',
    type: 'textarea',
    placeholder: 'Email content (use {{variable}} for dynamic content)',
    icon: 'description',
    validators: [
      Validators.required,
      Validators.maxLength(20000),
      Validators.pattern(/^(?!\s).*$/),
    ],
    validationMessages: {
      required: 'Email body is required.',
      maxlength: 'Email body must not exceed 20000 characters.',
      pattern: 'Email body cannot start with a space.',
    },
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    placeholder: 'Select status',
    icon: 'toggle_on',
    options: [
      { label: 'Active', value: true },
      { label: 'Inactive', value: false },
    ],
    validators: [],
  },
];

export const submitButtonConfig: ButtonConfig = {
  label: 'Submit',
  fontWeight: 500,
  variant: 'secondary',
  type: 'submit',
};

export const cancelButtonConfig: ButtonConfig = {
  label: 'Cancel',
  fontWeight: 500,
  variant: 'secondary',
  type: 'button',
};

export const previewButtonConfig: ButtonConfig = {
  label: 'Preview Template',
  fontWeight: 500,
  variant: 'secondary',
  type: 'button',
};

export const noteButtonConfig: ButtonConfig = {
  label: 'Note',
  fontWeight: 500,
  variant: 'secondary',
  type: 'button',
};

// Config for the "Delete Dialog"
export const deleteButtonConfig: ButtonConfig = {
  label: 'Delete Email Template',
  fontWeight: 500,
  variant: 'secondary',
  type: 'button',
};

export const deleteEmailTemplateDialog: ConfirmationDialogData = {
  title: 'Delete Email Template',
  message:
    'Are you sure you want to delete this email template? This action cannot be undone. All template data will be permanently deleted.',
  confirmButtonConfig: deleteButtonConfig,
  cancelButtonConfig: cancelButtonConfig,
};

// Config for active/inactive dialog

export const activateButtonConfig: ButtonConfig = {
  label: 'Activate Email Template',
  variant: 'secondary',
};

export const inactivateButtonConfig: ButtonConfig = {
  label: 'Inactivate Email Template',
  variant: 'secondary',
};

export const activateEmailTemplateDialog: ConfirmationDialogData = {
  title: 'Activate Email Template',
  message: 'Are you sure you want to activate this Email Template?',
  confirmButtonConfig: activateButtonConfig,
  cancelButtonConfig: cancelButtonConfig,
};

export const inactivateEmailTemplateDialog: ConfirmationDialogData = {
  title: 'Inactivate Email Template',
  message: 'Are you sure you want to inactivate this Email Template?',
  confirmButtonConfig: inactivateButtonConfig,
  cancelButtonConfig: cancelButtonConfig,
};
