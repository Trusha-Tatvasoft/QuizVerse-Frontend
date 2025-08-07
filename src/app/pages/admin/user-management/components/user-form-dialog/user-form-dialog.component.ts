import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RegisterComponent } from '../../../../../core/auth/components/register/register.component';
import { UserFormData } from '../../interfaces/user-form-data.interface';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-user-form-dialog',
  imports: [CommonModule, ReactiveFormsModule, RegisterComponent, MatIconModule],
  templateUrl: './user-form-dialog.component.html',
  styleUrl: './user-form-dialog.component.scss',
})
export class UserFormDialogComponent {
  @Input() user: UserFormData | null = null;

  @Output() closeDialog = new EventEmitter<void>();
  @Output() saveUser = new EventEmitter<{ formData: FormData; isEdit: boolean }>();

  userForm!: FormGroup;
  isSubmitting = false;

  get isEditMode(): boolean {
    return !!this.user;
  }

  handleCancel(): void {
    this.closeDialog.emit();
  }

  handleBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeDialog.emit();
    }
  }

  onRegisterSaveUser(event: { formData: FormData; isEdit: boolean }) {
    this.saveUser.emit(event);
  }
}
