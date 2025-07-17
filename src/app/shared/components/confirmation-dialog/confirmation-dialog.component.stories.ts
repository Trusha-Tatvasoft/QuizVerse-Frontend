import { Meta, StoryFn } from '@storybook/angular';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import { moduleMetadata } from '@storybook/angular';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ConfirmationDialogData } from '../../interfaces/confirmation-dialog.interface';
import { OutlineButtonComponent } from '../outline-button/outline-button.component';
import { FilledButtonComponent } from '../filled-button/filled-button.component';

export default {
  title: 'Components/ConfirmationDialog',
  component: ConfirmationDialogComponent,
  tags: ['autodocs'],
  decorators: [
    // Inject required Angular Material and shared modules/components for rendering the dialog
    moduleMetadata({
      imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        OutlineButtonComponent,
        FilledButtonComponent,
      ],
      providers: [
        // Stub MatDialogRef for standalone Storybook rendering
        {
          provide: MatDialogRef,
          useValue: { close: (value: boolean) => console.log('Dialog closed with:', value) },
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {},
        },
      ],
    }),
  ],
} as Meta<ConfirmationDialogComponent>;

// Template to reuse for each story variant
const Template: StoryFn = (args: any) => ({
  component: ConfirmationDialogComponent,
  props: {
    data: args.data,
  },
  providers: [
    { provide: MAT_DIALOG_DATA, useValue: args.data },
    {
      provide: MatDialogRef,
      useValue: { close: (value: boolean) => console.log('Dialog closed with:', value) },
    },
  ],
});

// Dialog variant that includes an icon/image
export const WithImage = Template.bind({});
WithImage.args = {
  data: {
    title: 'Delete Notification',
    message: 'This action will permanently remove the notification from your inbox.',
    confirmButtonConfig: {
      label: 'Delete',
      variant: 'primary',
    },
    cancelButtonConfig: {
      label: 'Cancel',
      variant: 'secondary',
    },
    imageUrl: 'assets/images/alert-triangle.svg',
  } as ConfirmationDialogData,
};

// Dialog without an image/icon
export const NoImage = Template.bind({});
NoImage.args = {
  data: {
    title: 'Unassign User',
    message: 'Are you sure you want to unassign this user from the project?',
    confirmButtonConfig: {
      label: 'Unassign',
      variant: 'primary',
    },
    cancelButtonConfig: {
      label: 'Keep',
      variant: 'secondary',
    },
  } as ConfirmationDialogData,
};

// Dialog where confirm and cancel text are omitted to test defaults
export const NoConfirmOrCancelText = Template.bind({});
NoConfirmOrCancelText.args = {
  data: {
    title: 'Discard Changes',
    message: 'Do you want to discard your unsaved changes?',
    // Intentionally leaving out button configs to test default fallback
    imageUrl: 'assets/images/alert-triangle.svg',
  } as ConfirmationDialogData,
};

// Minimal dialog with only title and message
export const Minimal = Template.bind({});
Minimal.args = {
  data: {
    title: 'Exit Editor',
    message: 'Are you sure you want to exit? All unsaved changes will be lost.',
  } as ConfirmationDialogData,
};
