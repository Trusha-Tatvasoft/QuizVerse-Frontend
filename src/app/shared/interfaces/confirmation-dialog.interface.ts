// Defines the structure for confirmation dialog input data

import { ButtonConfig } from './button-config.interface';

/**
 * Data structure passed to the ConfirmationDialogComponent.
 */
export interface ConfirmationDialogData {
  title: string; // Title of the dialog
  message: string; // Body message text
  confirmButtonConfig: ButtonConfig; // Optional config for the confirm button
  cancelButtonConfig: ButtonConfig; // Optional config for the cancel button
  imageUrl?: string; // Optional icon/image to display
}
