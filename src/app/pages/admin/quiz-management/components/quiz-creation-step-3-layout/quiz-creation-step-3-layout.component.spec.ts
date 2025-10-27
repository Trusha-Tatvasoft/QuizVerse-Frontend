import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { QuizCreationStep3LayoutComponent } from './quiz-creation-step-3-layout.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { QuizCreationService } from '../../../../../services/admin/quiz-management/quiz-creation/quiz-creation.service';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { DynamicFormField } from '../../../../../shared/interfaces/dynamic-form-field.interface';
import { quizCRUDMessages } from '../../../../../utils/constants';
import { QuestionsList } from '../../../battle-management/interfaces/battle-creation.interface';

describe('QuizCreationStep3LayoutComponent', () => {
  let component: QuizCreationStep3LayoutComponent;
  let fixture: ComponentFixture<QuizCreationStep3LayoutComponent>;
  let quizService: jest.Mocked<QuizCreationService>;
  let snackbar: jest.Mocked<SnackbarService>;
  let dialog: jest.Mocked<MatDialog>;

  beforeEach(async () => {
    const quizServiceMock = {
      getDropDownData: jest.fn().mockReturnValue(of({ data: [{ id: 1, name: 'Easy' }] })),
    };
    const snackbarMock = {
      showError: jest.fn(),
      showSuccess: jest.fn(),
      showInfo: jest.fn(),
    };
    const dialogMock = {
      open: jest.fn().mockReturnValue({
        afterClosed: () => of(true),
      } as MatDialogRef<any>),
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, QuizCreationStep3LayoutComponent], // standalone import
      providers: [
        FormBuilder,
        { provide: QuizCreationService, useValue: quizServiceMock },
        { provide: SnackbarService, useValue: snackbarMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizCreationStep3LayoutComponent);
    component = fixture.componentInstance;

    quizService = TestBed.inject(QuizCreationService) as jest.Mocked<QuizCreationService>;
    snackbar = TestBed.inject(SnackbarService) as jest.Mocked<SnackbarService>;
    dialog = TestBed.inject(MatDialog) as jest.Mocked<MatDialog>;

    // Provide required @Input
    component.quizStep1Data = {
      quizCategory: 1,
      difficultyDistribution: [{ key: 'Easy', value: 2 }],
      totalQuestions: 10,
    } as any;

    // Manually call ngOnInit to initialize questionForm
    component.ngOnInit();

    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should build form and fetch dropdowns', () => {
    const buildSpy = jest.spyOn(component as any, 'buildQuestionForm');
    const dropdownSpy = jest.spyOn(component, 'getDropDownsData');
    component.ngOnInit();
    expect(buildSpy).toHaveBeenCalled();
    expect(dropdownSpy).toHaveBeenCalled();
  });

  it('ngOnDestroy should complete destroy$', () => {
    const spyNext = jest.spyOn((component as any).destroy$, 'next');
    const spyComplete = jest.spyOn((component as any).destroy$, 'complete');
    component.ngOnDestroy();
    expect(spyNext).toHaveBeenCalled();
    expect(spyComplete).toHaveBeenCalled();
  });

  it('should fill missing labels', () => {
    component.questionDifficultyOption = [{ value: 1, label: 'Easy' }];
    component.questionTypeOptions = [{ value: 1, label: 'MCQ' }];
    component.selectedQuestions = [{ queDifficultyId: 1, queTypeId: 1, queText: 'Q' } as any];
    component.fillMissingLabelsForSelectedQuestions();
    expect(component.selectedQuestions[0].queDifficultyName).toBe('Easy');
    expect(component.selectedQuestions[0].queTypeName).toBe('MCQ');
  });

  it('should correctly detect true/false type', () => {
    component.questionTypeOptions = [{ value: 1, label: 'True/False' }];
    component.questionForm.get('type')?.setValue(1);
    expect(component.isTrueFalseType()).toBe(true);
  });

  it('should correctly detect fill in the blanks type', () => {
    component.questionTypeOptions = [{ value: 1, label: 'Fill in the Blank' }];
    component.questionForm.get('type')?.setValue(1);
    expect(component.isFillInTheBlanksType()).toBe(true);
  });

  it('should update fields based on type', () => {
    component.questionTypeOptions = [
      { value: 1, label: 'Multiple Choice' },
      { value: 2, label: 'True/False' },
    ];
    component.questionForm = new FormBuilder().group({
      type: [1],
      correctAnswer: [''],
      option1: [''],
      option2: [''],
      option3: [''],
      option4: [''],
    });
    component.updateFieldsBasedOnType(1);
    expect(component.questionForm.get('correctAnswer')?.validator).toBeTruthy();
  });

  it('should add question successfully', () => {
    component.questionTypeOptions = [{ value: 1, label: 'Multiple Choice' }];
    component.questionForm = new FormBuilder().group({
      type: [1],
      difficulty: [1],
      questionText: ['Test'],
      correctAnswer: ['option1'],
      option1: ['option1'],
      option2: ['opt2'],
      option3: ['opt3'],
      option4: ['opt4'],
    });
    component.addQuestion();
    expect(component.selectedQuestions.length).toBe(1);
  });

  it('should handle addQuestion MCQ error when correct answer not in options', () => {
    component.questionTypeOptions = [{ value: 1, label: 'Multiple Choice' }];
    component.questionForm = new FormBuilder().group({
      type: [1],
      difficulty: [1],
      questionText: ['Test'],
      correctAnswer: ['wrongAnswer'],
      option1: ['opt1'],
      option2: ['opt2'],
      option3: ['opt3'],
      option4: ['opt4'],
    });
    component.addQuestion();
    expect(snackbar.showError).toHaveBeenCalled();
    expect(component.selectedQuestions.length).toBe(0);
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
    expect(snackbar.showError).toHaveBeenCalled();
    expect(component.selectedQuestions.length).toBe(0);
  });

  it('should update selectedQuestions table', () => {
    component.selectedQuestions = [
      { queText: 'Q1', queTypeName: 'MCQ', queDifficultyName: 'Easy' } as any,
    ];
    component.updateSelectedQuestionsTable();
    expect(component.questionsTableData.length).toBeGreaterThan(0);
  });

  it('should handle page change', () => {
    component.selectedQuestions = Array(10).fill({
      queText: 'Q',
      queTypeName: 'MCQ',
      queDifficultyName: 'Easy',
    } as any);
    component.pageChangeTableSelectedQuestions({ pageIndex: 1, pageSize: 5 });
    expect(component.currentPageSelected).toBe(2);
    expect(component.pageSizeSelected).toBe(5);
  });

  it('should handle delete action with confirmation', fakeAsync(() => {
    const spy = jest.spyOn(component, 'updateSelectedQuestionsTable');
    component.selectedQuestions = [
      { queText: 'Q1', queTypeName: 'MCQ', queDifficultyName: 'Easy' } as any,
    ];
    component.handleDeleteAction({ action: 'delete', row: { index: 0 } } as any);
    tick();
    expect(component.selectedQuestions.length).toBe(0);
    expect(spy).toHaveBeenCalled();
  }));

  it('should update validity correctly', fakeAsync(() => {
    component.selectedQuestions = [{ queDifficultyName: 'Easy' } as any];
    component.updateSelectedQuestionsValidity();
    tick();
    expect(component.isValidSelectedQuestions).toBe(true);
  }));

  it('should return correct isQuestionSelected value', () => {
    component.selectedQuestions = [{ id: 1 } as any];
    expect(component.isQuestionSelected(1)).toBe(true);
    expect(component.isQuestionSelected(2)).toBe(false);
  });

  it('should handle cardClick', () => {
    component.cardClick(1);
    expect(component.selectedQuestionMethodInManualAdditionIndex).toBe(1);
    expect(component.isInnerStep3).toBe(true);
  });

  describe('shouldRenderField', () => {
    beforeEach(() => {
      component.questionForm = new FormBuilder().group({
        type: [1],
        correctAnswer: [''],
        option1: [''],
        option2: [''],
        option3: [''],
        option4: [''],
      });
    });

    it('should return true for always visible fields', () => {
      const field: DynamicFormField = { name: 'type' } as any;
      expect(component.shouldRenderField(field)).toBe(true);
    });

    it('should return true for option fields when type is multiple choice', () => {
      component.questionTypeOptions = [{ value: 1, label: 'Multiple Choice' }];
      component.questionForm.get('type')?.setValue(1);

      const field: DynamicFormField = { name: 'option1' } as any;
      expect(component.shouldRenderField(field)).toBe(true);
    });

    it('should return false for option fields when type is not multiple choice', () => {
      component.questionTypeOptions = [{ value: 1, label: 'True/False' }];
      component.questionForm.get('type')?.setValue(1);

      const field: DynamicFormField = { name: 'option1' } as any;
      expect(component.shouldRenderField(field)).toBe(false);
    });

    it('should return true for correctAnswer when type is true/false', () => {
      component.questionTypeOptions = [{ value: 1, label: 'True/False' }];
      component.questionForm.get('type')?.setValue(1);

      const field: DynamicFormField = { name: 'correctAnswer' } as any;
      expect(component.shouldRenderField(field)).toBe(true);
    });

    it('should return false for unrelated fields', () => {
      component.questionTypeOptions = [{ value: 1, label: 'Subjective' }];
      component.questionForm.get('type')?.setValue(1);

      const field: DynamicFormField = { name: 'randomField' } as any;
      expect(component.shouldRenderField(field)).toBe(false);
    });
  });

  it('should add True/False question (case 2)', () => {
    component.questionTypeOptions = [{ value: 2, label: 'True/False' }];
    component.questionForm = new FormBuilder().group({
      type: [2],
      difficulty: [1],
      questionText: ['Q2'],
      correctAnswer: [true], // true/false
    });

    component.addQuestion();

    expect(component.selectedQuestions.length).toBe(1);
    expect(component.selectedQuestions[0].queOptionsAns![0].value).toBe('True');
  });

  it('should add question for case 3 (Short Answer)', () => {
    component.questionTypeOptions = [{ value: 3, label: 'Subjective' }];
    component.questionForm = new FormBuilder().group({
      type: [3],
      difficulty: [1],
      questionText: ['Q3'],
      correctAnswer: ['Some answer'],
    });

    component.addQuestion();

    expect(component.selectedQuestions.length).toBe(1);
    expect(component.selectedQuestions[0].queOptionsAns![0].value).toBe('Some answer');
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

  it('should not add question for default case (invalid type)', () => {
    component.questionTypeOptions = [{ value: 99, label: 'Invalid' }];
    component.questionForm = new FormBuilder().group({
      type: [99], // type not handled in switch
      difficulty: [1],
      questionText: ['QX'],
      correctAnswer: ['something'],
    });

    component.addQuestion();

    // default returns without adding
    expect(component.selectedQuestions.length).toBe(0);
  });

  it('should return early if correctAnswer control does not exist', () => {
    component.questionTypeOptions = [{ value: 1, label: 'Multiple Choice' }];

    component.questionForm = new FormBuilder().group({
      type: [1],
      option1: [''],
      option2: [''],
      option3: [''],
      option4: [''],
    });

    const spy = jest.spyOn(component.questionForm.get('option1')!, 'setValidators');

    component.updateFieldsBasedOnType(1);

    expect(spy).not.toHaveBeenCalled();
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

  it('should skip updating when option control does not exist', () => {
    component.questionTypeOptions = [{ value: 1, label: 'Multiple Choice' }];

    component.questionForm = new FormBuilder().group({
      type: [1],
      correctAnswer: [''],
      option1: [''],
      option2: [''],
    });

    const spy1 = jest.spyOn(component.questionForm.get('option1')!, 'setValidators');
    const spy2 = jest.spyOn(component.questionForm.get('option2')!, 'setValidators');

    component.updateFieldsBasedOnType(1);

    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();

    expect(component.questionForm.get('option3')).toBeNull();
    expect(component.questionForm.get('option4')).toBeNull();
  });

  describe('Additional Branch Coverage Tests', () => {
    it('should return true for correctAnswer field when type is true/false in shouldRenderField', () => {
      component.questionTypeOptions = [{ value: 2, label: 'True/False' }];
      component.questionForm = new FormBuilder().group({
        type: [2],
        correctAnswer: [''],
      });
      component.questionForm.get('type')?.setValue(2);

      const field: DynamicFormField = { name: 'correctAnswer' } as any;
      expect(component.shouldRenderField(field)).toBe(true);
    });

    it('should show error and not add MCQ question when options are not unique', () => {
      component.questionTypeOptions = [{ value: 1, label: 'Multiple Choice' }];
      component.questionDifficultyOption = [{ value: 1, label: 'Easy' }];
      component.questionForm = new FormBuilder().group({
        type: [1],
        difficulty: [1],
        questionText: ['Test Question'],
        correctAnswer: ['opt1'],
        option1: ['opt1'],
        option2: ['opt2'],
        option3: ['opt2'], // duplicate with option2
        option4: ['opt4'],
      });

      component.addQuestion();

      expect(snackbar.showError).toHaveBeenCalledWith(quizCRUDMessages.notUniqueOptions);
      expect(component.selectedQuestions.length).toBe(0);
    });

    it('should not add question when difficulty limit is reached', () => {
      component.questionTypeOptions = [{ value: 2, label: 'True/False' }];
      component.questionDifficultyOption = [{ value: 1, label: 'Easy' }];
      component.quizStep1Data = {
        quizCategory: 1,
        difficultyDistribution: [{ key: 'EasyQuestions', value: 1 }], // limit is 1
        totalQuestions: 10,
      } as any;

      // Add one Easy question already
      component.selectedQuestions = [
        {
          queDifficultyId: 1,
          queDifficultyName: 'Easy',
          queText: 'Existing Q',
          queTypeId: 2,
        } as any,
      ];

      component.questionForm = new FormBuilder().group({
        type: [2],
        difficulty: [1],
        questionText: ['New Q'],
        correctAnswer: [true],
      });

      component.addQuestion();

      expect(snackbar.showError).toHaveBeenCalledWith(
        quizCRUDMessages.maxDifficultyQuestionsError(1, 'Easy'),
      );
      expect(component.selectedQuestions.length).toBe(1);
    });

    it('should mark form as touched when form is invalid on addQuestion', () => {
      component.questionTypeOptions = [{ value: 1, label: 'Multiple Choice' }];
      component.questionForm = new FormBuilder().group({
        type: [null, Validators.required], // make invalid
        difficulty: [null, Validators.required],
        questionText: ['', Validators.required],
        correctAnswer: ['', Validators.required],
        option1: ['', Validators.required],
        option2: ['', Validators.required],
        option3: ['', Validators.required],
        option4: ['', Validators.required],
      });

      const markTouchedSpy = jest.spyOn(component.questionForm, 'markAllAsTouched');

      component.addQuestion();

      expect(markTouchedSpy).toHaveBeenCalled();
      expect(component.selectedQuestions.length).toBe(0);
    });

    it('should handle error when fetching question difficulty dropdown data', () => {
      const errorResponse = { error: { message: 'Difficulty API error' } };

      quizService.getDropDownData
        .mockReturnValueOnce(of({ data: [], result: true, statusCode: 200, message: 'Success' }))
        .mockReturnValueOnce(throwError(() => errorResponse));

      component.getDropDownsData();

      expect(snackbar.showError).toHaveBeenCalledWith(expect.any(String), 'Difficulty API error');
    });

    it('should handle error when fetching question type dropdown data', () => {
      const errorResponse = { error: { message: 'Type API error' } };

      quizService.getDropDownData
        .mockReturnValueOnce(of({ data: [], result: true, statusCode: 200, message: 'Success' }))
        .mockReturnValueOnce(throwError(() => errorResponse)); // Second call fails

      component.getDropDownsData();

      expect(snackbar.showError).toHaveBeenCalledWith(expect.any(String), 'Type API error');
    });

    it('should decrement currentPageSelected when last item on page > 1 is deleted', () => {
      component.selectedQuestions = [
        { queText: 'Q1', queTypeName: 'MCQ', queDifficultyName: 'Easy' } as any,
        { queText: 'Q2', queTypeName: 'MCQ', queDifficultyName: 'Easy' } as any,
      ];
      component.pageSizeSelected = 1;
      component.currentPageSelected = 2; // On page 2 with 1 item

      component.updateSelectedQuestionsTable();

      // Simulate having only 1 item on the current page
      component.questionsTableData = [
        {
          queText: 'Q2',
          queTypeName: { tagConfig: {} as any },
          queDifficultyName: { tagConfig: {} as any },
          action: [],
          index: 1,
        },
      ];

      // Delete the last item
      component.selectedQuestions = [component.selectedQuestions[0]];
      component.updateSelectedQuestionsTable();

      expect(component.currentPageSelected).toBe(1);
    });

    it('should return false when total selected questions exceed total limit', () => {
      component.quizStep1Data = {
        quizCategory: 1,
        difficultyDistribution: [{ key: 'EasyQuestions', value: 5 }],
        totalQuestions: 3, // Total limit is 3
      } as any;

      component.selectedQuestions = [
        { queDifficultyName: 'Easy' } as any,
        { queDifficultyName: 'Easy' } as any,
        { queDifficultyName: 'Easy' } as any,
        { queDifficultyName: 'Easy' } as any, // 4 questions > limit of 3
      ];

      const result = (component as any).areAllSelectedQuestionsWithinLimit();

      expect(result).toBe(false);
    });

    it('should return true when quizStep1Data is not provided', () => {
      component.quizStep1Data = null as any;
      component.selectedQuestions = [{ queDifficultyName: 'Easy' } as any];

      const result = (component as any).areAllSelectedQuestionsWithinLimit();

      expect(result).toBe(true);
    });

    it('should return true when selectedQuestions is not an array', () => {
      component.quizStep1Data = {
        quizCategory: 1,
        difficultyDistribution: [{ key: 'EasyQuestions', value: 2 }],
        totalQuestions: 10,
      } as any;
      component.selectedQuestions = null as any;

      const result = (component as any).areAllSelectedQuestionsWithinLimit();

      expect(result).toBe(true);
    });
  });

  describe('selectedQuestionsChangeFromInnerStep3Option3Parent', () => {
    it('should update selectedQuestions, totalQuestionsSelected, and call helper methods', () => {
      // Ensure helper methods are mocked so they don't throw
      jest.spyOn(component, 'fillMissingLabelsForSelectedQuestions').mockImplementation(() => {});
      jest.spyOn(component, 'updateSelectedQuestionsTable').mockImplementation(() => {});

      const mockQuestions: QuestionsList[] = [
        { id: 1, queText: 'Q1', queTypeName: 'Multiple Choice' },
        { id: 2, queText: 'Q2', queTypeName: 'Single Choice' },
      ];

      component.selectedQuestionsChangeFromInnerStep3Option3Parent(mockQuestions);

      expect(component.selectedQuestions).toEqual(mockQuestions);
      expect(component.totalQuestionsSelected).toBe(mockQuestions.length);
      expect(component.fillMissingLabelsForSelectedQuestions).toHaveBeenCalled();
      expect(component.updateSelectedQuestionsTable).toHaveBeenCalled();
    });
  });

  describe('closeQuestionAdditionOptionParent', () => {
    it('should set isInnerStep3 to false', () => {
      component.isInnerStep3 = true;

      component.closeQuestionAdditionOptionParent();

      expect(component.isInnerStep3).toBe(false);
    });
  });

  beforeEach(() => {
    // Ensure minimal setup before each test
    component.quizStep1Data = {
      quizCategory: 1,
      difficultyDistribution: [{ key: 'Easy', value: 5 }],
      totalQuestions: 10,
    } as any;

    component.questionTypeOptions = [
      { value: 1, label: 'Multiple Choice' },
      { value: 2, label: 'True/False' },
      { value: 3, label: 'Short Answer' },
      { value: 4, label: 'Fill in the Blank' },
    ];
  });

  // True/False question with false answer
  it('should add a True/False question with false answer', () => {
    component.questionForm.setValue({
      type: 2, // True/False
      difficulty: 1,
      questionText: 'Is this false?',
      correctAnswer: false,
      option1: '',
      option2: '',
      option3: '',
      option4: '',
    });

    component.addQuestion();

    const q = component.selectedQuestions[0];
    expect(q.queOptionsAns![0].value).toBe('False');
    expect(component.totalQuestionsSelected).toBe(1);
  });

  it('should set default categoryId = 0 if quizStep1Data.quizCategory is undefined', () => {
    (component.quizStep1Data as any).quizCategory = null;

    component.questionForm.setValue({
      type: 3, // Short Answer
      difficulty: 1,
      questionText: 'Short answer question',
      correctAnswer: 'Answer',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
    });

    component.addQuestion();

    expect(component.selectedQuestions[0].categoryId).toBe(0);
  });

  it('should set queTypeName to "Unknown" if type option not found', () => {
    component.questionTypeOptions = [];

    component.questionForm.setValue({
      type: 999, // non-existent
      difficulty: 1,
      questionText: 'Unknown type question',
      correctAnswer: 'Answer',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
    });

    component.addQuestion();

    expect(component.selectedQuestions.length).toBe(0);
  });

  // Add question when difficultyLimit is null
  it('should allow adding question if difficultyLimit is null', () => {
    component.quizStep1Data.difficultyDistribution = []; // no limits

    component.questionForm.setValue({
      type: 3, // Short Answer
      difficulty: 1,
      questionText: 'Question without limit',
      correctAnswer: 'Answer',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
    });

    component.addQuestion();

    expect(component.selectedQuestions.length).toBe(1);
  });

  // Fill-in-the-Blank missing placeholder
  it('should show error for Fill-in-the-Blank with missing placeholder', () => {
    component.questionForm.setValue({
      type: 4, // Fill in the Blank
      difficulty: 1,
      questionText: 'This is missing placeholder', // no {{}} here
      correctAnswer: 'Answer',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
    });

    component.addQuestion();

    expect((component as any).snackbar.showError).toHaveBeenCalledWith(
      quizCRUDMessages.fillInTheBlankFormatError,
    );
    expect(component.selectedQuestions.length).toBe(0);
  });

  // MCQ correctAnswer not in options
  it('should show error if MCQ correctAnswer not in options', () => {
    component.questionForm.setValue({
      type: 1, // Multiple Choice
      difficulty: 1,
      questionText: 'MCQ question',
      correctAnswer: 'Z', // invalid
      option1: 'A',
      option2: 'B',
      option3: 'C',
      option4: 'D',
    });

    component.addQuestion();

    expect((component as any).snackbar.showError).toHaveBeenCalledWith(
      quizCRUDMessages.mcqOptionError,
    );
    expect(component.selectedQuestions.length).toBe(0);
  });

  // MCQ options not unique
  it('should show error if MCQ options are not unique', () => {
    component.questionForm.setValue({
      type: 1, // Multiple Choice
      difficulty: 1,
      questionText: 'MCQ duplicate options',
      correctAnswer: 'A',
      option1: 'A',
      option2: 'A', // duplicate
      option3: 'C',
      option4: 'D',
    });

    component.addQuestion();

    expect((component as any).snackbar.showError).toHaveBeenCalledWith(
      quizCRUDMessages.notUniqueOptions,
    );
    expect(component.selectedQuestions.length).toBe(0);
  });
});
