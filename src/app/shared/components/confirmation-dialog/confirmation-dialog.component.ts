import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ConfirmationDialogData } from '../../interfaces/confirmation-dialog.interface';
import { OutlineButtonComponent } from '../outline-button/outline-button.component';
import { FilledButtonComponent } from '../filled-button/filled-button.component';

/**
 * A reusable, flexible confirmation dialog component.
 * Accepts a title, message, optional image, and customizable button configs.
 *
 * Usage:
 * Inject via MatDialog and provide `ConfirmationDialogData` as data.
 * The dialog returns `true` if confirmed, `false` if cancelled.
 */

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    OutlineButtonComponent,
    FilledButtonComponent,
  ],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss',
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData,
  ) {
    // Apply default labels and variants if not provided
    this.data = applyDefaultDialogConfig(data);
  }

  /**
   * Triggered when the cancel button is clicked.
   * Closes the dialog with `false` (cancel action).
   */
  onCancelClick(): void {
    this.dialogRef.close(false);
  }

  /**
   * Triggered when the confirm button is clicked.
   * Closes the dialog with `true` (confirm action).
   */
  onConfirmClick(): void {
    this.dialogRef.close(true);
  }
}

/**
 * Utility to apply default values for button labels and variants.
 * Ensures graceful fallback when button config is partially missing.
 */
function applyDefaultDialogConfig(data: ConfirmationDialogData): ConfirmationDialogData {
  return {
    ...data,
    cancelButtonConfig: {
      ...data.cancelButtonConfig,
      label: data.cancelButtonConfig?.label || 'Cancel',
      variant: data.cancelButtonConfig?.variant || 'secondary',
    },
    confirmButtonConfig: {
      ...data.confirmButtonConfig,
      label: data.confirmButtonConfig?.label || 'Delete',
      variant: data.confirmButtonConfig?.variant || 'secondary',
    },
  };
}
