import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import { ReportQuestionDialogComponent } from './report-question-dialog.component';
import { DynamicFormField } from '../../../../../shared/interfaces/dynamic-form-field.interface';

describe('ReportQuestionDialogComponent', () => {
  let component: ReportQuestionDialogComponent;
  let fixture: ComponentFixture<ReportQuestionDialogComponent>;
  let dialogRefMock: jest.Mocked<MatDialogRef<ReportQuestionDialogComponent>>;

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
    dialogRefMock = {
      close: jest.fn(),
    } as unknown as jest.Mocked<MatDialogRef<ReportQuestionDialogComponent>>;

    await TestBed.configureTestingModule({
      imports: [ReportQuestionDialogComponent, ReactiveFormsModule],
      providers: [{ provide: MatDialogRef, useValue: dialogRefMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportQuestionDialogComponent);
    component = fixture.componentInstance;

    // set inputs
    component.questionId = 1;
    component.questionText = 'Sample Question';

    // override form fields
    component.formFields = formFieldsMock;

    // rebuild form with mocked fields
    component.reportForm = component['fb'].group({
      description: ['', Validators.required],
    });

    fixture.detectChanges();
  });

  it('should create the component and initialize form fields', () => {
    expect(component).toBeTruthy();
    expect(component.reportForm.contains('description')).toBe(true);
  });

  describe('onSubmit', () => {
    it('should close dialog with form values when form is valid', () => {
      component.reportForm.setValue({ description: 'Bad wording' });

      component.onSubmit();

      expect(dialogRefMock.close).toHaveBeenCalledWith({
        questionId: 1,
        questionText: 'Sample Question',
        description: 'Bad wording',
      });
    });

    it('should mark all fields as touched when form is invalid', () => {
      component.reportForm.setValue({ description: '' });

      component.onSubmit();

      expect(component.reportForm.touched).toBe(true);
      expect(dialogRefMock.close).not.toHaveBeenCalled();
    });
  });

  describe('onCancel', () => {
    it('should close the dialog without data', () => {
      component.onCancel();
      expect(dialogRefMock.close).toHaveBeenCalledWith();
    });
  });

  describe('getError', () => {
    it('should return correct error message when field is invalid and touched', () => {
      const control = component.reportForm.get('description');
      control?.markAsTouched();
      control?.setValue('');

      const error = component.getError('description');
      expect(error).toBe('Description is required');
    });

    it('should return empty string when field has no errors', () => {
      component.reportForm.setValue({ description: 'Looks good' });

      const error = component.getError('description');
      expect(error).toBe('');
    });

    it('should return default message when no custom message exists', () => {
      component.formFields = [
        {
          name: 'title',
          label: 'Title',
          type: 'text',
          placeholder: 'Enter title',
          validators: [Validators.required],
          // no custom validationMessages for default test
        } as DynamicFormField,
      ];
      component.reportForm = component['fb'].group({ title: ['', Validators.required] });

      const control = component.reportForm.get('title');
      control?.markAsTouched();
      control?.setValue('');

      const error = component.getError('title');
      expect(error).toBe('Title is invalid'); // default fallback
    });
  });
});
