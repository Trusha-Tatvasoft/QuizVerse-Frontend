import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { BattleCreationStep1Component } from './battle-creation-step-1.component';
import { BattleManagementService } from '../../../../../../services/admin/battle-management/battle-management.service';
import { ValidationErrorService } from '../../../../../../shared/service/validation-error/validation-error.service';
import { SnackbarService } from '../../../../../../shared/service/snackbar/snackbar.service';
import { BattleTimeType } from '../../../../../../shared/enums/battle-management.enum';
import {
  QuestionDifficultyXP,
  BattleStep1Data,
} from '../../../interfaces/battle-creation.interface';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { DropDownType } from '../../../../../../shared/enums/dropdown-types.enum';
import { platformMessages } from '../../../../../../utils/constants';
import { DropDownData } from '../../../../../../shared/interfaces/drop-down-data.interface';
import { ApiResponse } from '../../../../../../shared/interfaces/api-response.interface';

describe('BattleCreationStep1Component', () => {
  let component: BattleCreationStep1Component;
  let fixture: ComponentFixture<BattleCreationStep1Component>;
  let battleManagementService: jest.Mocked<BattleManagementService>;
  let validationErrorService: jest.Mocked<ValidationErrorService>;
  let snackbarService: jest.Mocked<SnackbarService>;

  const mockDifficultyXP: QuestionDifficultyXP[] = [
    { questionDifficultyId: 1, questionDifficultyName: 'Easy', xpGained: 10 },
    { questionDifficultyId: 2, questionDifficultyName: 'Medium', xpGained: 20 },
  ];

  const mockInitialFormValues: BattleStep1Data = {
    name: 'Test Battle',
    description: 'Test Description',
    difficultyLevelId: 1,
    difficultyLevelName: 'Beginner',
    categoryId: 1,
    battleCategoryName: 'General Knowledge',
    battleType: BattleTimeType.TimeLimited,
    battleTypeName: 'Time Limited',
    startDate: new Date('2025-09-01'),
    endDate: new Date('2025-09-02'),
    totalTime: 10,
    totalQuestion: 10,
    totalXp: 100,
    questionsDifficulty: [
      { queDifficultyId: 1, noOfQues: 5, timePerQuestion: 30 },
      { queDifficultyId: 2, noOfQues: 5, timePerQuestion: 60 },
    ],
  };

  beforeEach(async () => {
    // Mock services
    battleManagementService = {
      getDropDownData: jest.fn(),
      getQuestionDifficultyXP: jest.fn(),
    } as unknown as jest.Mocked<BattleManagementService>;

    validationErrorService = {
      getErrorMessage: jest.fn(),
    } as unknown as jest.Mocked<ValidationErrorService>;

    snackbarService = {
      showError: jest.fn(),
    } as unknown as jest.Mocked<SnackbarService>;

    // Mock service responses
    battleManagementService.getDropDownData.mockImplementation((type: DropDownType) => {
      if (type === DropDownType.QuizDifficulty) {
        return of({
          result: true,
          statusCode: 200,
          message: 'Success',
          data: [
            { id: 1, name: 'Beginner' },
            { id: 2, name: 'Advanced' },
          ],
        } as ApiResponse<DropDownData[]>);
      } else if (type === DropDownType.QuizCategory) {
        return of({
          result: true,
          statusCode: 200,
          message: 'Success',
          data: [
            { id: 1, name: 'General Knowledge' },
            { id: 2, name: 'Science' },
          ],
        } as ApiResponse<DropDownData[]>);
      }
      return of({
        result: true,
        statusCode: 200,
        message: 'Success',
        data: [],
      } as ApiResponse<DropDownData[]>);
    });

    battleManagementService.getQuestionDifficultyXP.mockReturnValue(
      of({
        result: true,
        statusCode: 200,
        message: 'Success',
        data: mockDifficultyXP,
      } as ApiResponse<QuestionDifficultyXP[]>),
    );

    await TestBed.configureTestingModule({
      imports: [
        BattleCreationStep1Component,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
      ],
      providers: [
        { provide: BattleManagementService, useValue: battleManagementService },
        { provide: ValidationErrorService, useValue: validationErrorService },
        { provide: SnackbarService, useValue: snackbarService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BattleCreationStep1Component);
    component = fixture.componentInstance;

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form and load select field options on ngOnInit', async () => {
    component.initialFormValues = mockInitialFormValues;
    component.ngOnInit();
    jest.runAllTimers();

    expect(battleManagementService.getDropDownData).toHaveBeenCalledTimes(2);
    expect(battleManagementService.getQuestionDifficultyXP).toHaveBeenCalled();
    expect(component.newBattleForm).toBeDefined();
    expect(component.battleDifficultyOption).toEqual([
      { value: 1, label: 'Beginner' },
      { value: 2, label: 'Advanced' },
    ]);
    expect(component.questionFields.length).toBe(4); // 2 difficulties * (Questions + Time)
  });

  it('should restore initial form values if provided', async () => {
    component.initialFormValues = mockInitialFormValues;
    component.ngOnInit();
    jest.runAllTimers();

    expect(component.newBattleForm.get('battleTitle')?.value).toBe('Test Battle');
    expect(component.newBattleForm.get('battleCategory')?.value).toBe(1);
    expect(component.newBattleForm.get('easyQuestions')?.value).toBe(5);
    expect(component.newBattleForm.get('easyTime')?.value).toBe(30);
    expect(component.newBattleForm.get('mediumQuestions')?.value).toBe(5);
    expect(component.newBattleForm.get('mediumTime')?.value).toBe(60);
  });

  it('should update totals when question fields change', async () => {
    component.ngOnInit();
    jest.runAllTimers();

    component.newBattleForm.get('easyQuestions')?.setValue(5);
    component.newBattleForm.get('easyTime')?.setValue(30);
    component.newBattleForm.get('mediumQuestions')?.setValue(5);
    component.newBattleForm.get('mediumTime')?.setValue(60);

    component.updateTotals();

    expect(component.totalQuestionsStep1).toBe(10);
    expect(component.totalTimeStep1).toBe(450 / 60); // (5*30 + 5*60) / 60 = 7.5 minutes
    expect(component.totalXPStep1).toBe(150); // 5*10 + 5*20 = 150 XP
  });

  it('should emit form values when form changes', async () => {
    const formValuesChangeSpy = jest.spyOn(component.formValuesChange, 'emit');
    component.ngOnInit();
    jest.runAllTimers();

    component.newBattleForm.get('battleTitle')?.setValue('New Battle');
    jest.runAllTimers();

    expect(formValuesChangeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'New Battle',
        totalQuestion: 0,
        totalTime: 0,
        totalXp: 0,
      }),
    );
  });

  it('should apply date validators for TimeLimited battle type', async () => {
    component.ngOnInit();
    jest.runAllTimers();

    component.newBattleForm.get('battleType')?.setValue(BattleTimeType.TimeLimited);
    jest.runAllTimers();

    const startDateControl = component.newBattleForm.get('startDate');
    const endDateControl = component.newBattleForm.get('endDate');

    expect(startDateControl?.validator).toBeDefined();
    expect(endDateControl?.validator).toBeDefined();
  });

  it('should clear date validators for non-TimeLimited battle type', async () => {
    component.ngOnInit();
    jest.runAllTimers();

    component.newBattleForm.get('battleType')?.setValue(BattleTimeType.Permanent);
    jest.runAllTimers();

    const startDateControl = component.newBattleForm.get('startDate');
    const endDateControl = component.newBattleForm.get('endDate');

    expect(startDateControl?.validator).toBeNull();
    expect(endDateControl?.validator).toBeNull();
    expect(startDateControl?.value).toBeNull();
    expect(endDateControl?.value).toBeNull();
  });

  it('should emit categoryChanged event when battleCategory changes', async () => {
    const categoryChangedSpy = jest.spyOn(component.categoryChanged, 'emit');
    component.ngOnInit();
    jest.runAllTimers();

    component.newBattleForm.get('battleCategory')?.setValue(2);
    jest.runAllTimers();

    expect(categoryChangedSpy).toHaveBeenCalled();
  });

  it('should return false and show error if form is invalid on submit', () => {
    component.ngOnInit();
    const markAllAsTouchedSpy = jest.spyOn(component.newBattleForm, 'markAllAsTouched');

    const result = component.submitStep1Form();

    expect(result).toBe(false);
    expect(markAllAsTouchedSpy).toHaveBeenCalled();
  });

  it('should return false and show error if total questions are out of range', async () => {
    component.ngOnInit();
    jest.runAllTimers();

    component.newBattleForm.get('battleTitle')?.setValue('Test Battle');
    component.newBattleForm.get('description')?.setValue('Test Description');
    component.newBattleForm.get('battleCategory')?.setValue(1);
    component.newBattleForm.get('difficultyLevel')?.setValue(1);
    component.newBattleForm.get('battleType')?.setValue(BattleTimeType.Permanent);
    component.newBattleForm.get('easyQuestions')?.setValue(2); // Too few questions
    component.newBattleForm.get('easyTime')?.setValue(30);
    component.newBattleForm.get('mediumQuestions')?.setValue(0);
    component.newBattleForm.get('mediumTime')?.setValue(60);

    component.updateTotals();
    const result = component.submitStep1Form();

    expect(result).toBe(false);
    expect(snackbarService.showError).toHaveBeenCalledWith(
      platformMessages.minimumNumberOfQuestionError,
    );
  });

  it('should return true and emit form values on valid form submission', async () => {
    const formValuesChangeSpy = jest.spyOn(component.formValuesChange, 'emit');
    component.ngOnInit();
    jest.runAllTimers();

    component.newBattleForm.get('battleTitle')?.setValue('Test Battle');
    component.newBattleForm.get('description')?.setValue('Test Description');
    component.newBattleForm.get('battleCategory')?.setValue(1);
    component.newBattleForm.get('difficultyLevel')?.setValue(1);
    component.newBattleForm.get('battleType')?.setValue(BattleTimeType.Permanent);
    component.newBattleForm.get('easyQuestions')?.setValue(10);
    component.newBattleForm.get('easyTime')?.setValue(30);
    component.newBattleForm.get('mediumQuestions')?.setValue(0);
    component.newBattleForm.get('mediumTime')?.setValue(60);

    component.updateTotals();
    const result = component.submitStep1Form();

    expect(result).toBe(true);
    expect(formValuesChangeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Battle',
        categoryId: 1,
        difficultyLevelId: 1,
        battleType: BattleTimeType.Permanent,
        totalQuestion: 10,
        totalTime: 300 / 60, // 5 minutes
        totalXp: 100, // 10 questions * 10 XP
        questionsDifficulty: expect.arrayContaining([
          expect.objectContaining({ queDifficultyId: 1, noOfQues: 10, timePerQuestion: 30 }),
        ]),
      }),
    );
  });

  it('should handle errors from getQuestionDifficultyXP and show snackbar', async () => {
    battleManagementService.getQuestionDifficultyXP.mockReturnValue(
      throwError(() => ({ error: { message: undefined } })),
    );
    component.ngOnInit();
    jest.runAllTimers();

    expect(snackbarService.showError).toHaveBeenCalledWith(
      platformMessages.errorTitle,
      platformMessages.errorMessage,
    );
  });

  it('should clean up subscriptions on ngOnDestroy', () => {
    const destroyNextSpy = jest.spyOn(component['destroy$'], 'next');
    const destroyCompleteSpy = jest.spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(destroyNextSpy).toHaveBeenCalled();
    expect(destroyCompleteSpy).toHaveBeenCalled();
  });

  it('should get error message for invalid field', () => {
    component.ngOnInit();
    component.newBattleForm.get('battleTitle')?.setErrors({ required: true });
    validationErrorService.getErrorMessage.mockReturnValue('Battle title is required');

    const error = component.getError('battleTitle');

    expect(error).toBe('Battle title is required');
    expect(validationErrorService.getErrorMessage).toHaveBeenCalled();
  });
});
