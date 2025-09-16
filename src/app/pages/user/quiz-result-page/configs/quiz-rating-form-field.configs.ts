import { DynamicFormField } from '../../../../shared/interfaces/dynamic-form-field.interface';

export const quizRatingFormField: DynamicFormField[] = [
  {
    name: 'rating',
    type: 'star-rating', // custom render in template
    label: 'Your Rating',
    placeholder: '',
    validators: [],
  },
  {
    name: 'feedback',
    type: 'textarea',
    label: 'Feedback (optional)',
    placeholder: 'Write your feedback here...',
    validators: [], // explicitly empty
  },
];
