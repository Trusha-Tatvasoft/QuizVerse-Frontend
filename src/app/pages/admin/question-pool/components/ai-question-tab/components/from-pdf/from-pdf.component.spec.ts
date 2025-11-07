import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FromPdfComponent } from './from-pdf.component';
import { ReactiveFormsModule } from '@angular/forms';
import { of, Subject, throwError } from 'rxjs';
import { SnackbarService } from '../../../../../../../shared/service/snackbar/snackbar.service';
import { ValidationErrorService } from '../../../../../../../shared/service/validation-error/validation-error.service';
import { AiQuestionTabComponent } from '../../ai-question-tab.component';
import { QuestionPoolService } from '../../../../../../../services/admin/question-pool/question-pool.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { platformMessages } from '../../../../../../../utils/constants';
import { GenerateQuizRequest } from '../../../../interfaces/question-pool-ai-tab.interface';
import { QuestionPoolListData } from '../../../../interfaces/question-pool-list-data.interface';

describe('FromPdfComponent', () => {
  let component: FromPdfComponent;
  let fixture: ComponentFixture<FromPdfComponent>;
  let snackbarServiceMock: jest.Mocked<SnackbarService>;
  let validationErrorServiceMock: jest.Mocked<ValidationErrorService>;
  let questionPoolServiceMock: jest.Mocked<QuestionPoolService>;
  let dialogMock: jest.Mocked<MatDialog>;
  let dialogRefMock: jest.Mocked<MatDialogRef<any>>;
  let aiComponentMock: any;

  beforeEach(async () => {
    snackbarServiceMock = {
      showError: jest.fn(),
      showSuccess: jest.fn(),
    } as any;

    validationErrorServiceMock = {
      getErrorMessage: jest.fn().mockReturnValue('Mock error message'),
    } as any;

    questionPoolServiceMock = {
      generateQuestionsFromPdf: jest.fn(),
    } as any;

    dialogMock = {
      open: jest.fn(),
    } as any;

    dialogRefMock = {
      close: jest.fn(),
      afterClosed: jest.fn().mockReturnValue(of(false)),
    } as any;

    aiComponentMock = {
      quizConfig$: new Subject<GenerateQuizRequest | null>(),
    };

    await TestBed.configureTestingModule({
      imports: [FromPdfComponent, ReactiveFormsModule],
      providers: [
        { provide: SnackbarService, useValue: snackbarServiceMock },
        { provide: ValidationErrorService, useValue: validationErrorServiceMock },
        { provide: AiQuestionTabComponent, useValue: aiComponentMock },
        { provide: QuestionPoolService, useValue: questionPoolServiceMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: MatDialogRef, useValue: dialogRefMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FromPdfComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should create and initialize form', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
      expect(component.uploadForm).toBeDefined();
      expect(Object.keys(component.uploadForm.controls).length).toBeGreaterThan(0);
    });

    it('should initialize with default values', () => {
      fixture.detectChanges();
      expect(component.selectedFile).toBeNull();
      expect(component.quizConfig).toBeNull();
      expect(component.generateBtnConfig.isDisabled).toBe(true);
    });

    it('should subscribe to quizConfig$ on init', () => {
      const config: GenerateQuizRequest = {
        category: 'Science',
        questionSpec: [
          {
            questionDifficultyId: 1,
            questionDifficultyName: 'Medium',
            questionPerQuestionType: [
              {
                questionPerQuestionTypeId: 1,
                questionPerQuestionTypeName: 'MCQ',
                noOfQuesitons: 2,
              },
            ],
          },
        ],
      };

      fixture.detectChanges();
      aiComponentMock.quizConfig$.next(config);

      expect(component.quizConfig).toEqual(config);
      expect(component.quizConfig?.category).toBe('Science');
      expect(component.quizConfig?.questionSpec?.length).toBe(1);
    });

    it('should not process null config from quizConfig$', () => {
      fixture.detectChanges();
      const initialQuizConfig = component.quizConfig;

      aiComponentMock.quizConfig$.next(null);

      expect(component.quizConfig).toBe(initialQuizConfig);
    });

    it('should update generate button state when config is received', () => {
      const config: GenerateQuizRequest = {
        category: 'Math',
        questionSpec: [
          {
            questionDifficultyId: 1,
            questionDifficultyName: 'Easy',
            questionPerQuestionType: [
              {
                questionPerQuestionTypeId: 1,
                questionPerQuestionTypeName: 'MCQ',
                noOfQuesitons: 5,
              },
            ],
          },
        ],
      };

      fixture.detectChanges();
      component.selectedFile = new File([], 'test.pdf', { type: 'application/pdf' });
      aiComponentMock.quizConfig$.next(config);

      expect(component.generateBtnConfig.isDisabled).toBe(false);
    });
  });

  describe('File Selection', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should accept valid PDF file', () => {
      const mockFile = new File(['dummy'], 'valid.pdf', { type: 'application/pdf' });

      const event = { target: { files: [mockFile] } } as unknown as Event;
      component.fileSelected(event);

      expect(component.selectedFile).toBe(mockFile);
      expect(component.uploadForm.get('file')?.value).toBe(mockFile);
    });

    it('should reject file with invalid MIME type', () => {
      const invalidFile = new File(['dummy'], 'invalid.txt', { type: 'text/plain' });

      const event = { target: { files: [invalidFile] } } as unknown as Event;
      const control = component.uploadForm.get('file');

      component.fileSelected(event);

      expect(control?.errors).toEqual({ fileType: true });
      expect(control?.touched).toBe(true);
      expect(component.selectedFile).toBeNull();
    });

    it('should reject file without .pdf extension even with correct MIME type', () => {
      const invalidFile = new File(['dummy'], 'invalid.TXT', { type: 'application/pdf' });

      const event = { target: { files: [invalidFile] } } as unknown as Event;
      const control = component.uploadForm.get('file');

      component.fileSelected(event);

      expect(control?.errors).toEqual({ fileType: true });
      expect(component.selectedFile).toBeNull();
    });

    it('should handle file selection with no files', () => {
      const event = { target: { files: [] } } as unknown as Event;
      const initialFile = component.selectedFile;

      component.fileSelected(event);

      expect(component.selectedFile).toBe(initialFile);
    });

    it('should handle event with null target', () => {
      const event = { target: null } as unknown as Event;
      const initialFile = component.selectedFile;

      component.fileSelected(event);

      expect(component.selectedFile).toBe(initialFile);
    });

    it('should clear existing errors when selecting valid file', () => {
      const control = component.uploadForm.get('file');
      control?.setErrors({ fileType: true });

      const mockFile = new File(['dummy'], 'valid.pdf', { type: 'application/pdf' });
      const event = { target: { files: [mockFile] } } as unknown as Event;

      component.fileSelected(event);

      expect(control?.errors).toBeNull();
      expect(component.selectedFile).toBe(mockFile);
    });

    it('should handle uppercase PDF extension', () => {
      const mockFile = new File(['dummy'], 'valid.PDF', { type: 'application/pdf' });

      const event = { target: { files: [mockFile] } } as unknown as Event;
      component.fileSelected(event);

      expect(component.selectedFile).toBe(mockFile);
    });

    it('should call updateGenerateButtonState after file selection', () => {
      const updateSpy = jest.spyOn(component as any, 'updateGenerateButtonState');
      const mockFile = new File(['dummy'], 'valid.pdf', { type: 'application/pdf' });
      const event = { target: { files: [mockFile] } } as unknown as Event;

      component.fileSelected(event);

      expect(updateSpy).toHaveBeenCalled();
    });

    it('should call updateGenerateButtonState after invalid file selection', () => {
      const updateSpy = jest.spyOn(component as any, 'updateGenerateButtonState');
      const invalidFile = new File(['dummy'], 'invalid.txt', { type: 'text/plain' });
      const event = { target: { files: [invalidFile] } } as unknown as Event;

      component.fileSelected(event);

      expect(updateSpy).toHaveBeenCalled();
    });
  });

  describe('Clear File', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should clear selected file and reset input', () => {
      const fileInput = document.createElement('input');
      const pdfFile = new File(['data'], 'test.pdf', { type: 'application/pdf' });

      component.selectedFile = pdfFile;
      component.uploadForm.patchValue({ file: pdfFile });
      fileInput.value = 'test.pdf';

      component.clearSelectedFile(fileInput);

      expect(component.selectedFile).toBeNull();
      expect(fileInput.value).toBe('');
      expect(component.uploadForm.get('file')?.value).toBeNull();
    });

    it('should call updateGenerateButtonState after clearing file', () => {
      const updateSpy = jest.spyOn(component as any, 'updateGenerateButtonState');
      const fileInput = document.createElement('input');

      component.clearSelectedFile(fileInput);

      expect(updateSpy).toHaveBeenCalled();
    });
  });

  describe('Display File Name', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should display selected file name', () => {
      component.selectedFile = new File([], 'sample.pdf');
      expect(component.displayFileName).toBe('sample.pdf');
    });

    it('should display "No file chosen" when no file selected', () => {
      component.selectedFile = null;
      expect(component.displayFileName).toBe('No file chosen');
    });

    it('should display correct name after file change', () => {
      component.selectedFile = new File([], 'first.pdf');
      expect(component.displayFileName).toBe('first.pdf');

      component.selectedFile = new File([], 'second.pdf');
      expect(component.displayFileName).toBe('second.pdf');
    });
  });

  describe('Generate Question', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should show error when generating question without file', () => {
      component.selectedFile = null;
      component.quizConfig = {
        category: 'Science',
        questionSpec: [
          {
            questionDifficultyId: 1,
            questionDifficultyName: 'Easy',
            questionPerQuestionType: [
              {
                questionPerQuestionTypeId: 1,
                questionPerQuestionTypeName: 'MCQ',
                noOfQuesitons: 5,
              },
            ],
          },
        ],
      };

      component.generateQuestion();

      expect(snackbarServiceMock.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        platformMessages.uploadFileRequired,
      );
    });

    it('should show error when generating question without quizConfig', () => {
      component.selectedFile = new File([], 'file.pdf', { type: 'application/pdf' });
      component.quizConfig = null;

      component.generateQuestion();

      expect(snackbarServiceMock.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        platformMessages.aiConfigRequired,
      );
    });

    it('should show error when generating question with empty questionSpec', () => {
      component.selectedFile = new File([], 'file.pdf', { type: 'application/pdf' });
      component.quizConfig = {
        category: 'Science',
        questionSpec: [],
      };

      component.generateQuestion();

      expect(snackbarServiceMock.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        platformMessages.aiConfigRequired,
      );
    });

    it('should call API with FormData when both file and valid quizConfig exist', () => {
      const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const mockConfig: GenerateQuizRequest = {
        categoryId: 5,
        category: 'Math',
        questionSpec: [
          {
            questionDifficultyId: 2,
            questionDifficultyName: 'Medium',
            questionPerQuestionType: [
              {
                questionPerQuestionTypeId: 2,
                questionPerQuestionTypeName: 'TrueFalse',
                noOfQuesitons: 3,
              },
            ],
          },
        ],
      };

      const mockResponse = {
        result: true,
        statusCode: 200,
        message: 'fetched success',
        data: [] as QuestionPoolListData[],
      };

      questionPoolServiceMock.generateQuestionsFromPdf.mockReturnValue(of(mockResponse));

      component.selectedFile = mockFile;
      component.quizConfig = mockConfig;
      component.generateQuestion();

      expect(questionPoolServiceMock.generateQuestionsFromPdf).toHaveBeenCalled();
      const formDataArg = questionPoolServiceMock.generateQuestionsFromPdf.mock.calls[0][0];
      expect(formDataArg).toBeInstanceOf(FormData);
    });

    it('should show success message when API call succeeds', () => {
      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const mockConfig: GenerateQuizRequest = {
        categoryId: 1,
        category: 'Science',
        questionSpec: [
          {
            questionDifficultyId: 1,
            questionDifficultyName: 'Easy',
            questionPerQuestionType: [
              {
                questionPerQuestionTypeId: 1,
                questionPerQuestionTypeName: 'MCQ',
                noOfQuesitons: 5,
              },
            ],
          },
        ],
      };

      const mockQuestions: QuestionPoolListData[] = [
        {
          id: 1,
          categoryId: 10,
          categoryName: 'Science',
          queDifficultyId: 2,
          queDifficultyName: 'Medium',
          queText: 'Test Question',
          queTypeId: 1,
          queTypeName: 'MCQ',
          queOptionsAns: [],
        },
      ];

      const mockResponse = {
        result: true,
        statusCode: 200,
        message: 'success',
        data: mockQuestions,
      };

      questionPoolServiceMock.generateQuestionsFromPdf.mockReturnValue(of(mockResponse));

      component.selectedFile = mockFile;
      component.quizConfig = mockConfig;
      component.generateQuestion();

      expect(snackbarServiceMock.showSuccess).toHaveBeenCalledWith(
        platformMessages.successTitle,
        'Questions successfully created!',
      );
    });

    it('should show error message when API returns result false', () => {
      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const mockConfig: GenerateQuizRequest = {
        category: 'Science',
        questionSpec: [
          {
            questionDifficultyId: 1,
            questionDifficultyName: 'Easy',
            questionPerQuestionType: [
              {
                questionPerQuestionTypeId: 1,
                questionPerQuestionTypeName: 'MCQ',
                noOfQuesitons: 5,
              },
            ],
          },
        ],
      };

      const mockResponse = {
        result: false,
        statusCode: 400,
        message: 'Error',
        data: [],
      };

      questionPoolServiceMock.generateQuestionsFromPdf.mockReturnValue(of(mockResponse));

      component.selectedFile = mockFile;
      component.quizConfig = mockConfig;
      component.generateQuestion();

      expect(snackbarServiceMock.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        'Please try another PDF.',
      );
    });

    it('should show error message when API call fails', () => {
      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const mockConfig: GenerateQuizRequest = {
        category: 'Science',
        questionSpec: [
          {
            questionDifficultyId: 1,
            questionDifficultyName: 'Easy',
            questionPerQuestionType: [
              {
                questionPerQuestionTypeId: 1,
                questionPerQuestionTypeName: 'MCQ',
                noOfQuesitons: 5,
              },
            ],
          },
        ],
      };

      questionPoolServiceMock.generateQuestionsFromPdf.mockReturnValue(
        throwError(() => new Error('API Error')),
      );

      component.selectedFile = mockFile;
      component.quizConfig = mockConfig;
      component.generateQuestion();

      expect(snackbarServiceMock.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        'Something went wrong while generating from PDF.',
      );
    });

    it('should open preview dialog on successful generation', () => {
      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const mockConfig: GenerateQuizRequest = {
        category: 'Science',
        questionSpec: [
          {
            questionDifficultyId: 1,
            questionDifficultyName: 'Easy',
            questionPerQuestionType: [
              {
                questionPerQuestionTypeId: 1,
                questionPerQuestionTypeName: 'MCQ',
                noOfQuesitons: 5,
              },
            ],
          },
        ],
      };

      const mockQuestions: QuestionPoolListData[] = [
        {
          id: 1,
          categoryId: 10,
          categoryName: 'Science',
          queDifficultyId: 2,
          queDifficultyName: 'Medium',
          queText: 'Test Question',
          queTypeId: 1,
          queTypeName: 'MCQ',
          queOptionsAns: [],
        },
      ];

      const mockResponse = {
        result: true,
        statusCode: 200,
        message: 'Success',
        data: mockQuestions,
      };

      const mockPreviewDialogRef = {
        afterClosed: jest.fn().mockReturnValue(of(true)),
      };

      questionPoolServiceMock.generateQuestionsFromPdf.mockReturnValue(of(mockResponse));
      dialogMock.open.mockReturnValue(mockPreviewDialogRef as any);

      component.selectedFile = mockFile;
      component.quizConfig = mockConfig;
      component.generateQuestion();

      expect(dialogMock.open).toHaveBeenCalled();
    });

    it('should close parent dialog when preview dialog returns true', () => {
      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const mockConfig: GenerateQuizRequest = {
        category: 'Science',
        questionSpec: [
          {
            questionDifficultyId: 1,
            questionDifficultyName: 'Easy',
            questionPerQuestionType: [
              {
                questionPerQuestionTypeId: 1,
                questionPerQuestionTypeName: 'MCQ',
                noOfQuesitons: 5,
              },
            ],
          },
        ],
      };

      const mockQuestions: QuestionPoolListData[] = [
        {
          id: 1,
          categoryId: 10,
          categoryName: 'Science',
          queDifficultyId: 2,
          queDifficultyName: 'Medium',
          queText: 'Test Question',
          queTypeId: 1,
          queTypeName: 'MCQ',
          queOptionsAns: [],
        },
      ];

      const mockResponse = {
        result: true,
        statusCode: 200,
        message: 'Success',
        data: mockQuestions,
      };

      const mockPreviewDialogRef = {
        afterClosed: jest.fn().mockReturnValue(of(true)),
      };

      questionPoolServiceMock.generateQuestionsFromPdf.mockReturnValue(of(mockResponse));
      dialogMock.open.mockReturnValue(mockPreviewDialogRef as any);

      component.selectedFile = mockFile;
      component.quizConfig = mockConfig;
      component.generateQuestion();

      expect(dialogRefMock.close).toHaveBeenCalledWith(true);
    });

    it('should handle FormData correctly with categoryId as 0 when undefined', () => {
      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const mockConfig: GenerateQuizRequest = {
        category: 'Science',
        categoryId: undefined,
        questionSpec: [
          {
            questionDifficultyId: 1,
            questionDifficultyName: 'Easy',
            questionPerQuestionType: [
              {
                questionPerQuestionTypeId: 1,
                questionPerQuestionTypeName: 'MCQ',
                noOfQuesitons: 5,
              },
            ],
          },
        ],
      };

      const mockResponse = {
        result: true,
        statusCode: 200,
        message: 'Success',
        data: [],
      };
      questionPoolServiceMock.generateQuestionsFromPdf.mockReturnValue(of(mockResponse));

      component.selectedFile = mockFile;
      component.quizConfig = mockConfig;
      component.generateQuestion();

      expect(questionPoolServiceMock.generateQuestionsFromPdf).toHaveBeenCalled();
    });
  });

  describe('Generate Button State', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should disable button when no file and no quizConfig', () => {
      component.selectedFile = null;
      component.quizConfig = null;
      component['updateGenerateButtonState']();
      expect(component.generateBtnConfig.isDisabled).toBe(true);
    });

    it('should disable button when file exists but no quizConfig', () => {
      component.selectedFile = new File([], 'valid.pdf', { type: 'application/pdf' });
      component.quizConfig = null;
      component['updateGenerateButtonState']();
      expect(component.generateBtnConfig.isDisabled).toBe(true);
    });

    it('should disable button when file exists but empty questionSpec', () => {
      component.selectedFile = new File([], 'valid.pdf', { type: 'application/pdf' });
      component.quizConfig = {
        category: 'Science',
        questionSpec: [],
      };
      component['updateGenerateButtonState']();
      expect(component.generateBtnConfig.isDisabled).toBe(true);
    });

    it('should disable button when quizConfig exists but no file', () => {
      component.selectedFile = null;
      component.quizConfig = {
        category: 'Science',
        questionSpec: [
          {
            questionDifficultyId: 1,
            questionDifficultyName: 'Easy',
            questionPerQuestionType: [
              {
                questionPerQuestionTypeId: 1,
                questionPerQuestionTypeName: 'MCQ',
                noOfQuesitons: 5,
              },
            ],
          },
        ],
      };
      component['updateGenerateButtonState']();
      expect(component.generateBtnConfig.isDisabled).toBe(true);
    });

    it('should enable button when both file and valid quizConfig exist', () => {
      component.selectedFile = new File([], 'valid.pdf', { type: 'application/pdf' });
      component.quizConfig = {
        category: 'Science',
        questionSpec: [
          {
            questionDifficultyId: 1,
            questionDifficultyName: 'Easy',
            questionPerQuestionType: [
              {
                questionPerQuestionTypeId: 1,
                questionPerQuestionTypeName: 'MCQ',
                noOfQuesitons: 5,
              },
            ],
          },
        ],
      };
      component['updateGenerateButtonState']();
      expect(component.generateBtnConfig.isDisabled).toBe(false);
    });

    it('should update button state when quiz config changes', () => {
      const config: GenerateQuizRequest = {
        category: 'Math',
        questionSpec: [
          {
            questionDifficultyId: 3,
            questionDifficultyName: 'Hard',
            questionPerQuestionType: [
              {
                questionPerQuestionTypeId: 2,
                questionPerQuestionTypeName: 'TrueFalse',
                noOfQuesitons: 3,
              },
            ],
          },
        ],
      };

      component.selectedFile = new File([], 'test.pdf', { type: 'application/pdf' });
      aiComponentMock.quizConfig$.next(config);

      expect(component.generateBtnConfig.isDisabled).toBe(false);
    });
  });

  describe('Validation Error', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should get validation error message for existing field', () => {
      const controlName = component.fields[0].name;
      const control = component.uploadForm.get(controlName);
      control?.setErrors({ required: true });
      control?.markAsTouched();

      const errorMessage = component.getError(controlName);

      expect(validationErrorServiceMock.getErrorMessage).toHaveBeenCalledWith(
        control,
        component.fields[0].validationMessages ?? {},
        controlName,
      );
      expect(errorMessage).toBe('Mock error message');
    });

    it('should return null when control not found', () => {
      const result = component.getError('nonExistentField');
      expect(result).toBeNull();
      expect(validationErrorServiceMock.getErrorMessage).not.toHaveBeenCalled();
    });

    it('should handle field without validationMessages', () => {
      const controlName = component.fields[0].name;
      const control = component.uploadForm.get(controlName);
      const fieldWithoutMessages = { ...component.fields[0], validationMessages: undefined };
      component.fields = [fieldWithoutMessages];

      component.getError(controlName);

      expect(validationErrorServiceMock.getErrorMessage).toHaveBeenCalledWith(
        control,
        {},
        controlName,
      );
    });
  });

  describe('Component Cleanup', () => {
    it('should call next and complete on destroy$', () => {
      fixture.detectChanges();
      const nextSpy = jest.spyOn(component['destroy$'], 'next');
      const completeSpy = jest.spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });

    it('should unsubscribe from quizConfig$ on destroy', () => {
      fixture.detectChanges();
      const config: GenerateQuizRequest = {
        category: 'Test',
        questionSpec: [],
      };

      component.ngOnDestroy();
      aiComponentMock.quizConfig$.next(config);

      expect(component.quizConfig).toBeNull();
    });
  });

  describe('Form Building', () => {
    it('should build form with all fields', () => {
      fixture.detectChanges();
      component.fields.forEach((field) => {
        expect(component.uploadForm.get(field.name)).toBeTruthy();
      });
    });

    it('should initialize form controls with empty string', () => {
      fixture.detectChanges();
      component.fields.forEach((field) => {
        const control = component.uploadForm.get(field.name);
        expect(control?.value).toBe('');
      });
    });

    it('should apply validators from field configuration', () => {
      fixture.detectChanges();
      component.fields.forEach((field) => {
        const control = component.uploadForm.get(field.name);
        expect(control).toBeTruthy();
      });
    });

    it('should handle empty fields array', () => {
      const originalFields = component.fields;
      component.fields = [];
      (component as any).buildForm();

      expect(Object.keys(component.uploadForm.controls).length).toBe(0);

      component.fields = originalFields;
    });

    it('should handle field without validators', () => {
      component.fields = [
        {
          name: 'testField',
          validators: undefined,
          label: 'Test',
          type: 'text',
          placeholder: 'Test placeholder',
        } as any,
      ];
      (component as any).buildForm();

      const control = component.uploadForm.get('testField');
      expect(control).toBeTruthy();
      expect(control?.value).toBe('');
    });
  });
});
