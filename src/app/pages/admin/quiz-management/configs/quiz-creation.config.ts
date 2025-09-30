import { Validators } from '@angular/forms';
import { DynamicFormField } from '../../../../shared/interfaces/dynamic-form-field.interface';
import { ButtonConfig } from '../../../../shared/interfaces/button-config.interface';
import { ColumnDef } from '../../../../shared/interfaces/table-component.interface';
import { ConfirmationDialogData } from '../../../../shared/interfaces/confirmation-dialog.interface';

// Header section config for Quiz Creation page
export const quizCreationHeaderConfig = {
  icon: 'quiz',
  title: 'Create New Quiz',
  subtitle: 'Design and configure a new quiz for the platform',
  theme: 'user' as const,
};

export const stepsToCreateQuiz = [
  { heading: 'Create Quiz', description: 'Basic quiz information' },
  { heading: 'Question Method', description: 'Choose creation method' },
  { heading: 'Add Questions', description: 'Create or select questions' },
  { heading: 'Review', description: 'Review and publish' },
];

export const questionAdditionOptionsInManualMethod = [
  {
    icon: 'add',
    title: 'Create Questions Manually',
    description: 'Add new questions from scratch',
    iconColor: 'secondary-icon',
  },
  {
    icon: 'search',
    title: 'Select Questions from Pool',
    description: 'Choose from existing questions',
    iconColor: 'light-green-icon',
  },
  {
    icon: 'upload',
    title: 'Import from CSV/Excel',
    description: 'Upload questions from file',
    iconColor: 'primary-icon',
  },
];

export const questionCreationMethodsOptions = [
  {
    icon: 'description',
    title: 'Add Questions Manually',
    description: 'Create questions one by one or select from existing pool',
    iconColor: 'secondary-icon',
  },
  {
    icon: 'auto_awesome',
    title: 'Generate Questions with AI',
    description: 'Use AI to generate questions from text, URL, or PDF',
    iconColor: 'primary-icon',
  },
  {
    icon: 'description',
    title: 'Use a Combination of Both',
    description: 'Mix manual creation with AI generation',
    iconColor: 'secondary-icon',
    secondIcon: 'auto_awesome',
    secondIconColor: 'primary-icon',
  },
];

export const quizCreationFormFields: DynamicFormField[] = [
  {
    name: 'quizTitle',
    label: 'Quiz Title',
    type: 'text',
    placeholder: 'Enter quiz title',
    validators: [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(255),
      Validators.pattern(/^[A-Za-z0-9][A-Za-z0-9 .,!?\-_@#]*$/),
    ],
    validationMessages: {
      required: 'Quiz Title is required.',
      minlength: 'Quiz Title must be at least 1 characters.',
      maxlength: 'Quiz Title must not exceed 255 characters.',
      pattern: 'Quiz Title cannot start with a space or special character.',
    },
    gridClass: 'col-span-1 sm:col-span-1',
  },
  {
    name: 'quizCategory',
    label: 'Quiz Category',
    type: 'select',
    placeholder: 'Select quiz category',
    validators: [Validators.required],
    options: [
      { value: 'easy', label: 'Easy' },
      { value: 'medium', label: 'Medium' },
      { value: 'hard', label: 'Hard' },
    ],
    validationMessages: {
      required: 'Quiz Category Level is required.',
    },
    gridClass: 'col-span-1 sm:col-span-1',
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'Enter quiz description',
    validators: [
      Validators.required,
      Validators.maxLength(500),
      Validators.pattern(/^[A-Za-z0-9][A-Za-z0-9 .,!?\-_@#]*$/),
    ],
    validationMessages: {
      required: 'Description is required.',
      maxlength: 'Description must not exceed 500 characters.',
      pattern: 'Quiz Description cannot start with a space or special character.',
    },
    gridClass: 'col-span-1 sm:col-span-2',
  },
  {
    name: 'quizTiming',
    label: 'Quiz Timing (minutes)',
    type: 'number',
    placeholder: 'Enter quiz timing',
    validators: [Validators.required, Validators.min(2), Validators.max(180)],
    validationMessages: {
      min: 'Quiz timing must be at least 2 minutes.',
      max: 'Quiz timing cannot exceed 180 minutes.',
    },
    gridClass: 'col-span-1 sm:col-span-1',
  },
  {
    name: 'difficultyLevel',
    label: 'Difficulty Level',
    type: 'select',
    placeholder: 'Select difficulty level',
    validators: [Validators.required],
    options: [
      { value: 'easy', label: 'Easy' },
      { value: 'medium', label: 'Medium' },
      { value: 'hard', label: 'Hard' },
    ],
    validationMessages: {
      required: 'Difficulty Level is required.',
    },
    gridClass: 'col-span-1 sm:col-span-1',
  },
  {
    name: 'isPaid',
    label: 'Is Paid Quiz?',
    type: 'checkbox',
    placeholder: '',
    validators: [],
    gridClass: 'col-span-1 sm:col-span-1',
  },
  {
    name: 'price',
    label: 'Price (in ₹)',
    type: 'number',
    placeholder: 'Enter quiz price',
    validators: [Validators.min(1)],
    validationMessages: {
      min: 'Price cannot be less than 1.',
    },
    gridClass: 'col-span-1 sm:col-span-1',
  },
  {
    name: 'tags',
    label: 'Tags',
    type: 'text',
    placeholder: 'Add tags to help categorize your quiz',
    validators: [Validators.minLength(1), Validators.maxLength(255)],
    validationMessages: {
      minlength: 'Tags must be at least 1 characters.',
      maxlength: 'Tags must not exceed 255 characters.',
    },
    gridClass: 'col-span-1 sm:col-span-1',
  },
  {
    name: 'easyQuestions',
    label: 'Easy Questions',
    type: 'number',
    placeholder: 'No of easy questions',
    validators: [Validators.maxLength(255), Validators.required],
    validationMessages: {
      required: 'No of Easy Questions is required.',
    },
    gridClass: 'col-span-3 sm:col-span-1',
  },
  {
    name: 'mediumQuestions',
    label: 'Medium Questions',
    type: 'number',
    placeholder: 'No of medium questions',
    validators: [Validators.maxLength(255), Validators.required],
    validationMessages: {
      required: 'No of Medium Questions is required.',
    },
    gridClass: 'col-span-3 sm:col-span-1',
  },
  {
    name: 'hardQuestions',
    label: 'Hard Questions',
    type: 'number',
    placeholder: 'No of hard questions',
    validators: [Validators.maxLength(255), Validators.required],
    validationMessages: {
      required: 'No of Hard Questions is required.',
    },
    gridClass: 'col-span-3 sm:col-span-1',
  },
];

export const nextButtonConfig: ButtonConfig = {
  label: 'Next',
  fontWeight: 500,
  variant: 'gradient',
  type: 'submit',
  matIcon: 'keyboard_arrow_right',
  imagePosition: 'right',
};

export const publishQuizButtonConfig: ButtonConfig = {
  label: 'Publish Quiz',
  fontWeight: 500,
  variant: 'gradient',
  type: 'submit',
};

export const addTagButtonConfig: ButtonConfig = {
  label: 'Add',
  fontWeight: 500,
  type: 'button',
  variant: 'secondary',
};

export const saveDraftButtonConfig: ButtonConfig = {
  label: 'Save Draft',
  fontWeight: 500,
  type: 'button',
};

export const selectQuestionMethodPrimaryButtonConfig: ButtonConfig = {
  label: 'Coming Soon',
  fontWeight: 500,
  type: 'button',
  variant: 'primary',
};

export const selectQuestionMethodSecondaryButtonConfig: ButtonConfig = {
  label: 'Add',
  fontWeight: 500,
  type: 'button',
  variant: 'secondary',
};

export const addQuestionButtonConfig: ButtonConfig = {
  label: 'Add Question',
  fontWeight: 500,
  type: 'button',
  variant: 'secondary',
};

export const selectQuestionMethodDefaultButtonConfig: ButtonConfig = {
  label: 'Coming Soon',
  fontWeight: 500,
  type: 'button',
  variant: 'gradient',
};

export const chooseFileButtonConfig: ButtonConfig = {
  label: 'Choose File',
  type: 'button',
  variant: 'secondary',
};

export const downloadCsvButtonConfig: ButtonConfig = {
  label: 'Download CSV Template',
  type: 'button',
  variant: 'secondary',
  matIcon: 'download',
  imagePosition: 'left',
};
export const downloadExelButtonConfig: ButtonConfig = {
  label: 'Download Excel Template',
  type: 'button',
  variant: 'secondary',
  matIcon: 'download',
  imagePosition: 'left',
};

export const changeQuestionMethodButtonConfig: ButtonConfig = {
  label: 'Change Method',
  fontWeight: 500,
  type: 'button',
  variant: 'secondary',
};

export const exportCsvButtonConfig: ButtonConfig = {
  label: 'Export CSV',
  type: 'button',
  variant: 'secondary',
  matIcon: 'download',
};

export const previewQuizButtonConfig: ButtonConfig = {
  label: 'Preview Quiz',
  type: 'button',
  variant: 'secondary',
  matIcon: 'remove_red_eye',
};

export const backButtonConfig: ButtonConfig = {
  label: 'Back',
  fontWeight: 500,
  variant: 'gradient',
  type: 'submit',
  matIcon: 'keyboard_arrow_left',
  imagePosition: 'left',
};

//form in step 3 quiz creation
export const questionFormFieldForAddQuestionManually: DynamicFormField[] = [
  {
    name: 'type',
    label: 'Question Type',
    type: 'select',
    placeholder: 'Select question type',
    validators: [Validators.required],
    options: [
      { value: 'multiple_choice', label: 'Multiple Choice' },
      { value: 'true_false', label: 'True/False' },
      { value: 'fill_blank', label: 'Fill in the Blank' },
      { value: 'short_answer', label: 'Short Answer' },
    ],
    validationMessages: {
      required: 'Question Type is required.',
    },
    gridClass: 'col-span-1',
  },
  {
    name: 'difficulty',
    label: 'Difficulty',
    type: 'select',
    placeholder: 'Select difficulty level',
    validators: [Validators.required],
    options: [
      { value: 'easy', label: 'Easy' },
      { value: 'medium', label: 'Medium' },
      { value: 'hard', label: 'Hard' },
    ],
    validationMessages: {
      required: 'Difficulty level is required.',
    },
    gridClass: 'col-span-1',
  },
  {
    name: 'questionText',
    label: 'Question',
    type: 'text',
    placeholder: 'Enter question here',
    validators: [Validators.required, Validators.pattern(/^$|^\S[\s\S]*$/)],
    validationMessages: {
      required: 'Question is required.',
      pattern: 'Question should not start with a space.',
    },
    gridClass: 'col-span-1 sm:col-span-2',
  },
  {
    name: 'option1',
    label: 'Option 1',
    type: 'text',
    placeholder: 'Option 1',
    validators: [Validators.required],
    validationMessages: {
      required: 'Option 1 is required.',
    },
    gridClass: 'col-span-1 sm:col-span-1',
  },
  {
    name: 'option2',
    label: 'Option 2',
    type: 'text',
    placeholder: 'Option 2',
    validators: [Validators.required],
    validationMessages: {
      required: 'Option 2 is required.',
    },
    gridClass: 'col-span-1 sm:col-span-1',
  },
  {
    name: 'option3',
    label: 'Option 3',
    type: 'text',
    placeholder: 'Option 3',
    validators: [Validators.required],
    validationMessages: {
      required: 'Option 3 is required.',
    },
    gridClass: 'col-span-1 sm:col-span-1',
  },
  {
    name: 'option4',
    label: 'Option 4',
    type: 'text',
    placeholder: 'Option 4',
    validators: [Validators.required],
    validationMessages: {
      required: 'Option 4 is required.',
    },
    gridClass: 'col-span-1 sm:col-span-1',
  },
  {
    name: 'correctAnswer',
    label: 'Correct Answer',
    type: 'text',
    placeholder: 'Enter correct answer',
    validators: [Validators.required],
    validationMessages: {
      required: 'Correct answer is required.',
    },
    gridClass: 'col-span-1 sm:col-span-2',
  },
];

// Config for the search input field
export const searchInputConfig = {
  placeholder: 'Search questions...',
};

export const columns: ColumnDef[] = [
  {
    key: 'queText',
    label: 'Question',
    type: 'text',
    align: 'left',
  },
  {
    key: 'queTypeName',
    label: 'Type',
    type: 'tag',
    align: 'center',
  },
  {
    key: 'queDifficultyName',
    label: 'Difficulty',
    type: 'tag',
    align: 'center',
  },
  {
    key: 'action',
    label: 'Action',
    type: 'button',
    align: 'center',
  },
];

export const cancelButtonConfig: ButtonConfig = {
  label: 'Cancel',
  variant: 'secondary',
};

export const deleteButtonConfig: ButtonConfig = {
  label: 'Delete Question',
  variant: 'secondary',
};

export const deleteQuestionDialog: ConfirmationDialogData = {
  title: 'Delete Question',
  message: 'Are you sure you want to delete this question? This action cannot be undone.',
  confirmButtonConfig: deleteButtonConfig,
  cancelButtonConfig: cancelButtonConfig,
};
