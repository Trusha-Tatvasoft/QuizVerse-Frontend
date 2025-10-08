import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RegisterComponent } from '../../../../../core/auth/components/register/register.component';
import { UserFormData } from '../../interfaces/user-form-data.interface';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-user-form-dialog',
  imports: [CommonModule, ReactiveFormsModule, RegisterComponent, MatIconModule, MatDialogModule],
  templateUrl: './user-form-dialog.component.html',
  styleUrl: './user-form-dialog.component.scss',
})
export class UserFormDialogComponent {
  userForm!: FormGroup;
  isSubmitting = false;

  private readonly dialogRef = inject(MatDialogRef<UserFormDialogComponent>);
  readonly userData = inject<UserFormData | null>(MAT_DIALOG_DATA);

  get isEditMode(): boolean {
    return !!this.userData;
  }

  handleCancel(): void {
    this.dialogRef.close();
  }

  onRegisterSaveUser(event: { formData: FormData; isEdit: boolean }) {
    this.dialogRef.close(event);
  }
}
