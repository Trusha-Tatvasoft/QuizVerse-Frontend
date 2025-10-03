import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserFormDialogComponent } from './user-form-dialog.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

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
          { provide: MAT_DIALOG_DATA, useValue: null },
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
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [UserFormDialogComponent, HttpClientTestingModule],
        providers: [
          { provide: MatDialogRef, useValue: dialogRefMock },
          { provide: MAT_DIALOG_DATA, useValue: { id: 1, fullName: 'John' } },
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
});
