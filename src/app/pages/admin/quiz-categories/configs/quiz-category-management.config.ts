import { Validators } from '@angular/forms';
import { ButtonConfig } from '../../../../shared/interfaces/button-config.interface';
import { DynamicFormField } from '../../../../shared/interfaces/dynamic-form-field.interface';
import { TagInputConfig } from '../../../../shared/interfaces/tag-component.interface';

// Header section config for User Management page
export const quizCategoryHeaderConfig = {
  icon: 'folder_copy',
  title: 'Quiz Categories Management',
  subtitle: 'Organize quizzes by categories and subjects',
  theme: 'quiz' as const,
};

// Config for the search input field
export const searchInputConfig = {
  placeholder: 'Search categories...',
};

// Config for the "Add Category" button
export const addCategoryButtonConfig: ButtonConfig = {
  label: 'Add Category',
  matIcon: 'add',
  iconFontSet: 'material-icons',
  variant: 'secondary',
  fontWeight: 500,
};

export const createCategoryButtonConfig: ButtonConfig = {
  label: 'Create Category',
  variant: 'secondary',
  fontWeight: 500,
  type: 'submit',
};
export const categoryIconOptions = [
  { value: 'category', label: 'Category' },
  { value: 'computer', label: 'Technology' },
  { value: 'science', label: 'Science' },
  { value: 'history_edu', label: 'History' },
  { value: 'menu_book', label: 'Literature' },
  { value: 'sports_soccer', label: 'Sports' },
  { value: 'music_note', label: 'Music' },
  { value: 'palette', label: 'Art' },
];

export const quizCategoryFormFeild: DynamicFormField[] = [
  {
    name: 'name',
    label: 'Category Name*',
    type: 'text',
    placeholder: 'Name',
    icon: 'account_circle',
    validators: [Validators.required],
    validationMessages: {
      required: 'Category Name is required.',
    },
  },
  {
    name: 'description',
    label: 'Description*',
    type: 'textarea',
    placeholder: 'Tell us about quiz categories',
    icon: 'info',
    validators: [Validators.required, Validators.maxLength(255)],
    validationMessages: {
      required: 'Description is required.',
      maxlength: 'Description must not exceed 255 characters.',
    },
  },
  {
    name: 'icon',
    label: 'Category Icon',
    type: 'select',
    placeholder: 'Select an icon',
    icon: 'category',
    options: categoryIconOptions,
    validators: [],
    validationMessages: {},
  },
];

export const quizCategoryAction = {
  EDIT: 'edit',
  DELETE: 'delete',
  ACTIVATE: 'check_circle_outline',
  INACTIVATE: 'remove_circle_outline',
  PREVIEW: 'visibility',
};

export const activeTagConfig: TagInputConfig = {
  id: '',
  label: 'Active',
  type: 'static',
  hasBorder: false,
  backgroundColor: 'lightGreen',
  textColor: 'green',
  isSelected: false,
};

export const inActiveTagConfig: TagInputConfig = {
  id: '',
  label: 'InActive',
  type: 'static',
  hasBorder: false,
  backgroundColor: 'lightRed',
  textColor: 'red',
  isSelected: false,
};
