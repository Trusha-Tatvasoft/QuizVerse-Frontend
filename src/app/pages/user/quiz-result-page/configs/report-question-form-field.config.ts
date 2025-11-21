import { Validators } from '@angular/forms';
import { DynamicFormField } from '../../../../shared/interfaces/dynamic-form-field.interface';

export const reportQuestionFormField: DynamicFormField[] = [
  {
    name: 'reason',
    label: 'Description',
    type: 'textarea',
    placeholder: 'Enter your report description...',
    icon: 'report',
    validators: [Validators.required, Validators.minLength(40), Validators.maxLength(255)],
    validationMessages: {
      required: 'Description is required.',
      minlength: 'Description must be contains 40 characters.',
      maxlength: 'Description must not exceed 255 characters.',
    },
  },
];
