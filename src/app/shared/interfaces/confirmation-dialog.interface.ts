import { ButtonConfig } from './button-config.interface';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmButtonConfig: ButtonConfig;
  cancelButtonConfig: ButtonConfig;
  imageUrl?: string;
}
