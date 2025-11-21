import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { of, throwError, Subject } from 'rxjs';

import { FromTextComponent } from './from-text.component';
import { SnackbarService } from '../../../../../../../shared/service/snackbar/snackbar.service';
import { ValidationErrorService } from '../../../../../../../shared/service/validation-error/validation-error.service';
import { AiQuestionTabComponent } from '../../ai-question-tab.component';
import { QuestionPoolService } from '../../../../../../../services/admin/question-pool/question-pool.service';
import { ImportQuestionPreviewComponent } from '../../../manual-question-tab/components/import-question-preview/import-question-preview.component';
import {
  generateQuestionFormTextPromptMessages,
  platformMessages,
} from '../../../../../../../utils/constants';
import { promptTextAreaFormFields } from '../../../../configs/question-pool-dialog.config';
import {
  GenerateQuizRequest,
  GenerateQuestionFromPromptRequest,
} from '../../../../interfaces/question-pool-ai-tab.interface';
import {
  QuestionPoolListData,
  QueOptionsAndAns,
} from '../../../../interfaces/question-pool-list-data.interface';

// Mock services
const mockSnackbarService = {
  showError: jest.fn(),
  showSuccess: jest.fn(),
};

const mockValidationErrorService = {
  getErrorMessage: jest.fn(),
};

const mockAiQuestionTabComponent = {
  quizConfig$: new Subject<GenerateQuizRequest | null>(),
};

const mockQuestionPoolService = {
  generateQuestionsFromTextPrompt: jest.fn(),
};

const mockDialog = {
  open: jest.fn(),
};

const mockDialogRef = {
  close: jest.fn(),
};

describe('FromTextComponent', () => {
  let component: FromTextComponent;
  let fixture: ComponentFixture<FromTextComponent>;
  let formBuilder: FormBuilder;
  const mockQuizConfig: GenerateQuizRequest = {
    categoryId: 1,
    category: 'Science',
    questionSpec: [
      {
        questionDifficultyId: 1,
        questionDifficultyName: 'Easy',
        questionPerQuestionType: [
          {
            questionPerQuestionTypeId: 1,
            questionPerQuestionTypeName: 'Multiple Choice',
            noOfQuesitons: 5,
          },
        ],
      },
    ],
  };

  const mockQueOptionsAndAns: QueOptionsAndAns[] = [
    {
      id: 1,
      questionId: 1,
      key: 'option',
      value: 'Option A',
    },
    {
      id: 2,
      questionId: 1,
      key: 'option',
      value: 'Option B',
    },
    {
      id: 3,
      questionId: 1,
      key: 'option',
      value: 'Option C',
    },
    {
      id: 4,
      questionId: 1,
      key: 'answer',
      value: 'Option A',
    },
  ];

  const mockQuestions: QuestionPoolListData[] = [
    {
      id: 1,
      categoryId: 1,
      categoryName: 'Science',
      queDifficultyId: 1,
      queDifficultyName: 'Easy',
      queText: 'What is the chemical symbol for water?',
      queTypeId: 1,
      queTypeName: 'Multiple Choice',
      queOptionsAns: mockQueOptionsAndAns,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FromTextComponent, ReactiveFormsModule, MatInputModule, MatIconModule],
      providers: [
        FormBuilder,
        { provide: SnackbarService, useValue: mockSnackbarService },
        { provide: ValidationErrorService, useValue: mockValidationErrorService },
        { provide: AiQuestionTabComponent, useValue: mockAiQuestionTabComponent },
        { provide: QuestionPoolService, useValue: mockQuestionPoolService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: MatDialogRef, useValue: mockDialogRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FromTextComponent);
    component = fixture.componentInstance;
    formBuilder = TestBed.inject(FormBuilder);

    // Reset all mocks
    jest.clearAllMocks();
    mockAiQuestionTabComponent.quizConfig$ = new Subject<GenerateQuizRequest | null>();

    // Initialize the component
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize form with prompt field', () => {
      expect(component.promptForm).toBeDefined();
      expect(component.promptForm.contains('prompt')).toBe(true);
    });

    it('should set up fields from config', () => {
      expect(component.fields).toEqual(promptTextAreaFormFields);
      expect(component.fields.length).toBe(1);
      expect(component.fields[0].name).toBe('prompt');
    });

    it('should initialize generate button config as disabled', () => {
      expect(component.generateBtnConfig.isDisabled).toBe(true);
    });
  });

  describe('Form Validation', () => {
    it('should mark form as invalid when prompt is empty', () => {
      const promptControl = component.promptForm.get('prompt');
      promptControl?.setValue('');

      expect(promptControl?.valid).toBe(false);
      expect(promptControl?.errors?.['required']).toBeTruthy();
    });

    it('should mark form as invalid when prompt is too short', () => {
      const promptControl = component.promptForm.get('prompt');
      promptControl?.setValue('Short');

      expect(promptControl?.valid).toBe(false);
      expect(promptControl?.errors?.['minlength']).toBeTruthy();
    });

    it('should mark form as invalid when prompt is too long', () => {
      const longText = 'a'.repeat(501);
      const promptControl = component.promptForm.get('prompt');
      promptControl?.setValue(longText);

      expect(promptControl?.valid).toBe(false);
      expect(promptControl?.errors?.['maxlength']).toBeTruthy();
    });

    it('should mark form as invalid when prompt starts with space', () => {
      const promptControl = component.promptForm.get('prompt');
      promptControl?.setValue(' starts with space');

      expect(promptControl?.valid).toBe(false);
      expect(promptControl?.errors?.['pattern']).toBeTruthy();
    });

    it('should mark form as valid when prompt meets all criteria', () => {
      const validPrompt = 'This is a valid prompt that meets all validation criteria.';
      const promptControl = component.promptForm.get('prompt');
      promptControl?.setValue(validPrompt);

      expect(promptControl?.valid).toBe(true);
    });
  });

  describe('Quiz Config Subscription', () => {
    it('should update quizConfig when aiComponent emits new config', () => {
      mockAiQuestionTabComponent.quizConfig$.next(mockQuizConfig);

      expect(component.quizConfig).toEqual(mockQuizConfig);
    });

    it('should filter out null config values', () => {
      mockAiQuestionTabComponent.quizConfig$.next(null);

      expect(component.quizConfig).toBeNull();
    });

    it('should update generate button state when config changes', () => {
      const promptControl = component.promptForm.get('prompt');
      promptControl?.setValue('Valid prompt text that meets all requirements');

      // Initially disabled due to no config
      expect(component.generateBtnConfig.isDisabled).toBe(true);

      // Enable when config is provided
      mockAiQuestionTabComponent.quizConfig$.next(mockQuizConfig);

      expect(component.generateBtnConfig.isDisabled).toBe(false);
    });
  });

  describe('Generate Question', () => {
    beforeEach(() => {
      // Set up valid form and config for most tests
      const promptControl = component.promptForm.get('prompt');
      promptControl?.setValue('Valid prompt text that meets all requirements');
      component.quizConfig = mockQuizConfig;
    });

    it('should show error when form is invalid', () => {
      const promptControl = component.promptForm.get('prompt');
      promptControl?.setValue('');
      promptControl?.markAsTouched();

      component.generateQuestion();

      expect(mockSnackbarService.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        generateQuestionFormTextPromptMessages.enterValidPrompt,
      );
      expect(mockQuestionPoolService.generateQuestionsFromTextPrompt).not.toHaveBeenCalled();
    });

    it('should show error when quiz config is missing', () => {
      component.quizConfig = null;

      component.generateQuestion();

      expect(mockSnackbarService.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        platformMessages.aiConfigRequired,
      );
      expect(mockQuestionPoolService.generateQuestionsFromTextPrompt).not.toHaveBeenCalled();
    });

    it('should show error when question spec is empty', () => {
      component.quizConfig = { ...mockQuizConfig, questionSpec: [] };

      component.generateQuestion();

      expect(mockSnackbarService.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        platformMessages.aiConfigRequired,
      );
      expect(mockQuestionPoolService.generateQuestionsFromTextPrompt).not.toHaveBeenCalled();
    });

    it('should call service and show success on valid request', () => {
      const mockResponse = { data: mockQuestions, success: true };
      mockQuestionPoolService.generateQuestionsFromTextPrompt.mockReturnValue(of(mockResponse));

      component.generateQuestion();

      const expectedPayload: GenerateQuestionFromPromptRequest = {
        ...mockQuizConfig,
        prompt: 'Valid prompt text that meets all requirements',
      };

      expect(mockQuestionPoolService.generateQuestionsFromTextPrompt).toHaveBeenCalledWith(
        expectedPayload,
      );
      expect(mockSnackbarService.showSuccess).toHaveBeenCalledWith(
        platformMessages.successTitle,
        generateQuestionFormTextPromptMessages.questionGeneratedSuccess,
      );
    });

    it('should open preview dialog with correct question data on successful generation', () => {
      const mockResponse = { data: mockQuestions, success: true };
      mockQuestionPoolService.generateQuestionsFromTextPrompt.mockReturnValue(of(mockResponse));
      const mockPreviewDialogRef = { afterClosed: () => of(true) };
      mockDialog.open.mockReturnValue(mockPreviewDialogRef);

      component.generateQuestion();

      expect(mockDialog.open).toHaveBeenCalledWith(ImportQuestionPreviewComponent, {
        minWidth: '50vw',
        maxWidth: '100vw',
        maxHeight: '90vh',
        data: mockQuestions,
      });
    });

    it('should close parent dialog when preview dialog returns result', () => {
      const mockResponse = { data: mockQuestions, success: true };
      mockQuestionPoolService.generateQuestionsFromTextPrompt.mockReturnValue(of(mockResponse));
      const mockPreviewDialogRef = { afterClosed: () => of(true) };
      mockDialog.open.mockReturnValue(mockPreviewDialogRef);

      component.generateQuestion();

      expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });

    it('should handle service error and show error message', () => {
      const mockError = { error: { message: 'Custom error message' } };
      mockQuestionPoolService.generateQuestionsFromTextPrompt.mockReturnValue(
        throwError(() => mockError),
      );

      component.generateQuestion();

      expect(mockSnackbarService.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        'Custom error message',
      );
    });

    it('should use default error message when no custom message provided', () => {
      const mockError = { error: {} };
      mockQuestionPoolService.generateQuestionsFromTextPrompt.mockReturnValue(
        throwError(() => mockError),
      );

      component.generateQuestion();

      expect(mockSnackbarService.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        generateQuestionFormTextPromptMessages.questionGeneratedFailed,
      );
    });

    it('should handle multiple questions in response', () => {
      const multipleQuestions: QuestionPoolListData[] = [
        {
          id: 1,
          categoryId: 1,
          categoryName: 'Science',
          queDifficultyId: 1,
          queDifficultyName: 'Easy',
          queText: 'Question 1?',
          queTypeId: 1,
          queTypeName: 'Multiple Choice',
          queOptionsAns: mockQueOptionsAndAns,
        },
        {
          id: 2,
          categoryId: 1,
          categoryName: 'Science',
          queDifficultyId: 2,
          queDifficultyName: 'Medium',
          queText: 'Question 2?',
          queTypeId: 2,
          queTypeName: 'True/False',
          queOptionsAns: [
            {
              id: 5,
              questionId: 2,
              key: 'answer',
              value: 'True',
            },
          ],
        },
      ];

      const mockResponse = { data: multipleQuestions, success: true };
      mockQuestionPoolService.generateQuestionsFromTextPrompt.mockReturnValue(of(mockResponse));
      const mockPreviewDialogRef = { afterClosed: () => of(true) };
      mockDialog.open.mockReturnValue(mockPreviewDialogRef);

      component.generateQuestion();

      const questionsPassedToDialog = mockDialog.open.mock.calls[0][1]?.data;
      expect(questionsPassedToDialog).toEqual(multipleQuestions);
      expect(questionsPassedToDialog.length).toBe(2);
    });
  });

  describe('Button State Management', () => {
    it('should enable button when form is valid and config is present', () => {
      const promptControl = component.promptForm.get('prompt');
      promptControl?.setValue('Valid prompt text that meets all requirements');
      component.quizConfig = mockQuizConfig;

      component.updateGenerateButtonState();

      expect(component.generateBtnConfig.isDisabled).toBe(false);
    });

    it('should disable button when form is invalid', () => {
      const promptControl = component.promptForm.get('prompt');
      promptControl?.setValue('');
      component.quizConfig = mockQuizConfig;

      component.updateGenerateButtonState();

      expect(component.generateBtnConfig.isDisabled).toBe(true);
    });

    it('should disable button when config is missing', () => {
      const promptControl = component.promptForm.get('prompt');
      promptControl?.setValue('Valid prompt text');
      component.quizConfig = null;

      component.updateGenerateButtonState();

      expect(component.generateBtnConfig.isDisabled).toBe(true);
    });

    it('should disable button when config has empty question spec', () => {
      const promptControl = component.promptForm.get('prompt');
      promptControl?.setValue('Valid prompt text');
      component.quizConfig = { ...mockQuizConfig, questionSpec: [] };

      component.updateGenerateButtonState();

      expect(component.generateBtnConfig.isDisabled).toBe(true);
    });
  });

  describe('Error Message Handling', () => {
    it('should call validation error service for error messages', () => {
      const promptControl = component.promptForm.get('prompt');
      promptControl?.setValue('');
      promptControl?.markAsTouched();

      component.getError('prompt');

      expect(mockValidationErrorService.getErrorMessage).toHaveBeenCalledWith(
        promptControl,
        promptTextAreaFormFields[0].validationMessages,
        'prompt',
      );
    });

    it('should return null for non-existent field', () => {
      const error = component.getError('nonexistent');

      expect(error).toBeNull();
    });
  });

  describe('Form Value Changes', () => {
    it('should update button state on form value changes', () => {
      const updateButtonStateSpy = jest.spyOn(component, 'updateGenerateButtonState');

      const promptControl = component.promptForm.get('prompt');
      promptControl?.setValue('New value');

      expect(updateButtonStateSpy).toHaveBeenCalled();
    });
  });

  describe('Preview Dialog Scenarios', () => {
    beforeEach(() => {
      // Set up valid form and config
      const promptControl = component.promptForm.get('prompt');
      promptControl?.setValue('Valid prompt text');
      component.quizConfig = mockQuizConfig;
    });

    it('should not close parent dialog when preview dialog returns false', () => {
      const mockResponse = { data: mockQuestions, success: true };
      mockQuestionPoolService.generateQuestionsFromTextPrompt.mockReturnValue(of(mockResponse));
      const mockPreviewDialogRef = { afterClosed: () => of(false) };
      mockDialog.open.mockReturnValue(mockPreviewDialogRef);

      component.generateQuestion();

      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });

    it('should not close parent dialog when preview dialog returns null', () => {
      const mockResponse = { data: mockQuestions, success: true };
      mockQuestionPoolService.generateQuestionsFromTextPrompt.mockReturnValue(of(mockResponse));
      const mockPreviewDialogRef = { afterClosed: () => of(null) };
      mockDialog.open.mockReturnValue(mockPreviewDialogRef);

      component.generateQuestion();

      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });

    it('should not close parent dialog when preview dialog returns undefined', () => {
      const mockResponse = { data: mockQuestions, success: true };
      mockQuestionPoolService.generateQuestionsFromTextPrompt.mockReturnValue(of(mockResponse));
      const mockPreviewDialogRef = { afterClosed: () => of(undefined) };
      mockDialog.open.mockReturnValue(mockPreviewDialogRef);

      component.generateQuestion();

      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });
  });
});
