import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { QuizCreationStep3AiGenerationComponent } from './quiz-creation-step-3-ai-generation.component';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { QuestionPoolService } from '../../../../../services/admin/question-pool/question-pool.service';
import { ValidationErrorService } from '../../../../../shared/service/validation-error/validation-error.service';
import { DropdownService } from '../../../../../shared/service/dropdown/dropdown.service';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { platformMessages } from '../../../../../utils/constants';
import {
  QuestionsList,
  QuizStep1Data,
} from '../../../../../shared/interfaces/quiz-creation.interface';
import { DropDownData } from '../../../../../shared/interfaces/drop-down-data.interface';
import { DropDownType } from '../../../../../shared/enums/dropdown-types.enum';
import { ApiResponse } from '../../../../../shared/interfaces/api-response.interface';
import { QuestionPoolListData } from '../../../question-pool/interfaces/question-pool-list-data.interface';

describe('QuizCreationStep3AiGenerationComponent', () => {
  let component: QuizCreationStep3AiGenerationComponent;
  let fixture: ComponentFixture<QuizCreationStep3AiGenerationComponent>;
  let dialog: jest.Mocked<MatDialog>;
  let snackbarService: jest.Mocked<SnackbarService>;
  let questionPoolService: jest.Mocked<QuestionPoolService>;
  let validationErrorService: jest.Mocked<ValidationErrorService>;
  let dropdownService: jest.Mocked<DropdownService>;
  let fb: FormBuilder;

  const mockQuizStep1Data: QuizStep1Data = {
    quizTitle: 'Test Quiz',
    quizCategory: 1,
    quizCategoryName: 'Science',
    description: 'Test Description',
    quizTiming: 30,
    difficultyLevel: 2,
    isPaid: false,
    price: 0,
    totalQuestions: 5,
    tags: [],
    difficultyDistribution: [
      { key: 'easyQuestions', value: 2 },
      { key: 'mediumQuestions', value: 2 },
      { key: 'hardQuestions', value: 1 },
    ],
  };

  const mockQuestionsList: QuestionsList[] = [
    {
      id: 1,
      categoryId: 1,
      queDifficultyId: 1,
      queDifficultyName: 'Easy',
      queText: 'Test Question 1',
      queTypeId: 1,
      queTypeName: 'Multiple Choice',
      queOptionsAns: [],
    },
  ];

  const mockDropdownData: DropDownData[] = [
    { id: 1, name: 'Easy' },
    { id: 2, name: 'Medium' },
    { id: 3, name: 'Hard' },
  ];

  const mockTypeData: DropDownData[] = [
    { id: 1, name: 'Multiple Choice' },
    { id: 2, name: 'True/False' },
  ];

  beforeEach(async () => {
    const dialogMock = {
      open: jest.fn(),
    };

    const snackbarMock = {
      showError: jest.fn(),
      showSuccess: jest.fn(),
      showInfo: jest.fn(),
    };

    const questionPoolServiceMock = {
      generateQuestionsFromTextPrompt: jest.fn(),
      getQuestionsUsingWebUrl: jest.fn(),
      generateQuestionsFromPdf: jest.fn(),
    };

    const validationErrorServiceMock = {
      getErrorMessage: jest.fn(),
    };

    const dropdownServiceMock = {
      getDropdownData: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, QuizCreationStep3AiGenerationComponent],
      providers: [
        FormBuilder,
        { provide: MatDialog, useValue: dialogMock },
        { provide: SnackbarService, useValue: snackbarMock },
        { provide: QuestionPoolService, useValue: questionPoolServiceMock },
        { provide: ValidationErrorService, useValue: validationErrorServiceMock },
        { provide: DropdownService, useValue: dropdownServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizCreationStep3AiGenerationComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);
    dialog = TestBed.inject(MatDialog) as jest.Mocked<MatDialog>;
    snackbarService = TestBed.inject(SnackbarService) as jest.Mocked<SnackbarService>;
    questionPoolService = TestBed.inject(QuestionPoolService) as jest.Mocked<QuestionPoolService>;
    validationErrorService = TestBed.inject(
      ValidationErrorService,
    ) as jest.Mocked<ValidationErrorService>;
    dropdownService = TestBed.inject(DropdownService) as jest.Mocked<DropdownService>;

    // Set up component inputs
    component.quizStep1Data = mockQuizStep1Data;
    component.selectedQuestions = [...mockQuestionsList];

    // Mock dropdown service responses
    dropdownService.getDropdownData.mockImplementation((type: DropDownType) => {
      if (type === DropDownType.QuestionDifficulty) {
        return of(mockDropdownData);
      } else if (type === DropDownType.QuestionType) {
        return of(mockTypeData);
      }
      return of([]);
    });

    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize forms and load dropdowns', () => {
      expect(component.generationForm).toBeDefined();
      expect(component.specBuilderForm).toBeDefined();
      expect(dropdownService.getDropdownData).toHaveBeenCalledWith(DropDownType.QuestionDifficulty);
      expect(dropdownService.getDropdownData).toHaveBeenCalledWith(DropDownType.QuestionType);
    });

    it('should initialize componentQuestions with selectedQuestions', () => {
      expect(component.componentQuestions).toEqual(mockQuestionsList);
    });

    it('should build difficulty info from quizStep1Data', () => {
      component.buildDifficultyInfo();
      expect(component.difficultyInfo).toHaveLength(3);
      expect(component.difficultyInfo[0]).toEqual({ name: 'Easy', value: 2 });
    });
  });

  describe('Form Building', () => {
    it('should build generation form with correct controls', () => {
      expect(component.generationForm.contains('prompt')).toBe(true);
      expect(component.generationForm.contains('url')).toBe(true);
      expect(component.generationForm.contains('file')).toBe(true);
    });

    it('should build spec builder form with correct controls and validators', () => {
      expect(component.specBuilderForm.contains('difficulty')).toBe(true);
      expect(component.specBuilderForm.contains('type')).toBe(true);
      expect(component.specBuilderForm.contains('noOfQuestions')).toBe(true);

      const noOfQuestionsControl = component.specBuilderForm.get('noOfQuestions');
      // Check if validators are present (either required or min)
      expect(noOfQuestionsControl?.validator).toBeTruthy();
    });
  });

  describe('Spec Builder Methods', () => {
    beforeEach(() => {
      component.difficultyList = mockDropdownData;
      component.typeList = mockTypeData;
      component.specBuilderForm.patchValue({
        difficulty: { id: 1, name: 'Easy' },
        type: { id: 1, name: 'Multiple Choice' },
        noOfQuestions: 2,
      });
    });

    it('should add spec when form is valid', () => {
      component.onAddSpec();

      expect(component.addedSpecs).toHaveLength(1);
      expect(component.addedSpecs[0].questionDifficultyId).toBe(1);
      expect(component.addedSpecs[0].questionPerQuestionType).toHaveLength(1);
    });

    it('should not add spec when form is invalid', () => {
      component.specBuilderForm.patchValue({
        difficulty: null,
        type: null,
        noOfQuestions: 0,
      });

      component.onAddSpec();

      expect(component.addedSpecs).toHaveLength(0);
    });

    it('should respect max AI questions limit', () => {
      component.specBuilderForm.patchValue({
        noOfQuestions: 15, // Exceeds max of 10
      });

      component.onAddSpec();

      expect(snackbarService.showError).toHaveBeenCalledWith(
        expect.stringContaining('The maximum for AI generation is 10 questions'),
      );
      expect(component.addedSpecs).toHaveLength(0);
    });

    it('should remove spec correctly', () => {
      // First add a spec
      component.onAddSpec();

      const spec = component.addedSpecs[0];
      const type = spec.questionPerQuestionType[0];

      component.onRemoveSpec(spec, type);

      expect(component.addedSpecs).toHaveLength(0);
    });

    it('should reset all specs', () => {
      // Add some specs first
      component.onAddSpec();

      component.onResetAll();

      expect(component.addedSpecs).toHaveLength(0);
    });
  });

  describe('Generation Method Selection', () => {
    it('should select method and update validators', () => {
      component.selectMethod('url');

      expect(component.selectedGenerationMethod).toBe('url');
      // The validators are set dynamically, so we just check the method was selected
      expect(component.selectedGenerationMethod).toBe('url');
    });

    it('should reset file and content when changing method', () => {
      component.selectedFile = new File([''], 'test.pdf');
      component.pdfContent = 'test content';

      component.selectMethod('text');

      expect(component.selectedFile).toBeNull();
      expect(component.pdfContent).toBe('');
    });
  });

  describe('File Handling', () => {
    it('should handle valid PDF file selection', () => {
      const file = new File([''], 'test.pdf', { type: 'application/pdf' });
      const event = {
        target: {
          files: [file],
        },
      } as unknown as Event;

      component.onFileSelected(event);

      expect(component.selectedFile).toBe(file);
      expect(component.generationForm.get('file')?.value).toBe('test.pdf');
    });

    it('should reject non-PDF files', () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' });
      const event = {
        target: {
          files: [file],
        },
      } as unknown as Event;

      component.onFileSelected(event);

      expect(component.selectedFile).toBeNull();
      expect(snackbarService.showError).toHaveBeenCalledWith('Please upload a PDF file');
      expect(component.generationForm.get('file')?.errors).toBeTruthy();
    });
  });

  describe('Question Generation', () => {
    beforeEach(() => {
      component.difficultyList = mockDropdownData;
      component.typeList = mockTypeData;
      component.specBuilderForm.patchValue({
        difficulty: { id: 1, name: 'Easy' },
        type: { id: 1, name: 'Multiple Choice' },
        noOfQuestions: 2,
      });
      component.onAddSpec();

      component.selectMethod('text');
      component.generationForm.patchValue({ prompt: 'Test prompt' });

      component.generationForm.get('prompt')?.setErrors(null);
      component.generationForm.updateValueAndValidity();
    });

    it('should generate questions from text successfully', fakeAsync(() => {
      const mockResponse: ApiResponse<QuestionPoolListData[]> = {
        result: true,
        data: [
          {
            id: 1,
            categoryId: 1,
            categoryName: 'Science',
            queDifficultyId: 1,
            queDifficultyName: 'Easy',
            queText: 'Generated question',
            queTypeId: 1,
            queTypeName: 'Multiple Choice',
            queOptionsAns: [],
          },
        ],
        statusCode: 200,
        message: 'Success',
      };

      questionPoolService.generateQuestionsFromTextPrompt.mockReturnValue(of(mockResponse));

      // Mock dialog to return the questions
      const dialogRefMock = { afterClosed: () => of(mockResponse.data) };
      dialog.open.mockReturnValue(dialogRefMock as any);

      component.generateQuestions();
      tick();

      expect(questionPoolService.generateQuestionsFromTextPrompt).toHaveBeenCalled();
      expect(snackbarService.showSuccess).toHaveBeenCalledWith(
        platformMessages.successTitle,
        'Questions successfully created!',
      );
      expect(dialog.open).toHaveBeenCalled();
    }));

    it('should generate questions from URL successfully', fakeAsync(() => {
      component.selectMethod('url');
      component.generationForm.patchValue({ url: 'https://example.com' });

      const mockResponse: ApiResponse<QuestionPoolListData[]> = {
        result: true,
        data: [],
        statusCode: 200,
        message: 'Success',
      };

      questionPoolService.getQuestionsUsingWebUrl.mockReturnValue(of(mockResponse));
      const dialogRefMock = { afterClosed: () => of([]) };
      dialog.open.mockReturnValue(dialogRefMock as any);

      component.generateQuestions();
      tick();

      expect(questionPoolService.getQuestionsUsingWebUrl).toHaveBeenCalled();
    }));

    it('should handle generation failure when API returns error', fakeAsync(() => {
      const mockResponse: ApiResponse<QuestionPoolListData[]> = {
        result: false,
        data: [],
        statusCode: 400,
        message: 'Generation failed',
      };

      questionPoolService.generateQuestionsFromTextPrompt.mockReturnValue(of(mockResponse));

      component.generateQuestions();
      tick();

      expect(snackbarService.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        'Generation failed',
      );
    }));

    it('should handle generation API error', fakeAsync(() => {
      questionPoolService.generateQuestionsFromTextPrompt.mockReturnValue(
        throwError(() => ({ error: { message: 'API Error' } })),
      );

      component.generateQuestions();
      tick();

      expect(snackbarService.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        'API Error',
      );
    }));

    it('should show error when no specs added', () => {
      component.addedSpecs = [];

      component.generateQuestions();

      expect(snackbarService.showError).toHaveBeenCalledWith(
        'Please add at least one AI configuration.',
      );
    });

    it('should show error when source is invalid', () => {
      component.selectMethod('text');
      // Don't set prompt value to make form invalid

      component.generateQuestions();

      expect(snackbarService.showError).toHaveBeenCalledWith(
        'Please provide the content (text, URL, or PDF).',
      );
    });
  });

  describe('Question Management', () => {
    it('should update generated questions table', () => {
      component.componentQuestions = mockQuestionsList;
      component.updateGeneratedQuestionsTable();

      expect(component.questionsTableData).toHaveLength(1);
      expect(component.totalGeneratedQuestions).toBe(1);
    });

    it('should handle page changes correctly', () => {
      // Set up some test data
      component.componentQuestions = Array(10)
        .fill(0)
        .map((_, i) => ({
          ...mockQuestionsList[0],
          id: i + 1,
        }));
      component.pageSizeSelected = 5;

      const pageEvent = { pageIndex: 1, pageSize: 5 };
      component.pageChangeTableSelectedQuestions(pageEvent);

      expect(component.currentPageSelected).toBe(2);
      expect(component.pageSizeSelected).toBe(5);
    });
    it('should adjust current page when data is empty', () => {
      component.componentQuestions = [];
      component.currentPageSelected = 2;

      component.updateGeneratedQuestionsTable();

      expect(component.currentPageSelected).toBe(1);
    });

    it('should fill missing labels for selected questions', () => {
      const questionsWithMissingLabels: QuestionsList[] = [
        {
          id: 1,
          categoryId: 1,
          queDifficultyId: 1,
          queDifficultyName: undefined,
          queText: 'Test Question',
          queTypeId: 1,
          queTypeName: undefined,
          queOptionsAns: [],
        },
      ];

      component.componentQuestions = questionsWithMissingLabels;
      component.difficultyList = mockDropdownData;
      component.typeList = mockTypeData;

      component.fillMissingLabelsForSelectedQuestions();

      expect(component.componentQuestions[0].queDifficultyName).toBe('Easy');
      expect(component.componentQuestions[0].queTypeName).toBe('Multiple Choice');
    });
  });

  describe('Validation Methods', () => {
    it('should validate selected questions within limits', () => {
      component.componentQuestions = mockQuestionsList;
      const isValid = component['areAllSelectedQuestionsWithinLimit']();

      expect(isValid).toBe(true);
    });

    it('should invalidate when questions exceed difficulty limits', () => {
      const manyQuestions = Array(10)
        .fill(0)
        .map((_, i) => ({
          ...mockQuestionsList[0],
          id: i + 1,
          queDifficultyName: 'Easy',
        }));

      component.componentQuestions = manyQuestions;
      const isValid = component['areAllSelectedQuestionsWithinLimit']();

      expect(isValid).toBe(false);
    });

    it('should invalidate when questions exceed total limit', () => {
      const manyQuestions = Array(10)
        .fill(0)
        .map((_, i) => ({
          ...mockQuestionsList[0],
          id: i + 1,
          queDifficultyName: i < 2 ? 'Easy' : i < 4 ? 'Medium' : 'Hard',
        }));

      component.componentQuestions = manyQuestions;
      const isValid = component['areAllSelectedQuestionsWithinLimit']();

      expect(isValid).toBe(false);
    });

    it('should get total required for difficulty', () => {
      component.difficultyList = mockDropdownData;
      const total = component.getTotalRequired(1); // Easy difficulty
      expect(total).toBe(2);
    });

    it('should get total added for difficulty', () => {
      component.specBuilderForm.patchValue({
        difficulty: { id: 1, name: 'Easy' },
        type: { id: 1, name: 'Multiple Choice' },
        noOfQuestions: 2,
      });
      component.onAddSpec();

      const totalAdded = component.getTotalAddedForDifficulty(1);
      expect(totalAdded).toBe(2);
    });

    it('should get total added overall', () => {
      component.specBuilderForm.patchValue({
        difficulty: { id: 1, name: 'Easy' },
        type: { id: 1, name: 'Multiple Choice' },
        noOfQuestions: 2,
      });
      component.onAddSpec();

      const totalOverall = component.getTotalAddedOverall();
      expect(totalOverall).toBe(2);
    });
  });

  describe('Error Handling', () => {
    it('should get error message for form fields', () => {
      component.selectedGenerationMethod = 'text';
      component.generationForm.get('prompt')?.setErrors({ required: true });

      validationErrorService.getErrorMessage.mockReturnValue('This field is required');

      const error = component.getError('prompt');

      expect(error).toBe('This field is required');
      expect(validationErrorService.getErrorMessage).toHaveBeenCalled();
    });

    it('should return null for non-existent control', () => {
      const error = component.getError('nonexistent');
      expect(error).toBeNull();
    });
  });

  describe('Close Method', () => {
    it('should emit close event', () => {
      const emitSpy = jest.spyOn(component.closeQuestionAdditionOption, 'emit');

      component.close();

      expect(emitSpy).toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy subject', () => {
      const nextSpy = jest.spyOn(component['destroy$'], 'next');
      const completeSpy = jest.spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });
});
