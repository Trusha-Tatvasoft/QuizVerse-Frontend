import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ConfirmationDialogData } from '../../interfaces/confirmation-dialog.interface';
import { OutlineButtonComponent } from '../outline-button/outline-button.component';
import { FilledButtonComponent } from '../filled-button/filled-button.component';

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
    // Set default button labels and variants
    this.data = applyDefaultDialogConfig(data);
  }

  // Close dialog with false on cancel
  onCancelClick(): void {
    this.dialogRef.close(false);
  }

  // Close dialog with true on confirm
  onConfirmClick(): void {
    this.dialogRef.close(true);
  }
}

// Set fallback values for button configs
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
