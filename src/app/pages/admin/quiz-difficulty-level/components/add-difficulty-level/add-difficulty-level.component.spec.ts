import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AddDifficultyLevelComponent } from './add-difficulty-level.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { map, of, tap, throwError } from 'rxjs';
import { QuizDifficultyLevelService } from '../../../../../services/admin/quiz-difficulty-level/quiz-difficulty-level.service';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { ValidationErrorService } from '../../../../../shared/service/validation-error/validation-error.service';
import { platformMessages } from '../../../../../utils/constants';

describe('AddDifficultyLevelComponent (Jest)', () => {
  let component: AddDifficultyLevelComponent;
  let fixture: ComponentFixture<AddDifficultyLevelComponent>;

  const mockDialogRef = {
    close: jest.fn(),
  };

  const mockSnackbarService = {
    showError: jest.fn(),
  };

  const mockValidationErrorService = {
    getErrorMessage: jest.fn().mockReturnValue('Field error'),
  };

  const mockDifficultyService = {
    checkNameExists: jest.fn(),
    createDifficultyLevel: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: SnackbarService, useValue: mockSnackbarService },
        { provide: QuizDifficultyLevelService, useValue: mockDifficultyService },
        { provide: ValidationErrorService, useValue: mockValidationErrorService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddDifficultyLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.difficultyForm).toBeDefined();
    expect(component.difficultyForm.get('name')?.value).toBe('');
  });

  it('should return server error message if present', () => {
    component.serverErrors['name'] = 'Already exists';
    component.difficultyForm.get('name')?.setErrors({ server: true });
    const error = component.getError('name');
    expect(error).toBe('Already exists');
  });

  it('should return validation error if server error not present', () => {
    component.difficultyForm.get('name')?.setErrors({ required: true });
    const error = component.getError('name');
    expect(error).toBe('Field error');
  });

  it('should clear server error if name is available', fakeAsync(() => {
    mockDifficultyService.checkNameExists.mockReturnValueOnce(
      of({ result: true, message: '', statusCode: 200, data: true }),
    );
    const control = component.difficultyForm.get('name');
    control?.setErrors({ server: true });
    control?.setValue('NewName');
    component.validateName();
    tick();
    expect(component.serverErrors['name']).toBe('');
    expect(control?.hasError('server')).toBe(false);
  }));

  it('should clear server error when name is available', fakeAsync(() => {
    component.serverErrors['name'] = 'Some old error';
    component.difficultyForm.get('name')?.setErrors({ server: true });

    const response = { result: true, message: 'Available' };
    mockDifficultyService.checkNameExists.mockReturnValueOnce(of(response));

    component.difficultyForm.get('name')?.setValue('uniqueName');
    component.validateName();
    tick();

    expect(component.serverErrors['name']).toBe('');
    expect(component.difficultyForm.get('name')?.hasError('server')).toBe(false);
  }));

  it('should set server error for 4xx HTTP error without showing snackbar', fakeAsync(() => {
    const errorResponse = { status: 409, error: { message: 'Conflict: name exists' } };
    mockDifficultyService.checkNameExists.mockReturnValueOnce(throwError(() => errorResponse));

    component.difficultyForm.get('name')?.setValue('conflictName');
    component.validateName();
    tick();

    expect(component.serverErrors['name']).toBe('Conflict: name exists');
    expect(component.difficultyForm.get('name')?.hasError('server')).toBe(true);
    expect(mockSnackbarService.showError).not.toHaveBeenCalled();
  }));

  it('should do nothing when name is empty', () => {
    component.difficultyForm.get('name')?.setValue('');
    component.validateName();
    expect(mockDifficultyService.checkNameExists).not.toHaveBeenCalled();
  });

  it('should do nothing when control is invalid', () => {
    const control = component.difficultyForm.get('name');
    control?.setValue('a');
    control?.setErrors({ required: true });
    component.validateName();
    expect(mockDifficultyService.checkNameExists).not.toHaveBeenCalled();
  });

  it('should mark form as touched and return if form is invalid', () => {
    const markSpy = jest.spyOn(component.difficultyForm, 'markAllAsTouched');
    component.onSubmit();
    expect(markSpy).toHaveBeenCalled();
  });

  it('should submit valid form and close dialog on success', fakeAsync(() => {
    component.difficultyForm.setValue({ name: 'Test', description: 'Desc' });
    mockDifficultyService.createDifficultyLevel.mockReturnValueOnce(
      of({ result: true, message: 'Created', statusCode: 200, data: null }),
    );
    component.onSubmit();
    tick();
    expect(mockDialogRef.close).toHaveBeenCalledWith('Created');
  }));

  it('should show error if API response is failure on submit', fakeAsync(() => {
    component.difficultyForm.setValue({ name: 'Test', description: 'Desc' });
    mockDifficultyService.createDifficultyLevel.mockReturnValueOnce(
      of({ result: false, message: 'Failed', statusCode: 400, data: null }),
    );
    component.onSubmit();
    tick();
    expect(mockSnackbarService.showError).toHaveBeenCalledWith('Error!', 'Failed');
  }));

  it('should show error on API error response', fakeAsync(() => {
    component.difficultyForm.setValue({ name: 'Test', description: 'Desc' });
    const err = { error: { message: 'Internal Error' }, statusCode: 500 };
    mockDifficultyService.createDifficultyLevel.mockReturnValueOnce(throwError(() => err));
    component.onSubmit();
    tick();
    expect(mockSnackbarService.showError).toHaveBeenCalledWith('Error!', 'Internal Error');
  }));

  it('should close dialog on cancel', () => {
    component.onCancel();
    expect(mockDialogRef.close).toHaveBeenCalledWith(null);
  });

  it('should clear server error if name is available and had server error before', fakeAsync(() => {
    const control = component.difficultyForm.get('name');

    control?.setValue('UniqueName');
    control?.markAsTouched();

    component.serverErrors['name'] = 'Some error';

    mockDifficultyService.checkNameExists.mockReturnValueOnce(
      of({ result: true, message: '', statusCode: 200, data: true }),
    );

    component.validateName();
    tick();

    expect(component.serverErrors['name']).toBe('');
    expect(control?.hasError('server')).toBeFalsy();
  }));

  it('should remove server error from control if name becomes available', fakeAsync(() => {
    const control = component.difficultyForm.get('name');

    control?.setValue('UniqueName');
    control?.setErrors(null);
    component.serverErrors['name'] = 'Some previous error';

    mockDifficultyService.checkNameExists.mockReturnValueOnce(
      of(null).pipe(
        tap(() => control?.setErrors({ server: true })),
        map(() => ({ result: true, message: '', statusCode: 200, data: true })),
      ),
    );

    component.validateName();
    tick();

    expect(component.serverErrors['name']).toBe('');
    expect(control?.hasError('server')).toBe(false);
    expect(control?.errors).toBeNull();
  }));

  it('should create form controls with correct validators from config', () => {
    component.difficultyFields.forEach((field) => {
      const control = component.difficultyForm.get(field.name);
      expect(control).toBeTruthy();
      if (field.validators?.length) {
        control?.setValue('');
        expect(control?.invalid).toBe(true);
      }
    });
  });

  it('should return platformMessages.errorMessage when server error exists but no server error message is set', () => {
    const control = component.difficultyForm.get('name');
    control?.setErrors({ server: true });
    component.serverErrors['name'] = undefined as any;
    const error = component.getError('name');
    expect(error).toBe(platformMessages.errorMessage);
  });

  it('should return early in validateName if value is empty', () => {
    const spy = jest.spyOn(mockDifficultyService, 'checkNameExists');
    component.difficultyForm.get('name')?.setValue(''); // empty value
    component.validateName();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should return early in validateName if control is invalid', () => {
    const spy = jest.spyOn(mockDifficultyService, 'checkNameExists');
    const control = component.difficultyForm.get('name');
    control?.setValue('SomeName');
    control?.setErrors({ required: true }); // invalid
    component.validateName();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should show platformMessages.errorMessage if API returns failure without message', fakeAsync(() => {
    component.difficultyForm.setValue({ name: 'Test', description: 'Desc' });
    mockDifficultyService.createDifficultyLevel.mockReturnValueOnce(
      of({ result: false, message: '', statusCode: 400, data: null }),
    );
    component.onSubmit();
    tick();
    expect(mockSnackbarService.showError).toHaveBeenCalledWith(
      `Error!`,
      platformMessages.errorMessage,
    );
  }));

  it('should show platformMessages.errorMessage if API error has no message', fakeAsync(() => {
    component.difficultyForm.setValue({ name: 'Test', description: 'Desc' });
    const err = { error: {}, statusCode: 500 }; // no message in error object
    mockDifficultyService.createDifficultyLevel.mockReturnValueOnce(throwError(() => err));
    component.onSubmit();
    tick();
    expect(mockSnackbarService.showError).toHaveBeenCalledWith(
      `Error!`,
      platformMessages.errorMessage,
    );
  }));

  it('should use platformMessages.errorMessage if API error has no message', fakeAsync(() => {
    component.difficultyForm.setValue({ name: 'Test', description: 'Desc' });
    const err = { error: {}, statusCode: 500 }; // no message
    mockDifficultyService.createDifficultyLevel.mockReturnValueOnce(throwError(() => err));

    component.onSubmit();
    tick();

    expect(mockSnackbarService.showError).toHaveBeenCalledWith(
      'Error!',
      platformMessages.errorMessage,
    );
  }));

  it('should show snackbar error when backend returns 5xx error', fakeAsync(() => {
    const errorResponse = { error: { message: 'Internal Server Error' }, status: 500 };

    mockDifficultyService.checkNameExists.mockReturnValueOnce(throwError(() => errorResponse));

    component.difficultyForm.get('name')?.setValue('test');
    component.validateName();
    tick();

    expect(mockSnackbarService.showError).toHaveBeenCalledWith(
      `${platformMessages.errorTitle}`,
      'Internal Server Error',
    );
  }));

  it('should use platformMessages.errorMessage when backend does not send message', fakeAsync(() => {
    const errorResponse = { error: {}, status: 500 }; // no message key

    mockDifficultyService.checkNameExists.mockReturnValueOnce(throwError(() => errorResponse));

    component.difficultyForm.get('name')?.setValue('test');
    component.validateName();
    tick();

    expect(mockSnackbarService.showError).toHaveBeenCalledWith(
      `${platformMessages.errorTitle}`,
      platformMessages.errorMessage,
    );
  }));
});
