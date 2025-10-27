import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { AddEditQuestionDifficultyComponent } from './add-edit-question-difficulty.component';
import { QuestionDifficultyService } from '../../../../../services/admin/question-difficulty/question-difficulty.service';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { ValidationErrorService } from '../../../../../shared/service/validation-error/validation-error.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { platformMessages } from '../../../../../utils/constants';
import { QuestionDifficultyResponseDTO } from '../../interfaces/question-difficulty.interface';

describe('AddEditQuestionDifficultyComponent (Jest)', () => {
  let fixture: ComponentFixture<AddEditQuestionDifficultyComponent>;
  let component: AddEditQuestionDifficultyComponent;

  let mockService: jest.Mocked<QuestionDifficultyService>;
  let mockSnackbar: jest.Mocked<SnackbarService>;
  let mockValidation: jest.Mocked<ValidationErrorService>;
  let mockDialogRef: jest.Mocked<MatDialogRef<AddEditQuestionDifficultyComponent>>;

  const mockData: QuestionDifficultyResponseDTO = {
    id: 1,
    name: 'Easy',
    description: 'Simple',
    xpGained: 10,
    totalQuestions: 5,
  };

  beforeEach(async () => {
    mockService = {
      checkNameExists: jest.fn(),
      checkXPExists: jest.fn(),
      createQuestionDifficultyLevel: jest.fn(),
    } as any;

    mockSnackbar = {
      showError: jest.fn(),
      showSuccess: jest.fn(),
    } as any;

    mockValidation = {
      getErrorMessage: jest.fn().mockReturnValue('validation error'),
    } as any;

    mockDialogRef = {
      close: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [AddEditQuestionDifficultyComponent],
      providers: [
        FormBuilder,
        { provide: QuestionDifficultyService, useValue: mockService },
        { provide: SnackbarService, useValue: mockSnackbar },
        { provide: ValidationErrorService, useValue: mockValidation },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddEditQuestionDifficultyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize form on init', () => {
    expect(component.questionDifficultyForm).toBeDefined();
    expect(component.questionDifficultyForm.get('name')).toBeTruthy();
  });

  it('should prefill form when data is provided', () => {
    component.ngOnInit();
    expect(component.questionDifficultyForm.value.name).toBe('Easy');
    expect(component.questionDifficultyForm.value.description).toBe('Simple');
    expect(component.questionDifficultyForm.value.xpPerQuestion).toBe(10);
  });

  it('should return server error if control has server error', () => {
    component['serverErrors'] = { name: 'server error' };
    component.questionDifficultyForm.get('name')?.setErrors({ server: true });
    const error = component.getError('name');
    expect(error).toBe('server error');
  });

  it('should fallback to validationErrorService when no server error', () => {
    const error = component.getError('name');
    expect(error).toBe('validation error');
  });

  it('should clear server error when checkNameExists succeeds', () => {
    mockService.checkNameExists.mockReturnValue(
      of({ result: true, statusCode: 200, message: 'ok', data: true }),
    );

    component.questionDifficultyForm.get('name')?.setValue('NewName');
    component.validateName();

    expect(component['serverErrors']['name']).toBe('');
  });

  it('should set server error when checkNameExists fails with 400', () => {
    mockService.checkNameExists.mockReturnValue(
      throwError(() => ({ status: 400, error: { message: 'name exists' } })),
    );
    component.questionDifficultyForm.get('name')?.setValue('dup');
    component.validateName();
    expect(component['serverErrors']['name']).toBe('name exists');
  });

  it('should call snackbar on server error >= 500', () => {
    mockService.checkNameExists.mockReturnValue(throwError(() => ({ status: 500, error: {} })));
    component.questionDifficultyForm.get('name')?.setValue('err');
    component.validateName();
    expect(mockSnackbar.showError).toHaveBeenCalledWith(
      `${platformMessages.errorTitle}`,
      platformMessages.errorMessage,
    );
  });

  it('should mark form touched if invalid on submit', () => {
    component.questionDifficultyForm.get('name')?.setValue('');
    component.formSubmit();
    expect(component.questionDifficultyForm.get('name')?.touched).toBeTruthy();
  });

  it('should close dialog on successful create', () => {
    mockService.createQuestionDifficultyLevel.mockReturnValue(
      of({ result: true, statusCode: 200, message: 'ok', data: null }),
    );
    component.questionDifficultyForm.setValue({
      name: 'New',
      description: 'Desc',
      xpPerQuestion: 20,
    });
    component.formSubmit();
    expect(mockDialogRef.close).toHaveBeenCalledWith('ok');
  });

  it('should show error when create fails with response', () => {
    mockService.createQuestionDifficultyLevel.mockReturnValue(
      of({ result: false, statusCode: 400, message: '', data: null }),
    );
    component.questionDifficultyForm.setValue({
      name: 'New',
      description: 'Desc',
      xpPerQuestion: 20,
    });
    component.formSubmit();
    expect(mockSnackbar.showError).toHaveBeenCalledWith(
      `${platformMessages.errorTitle}`,
      platformMessages.errorMessage,
    );
  });

  it('should show snackbar when create throws error', () => {
    mockService.createQuestionDifficultyLevel.mockReturnValue(
      throwError(() => ({ statusCode: 500, error: {} })),
    );
    component.questionDifficultyForm.setValue({
      name: 'New',
      description: 'Desc',
      xpPerQuestion: 20,
    });
    component.formSubmit();
    expect(mockSnackbar.showError).toHaveBeenCalledWith(
      `${platformMessages.errorTitle}`,
      platformMessages.errorMessage,
    );
  });

  it('should close dialog with null on cancel', () => {
    component.cancelButtonClicked();
    expect(mockDialogRef.close).toHaveBeenCalledWith(null);
  });

  it('should show global error when checkXPExists fails with 500', fakeAsync(() => {
    mockService.checkXPExists.mockReturnValue(
      throwError(() => ({ status: 500, error: { message: 'server error' } })),
    );

    const control = component.questionDifficultyForm.get('xpPerQuestion');
    control?.setValue(20);
    control?.setErrors(null);

    component.validateXP();

    flushMicrotasks();
    expect(mockSnackbar.showError).toHaveBeenCalledWith('Error!', 'server error');
  }));

  describe('AddEditQuestionDifficultyComponent validateXP tests', () => {
    it('should clear server error when checkXPExists succeeds', fakeAsync(() => {
      // Mock service to return success
      mockService.checkXPExists.mockReturnValue(of({ result: true, statusCode: 200 } as any));

      const control = component.questionDifficultyForm.get('xpPerQuestion');
      control?.setValue(15);
      control?.setErrors({ server: true });
      control?.updateValueAndValidity({ onlySelf: true }); // <-- ensure Angular knows about the error
      component['serverErrors']['xpPerQuestion'] = 'some error';

      component.validateXP();
      tick(); // process observable

      expect(component['serverErrors']['xpPerQuestion']).toBe('');
      expect(control?.hasError('server')).toBeFalsy();
    }));

    it('should set server error when checkXPExists fails with 400', fakeAsync(() => {
      mockService.checkXPExists.mockReturnValue(
        throwError(() => ({ status: 400, error: { message: 'xp exists' } })),
      );

      const control = component.questionDifficultyForm.get('xpPerQuestion');
      control?.setValue(20); // <-- different from mockData.xpGained
      control?.setErrors(null);
      control?.updateValueAndValidity({ onlySelf: true });

      component.validateXP();
      tick();

      expect(component['serverErrors']['xpPerQuestion']).toBe('xp exists');
      expect(control?.hasError('server')).toBe(true);
    }));

    it('should show global error when checkXPExists fails with 500', fakeAsync(() => {
      mockService.checkXPExists.mockReturnValue(
        throwError(() => ({ status: 500, error: { message: 'server error' } })),
      );

      const control = component.questionDifficultyForm.get('xpPerQuestion');
      control?.setValue(20);
      control?.setErrors(null);

      component.validateXP();
      flushMicrotasks();

      expect(mockSnackbar.showError).toHaveBeenCalledWith(
        `${platformMessages.errorTitle}`,
        'server error',
      );
    }));

    it('should skip validation if value is unchanged', () => {
      const control = component.questionDifficultyForm.get('xpPerQuestion');

      // Set same value as mockData and add server error
      control?.setValue(mockData.xpGained);
      control?.setErrors({ server: true });
      control?.updateValueAndValidity({ onlySelf: true });

      component['serverErrors']['xpPerQuestion'] = 'old error';

      component.validateXP();

      // serverErrors and control error should be cleared
      expect(component['serverErrors']['xpPerQuestion']).toBe('');
      expect(control?.hasError('server')).toBeFalsy();
    });

    it('should skip validation if value is invalid', () => {
      const control = component.questionDifficultyForm.get('xpPerQuestion');
      control?.setValue(null); // invalid
      component.validateXP();

      expect(component['serverErrors']['xpPerQuestion']).toBeUndefined();
    });
  });

  it('should clear server error if value equals existing data', () => {
    const control = component.questionDifficultyForm.get('name');
    control?.setValue(mockData.name);
    control?.setErrors({ server: true });
    control?.updateValueAndValidity();
    component['serverErrors']['name'] = 'old error';

    component.validateName();

    expect(component['serverErrors']['name']).toBe('');
    expect(control?.hasError('server')).toBeFalsy();
  });

  it('should clear server error on successful checkNameExists when control had server error', fakeAsync(() => {
    mockService.checkNameExists.mockReturnValue(
      of({ result: true, statusCode: 200, message: 'ok', data: true }),
    );

    const control = component.questionDifficultyForm.get('name');
    control?.setValue('NewName');
    control?.setErrors(null);
    component['serverErrors']['name'] = 'old error';

    component.validateName();
    flushMicrotasks();

    expect(component['serverErrors']['name']).toBe('');
    expect(control?.hasError('server')).toBeFalsy();
  }));

  it('should return server error when control has server error', () => {
    const control = component.questionDifficultyForm.get('name');
    control?.setErrors({ server: true });
    component['serverErrors']['name'] = 'server error message';

    const error = component.getError('name');
    expect(error).toBe('server error message');
  });

  it('should return platform error message if serverErrors[fieldName] is undefined', () => {
    const control = component.questionDifficultyForm.get('name');
    control?.setErrors({ server: true });

    const error = component.getError('name');
    expect(error).toBe(platformMessages.errorMessage);
  });

  it('should fallback to validationErrorService when no server error', () => {
    const control = component.questionDifficultyForm.get('name');
    control?.setErrors(null);
    (component['validationErrorService'].getErrorMessage as jest.Mock).mockReturnValue(
      'validation fallback',
    );

    const error = component.getError('name');
    expect(error).toBe('validation fallback');
  });
});
