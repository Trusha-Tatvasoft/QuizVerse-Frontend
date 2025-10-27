import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { QuizCreationService } from './quiz-creation.service';
import {
  QuestionPoolList,
  QueOptionsAndAnswers,
  QuestionsList,
  QuestionsListRequest,
  SaveQuizRequest,
  QuizResponse,
  QuestionResponseDto,
  QuizStep1Data,
  QuizPreviewData,
  ExportQuizQuestionsRequestDto,
} from '../../../../shared/interfaces/quiz-creation.interface';
import { environment } from '../../../../../environments/environment.dev';
import { EndPoints } from '../../../../shared/enums/end-point.enum';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponse } from '../../../../shared/interfaces/api-response.interface';
import { PaginationRequest } from '../../../../shared/interfaces/pagination-request.interface';
import { PaginatedDataResponse } from '../../../../shared/interfaces/paginated-data-response.interface';
import { DropDownData } from '../../../../shared/interfaces/drop-down-data.interface';

describe('QuizCreationService', () => {
  let service: QuizCreationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [QuizCreationService],
    });
    service = TestBed.inject(QuizCreationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensure no outstanding HTTP requests
  });

  describe('Service Methods', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    describe('getDropDownData', () => {
      it('should fetch dropdown data for a given type', () => {
        const type = 1;
        const mockResponse: ApiResponse<DropDownData[]> = {
          result: true,
          statusCode: 200,
          message: 'Success',
          data: [{ id: 1, name: 'Category 1' }],
        };

        service.getDropDownData(type).subscribe((response) => {
          expect(response).toEqual(mockResponse);
          expect(response.data.length).toBe(1);
          expect(response.data[0].name).toBe('Category 1');
          expect(response.result).toBe(true);
        });

        const req = httpMock.expectOne(
          `${environment.baseUrl}/${EndPoints.DropDownData}?type=${type}`,
        );
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
      });

      it('should handle HTTP error for getDropDownData', () => {
        const type = 1;
        const errorMessage = 'Server Error';
        service.getDropDownData(type).subscribe({
          error: (error: HttpErrorResponse) => {
            expect(error.status).toBe(500);
            expect(error.statusText).toBe(errorMessage);
          },
        });

        const req = httpMock.expectOne(
          `${environment.baseUrl}/${EndPoints.DropDownData}?type=${type}`,
        );
        req.flush(errorMessage, { status: 500, statusText: errorMessage });
      });
    });

    describe('getQuestions', () => {
      it('should fetch paginated questions', () => {
        const mockRequest: PaginationRequest = {
          pageNumber: 1,
          pageSize: 10,
          sortDescending: false,
        };
        const mockResponse: ApiResponse<PaginatedDataResponse<QuestionPoolList>> = {
          result: true,
          statusCode: 200,
          message: 'Success',
          data: {
            records: [
              {
                id: 1,
                categoryId: 10,
                categoryName: 'Math',
                queDifficultyId: 2,
                queDifficultyName: 'Medium',
                queText: 'What is 2 + 2?',
                queTypeId: 1,
                queTypeName: 'MCQ',
                queOptionsAns: [{ id: 1, questionId: 1, key: 'A', value: '4' }],
              },
            ],
            totalRecords: 1,
          },
        };

        service.getQuestions(mockRequest).subscribe((response) => {
          expect(response).toEqual(mockResponse);
          expect(response.data.records.length).toBe(1);
          expect(response.data.records[0].queText).toBe('What is 2 + 2?');
          expect(response.result).toBe(true);
        });

        const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.QuestionPoolList}`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(mockRequest);
        req.flush(mockResponse);
      });

      it('should handle error for getQuestions', () => {
        const mockRequest: PaginationRequest = {
          pageNumber: 1,
          pageSize: 10,
          sortDescending: false,
        };
        service.getQuestions(mockRequest).subscribe({
          error: (error: HttpErrorResponse) => {
            expect(error.status).toBe(400);
            expect(error.statusText).toBe('Bad Request');
          },
        });

        const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.QuestionPoolList}`);
        req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
      });
    });

    describe('createOrUpdateQuiz', () => {
      it('should create or update a quiz', () => {
        const mockRequest: SaveQuizRequest = {
          name: 'Math Quiz',
          categoryId: 5,
          description: 'Basic Math Quiz',
          totalTime: 30,
          difficultyLevelId: 2,
          totalQuestion: 10,
          isPaid: false,
          noOfQuestionsPerDifficulty: [
            { queDifficultyName: 'Easy', noOfQuestions: 3 },
            { queDifficultyName: 'Medium', noOfQuestions: 4 },
            { queDifficultyName: 'Hard', noOfQuestions: 3 },
          ],
        };
        const mockResponse: ApiResponse<null> = {
          result: true,
          statusCode: 200,
          message: 'Quiz saved successfully',
          data: null,
        };

        service.createOrUpdateQuiz(mockRequest).subscribe((response) => {
          expect(response).toEqual(mockResponse);
          expect(response.data).toBeNull();
          expect(response.result).toBe(true);
        });

        const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.CreateOrUpdateQuiz}`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(mockRequest);
        req.flush(mockResponse);
      });

      it('should handle error for createOrUpdateQuiz', () => {
        const mockRequest: SaveQuizRequest = {
          name: 'Math Quiz',
          categoryId: 5,
          description: 'Basic Math Quiz',
          totalTime: 30,
          difficultyLevelId: 2,
          totalQuestion: 10,
          isPaid: false,
          noOfQuestionsPerDifficulty: [],
        };
        service.createOrUpdateQuiz(mockRequest).subscribe({
          error: (error: HttpErrorResponse) => {
            expect(error.status).toBe(400);
          },
        });

        const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.CreateOrUpdateQuiz}`);
        req.flush('Invalid request', { status: 400, statusText: 'Bad Request' });
      });
    });

    describe('getQuiz', () => {
      it('should fetch quiz details by ID', () => {
        const quizId = 1;
        const mockResponse: ApiResponse<QuizResponse> = {
          result: true,
          statusCode: 200,
          message: 'Success',
          data: {
            id: 1,
            name: 'Math Quiz',
            categoryId: 5,
            description: 'Basic Math Quiz',
            totalTime: 30,
            difficultyLevelId: 2,
            totalQuestion: 10,
            isPaid: false,
            status: 1,
            noOfQuestionsPerDifficulty: [],
          },
        };

        service.getQuiz(quizId).subscribe((response) => {
          expect(response).toEqual(mockResponse);
          expect(response.data.name).toBe('Math Quiz');
          expect(response.result).toBe(true);
        });

        const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.GetQuizById}/${quizId}`);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
      });

      it('should handle error for getQuiz', () => {
        const quizId = 1;
        service.getQuiz(quizId).subscribe({
          error: (error: HttpErrorResponse) => {
            expect(error.status).toBe(404);
          },
        });

        const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.GetQuizById}/${quizId}`);
        req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      });
    });

    describe('getQuestionsFromCsv', () => {
      it('should import questions from CSV', () => {
        const mockFile = new File([''], 'questions.csv');
        const mockResponse: ApiResponse<QuestionResponseDto[]> = {
          result: true,
          statusCode: 200,
          message: 'Success',
          data: [
            {
              id: 1,
              categoryId: 5,
              queDifficultyId: 2,
              queText: 'What is 2+2?',
              queTypeId: 1,
              queOptionsAns: [{ id: 1, questionId: 1, key: 'A', value: '4' }],
            },
          ],
        };

        service.getQuestionsFromCsv(mockFile).subscribe((response) => {
          expect(response).toEqual(mockResponse);
          expect(response.data[0].queText).toBe('What is 2+2?');
          expect(response.result).toBe(true);
        });

        const req = httpMock.expectOne(
          `${environment.baseUrl}/${EndPoints.PreviewQuestionsFromCsv}`,
        );
        expect(req.request.method).toBe('POST');
        expect(req.request.body instanceof FormData).toBe(true);
        req.flush(mockResponse);
      });

      it('should handle error for getQuestionsFromCsv', () => {
        const mockFile = new File([''], 'questions.csv');
        service.getQuestionsFromCsv(mockFile).subscribe({
          error: (error: HttpErrorResponse) => {
            expect(error.status).toBe(400);
          },
        });

        const req = httpMock.expectOne(
          `${environment.baseUrl}/${EndPoints.PreviewQuestionsFromCsv}`,
        );
        req.flush('Invalid file', { status: 400, statusText: 'Bad Request' });
      });
    });

    describe('getQuestionsFromExcel', () => {
      it('should import questions from Excel', () => {
        const mockFile = new File([''], 'questions.xlsx');
        const mockResponse: ApiResponse<QuestionResponseDto[]> = {
          result: true,
          statusCode: 200,
          message: 'Success',
          data: [
            {
              id: 1,
              categoryId: 5,
              queDifficultyId: 2,
              queText: 'What is 3+3?',
              queTypeId: 1,
              queOptionsAns: [{ id: 1, questionId: 1, key: 'A', value: '6' }],
            },
          ],
        };

        service.getQuestionsFromExcel(mockFile).subscribe((response) => {
          expect(response).toEqual(mockResponse);
          expect(response.data[0].queText).toBe('What is 3+3?');
          expect(response.result).toBe(true);
        });

        const req = httpMock.expectOne(
          `${environment.baseUrl}/${EndPoints.PreviewQuestionsFromExcel}`,
        );
        expect(req.request.method).toBe('POST');
        expect(req.request.body instanceof FormData).toBe(true);
        req.flush(mockResponse);
      });

      it('should handle error for getQuestionsFromExcel', () => {
        const mockFile = new File([''], 'questions.xlsx');
        service.getQuestionsFromExcel(mockFile).subscribe({
          error: (error: HttpErrorResponse) => {
            expect(error.status).toBe(400);
          },
        });

        const req = httpMock.expectOne(
          `${environment.baseUrl}/${EndPoints.PreviewQuestionsFromExcel}`,
        );
        req.flush('Invalid file', { status: 400, statusText: 'Bad Request' });
      });
    });

    describe('exportCsv', () => {
      it('should export quiz questions to CSV', () => {
        const mockRequest: ExportQuizQuestionsRequestDto = {
          quizName: 'Test Quiz',
          questions: [
            {
              categoryId: 5,
              queDifficultyId: 2,
              queText: 'What is 2+2?',
              queTypeId: 1,
            },
          ],
        };
        const mockBlob = new Blob([''], { type: 'text/csv' });

        service.exportCsv(mockRequest).subscribe((blob) => {
          expect(blob).toEqual(mockBlob);
        });

        const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.ExportQuestions}`);
        expect(req.request.method).toBe('POST');
        expect(req.request.responseType).toBe('blob');
        expect(req.request.body).toEqual(mockRequest);
        req.flush(mockBlob);
      });

      it('should handle error for exportCsv', () => {
        const mockRequest: ExportQuizQuestionsRequestDto = {
          quizName: 'Test Quiz',
          questions: [],
        };

        service.exportCsv(mockRequest).subscribe({
          error: (error: HttpErrorResponse) => {
            expect(error.status).toBe(400);
            expect(error.statusText).toBe('Bad Request');
          },
        });

        const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.ExportQuestions}`);
        req.flush(null, { status: 400, statusText: 'Bad Request' });
      });
    });

    describe('Quiz Creation Interfaces', () => {
      let mockOption: QueOptionsAndAnswers;
      let mockQuestion: QuestionsList;
      let mockQuestionRequest: QuestionsListRequest;
      let mockSaveQuizRequest: SaveQuizRequest;
      let mockQuizResponse: QuizResponse;
      let mockQuizStep1Data: QuizStep1Data;
      let mockQuizPreviewData: QuizPreviewData;
      let mockExportRequest: ExportQuizQuestionsRequestDto;

      beforeEach(() => {
        mockOption = {
          key: 'A',
          value: 'Option A',
        };

        mockQuestion = {
          queText: 'What is 2 + 2?',
          queOptionsAns: [mockOption],
        };

        mockQuestionRequest = {
          categoryId: 10,
          queDifficultyId: 2,
          queText: 'What is 5 + 5?',
          queTypeId: 1,
          queOptionsAns: [mockOption],
        };

        mockSaveQuizRequest = {
          name: 'Math Quiz',
          categoryId: 5,
          description: 'Basic Math Quiz',
          totalTime: 30,
          difficultyLevelId: 2,
          totalQuestion: 10,
          isPaid: false,
          noOfQuestionsPerDifficulty: [
            { queDifficultyName: 'Easy', noOfQuestions: 3 },
            { queDifficultyName: 'Medium', noOfQuestions: 4 },
            { queDifficultyName: 'Hard', noOfQuestions: 3 },
          ],
          tags: [{ name: 'math' }],
          questions: [mockQuestionRequest],
        };

        mockQuizResponse = {
          name: 'Math Quiz',
          categoryId: 5,
          description: 'Basic Math Quiz',
          totalTime: 30,
          difficultyLevelId: 2,
          totalQuestion: 10,
          isPaid: false,
          status: 1,
          tags: [{ name: 'math' }],
          questions: [
            {
              id: 1,
              categoryId: 5,
              queDifficultyId: 2,
              queText: 'What is 10 + 10?',
              queTypeId: 1,
              queOptionsAns: [{ id: 1, questionId: 1, key: 'A', value: '20' }],
            },
          ],
          noOfQuestionsPerDifficulty: [
            { queDifficultyName: 'Easy', noOfQuestions: 3 },
            { queDifficultyName: 'Medium', noOfQuestions: 4 },
            { queDifficultyName: 'Hard', noOfQuestions: 3 },
          ],
        };

        mockQuizStep1Data = {
          quizTitle: 'Algebra Quiz',
          quizCategory: 2,
          description: 'Test your algebra skills',
          quizTiming: 20,
          difficultyLevel: 1,
          isPaid: true,
          totalQuestions: 5,
          tags: ['math', 'algebra'],
          difficultyDistribution: [
            { key: 'easy', value: 2 },
            { key: 'medium', value: 2 },
            { key: 'hard', value: 1 },
          ],
        };

        mockQuizPreviewData = {
          quizName: 'Preview Quiz',
          description: 'Preview description',
          tags: [
            {
              id: '1',
              label: 'math',
              type: 'static',
              isSelected: false,
              hasBorder: true,
              backgroundColor: 'white',
              textColor: 'black',
            },
          ],
          questions: [mockQuestion],
        };

        mockExportRequest = {
          quizName: 'Export Quiz',
          questions: [mockQuestionRequest],
        };
      });

      it('should create a valid SaveQuizRequest', () => {
        expect(mockSaveQuizRequest.name).toBe('Math Quiz');
        expect(mockSaveQuizRequest.noOfQuestionsPerDifficulty.length).toBe(3);
        expect(mockSaveQuizRequest.questions?.length).toBe(1);
        expect(mockSaveQuizRequest.tags?.length).toBe(1);
        expect(mockSaveQuizRequest.price).toBeUndefined();
        expect(mockSaveQuizRequest.status).toBeUndefined();
      });

      it('should handle minimal SaveQuizRequest', () => {
        const minimalSaveQuizRequest: SaveQuizRequest = {
          name: 'Minimal Quiz',
          categoryId: 1,
          description: '',
          totalTime: 0,
          difficultyLevelId: 1,
          totalQuestion: 0,
          isPaid: false,
          noOfQuestionsPerDifficulty: [],
        };
        expect(minimalSaveQuizRequest.name).toBe('Minimal Quiz');
        expect(minimalSaveQuizRequest.tags).toBeUndefined();
        expect(minimalSaveQuizRequest.questions).toBeUndefined();
        expect(minimalSaveQuizRequest.noOfQuestionsPerDifficulty.length).toBe(0);
      });

      it('should map QuizResponse correctly', () => {
        expect(mockQuizResponse.questions?.[0].queText).toBe('What is 10 + 10?');
        expect(mockQuizResponse.tags?.[0].name).toBe('math');
        expect(mockQuizResponse.status).toBe(1);
      });

      it('should handle minimal QuizResponse', () => {
        const minimalQuizResponse: QuizResponse = {
          name: 'Minimal Quiz',
          categoryId: 1,
          description: '',
          totalTime: 0,
          difficultyLevelId: 1,
          totalQuestion: 0,
          isPaid: false,
          status: 0,
          noOfQuestionsPerDifficulty: [],
        };
        expect(minimalQuizResponse.name).toBe('Minimal Quiz');
        expect(minimalQuizResponse.questions).toBeUndefined();
        expect(minimalQuizResponse.tags).toBeUndefined();
        expect(minimalQuizResponse.price).toBeUndefined();
      });

      it('should handle QuizStep1Data correctly', () => {
        expect(mockQuizStep1Data.quizTitle).toBe('Algebra Quiz');
        expect(mockQuizStep1Data.difficultyDistribution?.[0].key).toBe('easy');
        expect(mockQuizStep1Data.tags.length).toBe(2);
        expect(mockQuizStep1Data.quizCategoryName).toBeUndefined();
      });

      it('should handle minimal QuizStep1Data', () => {
        const minimalQuizStep1Data: QuizStep1Data = {
          quizTitle: 'Minimal Quiz',
          quizCategory: 1,
          description: '',
          quizTiming: 0,
          difficultyLevel: 1,
          isPaid: false,
          totalQuestions: 0,
          tags: [],
        };
        expect(minimalQuizStep1Data.quizTitle).toBe('Minimal Quiz');
        expect(minimalQuizStep1Data.difficultyDistribution).toBeUndefined();
        expect(minimalQuizStep1Data.price).toBeUndefined();
        expect(minimalQuizStep1Data.quizCategoryName).toBeUndefined();
      });

      it('should create valid QuizPreviewData', () => {
        expect(mockQuizPreviewData.questions[0].queText).toBe('What is 2 + 2?');
        expect(mockQuizPreviewData.tags[0].label).toBe('math');
      });

      it('should handle minimal QuizPreviewData', () => {
        const minimalQuizPreviewData: QuizPreviewData = {
          quizName: 'Empty Quiz',
          description: '',
          tags: [],
          questions: [],
        };
        expect(minimalQuizPreviewData.tags.length).toBe(0);
        expect(minimalQuizPreviewData.questions.length).toBe(0);
      });

      it('should prepare valid ExportQuizQuestionsRequestDto', () => {
        expect(mockExportRequest.quizName).toBe('Export Quiz');
        expect(mockExportRequest.questions.length).toBe(1);
      });

      it('should handle minimal ExportQuizQuestionsRequestDto', () => {
        const minimalExportRequest: ExportQuizQuestionsRequestDto = {
          quizName: '',
          questions: [],
        };
        expect(minimalExportRequest.quizName).toBe('');
        expect(minimalExportRequest.questions.length).toBe(0);
      });

      it('should allow QueOptionsAndAnswers mapping', () => {
        expect(mockOption.value).toBe('Option A');
        expect(mockOption.id).toBeUndefined();
        expect(mockOption.questionId).toBeUndefined();
      });

      it('should handle QuestionsList with minimal properties', () => {
        const minimalQuestion: QuestionsList = {
          queText: 'Minimal Question',
        };
        expect(minimalQuestion.queText).toBe('Minimal Question');
        expect(minimalQuestion.id).toBeUndefined();
        expect(minimalQuestion.queOptionsAns).toBeUndefined();
        expect(minimalQuestion.categoryId).toBeUndefined();
        expect(minimalQuestion.queDifficultyId).toBeUndefined();
        expect(minimalQuestion.queDifficultyName).toBeUndefined();
        expect(minimalQuestion.queTypeId).toBeUndefined();
        expect(minimalQuestion.queTypeName).toBeUndefined();
      });
    });
  });
});
