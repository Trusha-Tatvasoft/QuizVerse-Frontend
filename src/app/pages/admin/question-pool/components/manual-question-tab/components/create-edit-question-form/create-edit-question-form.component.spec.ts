import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CreateEditQuestionFormComponent } from './create-edit-question-form.component';
import {
  patchFormWithQuestion,
  mapFormToQuestionRequest,
  updateDropdownOptions,
} from './create-edit-question-form.hepler';
import { DropdownService } from '../../../../../../../shared/service/dropdown/dropdown.service';
import { QuestionPoolService } from '../../../../../../../services/admin/question-pool/question-pool.service';
import { SnackbarService } from '../../../../../../../shared/service/snackbar/snackbar.service';
import { buildBaseFields } from '../../../../configs/question-pool-dialog.config';
import { uniqueOptionsGroupValidator } from './create-edit-question-form.validator';

// Mock helper functions
jest.mock('./create-edit-question-form.hepler', () => ({
  patchFormWithQuestion: jest.fn(),
  mapFormToQuestionRequest: jest.fn().mockReturnValue({ dto: true }),
  updateDropdownOptions: jest.fn(),
}));

// Mock config functions
jest.mock('../../../../configs/question-pool-dialog.config', () => ({
  buildBaseFields: jest
    .fn()
    .mockReturnValue([{ name: 'type', label: '', type: '', placeholder: '', validators: [] }]),
  buildFieldsByQuestionType: jest.fn().mockReturnValue([
    { name: 'option1', label: '', type: '', placeholder: '', validators: [] },
    { name: 'option2', label: '', type: '', placeholder: '', validators: [] },
  ]),
}));

// Mock validator
jest.mock('./create-edit-question-form.validator', () => ({
  uniqueOptionsGroupValidator: jest.fn(() => () => null),
}));

describe('CreateEditQuestionFormComponent', () => {
  let component: CreateEditQuestionFormComponent;
  let fixture: ComponentFixture<CreateEditQuestionFormComponent>;
  let fb: FormBuilder;

  const mockDialogRef = { close: jest.fn() };
  const mockDropdownService = { getDropdownData: jest.fn() };
  const mockQuestionService = {
    getQuestionPreviewById: jest.fn(),
    createOrUpdateQuestion: jest.fn(),
  };
  const mockSnackbar = { showSuccess: jest.fn(), showError: jest.fn() };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateEditQuestionFormComponent],
      providers: [
        FormBuilder,
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: DropdownService, useValue: mockDropdownService },
        { provide: QuestionPoolService, useValue: mockQuestionService },
        { provide: SnackbarService, useValue: mockSnackbar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateEditQuestionFormComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);

    mockDropdownService.getDropdownData.mockReturnValue(of([{ id: 1, name: 'Test' }]));
    mockQuestionService.getQuestionPreviewById.mockReturnValue(
      of({
        data: {
          id: 1,
          category: 'Test',
          difficulty: 'Easy',
          questionType: 'MCQ',
          questionText: 'Q1',
        },
      }),
    );
    mockQuestionService.createOrUpdateQuestion.mockReturnValue(of({ result: true, message: 'ok' }));
  });

  afterEach(() => jest.clearAllMocks());

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit without questionId should build form and load dropdowns', () => {
    component.ngOnInit();
    expect(buildBaseFields).toHaveBeenCalled();
    expect(mockDropdownService.getDropdownData).toHaveBeenCalledTimes(3);
    expect(updateDropdownOptions).toHaveBeenCalled();
  });

  it('ngOnInit with questionId should load question details', () => {
    component.questionId = 5;
    component.ngOnInit();
    expect(mockQuestionService.getQuestionPreviewById).toHaveBeenCalledWith(5);
    expect(patchFormWithQuestion).toHaveBeenCalled();
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

  it('should call updateFieldsByType on type change', () => {
    const spy = jest.spyOn(component, 'updateFieldsByType');

    component.ngOnInit();

    const typeControl = component.form.get('type');
    typeControl?.setValue(1);

    expect(spy).toHaveBeenCalledWith(1);
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

  it('getError should return null when no control or errors', () => {
    component.baseFields = buildBaseFields();
    component.fields = [...component.baseFields];
    component.buildForm();
    expect(component.getError('type')).toBeNull();
  });

  it('getError should return validation message if error exists', () => {
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
    component.form.get('test')?.setErrors({ required: true });
    expect(component.getError('test')).toBe('Field required');
  });

  it('getError should return default message when error key has no message', () => {
    component.fields = [{ name: 'test', label: '', type: '', placeholder: '', validators: [] }];
    component.buildForm();
    component.form.get('test')?.setErrors({ random: true });
    expect(component.getError('test')).toBe('Invalid field');
  });

  it('createOrUpdateQuestion should call service and show success for valid form', () => {
    component.baseFields = buildBaseFields();
    component.fields = [...component.baseFields];
    component.buildForm();
    component.form.get('type')?.setValue(1);
    component.createOrUpdateQuestion();

    expect(mapFormToQuestionRequest).toHaveBeenCalled();
    expect(mockQuestionService.createOrUpdateQuestion).toHaveBeenCalled();
    expect(mockSnackbar.showSuccess).toHaveBeenCalled();
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
    expect(mockSnackbar.showError).toHaveBeenCalledWith('Failed', 'fail');
  });

  it('createOrUpdateQuestion should show error on service error', () => {
    mockQuestionService.createOrUpdateQuestion.mockReturnValueOnce(throwError(() => 'err'));
    component.baseFields = buildBaseFields();
    component.fields = [...component.baseFields];
    component.buildForm();
    component.form.get('type')?.setValue(1);
    component.createOrUpdateQuestion();
    expect(mockSnackbar.showError).toHaveBeenCalledWith('Error', 'err');
  });

  it('should mark all as touched if form invalid', () => {
    component.ngOnInit();
    const markAllSpy = jest.spyOn(component.form, 'markAllAsTouched');
    Object.defineProperty(component.form, 'valid', { get: () => false });
    component.createOrUpdateQuestion();
    expect(markAllSpy).toHaveBeenCalled();
  });

  it('closeDialog should call dialogRef.close', () => {
    component.closeDailog();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });
});
