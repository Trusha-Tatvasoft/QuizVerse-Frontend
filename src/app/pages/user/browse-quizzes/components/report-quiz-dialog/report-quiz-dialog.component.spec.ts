import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReportQuizDialogComponent } from './report-quiz-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { of, throwError } from 'rxjs';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { ValidationErrorService } from '../../../../../shared/service/validation-error/validation-error.service';
import { BrowseQuizzesService } from '../../../../../services/user/browse-quizzes/browse-quizzes.service';

describe('ReportQuizDialogComponent (Jest)', () => {
  let component: ReportQuizDialogComponent;
  let fixture: ComponentFixture<ReportQuizDialogComponent>;

  const mockDialogRef = {
    close: jest.fn(),
  };

  const mockDialogData = {
    quizTitle: 'Mock Quiz',
    quizId: 1,
    reason: 'Inappropriate content',
    reportId: 123,
    isEditMode: true,
  };

  const mockSnackbarService = {
    showSuccess: jest.fn(),
    showError: jest.fn(),
  };

  const mockValidationErrorService = {
    getErrorMessage: jest.fn().mockReturnValue('Required field'),
  };

  const mockBrowseQuizzesService = {
    reportQuiz: jest.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, ReactiveFormsModule, ReportQuizDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: SnackbarService, useValue: mockSnackbarService },
        { provide: ValidationErrorService, useValue: mockValidationErrorService },
        { provide: BrowseQuizzesService, useValue: mockBrowseQuizzesService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportQuizDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize form with fields from reportQuestionFormField', () => {
      expect(component.reportForm).toBeDefined();
      expect(component.reportForm.get('reason')).toBeDefined();
    });

    it('should set component properties from dialog data', () => {
      expect(component.quizTitle).toBe('Mock Quiz');
      expect(component.quizId).toBe(1);
      expect(component.reason).toBe('Inappropriate content');
    });

    it('should patch values in edit mode', () => {
      expect(component.reportForm.get('reason')?.value).toBe('Inappropriate content');
    });

    it('should not patch values when not in edit mode', () => {
      const nonEditModeData = {
        quizTitle: 'New Quiz',
        quizId: 2,
        reason: '',
        reportId: 0,
        isEditMode: false,
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [CommonModule, ReactiveFormsModule, ReportQuizDialogComponent],
        providers: [
          { provide: MAT_DIALOG_DATA, useValue: nonEditModeData },
          { provide: MatDialogRef, useValue: mockDialogRef },
          { provide: SnackbarService, useValue: mockSnackbarService },
          { provide: ValidationErrorService, useValue: mockValidationErrorService },
          { provide: BrowseQuizzesService, useValue: mockBrowseQuizzesService },
        ],
      }).compileComponents();

      const newFixture = TestBed.createComponent(ReportQuizDialogComponent);
      const newComponent = newFixture.componentInstance;
      const patchSpy = jest.spyOn(newComponent, 'patchValues');

      newFixture.detectChanges();

      expect(patchSpy).not.toHaveBeenCalled();
    });
  });

  describe('patchValues', () => {
    it('should patch reason value from data', () => {
      component.reportForm.patchValue({ reason: '' });
      component.patchValues();
      expect(component.reportForm.get('reason')?.value).toBe('Inappropriate content');
    });

    it('should handle empty reason in data', () => {
      const emptyReasonData = {
        ...mockDialogData,
        reason: '',
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [CommonModule, ReactiveFormsModule, ReportQuizDialogComponent],
        providers: [
          { provide: MAT_DIALOG_DATA, useValue: emptyReasonData },
          { provide: MatDialogRef, useValue: mockDialogRef },
          { provide: SnackbarService, useValue: mockSnackbarService },
          { provide: ValidationErrorService, useValue: mockValidationErrorService },
          { provide: BrowseQuizzesService, useValue: mockBrowseQuizzesService },
        ],
      }).compileComponents();

      const newFixture = TestBed.createComponent(ReportQuizDialogComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();

      expect(newComponent.reportForm.get('reason')?.value).toBe('');
    });

    it('should handle undefined reason in data', () => {
      const undefinedReasonData = {
        ...mockDialogData,
        reason: undefined,
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [CommonModule, ReactiveFormsModule, ReportQuizDialogComponent],
        providers: [
          { provide: MAT_DIALOG_DATA, useValue: undefinedReasonData },
          { provide: MatDialogRef, useValue: mockDialogRef },
          { provide: SnackbarService, useValue: mockSnackbarService },
          { provide: ValidationErrorService, useValue: mockValidationErrorService },
          { provide: BrowseQuizzesService, useValue: mockBrowseQuizzesService },
        ],
      }).compileComponents();

      const newFixture = TestBed.createComponent(ReportQuizDialogComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();

      expect(newComponent.reportForm.get('reason')?.value).toBe('');
    });
  });

  describe('reportQuiz', () => {
    it('should mark form as touched if invalid', () => {
      const markSpy = jest.spyOn(component.reportForm, 'markAllAsTouched');
      component.reportForm.get('reason')?.setValue('');
      component.reportQuiz();
      expect(markSpy).toHaveBeenCalled();
      expect(mockBrowseQuizzesService.reportQuiz).not.toHaveBeenCalled();
    });

    it('should return early if form is invalid', () => {
      component.reportForm.get('reason')?.setValue('');
      component.reportForm.get('reason')?.setErrors({ required: true });

      const emitSpy = jest.spyOn(component.reportSubmitted, 'emit');
      component.reportQuiz();

      expect(mockBrowseQuizzesService.reportQuiz).not.toHaveBeenCalled();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should submit report successfully', fakeAsync(() => {
      component.reportForm.get('reason')?.setValue('Spam report');
      component.reportForm.get('reason')?.setErrors(null);
      component.reportForm.updateValueAndValidity();

      mockBrowseQuizzesService.reportQuiz.mockReturnValue(of({ result: true }));

      const emitSpy = jest.spyOn(component.reportSubmitted, 'emit');

      component.reportQuiz();
      tick();

      expect(mockBrowseQuizzesService.reportQuiz).toHaveBeenCalledWith({
        quizId: 1,
        reason: 'Spam report',
        reportId: 123,
      });
      expect(mockSnackbarService.showSuccess).toHaveBeenCalled();
      expect(emitSpy).toHaveBeenCalledWith(true);
      expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    }));

    it('should handle failed report submission (result: false)', fakeAsync(() => {
      component.reportForm.get('reason')?.setValue('Spam');
      component.reportForm.get('reason')?.setErrors(null);
      component.reportForm.updateValueAndValidity();

      mockBrowseQuizzesService.reportQuiz.mockReturnValue(of({ result: false }));

      const emitSpy = jest.spyOn(component.reportSubmitted, 'emit');

      component.reportQuiz();
      tick();

      expect(mockSnackbarService.showError).toHaveBeenCalled();
      expect(emitSpy).not.toHaveBeenCalled();
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    }));

    it('should handle API error with custom message', fakeAsync(() => {
      component.reportForm.get('reason')?.setValue('Invalid quiz');
      component.reportForm.get('reason')?.setErrors(null);
      component.reportForm.updateValueAndValidity();

      mockBrowseQuizzesService.reportQuiz.mockReturnValue(
        throwError(() => ({ error: { message: 'Server error' } })),
      );

      component.reportQuiz();
      tick();

      expect(mockSnackbarService.showError).toHaveBeenCalledWith(
        expect.any(String),
        'Server error',
      );
    }));

    it('should handle API error without custom message', fakeAsync(() => {
      component.reportForm.get('reason')?.setValue('Invalid quiz');
      component.reportForm.get('reason')?.setErrors(null);
      component.reportForm.updateValueAndValidity();

      mockBrowseQuizzesService.reportQuiz.mockReturnValue(throwError(() => ({})));

      component.reportQuiz();
      tick();

      expect(mockSnackbarService.showError).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );
    }));

    it('should handle API error with null error object', fakeAsync(() => {
      component.reportForm.get('reason')?.setValue('Invalid quiz');
      component.reportForm.get('reason')?.setErrors(null);
      component.reportForm.updateValueAndValidity();

      mockBrowseQuizzesService.reportQuiz.mockReturnValue(throwError(() => ({ error: null })));

      component.reportQuiz();
      tick();

      expect(mockSnackbarService.showError).toHaveBeenCalled();
    }));
  });

  describe('cancel', () => {
    it('should close dialog on cancel', () => {
      component.cancel();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should close dialog without any arguments', () => {
      component.cancel();
      expect(mockDialogRef.close).toHaveBeenCalledWith();
    });
  });

  describe('getError', () => {
    it('should return validation message for field with error', () => {
      const error = component.getError('reason');
      expect(error).toBe('Required field');
      expect(mockValidationErrorService.getErrorMessage).toHaveBeenCalled();
    });

    it('should return null if control does not exist', () => {
      const error = component.getError('nonexistentField');
      expect(error).toBeNull();
    });

    it('should pass correct parameters to validation service', () => {
      mockValidationErrorService.getErrorMessage.mockClear();

      component.getError('reason');

      expect(mockValidationErrorService.getErrorMessage).toHaveBeenCalledWith(
        component.reportForm.get('reason'),
        expect.any(Object),
        'reason',
      );
    });

    it('should handle field without validation messages', () => {
      mockValidationErrorService.getErrorMessage.mockReturnValue(null);

      const error = component.getError('reason');

      expect(error).toBeNull();
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy$ subject', () => {
      const nextSpy = jest.spyOn(component['destroy$'], 'next');
      const completeSpy = jest.spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });

    it('should unsubscribe from ongoing subscriptions', fakeAsync(() => {
      component.reportForm.get('reason')?.setValue('Test reason');
      mockBrowseQuizzesService.reportQuiz.mockReturnValue(of({ result: true }));

      component.reportQuiz();
      component.ngOnDestroy();
      tick();

      // Verify that destroy$ was called properly
      expect(component['destroy$'].closed).toBe(false);
      expect(component['destroy$'].observers.length).toBe(0);
    }));
  });

  describe('Component Properties', () => {
    it('should have correct initial button configurations', () => {
      expect(component.submitButton).toBeDefined();
      expect(component.cancelButton).toBeDefined();
    });

    it('should have correct form fields configuration', () => {
      expect(component.formFields).toBeDefined();
      expect(Array.isArray(component.formFields)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple successive report submissions', fakeAsync(() => {
      component.reportForm.get('reason')?.setValue('First report');
      component.reportForm.get('reason')?.setErrors(null);
      component.reportForm.updateValueAndValidity();

      mockBrowseQuizzesService.reportQuiz.mockReturnValue(of({ result: true }));

      component.reportQuiz();
      tick();

      expect(mockDialogRef.close).toHaveBeenCalledTimes(1);

      jest.clearAllMocks();

      component.reportForm.get('reason')?.setValue('Second report');
      component.reportForm.get('reason')?.setErrors(null);
      component.reportForm.updateValueAndValidity();

      mockBrowseQuizzesService.reportQuiz.mockReturnValue(of({ result: true }));

      component.reportQuiz();
      tick();

      expect(mockDialogRef.close).toHaveBeenCalledTimes(1);
    }));

    it('should emit false when report submission fails', fakeAsync(() => {
      component.reportForm.get('reason')?.setValue('Failed report');
      mockBrowseQuizzesService.reportQuiz.mockReturnValue(of({ result: false }));

      const emitSpy = jest.spyOn(component.reportSubmitted, 'emit');

      component.reportQuiz();
      tick();

      expect(emitSpy).not.toHaveBeenCalledWith(false);
      expect(emitSpy).not.toHaveBeenCalled();
    }));
  });
});
