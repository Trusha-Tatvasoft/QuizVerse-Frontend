import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { BattleCreationStep3Option1Component } from './battle-creation-step-3-option-1.component';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { ValidationErrorService } from '../../../../../../../shared/service/validation-error/validation-error.service';
import { SnackbarService } from '../../../../../../../shared/service/snackbar/snackbar.service';
import { BattleStep1Data } from '../../../../interfaces/battle-creation.interface';
import {
  changeQuestionMethodButtonConfig,
  questionFormFieldForAddQuestionManually,
} from '../../../../../quiz-management/configs/quiz-creation.config';
import { addQuestionButtonConfig } from '../../../../../question-pool/configs/question-pool.config';
import { quizCRUDMessages } from '../../../../../../../utils/constants';
import { QuestionType } from '../../../../../../../shared/enums/quiz-management.enum';
import { DynamicFormField } from '../../../../../../../shared/interfaces/dynamic-form-field.interface';

describe('BattleCreationStep3Option1Component', () => {
  let component: BattleCreationStep3Option1Component;
  let fixture: ComponentFixture<BattleCreationStep3Option1Component>;
  let validationErrorService: jest.Mocked<ValidationErrorService>;
  let snackbarService: jest.Mocked<SnackbarService>;

  const mockBattleStep1Data: BattleStep1Data = {
    name: 'Test Battle',
    description: 'Test Description',
    difficultyLevelId: 2,
    difficultyLevelName: 'Medium',
    categoryId: 1,
    battleCategoryName: 'General Knowledge',
    status: 1,
    battleType: 1,
    battleTypeName: 'Permanent',
    startDate: new Date(),
    endDate: new Date(),
    totalTime: 30,
    totalQuestion: 10,
    totalXp: 100,
    questionsDifficulty: [
      { queDifficultyId: 1, noOfQues: 5, timePerQuestion: 30 },
      { queDifficultyId: 2, noOfQues: 3, timePerQuestion: 45 },
      { queDifficultyId: 3, noOfQues: 2, timePerQuestion: 60 },
    ],
  };

  const mockQuestionDifficultyOption = [
    { value: 1, label: 'Easy' },
    { value: 2, label: 'Medium' },
    { value: 3, label: 'Hard' },
  ];

  const mockQuestionTypeOptions = [
    { value: QuestionType.MultipleOptions, label: 'Multiple Choice' },
    { value: QuestionType.TrueFalse, label: 'True/False' },
    { value: QuestionType.ShortAnswer, label: 'Short Answer' },
    { value: QuestionType.FillInTheBlank, label: 'Fill in the Blank' },
  ];

  const expectedFormFields: DynamicFormField[] = questionFormFieldForAddQuestionManually.map(
    (field) => {
      if (field.name === 'type') {
        return { ...field, options: mockQuestionTypeOptions };
      }
      if (field.name === 'difficulty') {
        return { ...field, options: mockQuestionDifficultyOption };
      }
      return field;
    },
  );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BattleCreationStep3Option1Component,
        ReactiveFormsModule,
        MatSelectModule,
        MatOptionModule,
        CommonModule,
        MatInputModule,
      ],
      providers: [
        FormBuilder,
        {
          provide: ValidationErrorService,
          useValue: {
            getErrorMessage: jest.fn().mockReturnValue(null),
          },
        },
        {
          provide: SnackbarService,
          useValue: {
            showError: jest.fn(),
            showSuccess: jest.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BattleCreationStep3Option1Component);
    component = fixture.componentInstance;

    validationErrorService = TestBed.inject(
      ValidationErrorService,
    ) as jest.Mocked<ValidationErrorService>;
    snackbarService = TestBed.inject(SnackbarService) as jest.Mocked<SnackbarService>;

    component.battleStep1Data = { ...mockBattleStep1Data }; // Clone to avoid mutation
    component.questionDifficultyOption = mockQuestionDifficultyOption;
    component.questionTypeOptions = mockQuestionTypeOptions;
    component.selectedQuestions = [];

    component.ngOnInit();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with default values and form subscription', () => {
      expect(component.changeMethodButton).toEqual(changeQuestionMethodButtonConfig);
      expect(component.addQuestionButton).toEqual(addQuestionButtonConfig);
      expect(component.questionFormFieldForAddQuestionManuallyStep3).toEqual(expectedFormFields);
      expect(component.questionForm).toBeDefined();
      expect(component.questionForm.get('type')?.value).toBe(mockQuestionTypeOptions[0].value);

      // Test valueChanges subscription
      const typeControl = component.questionForm.get('type')!;
      typeControl.setValue(QuestionType.TrueFalse);
      expect(component.questionForm.get('correctAnswer')?.validator).toBeDefined();
    });

    it('should build question form with correct fields', () => {
      const formControls = Object.keys(component.questionForm.controls);
      const expectedFields = questionFormFieldForAddQuestionManually.map((field) => field.name);
      expect(formControls).toEqual(expect.arrayContaining(expectedFields));
    });
  });

  describe('Form Handling', () => {
    it('should update fields when type changes to True/False', fakeAsync(() => {
      component.questionForm.get('type')?.setValue(QuestionType.TrueFalse);
      fixture.detectChanges();
      tick();

      const optionControls = ['option1', 'option2', 'option3', 'option4'];
      optionControls.forEach((opt) => {
        expect(component.questionForm.get(opt)?.hasValidator(Validators.required)).toBe(false);
        expect(component.questionForm.get(opt)?.value).toBe('');
      });

      expect(component.questionForm.get('correctAnswer')?.hasValidator(Validators.required)).toBe(
        true,
      );
    }));

    it('should update fields when type changes to Multiple Choice', fakeAsync(() => {
      component.questionForm.get('type')?.setValue(QuestionType.MultipleOptions);
      fixture.detectChanges();
      tick();

      const optionControls = ['option1', 'option2', 'option3', 'option4'];
      optionControls.forEach((opt) => {
        expect(component.questionForm.get(opt)?.hasValidator(Validators.required)).toBe(true);
      });

      expect(component.questionForm.get('correctAnswer')?.hasValidator(Validators.required)).toBe(
        true,
      );
    }));

    it('should update fields when type changes to FillInTheBlank', fakeAsync(() => {
      component.questionForm.get('type')?.setValue(QuestionType.FillInTheBlank);
      fixture.detectChanges();
      tick();

      const optionControls = ['option1', 'option2', 'option3', 'option4'];
      optionControls.forEach((opt) => {
        expect(component.questionForm.get(opt)?.hasValidator(Validators.required)).toBe(false);
        expect(component.questionForm.get(opt)?.value).toBe('');
      });

      expect(component.questionForm.get('correctAnswer')?.hasValidator(Validators.required)).toBe(
        true,
      );
    }));

    it('should handle invalid type value', fakeAsync(() => {
      component.questionForm.get('type')?.setValue(999); // Invalid type
      fixture.detectChanges();
      tick();

      const optionControls = ['option1', 'option2', 'option3', 'option4'];
      optionControls.forEach((opt) => {
        expect(component.questionForm.get(opt)?.hasValidator(Validators.required)).toBe(false);
      });

      expect(component.questionForm.get('correctAnswer')?.hasValidator(Validators.required)).toBe(
        true,
      );
    }));
  });

  describe('shouldRenderField', () => {
    it('should render always visible fields', () => {
      const alwaysVisibleFields = ['type', 'difficulty', 'questionText', 'correctAnswer'];
      alwaysVisibleFields.forEach((fieldName) => {
        const field = questionFormFieldForAddQuestionManually.find((f) => f.name === fieldName)!;
        expect(component.shouldRenderField(field)).toBe(true);
      });
    });

    it('should render option fields for Multiple Choice', () => {
      component.questionForm.get('type')?.setValue(QuestionType.MultipleOptions);
      const optionFields = ['option1', 'option2', 'option3', 'option4'];
      optionFields.forEach((fieldName) => {
        const field = questionFormFieldForAddQuestionManually.find((f) => f.name === fieldName)!;
        expect(component.shouldRenderField(field)).toBe(true);
      });
    });

    it('should not render option fields for FillInTheBlank', () => {
      component.questionForm.get('type')?.setValue(QuestionType.FillInTheBlank);
      const optionFields = ['option1', 'option2', 'option3', 'option4'];
      optionFields.forEach((fieldName) => {
        const field = questionFormFieldForAddQuestionManually.find((f) => f.name === fieldName)!;
        expect(component.shouldRenderField(field)).toBe(false);
      });
    });

    it('should not render unknown field', () => {
      const unknownField: DynamicFormField = {
        name: 'unknown',
        label: 'Unknown',
        type: 'text',
        placeholder: 'Unknown',
        validators: [],
      };
      expect(component.shouldRenderField(unknownField)).toBe(false);
    });
  });

  describe('addQuestion', () => {
    it('should add a Multiple Choice question when form is valid', () => {
      const emitSpy = jest.spyOn(component.selectedQuestionsChangeFromInnerStep3Option1, 'emit');

      component.questionForm.setValue({
        type: QuestionType.MultipleOptions,
        difficulty: 1,
        questionText: 'What is the capital of France?',
        option1: 'Paris',
        option2: 'London',
        option3: 'Berlin',
        option4: 'Madrid',
        correctAnswer: 'Paris',
      });

      component.addQuestion();

      expect(component.selectedQuestions.length).toBe(1);
      expect(component.selectedQuestions[0]).toEqual({
        categoryId: mockBattleStep1Data.categoryId,
        queDifficultyId: 1,
        queDifficultyName: 'Easy',
        queText: 'What is the capital of France?',
        queTypeId: QuestionType.MultipleOptions,
        queTypeName: 'Multiple Choice',
        queOptionsAns: [
          { id: 1, key: 'option', value: 'Paris' },
          { id: 2, key: 'option', value: 'London' },
          { id: 3, key: 'option', value: 'Berlin' },
          { id: 4, key: 'option', value: 'Madrid' },
          { id: 5, key: 'answer', value: 'Paris' },
        ],
      });
      expect(emitSpy).toHaveBeenCalledWith(component.selectedQuestions);
      expect(snackbarService.showSuccess).toHaveBeenCalledWith(quizCRUDMessages.questionAdded);
    });

    it('should add a True/False question when form is valid', () => {
      const emitSpy = jest.spyOn(component.selectedQuestionsChangeFromInnerStep3Option1, 'emit');

      component.questionForm.setValue({
        type: QuestionType.TrueFalse,
        difficulty: 2,
        questionText: 'Is the Earth flat?',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        correctAnswer: false,
      });

      component.addQuestion();

      expect(component.selectedQuestions.length).toBe(1);
      expect(component.selectedQuestions[0]).toEqual({
        categoryId: mockBattleStep1Data.categoryId,
        queDifficultyId: 2,
        queDifficultyName: 'Medium',
        queText: 'Is the Earth flat?',
        queTypeId: QuestionType.TrueFalse,
        queTypeName: 'True/False',
        queOptionsAns: [{ id: 1, key: 'answer', value: 'False' }],
      });
      expect(emitSpy).toHaveBeenCalledWith(component.selectedQuestions);
      expect(snackbarService.showSuccess).toHaveBeenCalledWith(quizCRUDMessages.questionAdded);
    });

    it('should handle addQuestion MCQ error when not unique options', () => {
      component.questionTypeOptions = [{ value: 1, label: 'Multiple Choice' }];
      component.questionForm = new FormBuilder().group({
        type: [1],
        difficulty: [1],
        questionText: ['Test'],
        correctAnswer: ['wrongAnswer'],
        option1: ['opt1'],
        option2: ['opt1'],
        option3: ['opt3'],
        option4: ['opt4'],
      });
      component.addQuestion();
      expect(snackbarService.showError).toHaveBeenCalled();
      expect(component.selectedQuestions.length).toBe(0);
    });

    it('should add a ShortAnswer question when form is valid', () => {
      const emitSpy = jest.spyOn(component.selectedQuestionsChangeFromInnerStep3Option1, 'emit');

      component.questionForm.setValue({
        type: QuestionType.ShortAnswer,
        difficulty: 3,
        questionText: 'What is 2 + 2?',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        correctAnswer: '4',
      });

      component.addQuestion();

      expect(component.selectedQuestions.length).toBe(1);
      expect(component.selectedQuestions[0]).toEqual({
        categoryId: mockBattleStep1Data.categoryId,
        queDifficultyId: 3,
        queDifficultyName: 'Hard',
        queText: 'What is 2 + 2?',
        queTypeId: QuestionType.ShortAnswer,
        queTypeName: 'Short Answer',
        queOptionsAns: [{ id: 1, key: 'answer', value: '4' }],
      });
      expect(emitSpy).toHaveBeenCalledWith(component.selectedQuestions);
      expect(snackbarService.showSuccess).toHaveBeenCalledWith(quizCRUDMessages.questionAdded);
    });

    it('should add FillInTheBlank question with formatted blanks (case 4)', () => {
      component.questionTypeOptions = [{ value: 4, label: 'Fill in the Blank' }];
      component.questionForm = new FormBuilder().group({
        type: [4],
        difficulty: [1],
        questionText: ['Q with {{}} inside'],
        correctAnswer: ['ExpectedAnswer'],
      });

      component.addQuestion();

      expect(component.selectedQuestions.length).toBe(1);
      // question text should be formatted with "__________"
      expect(component.selectedQuestions[0].queText).toContain('__________');
      // answer should be added
      expect(component.selectedQuestions[0].queOptionsAns![0].value).toBe('ExpectedAnswer');
    });

    it('should not add FillInTheBlank question if no placeholder exists (case 4)', () => {
      const spy = jest.spyOn(component['snackbar'], 'showError');

      component.questionTypeOptions = [{ value: 4, label: 'Fill in the Blank' }];
      component.questionForm = new FormBuilder().group({
        type: [4],
        difficulty: [1],
        questionText: ['Q without placeholder'],
        correctAnswer: ['ExpectedAnswer'],
      });

      component.addQuestion();

      expect(component.selectedQuestions.length).toBe(0);
      expect(spy).toHaveBeenCalledWith(
        'Question text must contain at least one "{{}}" placeholder for the blank.',
      );
    });

    describe('addQuestion duplicate handling', () => {
      beforeEach(() => {
        component.selectedQuestions = [];
      });

      it('should add a new True/False question if no duplicate text exists', () => {
        component.questionTypeOptions = [{ value: 2, label: 'True/False' }];
        component.questionForm = new FormBuilder().group({
          type: [2],
          difficulty: [1],
          questionText: ['Q1'],
          correctAnswer: [true],
        });

        component.addQuestion();

        expect(component.selectedQuestions.length).toBe(1);
        expect(component.selectedQuestions[0].queOptionsAns![0].value).toBe('True');
      });

      it('should add a new Short Answer question with same text but different type', () => {
        // Add first True/False with text QX
        component.selectedQuestions.push({
          queText: 'QX',
          queTypeId: 2,
          queTypeName: 'True/False',
          queDifficultyId: 2,
          queDifficultyName: 'Easy',
          queOptionsAns: [{ id: 1, key: 'answer', value: 'True' }],
        });

        component.questionTypeOptions = [{ value: 3, label: 'Subjective' }];
        component.questionForm = new FormBuilder().group({
          type: [3],
          difficulty: [1],
          questionText: ['QX'], // same text, different type
          correctAnswer: ['Answer'],
        });

        component.addQuestion();

        expect(component.selectedQuestions.length).toBe(2);
        expect(component.selectedQuestions[1].queOptionsAns![0].value).toBe('Answer');
      });

      it('should block adding duplicate FillInTheBlank with same text and type', () => {
        const spy = jest.spyOn(component['snackbar'], 'showError');

        // Add first FillInTheBlank with text
        component.selectedQuestions.push({
          queText: 'Q with __________',
          queTypeId: 4,
          queOptionsAns: [{ id: 1, key: 'answer', value: 'Ans' }],
        });

        component.questionTypeOptions = [{ value: 4, label: 'Fill in the Blank' }];
        component.questionForm = new FormBuilder().group({
          type: [4],
          difficulty: [1],
          questionText: ['Q with {{}}'], // will format to same text
          correctAnswer: ['Ans'],
        });

        component.addQuestion();

        expect(component.selectedQuestions.length).toBe(1);
        expect(spy).toHaveBeenCalledWith(quizCRUDMessages.duplicateQuestionError);
      });

      it('should not add invalid type (default case)', () => {
        component.questionTypeOptions = [{ value: 99, label: 'Invalid' }];
        component.questionForm = new FormBuilder().group({
          type: [99],
          difficulty: [1],
          questionText: ['Invalid Q'],
          correctAnswer: ['x'],
        });

        component.addQuestion();

        expect(component.selectedQuestions.length).toBe(0);
      });
    });

    it('should not add question if difficulty limit is reached', () => {
      component.selectedQuestions = Array(5)
        .fill(0)
        .map((_, index) => ({
          id: index + 10,
          categoryId: 1,
          queDifficultyId: 1,
          queDifficultyName: 'Easy',
          queText: `Question ${index + 10}`,
          queTypeId: QuestionType.MultipleOptions,
          queTypeName: 'Multiple Choice',
          queOptionsAns: [],
        }));

      component.questionForm.setValue({
        type: QuestionType.MultipleOptions,
        difficulty: 1,
        questionText: 'What is the capital of France?',
        option1: 'Paris',
        option2: 'London',
        option3: 'Berlin',
        option4: 'Madrid',
        correctAnswer: 'Paris',
      });

      component.addQuestion();

      expect(component.selectedQuestions.length).toBe(5);
      expect(snackbarService.showError).toHaveBeenCalledWith(
        quizCRUDMessages.maxDifficultyQuestionsError(5, 'Easy'),
      );
    });

    it('should handle zero difficulty limit', () => {
      const limitedData: BattleStep1Data = {
        ...mockBattleStep1Data,
        questionsDifficulty: [{ queDifficultyId: 1, noOfQues: 0, timePerQuestion: 30 }],
      };
      component.battleStep1Data = limitedData;
      component.selectedQuestions = [];

      component.questionForm.setValue({
        type: QuestionType.MultipleOptions,
        difficulty: 1,
        questionText: 'What is the capital?',
        option1: 'Paris',
        option2: 'London',
        option3: 'Berlin',
        option4: 'Madrid',
        correctAnswer: 'Paris',
      });

      component.addQuestion();

      expect(component.selectedQuestions.length).toBe(0);
      expect(snackbarService.showError).toHaveBeenCalledWith(
        quizCRUDMessages.maxDifficultyQuestionsError(0, 'Easy'),
      );
    });
  });

  describe('UI Interactions', () => {
    it('should emit close event when closeOption is called', () => {
      const emitSpy = jest.spyOn(component.closeQuestionAdditionOption, 'emit');

      component.closeOption();

      expect(emitSpy).toHaveBeenCalled();
    });

    it('should reset form after adding a question', () => {
      component.questionForm.setValue({
        type: QuestionType.MultipleOptions,
        difficulty: 1,
        questionText: 'What is the capital of France?',
        option1: 'Paris',
        option2: 'London',
        option3: 'Berlin',
        option4: 'Madrid',
        correctAnswer: 'Paris',
      });

      component.addQuestion();

      expect(component.questionForm.pristine).toBe(true);
      expect(component.questionForm.get('questionText')?.value).toBe(null);
    });
  });

  describe('getDropDownsData', () => {
    it('should update form fields with dropdown options', () => {
      component.getDropDownsData();

      const difficultyField = component.questionFormFieldForAddQuestionManuallyStep3.find(
        (f) => f.name === 'difficulty',
      );
      const typeField = component.questionFormFieldForAddQuestionManuallyStep3.find(
        (f) => f.name === 'type',
      );

      expect(difficultyField?.options).toEqual(mockQuestionDifficultyOption);
      expect(typeField?.options).toEqual(mockQuestionTypeOptions);
      expect(component.questionForm.get('type')?.value).toBe(mockQuestionTypeOptions[0].value);
    });

    it('should handle empty options', () => {
      component.questionDifficultyOption = [];
      component.questionTypeOptions = [];

      // This should not throw an error anymore
      component.getDropDownsData();

      const difficultyField = component.questionFormFieldForAddQuestionManuallyStep3.find(
        (f) => f.name === 'difficulty',
      );
      const typeField = component.questionFormFieldForAddQuestionManuallyStep3.find(
        (f) => f.name === 'type',
      );

      expect(difficultyField?.options).toEqual([]);
      expect(typeField?.options).toEqual([]);
    });
  });

  describe('isTrueFalseType', () => {
    it('should return true for True/False type', () => {
      component.questionForm.get('type')?.setValue(QuestionType.TrueFalse);
      expect(component.isTrueFalseType()).toBe(true);
    });

    it('should return false for non-True/False type', () => {
      component.questionForm.get('type')?.setValue(QuestionType.MultipleOptions);
      expect(component.isTrueFalseType()).toBe(false);
    });
  });

  describe('isFillInTheBlanksType', () => {
    it('should return true for Fill in the Blanks type', () => {
      component.questionForm.get('type')?.setValue(QuestionType.FillInTheBlank);
      expect(component.isFillInTheBlanksType()).toBe(true);
    });

    it('should return false for non-Fill in the Blanks type', () => {
      component.questionForm.get('type')?.setValue(QuestionType.MultipleOptions);
      expect(component.isFillInTheBlanksType()).toBe(false);
    });
  });

  describe('getDifficultyLabel', () => {
    it('should return correct difficulty label', () => {
      expect(component.getDifficultyLabel(1)).toBe('Easy');
      expect(component.getDifficultyLabel(2)).toBe('Medium');
      expect(component.getDifficultyLabel(3)).toBe('Hard');
    });

    it('should return empty string for invalid difficulty', () => {
      component.questionDifficultyOption = mockQuestionDifficultyOption;
      expect(component.getDifficultyLabel(999)).toBe('');
    });
  });

  describe('getErrorQuestionForm', () => {
    it('should call validationErrorService with minlength error', () => {
      const control = component.questionForm.get('questionText')!;
      const field = questionFormFieldForAddQuestionManually.find((f) => f.name === 'questionText')!;
      control.setErrors({ minlength: true });

      component.getErrorQuestionForm('questionText');

      expect(validationErrorService.getErrorMessage).toHaveBeenCalledWith(
        control,
        field.validationMessages,
        'questionText',
      );
    });

    it('should call validationErrorService with maxlength error', () => {
      const control = component.questionForm.get('questionText')!;
      const field = questionFormFieldForAddQuestionManually.find((f) => f.name === 'questionText')!;
      control.setErrors({ maxlength: true });

      component.getErrorQuestionForm('questionText');

      expect(validationErrorService.getErrorMessage).toHaveBeenCalledWith(
        control,
        field.validationMessages,
        'questionText',
      );
    });
  });
});
