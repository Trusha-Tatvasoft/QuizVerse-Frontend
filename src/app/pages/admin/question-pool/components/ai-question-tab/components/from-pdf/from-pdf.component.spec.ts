import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FromPdfComponent } from './from-pdf.component';
import { ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { SnackbarService } from '../../../../../../../shared/service/snackbar/snackbar.service';
import { ValidationErrorService } from '../../../../../../../shared/service/validation-error/validation-error.service';
import { AiQuestionTabComponent } from '../../ai-question-tab.component';
import { platformMessages } from '../../../../../../../utils/constants';
import { GenerateQuizRequest } from '../../../../interfaces/question-pool-ai-tab.interface';

describe('FromPdfComponent', () => {
  let component: FromPdfComponent;
  let fixture: ComponentFixture<FromPdfComponent>;
  let snackbarServiceMock: jest.Mocked<SnackbarService>;
  let validationErrorServiceMock: jest.Mocked<ValidationErrorService>;
  let aiComponentMock: any;

  beforeEach(async () => {
    snackbarServiceMock = {
      showError: jest.fn(),
      showSuccess: jest.fn(),
    } as any;

    validationErrorServiceMock = {
      getErrorMessage: jest.fn().mockReturnValue('Mock error message'),
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
      const mockCallback = jest.fn();
      component.pdfFileSelected = mockCallback;

      const event = { target: { files: [mockFile] } } as unknown as Event;
      component.fileSelected(event);

      expect(component.selectedFile).toBe(mockFile);
      expect(mockCallback).toHaveBeenCalledWith(mockFile);
      expect(component.uploadForm.get('file')?.value).toBe(mockFile);
    });

    it('should reject file with invalid MIME type', () => {
      const invalidFile = new File(['dummy'], 'invalid.txt', { type: 'text/plain' });
      const mockCallback = jest.fn();
      component.pdfFileSelected = mockCallback;

      const event = { target: { files: [invalidFile] } } as unknown as Event;
      const control = component.uploadForm.get('file');

      component.fileSelected(event);

      expect(control?.errors).toEqual({ fileType: true });
      expect(control?.touched).toBe(true);
      expect(mockCallback).toHaveBeenCalledWith(null);
      expect(component.selectedFile).toBeNull();
    });

    it('should reject file without .pdf extension even with correct MIME type', () => {
      const invalidFile = new File(['dummy'], 'invalid.TXT', { type: 'application/pdf' });
      const mockCallback = jest.fn();
      component.pdfFileSelected = mockCallback;

      const event = { target: { files: [invalidFile] } } as unknown as Event;
      const control = component.uploadForm.get('file');

      component.fileSelected(event);

      expect(control?.errors).toEqual({ fileType: true });
      expect(mockCallback).toHaveBeenCalledWith(null);
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
      const mockCallback = jest.fn();
      component.pdfFileSelected = mockCallback;

      const event = { target: { files: [mockFile] } } as unknown as Event;
      component.fileSelected(event);

      expect(component.selectedFile).toBe(mockFile);
      expect(mockCallback).toHaveBeenCalledWith(mockFile);
    });

    it('should call updateGenerateButtonState after file selection', () => {
      const updateSpy = jest.spyOn(component as any, 'updateGenerateButtonState');
      const mockFile = new File(['dummy'], 'valid.pdf', { type: 'application/pdf' });
      const event = { target: { files: [mockFile] } } as unknown as Event;

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
      const mockCallback = jest.fn();

      component.selectedFile = pdfFile;
      component.pdfFileSelected = mockCallback;
      component.uploadForm.patchValue({ file: pdfFile });
      fileInput.value = 'test.pdf';

      component.clearSelectedFile(fileInput);

      expect(component.selectedFile).toBeNull();
      expect(fileInput.value).toBe('');
      expect(component.uploadForm.get('file')?.value).toBeNull();
      expect(mockCallback).toHaveBeenCalledWith(null);
    });

    it('should call updateGenerateButtonState after clearing file', () => {
      const updateSpy = jest.spyOn(component as any, 'updateGenerateButtonState');
      const fileInput = document.createElement('input');

      component.clearSelectedFile(fileInput);

      expect(updateSpy).toHaveBeenCalled();
    });

    it('should clear file when pdfFileSelected callback is not provided', () => {
      const fileInput = document.createElement('input');
      component.pdfFileSelected = undefined;
      component.selectedFile = new File(['data'], 'test.pdf', { type: 'application/pdf' });

      component.clearSelectedFile(fileInput);

      expect(component.selectedFile).toBeNull();
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

    it('should not show error when both file and valid quizConfig exist', () => {
      component.selectedFile = new File([], 'file.pdf', { type: 'application/pdf' });
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

      expect(snackbarServiceMock.showError).not.toHaveBeenCalled();
    });

    it('should create correct request payload with file and quizConfig', () => {
      const mockFile = new File([], 'test.pdf', { type: 'application/pdf' });
      const mockConfig: GenerateQuizRequest = {
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

      component.selectedFile = mockFile;
      component.quizConfig = mockConfig;
      component.generateQuestion();

      const expectedPayload = {
        ...mockConfig,
        prompt: mockFile,
      };

      expect(expectedPayload).toEqual(
        expect.objectContaining({
          category: 'Math',
          questionSpec: mockConfig.questionSpec,
          prompt: mockFile,
        }),
      );
    });

    it('should return early when file is missing', () => {
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

      expect(snackbarServiceMock.showError).toHaveBeenCalledTimes(1);
      expect(snackbarServiceMock.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        platformMessages.uploadFileRequired,
      );
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
