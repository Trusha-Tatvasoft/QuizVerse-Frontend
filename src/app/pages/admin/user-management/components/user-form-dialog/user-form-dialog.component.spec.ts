import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserFormDialogComponent } from './user-form-dialog.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Role } from '../../../../../shared/enums/role';

describe('UserFormDialogComponent', () => {
  let component: UserFormDialogComponent;
  let fixture: ComponentFixture<UserFormDialogComponent>;
  let dialogRefMock: { close: jest.Mock };

  beforeEach(async () => {
    dialogRefMock = { close: jest.fn() };
  });

  describe('Add mode (userData is null)', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [UserFormDialogComponent, HttpClientTestingModule],
        providers: [
          { provide: MatDialogRef, useValue: dialogRefMock },
          { provide: MAT_DIALOG_DATA, useValue: { user: null, role: null } },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      }).compileComponents();

      fixture = TestBed.createComponent(UserFormDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should be in Add mode', () => {
      expect(component.isEditMode).toBe(false);
    });

    it('should return null for userData', () => {
      expect(component.userData).toBeNull();
    });

    it('should return null for role', () => {
      expect(component.role).toBeNull();
    });

    it('should return false for isSuperAdmin when role is null', () => {
      expect(component.isSuperAdmin()).toBe(false);
    });

    it('should close the dialog when handleCancel is called', () => {
      component.handleCancel();
      expect(dialogRefMock.close).toHaveBeenCalledWith();
    });

    it('should close the dialog with data when onRegisterSaveUser is called', () => {
      const payload = { formData: new FormData(), isEdit: false };
      component.onRegisterSaveUser(payload);
      expect(dialogRefMock.close).toHaveBeenCalledWith(payload);
    });
  });

  describe('Edit mode (userData is present)', () => {
    const mockUserData = { id: 1, fullName: 'John' };

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [UserFormDialogComponent, HttpClientTestingModule],
        providers: [
          { provide: MatDialogRef, useValue: dialogRefMock },
          { provide: MAT_DIALOG_DATA, useValue: { user: mockUserData, role: Role.SuperAdmin } },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      }).compileComponents();

      fixture = TestBed.createComponent(UserFormDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should be in Edit mode', () => {
      expect(component.isEditMode).toBe(true);
    });

    it('should return userData correctly', () => {
      expect(component.userData).toEqual(mockUserData);
    });

    it('should return role correctly', () => {
      expect(component.role).toBe(Role.SuperAdmin);
    });

    it('should return true for isSuperAdmin when role is SuperAdmin', () => {
      expect(component.isSuperAdmin()).toBe(true);
    });

    it('should close the dialog when handleCancel is called', () => {
      component.handleCancel();
      expect(dialogRefMock.close).toHaveBeenCalledWith();
    });

    it('should close the dialog with data when onRegisterSaveUser is called', () => {
      const payload = { formData: new FormData(), isEdit: true };
      component.onRegisterSaveUser(payload);
      expect(dialogRefMock.close).toHaveBeenCalledWith(payload);
    });
  });

  describe('isSuperAdmin method', () => {
    it('should return false when role is not SuperAdmin', async () => {
      await TestBed.configureTestingModule({
        imports: [UserFormDialogComponent, HttpClientTestingModule],
        providers: [
          { provide: MatDialogRef, useValue: dialogRefMock },
          { provide: MAT_DIALOG_DATA, useValue: { user: null, role: 'Admin' } },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      }).compileComponents();

      fixture = TestBed.createComponent(UserFormDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.isSuperAdmin()).toBe(false);
    });
  });
});
