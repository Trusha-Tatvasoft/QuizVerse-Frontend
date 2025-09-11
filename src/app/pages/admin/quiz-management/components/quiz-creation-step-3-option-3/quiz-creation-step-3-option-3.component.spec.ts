import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizCreationStep3Option3Component } from './quiz-creation-step-3-option-3.component';
import { QuizCreationService } from '../../../../../services/admin/quiz-management/quiz-creation/quiz-creation.service';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { of, throwError } from 'rxjs';
import { QuestionResponseDto } from '../../../../../shared/interfaces/quiz-creation.interface';
import { ApiResponse } from '../../../../../shared/interfaces/api-response.interface';
import { quizCRUDMessages } from '../../../../../utils/constants';

describe('QuizCreationStep3Option3Component', () => {
  let component: QuizCreationStep3Option3Component;
  let fixture: ComponentFixture<QuizCreationStep3Option3Component>;
  let quizService: jest.Mocked<QuizCreationService>;
  let snackbar: jest.Mocked<SnackbarService>;

  const createFileList = (files: File[]) =>
    ({
      0: files[0],
      length: files.length,
      item: (index: number) => files[index] || null,
    }) as unknown as FileList;

  beforeEach(async () => {
    const quizServiceMock = {
      getQuestionsFromCsv: jest.fn(),
      getQuestionsFromExcel: jest.fn(),
    };

    const snackbarMock = {
      showSuccess: jest.fn(),
      showError: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [QuizCreationStep3Option3Component],
      providers: [
        { provide: QuizCreationService, useValue: quizServiceMock },
        { provide: SnackbarService, useValue: snackbarMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizCreationStep3Option3Component);
    component = fixture.componentInstance;
    quizService = TestBed.inject(QuizCreationService) as jest.Mocked<QuizCreationService>;
    snackbar = TestBed.inject(SnackbarService) as jest.Mocked<SnackbarService>;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call ngOnDestroy and complete destroy$ subject', () => {
    const nextSpy = jest.spyOn(component['destroy$'], 'next');
    const completeSpy = jest.spyOn(component['destroy$'], 'complete');
    component.ngOnDestroy();
    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should emit closeQuestionAdditionOption', () => {
    const spy = jest.spyOn(component.closeQuestionAdditionOption, 'emit');
    component.closeOption();
    expect(spy).toHaveBeenCalled();
  });

  describe('fileDrop', () => {
    it('should handle fileDrop with no files', () => {
      const handleSpy = jest.spyOn(component, 'handleFiles');
      const event = {
        preventDefault: jest.fn(),
        dataTransfer: { files: createFileList([]) },
      } as unknown as DragEvent;
      component.fileDrop(event);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(handleSpy).not.toHaveBeenCalled();
    });
  });

  it('should call dragOver and prevent default', () => {
    const event = { preventDefault: jest.fn() } as unknown as DragEvent;
    component.dragOver(event);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  describe('onFileSelected', () => {
    it('should handle onFileSelected with no files', () => {
      const handleSpy = jest.spyOn(component, 'handleFiles');
      const input = { files: null, value: '' } as unknown as HTMLInputElement;
      const event = { target: input } as unknown as Event;
      component.onFileSelected(event);
      expect(handleSpy).not.toHaveBeenCalled();
      expect(input.value).toBe('');
    });
  });

  describe('handleFiles', () => {
    const csvFile = new File([''], 'questions.csv', { type: 'text/csv' });
    const xlsFile = new File([''], 'questions.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const invalidFile = new File([''], 'file.txt', { type: 'text/plain' });

    it('should return immediately if no file', () => {
      component.handleFiles(createFileList([]));
      expect(quizService.getQuestionsFromCsv).not.toHaveBeenCalled();
      expect(quizService.getQuestionsFromExcel).not.toHaveBeenCalled();
      expect(snackbar.showError).not.toHaveBeenCalled();
    });

    it('should handle CSV with non-empty data', () => {
      const response: ApiResponse<QuestionResponseDto[]> = {
        data: [
          {
            id: 1,
            categoryId: 1,
            queDifficultyId: 1,
            queText: 'What is 2+2?',
            queTypeId: 1,
            queOptionsAns: [
              { id: 1, questionId: 1, key: 'option', value: '4' },
              { id: 2, questionId: 1, key: 'answer', value: '4' },
            ],
          },
        ],
        result: true,
        statusCode: 200,
        message: 'success',
      };
      quizService.getQuestionsFromCsv.mockReturnValue(of(response));
      const emitSpy = jest.spyOn(component.selectedQuestionsChangeFromInnerStep3Option3, 'emit');
      component.selectedQuestions = [
        {
          id: 2,
          categoryId: 2,
          queDifficultyId: 2,
          queText: 'What is 3+3?',
          queTypeId: 1,
          queOptionsAns: [{ id: 3, questionId: 2, key: 'answer', value: '6' }],
        },
      ];

      component.handleFiles(createFileList([csvFile]));

      expect(quizService.getQuestionsFromCsv).toHaveBeenCalledWith(csvFile);
      expect(component.selectedQuestions).toEqual([
        {
          id: 2,
          categoryId: 2,
          queDifficultyId: 2,
          queText: 'What is 3+3?',
          queTypeId: 1,
          queOptionsAns: [{ id: 3, questionId: 2, key: 'answer', value: '6' }],
        },
        {
          id: 1,
          categoryId: 1,
          queDifficultyId: 1,
          queText: 'What is 2+2?',
          queTypeId: 1,
          queOptionsAns: [
            { id: 1, questionId: 1, key: 'option', value: '4' },
            { id: 2, questionId: 1, key: 'answer', value: '4' },
          ],
        },
      ]);
      expect(emitSpy).toHaveBeenCalledWith(component.selectedQuestions);
      expect(snackbar.showSuccess).toHaveBeenCalledWith('1 questions added!!');
    });

    it('should handle CSV with empty data', () => {
      quizService.getQuestionsFromCsv.mockReturnValue(
        of({ data: [], result: true, statusCode: 200, message: 'success' }),
      );
      component.selectedQuestions = [];
      component.handleFiles(createFileList([csvFile]));
      expect(quizService.getQuestionsFromCsv).toHaveBeenCalledWith(csvFile);
      expect(component.selectedQuestions.length).toBe(0);
      expect(snackbar.showSuccess).toHaveBeenCalledWith('0 questions added!!');
    });

    it('should handle CSV with null que_options_ans', () => {
      const response: ApiResponse<QuestionResponseDto[]> = {
        data: [
          {
            id: 1,
            categoryId: 1,
            queDifficultyId: 1,
            queText: 'What is 2+2?',
            queTypeId: 1,
            queOptionsAns: [],
          },
        ],
        result: true,
        statusCode: 200,
        message: 'success',
      };
      quizService.getQuestionsFromCsv.mockReturnValue(of(response));
      const emitSpy = jest.spyOn(component.selectedQuestionsChangeFromInnerStep3Option3, 'emit');
      component.selectedQuestions = [];

      component.handleFiles(createFileList([csvFile]));

      expect(quizService.getQuestionsFromCsv).toHaveBeenCalledWith(csvFile);
      expect(component.selectedQuestions).toEqual([
        {
          id: 1,
          categoryId: 1,
          queDifficultyId: 1,
          queText: 'What is 2+2?',
          queTypeId: 1,
          queOptionsAns: [],
        },
      ]);
      expect(emitSpy).toHaveBeenCalledWith(component.selectedQuestions);
      expect(snackbar.showSuccess).toHaveBeenCalledWith('1 questions added!!');
    });

    it('should handle CSV error', () => {
      const error = 'CSV error';
      quizService.getQuestionsFromCsv.mockReturnValue(throwError(() => error));
      component.handleFiles(createFileList([csvFile]));
      expect(quizService.getQuestionsFromCsv).toHaveBeenCalledWith(csvFile);
      expect(snackbar.showError).toHaveBeenCalledWith('Error! undefined', 'Something went wrong.');
    });

    it('should handle Excel with non-empty data', () => {
      const response: ApiResponse<QuestionResponseDto[]> = {
        data: [
          {
            id: 3,
            categoryId: 3,
            queDifficultyId: 2,
            queText: 'What is 5+5?',
            queTypeId: 1,
            queOptionsAns: [
              { id: 4, questionId: 3, key: 'option', value: '10' },
              { id: 5, questionId: 3, key: 'answer', value: '10' },
            ],
          },
        ],
        result: true,
        statusCode: 200,
        message: 'success',
      };
      quizService.getQuestionsFromExcel.mockReturnValue(of(response));
      const emitSpy = jest.spyOn(component.selectedQuestionsChangeFromInnerStep3Option3, 'emit');
      component.selectedQuestions = [
        {
          id: 2,
          categoryId: 2,
          queDifficultyId: 2,
          queText: 'What is 3+3?',
          queTypeId: 1,
          queOptionsAns: [{ id: 3, questionId: 2, key: 'answer', value: '6' }],
        },
      ];

      component.handleFiles(createFileList([xlsFile]));

      expect(quizService.getQuestionsFromExcel).toHaveBeenCalledWith(xlsFile);
      expect(component.selectedQuestions).toEqual([
        {
          id: 2,
          categoryId: 2,
          queDifficultyId: 2,
          queText: 'What is 3+3?',
          queTypeId: 1,
          queOptionsAns: [{ id: 3, questionId: 2, key: 'answer', value: '6' }],
        },
        {
          id: 3,
          categoryId: 3,
          queDifficultyId: 2,
          queText: 'What is 5+5?',
          queTypeId: 1,
          queOptionsAns: [
            { id: 4, questionId: 3, key: 'option', value: '10' },
            { id: 5, questionId: 3, key: 'answer', value: '10' },
          ],
        },
      ]);
      expect(emitSpy).toHaveBeenCalledWith(component.selectedQuestions);
      expect(snackbar.showSuccess).toHaveBeenCalledWith('1 questions added!!');
    });

    it('should handle Excel with empty data', () => {
      quizService.getQuestionsFromExcel.mockReturnValue(
        of({ data: [], result: true, statusCode: 200, message: 'success' }),
      );
      component.selectedQuestions = [];
      component.handleFiles(createFileList([xlsFile]));
      expect(quizService.getQuestionsFromExcel).toHaveBeenCalledWith(xlsFile);
      expect(component.selectedQuestions.length).toBe(0);
      expect(snackbar.showSuccess).toHaveBeenCalledWith('0 questions added!!');
    });

    it('should handle Excel with null que_options_ans', () => {
      const response: ApiResponse<QuestionResponseDto[]> = {
        data: [
          {
            id: 3,
            categoryId: 3,
            queDifficultyId: 2,
            queText: 'What is 5+5?',
            queTypeId: 1,
            queOptionsAns: [],
          },
        ],
        result: true,
        statusCode: 200,
        message: 'success',
      };
      quizService.getQuestionsFromExcel.mockReturnValue(of(response));
      const emitSpy = jest.spyOn(component.selectedQuestionsChangeFromInnerStep3Option3, 'emit');
      component.selectedQuestions = [];

      component.handleFiles(createFileList([xlsFile]));

      expect(quizService.getQuestionsFromExcel).toHaveBeenCalledWith(xlsFile);
      expect(component.selectedQuestions).toEqual([
        {
          id: 3,
          categoryId: 3,
          queDifficultyId: 2,
          queText: 'What is 5+5?',
          queTypeId: 1,
          queOptionsAns: [],
        },
      ]);
      expect(emitSpy).toHaveBeenCalledWith(component.selectedQuestions);
      expect(snackbar.showSuccess).toHaveBeenCalledWith('1 questions added!!');
    });

    it('should handle Excel error', () => {
      const error = 'Excel error';
      quizService.getQuestionsFromExcel.mockReturnValue(throwError(() => error));
      component.handleFiles(createFileList([xlsFile]));
      expect(quizService.getQuestionsFromExcel).toHaveBeenCalledWith(xlsFile);
      expect(snackbar.showError).toHaveBeenCalledWith('Error! undefined', 'Something went wrong.');
    });

    it('should show error for invalid file type', () => {
      component.handleFiles(createFileList([invalidFile]));
      expect(snackbar.showError).toHaveBeenCalledWith('Select only Excel or csv.');
    });
  });

  describe('selectedQuestions queOptionsAns mapping', () => {
    it('should map queOptionsAns when options are provided', () => {
      const question = {
        id: 1,
        categoryId: 10,
        queDifficultyId: 2,
        queDifficultyName: 'Medium',
        queText: 'Sample Q?',
        queTypeId: 3,
        queTypeName: 'MCQ',
        queOptionsAns: [{ id: 101, questionId: 1, key: undefined, value: undefined }],
      };

      component.selectedQuestions.push({
        id: question.id,
        categoryId: question.categoryId,
        queDifficultyId: question.queDifficultyId,
        queDifficultyName: question.queDifficultyName,
        queText: question.queText,
        queTypeId: question.queTypeId,
        queTypeName: question.queTypeName,
        queOptionsAns:
          question.queOptionsAns?.map((opt) => ({
            id: opt.id,
            questionId: opt.questionId,
            key: opt.key ?? '',
            value: String(opt.value ?? ''),
          })) ?? [],
      });

      expect(component.selectedQuestions[0].queOptionsAns![0].key).toBe('');
      expect(component.selectedQuestions[0].queOptionsAns![0].value).toBe('');
    });

    it('should fallback to empty array when queOptionsAns is undefined', () => {
      const question = {
        id: 2,
        categoryId: 20,
        queDifficultyId: 1,
        queDifficultyName: 'Easy',
        queText: 'Another Q?',
        queTypeId: 4,
        queTypeName: 'True/False',
        queOptionsAns: undefined,
      } as any;

      component.selectedQuestions.push({
        id: question.id,
        categoryId: question.categoryId,
        queDifficultyId: question.queDifficultyId,
        queDifficultyName: question.queDifficultyName,
        queText: question.queText,
        queTypeId: question.queTypeId,
        queTypeName: question.queTypeName,
        queOptionsAns:
          question.queOptionsAns?.map((opt: any) => ({
            id: opt.id,
            questionId: opt.questionId,
            key: opt.key ?? '',
            value: String(opt.value ?? ''),
          })) ?? [],
      });

      expect(component.selectedQuestions[0].queOptionsAns).toEqual([]);
    });
  });

  describe('QuizCreationStep3Option3Component - Additional Branch Coverage', () => {
    describe('fileDrop', () => {
      it('should handle fileDrop with null dataTransfer', () => {
        const handleSpy = jest.spyOn(component, 'handleFiles');
        const event = {
          preventDefault: jest.fn(),
          dataTransfer: null,
        } as unknown as DragEvent;
        component.fileDrop(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(handleSpy).not.toHaveBeenCalled();
      });
    });

    describe('onFileSelected', () => {
      it('should handle onFileSelected with null files', () => {
        const handleSpy = jest.spyOn(component, 'handleFiles');
        const input = { files: null, value: '' } as unknown as HTMLInputElement;
        const event = { target: input } as unknown as Event;
        component.onFileSelected(event);
        expect(handleSpy).not.toHaveBeenCalled();
        expect(input.value).toBe('');
      });

      it('should handle onFileSelected with undefined files', () => {
        const handleSpy = jest.spyOn(component, 'handleFiles');
        const input = { files: undefined, value: '' } as unknown as HTMLInputElement;
        const event = { target: input } as unknown as Event;
        component.onFileSelected(event);
        expect(handleSpy).not.toHaveBeenCalled();
        expect(input.value).toBe('');
      });
    });

    describe('handleFiles', () => {
      it('should handle Excel with null res.data', () => {
        quizService.getQuestionsFromExcel.mockReturnValue(
          of({
            data: null,
            result: true,
            statusCode: 200,
            message: 'success',
          } as unknown as ApiResponse<QuestionResponseDto[]>),
        );

        const emitSpy = jest.spyOn(component.selectedQuestionsChangeFromInnerStep3Option3, 'emit');

        const xlsFile = new File([''], 'questions.xlsx', {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        component.handleFiles(createFileList([xlsFile]));

        expect(quizService.getQuestionsFromExcel).toHaveBeenCalledWith(xlsFile);
        expect(component.selectedQuestions).toEqual([]);
        expect(emitSpy).toHaveBeenCalledWith([]);
        expect(snackbar.showSuccess).toHaveBeenCalledWith('0 questions added!!');
      });

      it('should handle file with no extension', () => {
        const noExtFile = new File([''], 'questions', { type: 'application/octet-stream' });
        component.handleFiles(createFileList([noExtFile]));
        expect(quizService.getQuestionsFromCsv).not.toHaveBeenCalled();
        expect(quizService.getQuestionsFromExcel).not.toHaveBeenCalled();
        expect(snackbar.showError).toHaveBeenCalledWith(quizCRUDMessages.fileTypeError);
      });

      it('should handle file with uppercase CSV extension', () => {
        const csvFile = new File([''], 'questions.CSV', { type: 'text/csv' });
        const response: ApiResponse<QuestionResponseDto[]> = {
          data: [
            {
              id: 1,
              categoryId: 1,
              queDifficultyId: 1,
              queText: 'What is 2+2?',
              queTypeId: 1,
              queOptionsAns: [],
            },
          ],
          result: true,
          statusCode: 200,
          message: 'success',
        };
        quizService.getQuestionsFromCsv.mockReturnValue(of(response));
        const emitSpy = jest.spyOn(component.selectedQuestionsChangeFromInnerStep3Option3, 'emit');

        component.handleFiles(createFileList([csvFile]));

        expect(quizService.getQuestionsFromCsv).toHaveBeenCalledWith(csvFile);
        expect(component.selectedQuestions).toEqual([
          {
            id: 1,
            categoryId: 1,
            queDifficultyId: 1,
            queText: 'What is 2+2?',
            queTypeId: 1,
            queOptionsAns: [],
          },
        ]);
        expect(emitSpy).toHaveBeenCalledWith(component.selectedQuestions);
        expect(snackbar.showSuccess).toHaveBeenCalledWith('1 questions added!!');
      });

      it('should handle file with uppercase XLSX extension', () => {
        const xlsFile = new File([''], 'questions.XLSX', {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const response: ApiResponse<QuestionResponseDto[]> = {
          data: [
            {
              id: 1,
              categoryId: 1,
              queDifficultyId: 1,
              queText: 'What is 2+2?',
              queTypeId: 1,
              queOptionsAns: [],
            },
          ],
          result: true,
          statusCode: 200,
          message: 'success',
        };
        quizService.getQuestionsFromExcel.mockReturnValue(of(response));
        const emitSpy = jest.spyOn(component.selectedQuestionsChangeFromInnerStep3Option3, 'emit');

        component.handleFiles(createFileList([xlsFile]));

        expect(quizService.getQuestionsFromExcel).toHaveBeenCalledWith(xlsFile);
        expect(component.selectedQuestions).toEqual([
          {
            id: 1,
            categoryId: 1,
            queDifficultyId: 1,
            queText: 'What is 2+2?',
            queTypeId: 1,
            queOptionsAns: [],
          },
        ]);
        expect(emitSpy).toHaveBeenCalledWith(component.selectedQuestions);
        expect(snackbar.showSuccess).toHaveBeenCalledWith('1 questions added!!');
      });
    });

    describe('downloadFile', () => {
      it('should create and trigger download link', () => {
        const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue({
          href: '',
          download: '',
          click: jest.fn(),
        } as any);
        const fileUrl = 'http://example.com/sample.csv';
        component['downloadFile'](fileUrl);
        expect(createElementSpy).toHaveBeenCalledWith('a');
        expect(document.createElement('a').href).toBe(fileUrl);
        expect(document.createElement('a').download).toBe('sample.csv');
        expect(document.createElement('a').click).toHaveBeenCalled();
        createElementSpy.mockRestore();
      });
    });
  });

  describe('QuizCreationStep3Option3Component - file handling', () => {
    it('should handle error when CSV parsing fails', () => {
      quizService.getQuestionsFromCsv.mockReturnValue(
        throwError(() => new Error('CSV parsing failed')),
      );

      const emitSpy = jest.spyOn(component.selectedQuestionsChangeFromInnerStep3Option3, 'emit');
      const csvFile = new File([''], 'questions.csv', { type: 'text/csv' });

      component.handleFiles(createFileList([csvFile]));

      expect(quizService.getQuestionsFromCsv).toHaveBeenCalledWith(csvFile);
      expect(component.selectedQuestions).toEqual([]); // fallback
      expect(emitSpy).not.toHaveBeenCalled();
      expect(snackbar.showError).toHaveBeenCalledWith('Error! undefined', 'Something went wrong.');
    });

    it('should handle error when Excel parsing fails', () => {
      quizService.getQuestionsFromExcel.mockReturnValue(
        throwError(() => new Error('Excel parsing failed')),
      );

      const emitSpy = jest.spyOn(component.selectedQuestionsChangeFromInnerStep3Option3, 'emit');
      const xlsFile = new File([''], 'questions.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      component.handleFiles(createFileList([xlsFile]));

      expect(quizService.getQuestionsFromExcel).toHaveBeenCalledWith(xlsFile);
      expect(component.selectedQuestions).toEqual([]); // fallback
      expect(emitSpy).not.toHaveBeenCalled();
      expect(snackbar.showError).toHaveBeenCalledWith('Error! undefined', 'Something went wrong.');
    });
  });
});
