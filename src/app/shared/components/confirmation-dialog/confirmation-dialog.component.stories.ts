import { Meta, StoryFn } from '@storybook/angular';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import { moduleMetadata } from '@storybook/angular';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ConfirmationDialogData } from '../../interfaces/constants.static';

export default {
  title: 'Dialogs/ConfirmationDialog',
  component: ConfirmationDialogComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [CommonModule, MatDialogModule, MatButtonModule],
      providers: [
        {
          provide: MatDialogRef,
          useValue: { close: () => {} },
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {},
        },
      ],
    }),
  ],
  argTypes: {
    confirm: { action: 'confirm clicked' },
    cancel: { action: 'cancel clicked' },
  },
} as Meta<ConfirmationDialogComponent>;

const Template: StoryFn = (args: any) => ({
  component: ConfirmationDialogComponent,
  props: {
    data: args.data,
    confirm: args.confirm,
    cancel: args.cancel,
  },
  providers: [
    { provide: MAT_DIALOG_DATA, useValue: args.data },
    { provide: MatDialogRef, useValue: { close: () => {} } },
  ],
});

export const Default = Template.bind({});
Default.args = {
  data: {
    title: 'Delete Category',
    message: 'Are you sure you want to delete this category?',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    imageUrl: 'assets/images/alert-triangle.svg',
  } as ConfirmationDialogData,
};

export const WithImage = Template.bind({});
WithImage.args = {
  data: {
    title: 'Delete Product',
    message: 'This action cannot be undone.',
    imageUrl: 'assets/images/alert-triangle.svg',
  } as ConfirmationDialogData,
};

export const NoImage = Template.bind({});
NoImage.args = {
  data: {
    title: 'Remove Access',
    message: 'Do you want to remove user access to this project?',
    confirmText: 'Yes, remove',
    cancelText: 'Cancel',
  } as ConfirmationDialogData,
};

export const NoConfirmOrCancelText = Template.bind({});
NoConfirmOrCancelText.args = {
  data: {
    title: 'Delete Entry',
    message: 'Do you want to proceed?',
    imageUrl: 'assets/images/alert-triangle.svg',
  } as ConfirmationDialogData,
};

export const Minimal = Template.bind({});
Minimal.args = {
  data: {
    title: 'Confirm Action',
    message: 'Are you sure?',
  } as ConfirmationDialogData,
};
