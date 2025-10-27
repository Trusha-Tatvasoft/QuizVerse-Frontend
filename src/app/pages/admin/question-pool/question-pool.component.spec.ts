import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import {
  patchFormWithQuestion,
  mapFormToQuestionRequest,
  updateDropdownOptions,
} from './components/manual-question-tab/components/create-edit-question-form/create-edit-question-form.hepler';
import { QuestionPoolService } from '../../../services/admin/question-pool/question-pool.service';
import { DropdownService } from '../../../shared/service/dropdown/dropdown.service';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { ValidationErrorService } from '../../../shared/service/validation-error/validation-error.service';
import { platformMessages } from '../../../utils/constants';
import { CreateEditQuestionFormComponent } from './components/manual-question-tab/components/create-edit-question-form/create-edit-question-form.component';
import { uniqueOptionsGroupValidator } from './components/manual-question-tab/components/create-edit-question-form/create-edit-question-form.validator';
import { buildBaseFields } from './configs/question-pool-dialog.config';
import { QuestionDetail } from './interfaces/question-pool-preview.interface';

// Mock helper functions
jest.mock(
  './components/manual-question-tab/components/create-edit-question-form/create-edit-question-form.hepler',
  () => ({
    patchFormWithQuestion: jest.fn(),
    mapFormToQuestionRequest: jest.fn().mockReturnValue({ dto: true }),
    updateDropdownOptions: jest.fn(),
  }),
);

// Mock config functions
jest.mock('./configs/question-pool-dialog.config', () => ({
  buildBaseFields: jest
    .fn()
    .mockReturnValue([{ name: 'type', label: '', type: '', placeholder: '', validators: [] }]),
  buildFieldsByQuestionType: jest.fn().mockReturnValue([
    { name: 'option1', label: '', type: '', placeholder: '', validators: [] },
    { name: 'option2', label: '', type: '', placeholder: '', validators: [] },
  ]),
}));

// Mock validator
jest.mock(
  './components/manual-question-tab/components/create-edit-question-form/create-edit-question-form.validator',
  () => ({
    uniqueOptionsGroupValidator: jest.fn(() => () => null),
  }),
);

describe('CreateEditQuestionFormComponent', () => {
  let component: CreateEditQuestionFormComponent;
  let fixture: ComponentFixture<CreateEditQuestionFormComponent>;
  let fb: FormBuilder;

  const mockDialogRef = { close: jest.fn() };
  const mockDropdownService = { getDropdownData: jest.fn() };
  const mockQuestionService = {
    createOrUpdateQuestion: jest.fn(),
  };
  const mockSnackbar = { showSuccess: jest.fn(), showError: jest.fn() };
  const mockValidationErrorService = { getErrorMessage: jest.fn() };

  const mockQuestionData: QuestionDetail = {
    id: 1,
    category: 'Test Category',
    difficulty: 'Easy',
    questionType: 'MCQ',
    questionText: 'Sample Question',
    options: [],
    correctAnswer: 'A',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateEditQuestionFormComponent],
      providers: [
        FormBuilder,
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: DropdownService, useValue: mockDropdownService },
        { provide: QuestionPoolService, useValue: mockQuestionService },
        { provide: SnackbarService, useValue: mockSnackbar },
        { provide: ValidationErrorService, useValue: mockValidationErrorService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateEditQuestionFormComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);

    mockDropdownService.getDropdownData.mockReturnValue(of([{ id: 1, name: 'Test' }]));
    mockQuestionService.createOrUpdateQuestion.mockReturnValue(of({ result: true, message: 'ok' }));
  });

  afterEach(() => jest.clearAllMocks());

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should build form and load dropdowns', () => {
    component.ngOnInit();
    expect(buildBaseFields).toHaveBeenCalled();
    expect(mockDropdownService.getDropdownData).toHaveBeenCalledTimes(3);
  });

  it('ngOnInit should subscribe to type valueChanges', () => {
    const spy = jest.spyOn(component, 'updateFieldsByType');
    component.ngOnInit();

    const typeControl = component.form.get('type');
    typeControl?.setValue(1);

    expect(spy).toHaveBeenCalledWith(1);
  });

  it('loadDropdowns should update dropdown options after loading', fakeAsync(() => {
    component.ngOnInit();
    tick();

    expect(updateDropdownOptions).toHaveBeenCalledWith(
      component.fields,
      component.categoryList,
      component.difficultyList,
      component.typeList,
    );
  }));

  it('loadDropdowns should patch form if questionData exists', fakeAsync(() => {
    component.questionData = mockQuestionData;
    const patchSpy = jest.spyOn(component, 'patchFormWithQuestionData');

    component.ngOnInit();
    tick();

    expect(patchSpy).toHaveBeenCalledWith(mockQuestionData);
  }));

  it('loadDropdowns should not patch form if questionData is undefined', fakeAsync(() => {
    component.questionData = undefined;
    const patchSpy = jest.spyOn(component, 'patchFormWithQuestionData');

    component.ngOnInit();
    tick();

    expect(patchSpy).not.toHaveBeenCalled();
  }));

  it('patchFormWithQuestionData should call helper with correct arguments', () => {
    component.ngOnInit();
    component.categoryList = [{ id: 1, name: 'Cat1' }];
    component.difficultyList = [{ id: 1, name: 'Easy' }];
    component.typeList = [{ id: 1, name: 'MCQ' }];

    component.patchFormWithQuestionData(mockQuestionData);

    expect(patchFormWithQuestion).toHaveBeenCalledWith(
      component.form,
      mockQuestionData,
      component.categoryList,
      component.difficultyList,
      component.typeList,
    );
  });

  it('buildForm should create controls from fields', () => {
    component.baseFields = buildBaseFields();
    component.fields = [...component.baseFields];
    component.buildForm();
    expect(Object.keys(component.form.controls)).toContain('type');
  });

  it('updateFieldsByType should remove non-base controls and add new fields', () => {
    component.baseFields = buildBaseFields();
    component.fields = [...component.baseFields];
    component.buildForm();

    component.form.addControl('extra', fb.control(''));
    expect(component.form.contains('extra')).toBe(true);

    component.updateFieldsByType(2);
    expect(component.form.contains('extra')).toBe(false);
    expect(Object.keys(component.form.controls)).toContain('option1');
    expect(Object.keys(component.form.controls)).toContain('option2');
    expect(component.form.validator).toBeNull();
  });

  it('should not throw if type control does not exist during ngOnInit', () => {
    jest.spyOn(component, 'buildForm').mockImplementation(() => {
      component.form = fb.group({});
    });

    expect(() => component.ngOnInit()).not.toThrow();
  });

  it('updateFieldsByType should attach uniqueOptionsGroupValidator for MCQ type', () => {
    component.baseFields = buildBaseFields();
    component.fields = [...component.baseFields];
    component.buildForm();

    component.updateFieldsByType(1);
    expect(uniqueOptionsGroupValidator).toHaveBeenCalledWith(['option1', 'option2']);
  });

  it('updateFieldsByType should clear validators for non-MCQ types', () => {
    component.baseFields = buildBaseFields();
    component.fields = [...component.baseFields];
    component.buildForm();

    component.updateFieldsByType(2);
    expect(component.form.validator).toBeNull();
  });

  it('getError should return null when control not found', () => {
    component.fields = [{ name: 'test', label: '', type: '', placeholder: '', validators: [] }];
    component.buildForm();
    const result = component.getError('unknown');
    expect(result).toBeNull();
  });

  it('getError should call validationErrorService with control, messages, and fieldName', () => {
    component.fields = [
      {
        name: 'test',
        label: '',
        type: '',
        placeholder: '',
        validators: [],
        validationMessages: { required: 'Field required' },
      },
    ];
    component.buildForm();
    const control = component.form.get('test');
    mockValidationErrorService.getErrorMessage.mockReturnValue('Field required');

    const result = component.getError('test');

    expect(mockValidationErrorService.getErrorMessage).toHaveBeenCalledWith(
      control,
      { required: 'Field required' },
      'test',
    );
    expect(result).toBe('Field required');
  });

  it('createOrUpdateQuestion should call service with id 0 for new question', () => {
    component.questionData = undefined;
    component.baseFields = buildBaseFields();
    component.fields = [...component.baseFields];
    component.buildForm();
    component.form.get('type')?.setValue(1);

    component.createOrUpdateQuestion();

    expect(mockQuestionService.createOrUpdateQuestion).toHaveBeenCalledWith(0, { dto: true });
  });

  it('createOrUpdateQuestion should call service with existing id for edit', () => {
    component.questionData = mockQuestionData;
    component.baseFields = buildBaseFields();
    component.fields = [...component.baseFields];
    component.buildForm();
    component.form.get('type')?.setValue(1);

    component.createOrUpdateQuestion();

    expect(mockQuestionService.createOrUpdateQuestion).toHaveBeenCalledWith(1, { dto: true });
  });

  it('createOrUpdateQuestion should show success and close dialog on success', () => {
    component.baseFields = buildBaseFields();
    component.fields = [...component.baseFields];
    component.buildForm();
    component.form.get('type')?.setValue(1);

    component.createOrUpdateQuestion();

    expect(mapFormToQuestionRequest).toHaveBeenCalled();
    expect(mockSnackbar.showSuccess).toHaveBeenCalledWith(platformMessages.successTitle, 'ok');
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('createOrUpdateQuestion should show error when service returns failure', () => {
    mockQuestionService.createOrUpdateQuestion.mockReturnValueOnce(
      of({ result: false, message: 'fail' }),
    );
    component.baseFields = buildBaseFields();
    component.fields = [...component.baseFields];
    component.buildForm();
    component.form.get('type')?.setValue(1);

    component.createOrUpdateQuestion();

    expect(mockSnackbar.showError).toHaveBeenCalledWith(platformMessages.errorTitle, 'fail');
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('createOrUpdateQuestion should show error on service error', fakeAsync(() => {
    mockQuestionService.createOrUpdateQuestion.mockReturnValueOnce(
      throwError(() => ({ error: { message: 'err' } })),
    );

    component.baseFields = buildBaseFields();
    component.fields = [...component.baseFields];
    component.buildForm();
    component.form.get('type')?.setValue(1);

    component.createOrUpdateQuestion();
    tick();

    expect(mockSnackbar.showError).toHaveBeenCalledWith(platformMessages.errorTitle, 'err');
  }));

  it('createOrUpdateQuestion should show generic error when error.message is missing', fakeAsync(() => {
    mockQuestionService.createOrUpdateQuestion.mockReturnValueOnce(throwError(() => ({})));

    component.baseFields = buildBaseFields();
    component.fields = [...component.baseFields];
    component.buildForm();
    component.form.get('type')?.setValue(1);

    component.createOrUpdateQuestion();
    tick();

    expect(mockSnackbar.showError).toHaveBeenCalledWith(
      platformMessages.errorTitle,
      platformMessages.errorMessage,
    );
  }));

  it('should mark all as touched if form invalid', () => {
    component.ngOnInit();
    const markAllSpy = jest.spyOn(component.form, 'markAllAsTouched');
    Object.defineProperty(component.form, 'valid', { get: () => false });

    component.createOrUpdateQuestion();

    expect(markAllSpy).toHaveBeenCalled();
    expect(mockQuestionService.createOrUpdateQuestion).not.toHaveBeenCalled();
  });

  it('closeDialog should call dialogRef.close', () => {
    component.closeDialog();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('ngOnDestroy should complete destroy$ subject', () => {
    const nextSpy = jest.spyOn(component['destroy$'], 'next');
    const completeSpy = jest.spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});
