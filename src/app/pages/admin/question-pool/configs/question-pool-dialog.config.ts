import { Validators } from '@angular/forms';
import { ButtonConfig } from '../../../../shared/interfaces/button-config.interface';
import { DynamicFormField } from '../../../../shared/interfaces/dynamic-form-field.interface';

export const downloadCsvBtn: ButtonConfig = {
  label: 'Download CSV Template',
  matIcon: 'file_download',
  variant: 'secondary',
  type: 'button',
  fontWeight: 500,
};

export const downloadExcelBtn: ButtonConfig = {
  label: 'Download Excel Template',
  matIcon: 'file_download',
  variant: 'secondary',
  type: 'button',
  fontWeight: 500,
};

export const uploadButtonConfig: ButtonConfig = {
  label: 'Choose File',
  variant: 'secondary',
  fontWeight: 500,
};

//#region Create Question Manual
export function buildBaseFields(): DynamicFormField[] {
  return [
    {
      name: 'category',
      label: 'Category*',
      type: 'select',
      placeholder: 'Select category',
      validators: [Validators.required],
      options: [],
      validationMessages: { required: 'Category is required.' },
      gridClass: 'col-span-2',
    },
    {
      name: 'type',
      label: 'Question Type*',
      type: 'select',
      placeholder: 'Select question type',
      validators: [Validators.required],
      options: [],
      validationMessages: { required: 'Question type is required.' },
      gridClass: 'col-span-2 sm:col-span-1',
    },
    {
      name: 'difficulty',
      label: 'Difficulty*',
      type: 'select',
      placeholder: 'Select difficulty',
      validators: [Validators.required],
      options: [],
      validationMessages: { required: 'Difficulty is required.' },
      gridClass: 'col-span-2 sm:col-span-1',
    },
    {
      name: 'questionText',
      label: 'Question*',
      type: 'textarea',
      placeholder: 'Enter your question...',
      icon: 'help_outline',
      validators: [Validators.required, Validators.pattern(/^$|^\S[\s\S]*$/)],
      validationMessages: {
        required: 'Question text is required.',
        pattern: 'Question should not start with a space.',
      },
      gridClass: 'col-span-2',
    },
  ];
}

export function buildFieldsByQuestionType(type: number): DynamicFormField[] {
  switch (type) {
    case 1:
      return [
        {
          name: 'option1',
          label: 'Option 1*',
          type: 'text',
          placeholder: 'Option 1',
          validators: [Validators.required],
          validationMessages: {
            required: 'Option 1 is required.',
            notUnique: 'All options must be unique.',
          },
          gridClass: 'col-span-2 sm:col-span-1',
        },
        {
          name: 'option2',
          label: 'Option 2*',
          type: 'text',
          placeholder: 'Option 2',
          validators: [Validators.required],
          validationMessages: {
            required: 'Option 2 is required.',
            notUnique: 'All options must be unique.',
          },
          gridClass: 'col-span-2 sm:col-span-1',
        },
        {
          name: 'option3',
          label: 'Option 3*',
          type: 'text',
          placeholder: 'Option 3',
          validators: [Validators.required],
          validationMessages: {
            required: 'Option 3 is required.',
            notUnique: 'All options must be unique.',
          },
          gridClass: 'col-span-2 sm:col-span-1',
        },
        {
          name: 'option4',
          label: 'Option 4*',
          type: 'text',
          placeholder: 'Option 4',
          validators: [Validators.required],
          validationMessages: {
            required: 'Option 4 is required.',
            notUnique: 'All options must be unique.',
          },
          gridClass: 'col-span-2 sm:col-span-1',
        },
        {
          name: 'correctAnswer',
          label: 'Correct Answer*',
          type: 'select',
          placeholder: 'Select correct answer',
          validators: [Validators.required],
          validationMessages: { required: 'Correct answer is required.' },
          gridClass: 'col-span-2',
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' },
            { value: 'option4', label: 'Option 4' },
          ],
        },
      ];
    case 2:
      return [
        {
          name: 'correctAnswer',
          label: 'Correct Answer*',
          type: 'select',
          placeholder: 'Select answer',
          options: [
            { value: 'true', label: 'True' },
            { value: 'false', label: 'False' },
          ],
          validators: [Validators.required],
          validationMessages: { required: 'Correct answer is required.' },
          gridClass: 'col-span-2',
        },
      ];
    case 3:
      return [
        {
          name: 'correctAnswer',
          label: 'Correct Answer*',
          type: 'textarea',
          placeholder: 'Enter detailed answer',
          validators: [Validators.required],
          validationMessages: { required: 'Correct answer is required.' },
          gridClass: 'col-span-2',
        },
      ];
    case 4:
      return [
        {
          name: 'correctAnswer',
          label: 'Correct Answer*',
          type: 'text',
          placeholder: 'Enter correct answer',
          validators: [Validators.required],
          validationMessages: { required: 'Correct answer is required.' },
          gridClass: 'col-span-2',
        },
      ];
    default:
      return [];
  }
}

export const importQuestionFormFields: DynamicFormField[] = [
  {
    name: 'file',
    label: 'Upload File',
    type: 'file',
    placeholder: 'Choose a file',
    icon: 'upload',
    validators: [Validators.required],
    validationMessages: {
      required: 'A file is required.',
      fileType: 'Only .csv, .xls, or .xlsx formats are allowed.',
    },
  },
];
