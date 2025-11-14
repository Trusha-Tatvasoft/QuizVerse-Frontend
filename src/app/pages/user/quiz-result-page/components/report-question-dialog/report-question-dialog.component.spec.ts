import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReportQuestionDialogComponent } from './report-question-dialog.component';
import { DynamicFormField } from '../../../../../shared/interfaces/dynamic-form-field.interface';
import { ValidationErrorService } from '../../../../../shared/service/validation-error/validation-error.service';
import { ReportQuestionDialogData } from '../../interfaces/quiz-question-review.interface';

describe('ReportQuestionDialogComponent', () => {
  let component: ReportQuestionDialogComponent;
  let fixture: ComponentFixture<ReportQuestionDialogComponent>;
  let dialogRefMock: jest.Mocked<MatDialogRef<ReportQuestionDialogComponent>>;
  let validationErrorServiceMock: jest.Mocked<ValidationErrorService>;

  const dialogData: ReportQuestionDialogData = {
    questionId: 1,
    questionText: 'Sample Question',
    reportId: null,
    isEditable: true,
    description: null,
  };

  const formFieldsMock: DynamicFormField[] = [
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Enter description',
      validators: [Validators.required],
      validationMessages: {
        required: 'Description is required',
      },
    },
  ];

  beforeEach(async () => {
    dialogRefMock = { close: jest.fn() } as any;
    validationErrorServiceMock = {
      getErrorMessage: jest.fn().mockReturnValue('Description is required'),
    } as any;

    await TestBed.configureTestingModule({
      imports: [ReportQuestionDialogComponent, ReactiveFormsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: ValidationErrorService, useValue: validationErrorServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportQuestionDialogComponent);
    component = fixture.componentInstance;

    component.formFields = formFieldsMock;
    fixture.detectChanges();
  });

  it('should create component and initialize form', () => {
    expect(component).toBeTruthy();
    expect(component.reportForm.contains('description')).toBe(true);
  });

  describe('ngOnInit & initForm', () => {
    it('should initialize form with description if data provided', () => {
      const dataWithDescription = { ...dialogData, description: 'Existing report' };
      (component as any).data = dataWithDescription;
      component.ngOnInit();

      expect(component.reportForm.value.description).toBe('Existing report');
    });

    it('should disable form if not editable', () => {
      const nonEditable = { ...dialogData, isEditable: false, reportId: 1 };
      (component as any).data = nonEditable;

      component.ngOnInit();

      expect(component.reportForm.disabled).toBe(true);
    });

    it('should set submit button label correctly', () => {
      (component as any).data = { ...dialogData, reportId: 10, isEditable: true };
      component.ngOnInit();
      expect(component.submitButton.label).toBe('Update Report');
    });
  });

  describe('onSubmit', () => {
    it('should close dialog with valid form data', () => {
      component.reportForm.setValue({ description: 'Bad wording' });
      (component as any).data = { ...dialogData, reportId: 5 };

      component.onSubmit();

      expect(dialogRefMock.close).toHaveBeenCalledWith({
        reportId: 5,
        questionId: dialogData.questionId,
        description: 'Bad wording',
      });
    });

    it('should mark all as touched if form invalid', () => {
      component.reportForm.setValue({ description: '' });
      component.onSubmit();

      expect(component.reportForm.touched).toBe(true);
      expect(dialogRefMock.close).not.toHaveBeenCalled();
    });
  });

  describe('onCancel', () => {
    it('should close dialog without data', () => {
      component.onCancel();
      expect(dialogRefMock.close).toHaveBeenCalledWith();
    });
  });

  describe('getError', () => {
    it('should return correct custom error message', () => {
      const error = component.getError('description');
      expect(validationErrorServiceMock.getErrorMessage).toHaveBeenCalled();
      expect(error).toBe('Description is required');
    });

    it('should handle missing field gracefully', () => {
      const result = component.getError('unknown');
      expect(result).toBe('Description is required');
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy$', () => {
      const nextSpy = jest.spyOn((component as any).destroy$, 'next');
      const completeSpy = jest.spyOn((component as any).destroy$, 'complete');

      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });
});
