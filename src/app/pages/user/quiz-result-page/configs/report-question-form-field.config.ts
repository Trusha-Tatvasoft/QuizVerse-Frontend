import { Validators } from '@angular/forms';
import { DynamicFormField } from '../../../../shared/interfaces/dynamic-form-field.interface';

export const reportQuestionFormField: DynamicFormField[] = [
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'Enter your report description...',
    icon: 'report',
    validators: [Validators.required, Validators.maxLength(255)],
    validationMessages: {
      required: 'Description is required.',
      maxlength: 'Description must not exceed 255 characters.',
    },
  },
];
