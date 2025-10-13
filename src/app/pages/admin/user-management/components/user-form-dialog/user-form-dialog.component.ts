import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RegisterComponent } from '../../../../../core/auth/components/register/register.component';
import { UserFormData } from '../../interfaces/user-form-data.interface';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Role } from '../../../../../shared/enums/role';

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
  readonly dialogData = inject<{ user: UserFormData | null; role: string | null }>(MAT_DIALOG_DATA);

  get userData(): UserFormData | null {
    return this.dialogData.user;
  }

  get role(): string | null {
    return this.dialogData.role;
  }

  get isEditMode(): boolean {
    return !!this.userData;
  }

  handleCancel(): void {
    this.dialogRef.close();
  }

  onRegisterSaveUser(event: { formData: FormData; isEdit: boolean }) {
    this.dialogRef.close(event);
  }

  isSuperAdmin(): boolean {
    return this.role === Role.SuperAdmin;
  }
}
