import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { QuestionPoolService } from './question-pool.service';
import { PaginationRequest } from '../../../shared/interfaces/pagination-request.interface';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { PaginatedDataResponse } from '../../../shared/interfaces/paginated-data-response.interface';
import { QuestionPoolListData } from '../../../pages/admin/question-pool/interfaces/question-pool-list-data.interface';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { QuestionRequest } from '../../../pages/admin/question-pool/interfaces/question-request.interface';
import { GenerateQuestionFromPromptRequest } from '../../../pages/admin/question-pool/interfaces/question-pool-ai-tab.interface';

describe('QuestionPoolService', () => {
  let service: QuestionPoolService;
  let httpMock: HttpTestingController;

  const endpointUrl = `${environment.baseUrl}/${EndPoints.QuestionPoolList}`;

  const mockRequest: PaginationRequest = {
    pageNumber: 1,
    pageSize: 10,
    searchTerm: '',
    sortColumn: '',
    sortDescending: false,
    filters: {},
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QuestionPoolService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(QuestionPoolService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch paginated question pool list', () => {
    const mockResponse: ApiResponse<PaginatedDataResponse<QuestionPoolListData>> = {
      result: true,
      statusCode: 200,
      message: 'Success',
      data: {
        totalRecords: 1,
        records: [
          {
            id: 1,
            categoryId: 2,
            categoryName: 'Category 1',
            queDifficultyId: 1,
            queDifficultyName: 'Easy',
            queText: 'Sample question?',
            queTypeId: 5,
            queTypeName: 'Multiple Choice',
            queOptionsAns: [
              { id: 1, questionId: 1, key: 'Answer', value: '42' },
              { id: 2, questionId: 1, key: 'Option1', value: '24' },
            ],
          },
        ],
      },
    };

    service.getQuestionPoolList(mockRequest).subscribe((response) => {
      expect(response).toEqual(mockResponse);
      expect(response.data.totalRecords).toBe(1);
      expect(response.data.records[0].queText).toBe('Sample question?');
      expect(response.data.records[0].queOptionsAns[0].value).toBe('42');
    });

    const req = httpMock.expectOne(endpointUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockRequest);
    req.flush(mockResponse);
  });

  it('should handle empty response list', () => {
    const emptyResponse: ApiResponse<PaginatedDataResponse<QuestionPoolListData>> = {
      result: true,
      statusCode: 200,
      message: 'Success',
      data: {
        totalRecords: 0,
        records: [],
      },
    };

    service.getQuestionPoolList(mockRequest).subscribe((response) => {
      expect(response.data.records.length).toBe(0);
      expect(response.data.totalRecords).toBe(0);
    });

    const req = httpMock.expectOne(endpointUrl);
    expect(req.request.method).toBe('POST');
    req.flush(emptyResponse);
  });

  it('should call deleteQuestion with correct URL', () => {
    const deleteId = 5;
    const deleteUrl = `${environment.baseUrl}/${EndPoints.DeleteQuestion}/${deleteId}`;
    const mockDeleteResponse = { result: true, statusCode: 200, message: 'Deleted', data: {} };

    service.deleteQuestion(deleteId).subscribe((res) => {
      expect(res).toEqual(mockDeleteResponse);
    });

    const req = httpMock.expectOne(deleteUrl);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockDeleteResponse);
  });

  it('should fetch question preview with skipLoader header', () => {
    const previewId = 10;
    const previewUrl = `${environment.baseUrl}/${EndPoints.GetQuestionPrevirew}/${previewId}`;
    const mockPreviewResponse = {
      result: true,
      statusCode: 200,
      message: 'Success',
      data: {
        id: previewId,
        questionText: 'Preview question?',
        questionType: 'Multiple Choice',
        difficulty: 'Easy',
        category: 'Category 1',
        options: [{ id: 1, questionId: previewId, key: 'Answer', value: '42' }],
      },
    };

    service.getQuestionPreviewById(previewId).subscribe((res) => {
      expect(res).toEqual(mockPreviewResponse);
    });

    const req = httpMock.expectOne(previewUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('X-Skip-Loader')).toBe('true');
    req.flush(mockPreviewResponse);
  });

  it('should create a new question when id=0', () => {
    const id = 0;
    const dto: QuestionRequest = {
      categoryId: 2,
      difficultyId: 1,
      questionText: 'New question?',
      questionTypeId: 5,
      options: ['42', '24'],
      correctAnswer: '42',
    };
    const createUrl = `${environment.baseUrl}/${EndPoints.CreateOrUpdateQuestion}/${id}`;

    const mockResponse: ApiResponse<string> = {
      result: true,
      statusCode: 201,
      message: 'Created successfully',
      data: 'OK',
    };

    service.createOrUpdateQuestion(id, dto).subscribe((res) => {
      expect(res).toEqual(mockResponse);
      expect(res.result).toBe(true);
      expect(res.message).toBe('Created successfully');
    });

    const req = httpMock.expectOne(createUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(mockResponse);
  });

  it('should update an existing question when id is provided', () => {
    const id = 99;
    const dto: QuestionRequest = {
      categoryId: 2,
      difficultyId: 2,
      questionText: 'Updated question?',
      questionTypeId: 6,
      options: ['Yes', 'No'],
      correctAnswer: 'Yes',
    };
    const updateUrl = `${environment.baseUrl}/${EndPoints.CreateOrUpdateQuestion}/${id}`;

    const mockResponse: ApiResponse<string> = {
      result: true,
      statusCode: 200,
      message: 'Updated successfully',
      data: 'OK',
    };

    service.createOrUpdateQuestion(id, dto).subscribe((res) => {
      expect(res).toEqual(mockResponse);
      expect(res.result).toBe(true);
      expect(res.message).toBe('Updated successfully');
    });

    const req = httpMock.expectOne(updateUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(mockResponse);
  });

  it('should preview questions from CSV file', () => {
    const file = new File(['id,question'], 'questions.csv', { type: 'text/csv' });
    const formData = new FormData();
    formData.append('file', file);

    const previewUrl = `${environment.baseUrl}/${EndPoints.PreviewQuestionsFromCsv}`;

    const mockResponse: ApiResponse<QuestionPoolListData[]> = {
      result: true,
      statusCode: 200,
      message: 'Preview success',
      data: [
        {
          id: 1,
          categoryId: 2,
          categoryName: 'Category CSV',
          queDifficultyId: 1,
          queDifficultyName: 'Easy',
          queText: 'CSV question?',
          queTypeId: 5,
          queTypeName: 'Multiple Choice',
          queOptionsAns: [{ id: 1, questionId: 1, key: 'Answer', value: '42' }],
        },
      ],
    };

    service.previewQuestionsFromCsv(formData).subscribe((res) => {
      expect(res.length).toBe(1);
      expect(res[0].queText).toBe('CSV question?');
    });

    const req = httpMock.expectOne(previewUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    req.flush(mockResponse);
  });

  it('should preview questions from Excel file', () => {
    const file = new File(['excel-data'], 'questions.xlsx', { type: 'application/vnd.ms-excel' });
    const formData = new FormData();
    formData.append('file', file);

    const previewUrl = `${environment.baseUrl}/${EndPoints.PreviewQuestionsFromExcel}`;

    const mockResponse: ApiResponse<QuestionPoolListData[]> = {
      result: true,
      statusCode: 200,
      message: 'Preview success',
      data: [
        {
          id: 2,
          categoryId: 3,
          categoryName: 'Category Excel',
          queDifficultyId: 2,
          queDifficultyName: 'Medium',
          queText: 'Excel question?',
          queTypeId: 6,
          queTypeName: 'True/False',
          queOptionsAns: [{ id: 2, questionId: 2, key: 'Answer', value: 'Yes' }],
        },
      ],
    };

    service.previewQuestionsFromExcel(formData).subscribe((res) => {
      expect(res.length).toBe(1);
      expect(res[0].queText).toBe('Excel question?');
    });

    const req = httpMock.expectOne(previewUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    req.flush(mockResponse);
  });

  it('should save questions after preview', () => {
    const saveUrl = `${environment.baseUrl}/${EndPoints.SaveQuestions}`;
    const questions: QuestionPoolListData[] = [
      {
        id: 3,
        categoryId: 4,
        categoryName: 'Category Save',
        queDifficultyId: 3,
        queDifficultyName: 'Hard',
        queText: 'Saved question?',
        queTypeId: 7,
        queTypeName: 'Short Answer',
        queOptionsAns: [{ id: 3, questionId: 3, key: 'Answer', value: 'Saved' }],
      },
    ];

    const mockResponse: ApiResponse<string> = {
      result: true,
      statusCode: 200,
      message: 'Questions saved successfully',
      data: 'OK',
    };

    service.saveQuestions(questions).subscribe((res) => {
      expect(res).toEqual(mockResponse);
      expect(res.message).toBe('Questions saved successfully');
    });

    const req = httpMock.expectOne(saveUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(questions);
    req.flush(mockResponse);
  });

  describe('generateQuestionsFromTextPrompt', () => {
    it('should generate questions from text prompt successfully', () => {
      const requestPayload: GenerateQuestionFromPromptRequest = {
        prompt: 'Generate science questions about physics',
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

      const mockResponse: ApiResponse<QuestionPoolListData[]> = {
        result: true,
        statusCode: 200,
        message: 'Questions generated successfully',
        data: [
          {
            id: 101,
            categoryId: 1,
            categoryName: 'Science',
            queDifficultyId: 1,
            queDifficultyName: 'Easy',
            queText: "What is Newton's first law of motion?",
            queTypeId: 1,
            queTypeName: 'Multiple Choice',
            queOptionsAns: [
              { id: 1, questionId: 101, key: 'option', value: 'Law of Inertia' },
              { id: 2, questionId: 101, key: 'option', value: 'Law of Acceleration' },
              { id: 3, questionId: 101, key: 'option', value: 'Law of Action-Reaction' },
              { id: 4, questionId: 101, key: 'answer', value: 'Law of Inertia' },
            ],
          },
          {
            id: 102,
            categoryId: 1,
            categoryName: 'Science',
            queDifficultyId: 1,
            queDifficultyName: 'Easy',
            queText: 'What is the SI unit of force?',
            queTypeId: 1,
            queTypeName: 'Multiple Choice',
            queOptionsAns: [
              { id: 5, questionId: 102, key: 'option', value: 'Joule' },
              { id: 6, questionId: 102, key: 'option', value: 'Watt' },
              { id: 7, questionId: 102, key: 'option', value: 'Newton' },
              { id: 8, questionId: 102, key: 'answer', value: 'Newton' },
            ],
          },
        ],
      };

      service.generateQuestionsFromTextPrompt(requestPayload).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(response.result).toBe(true);
        expect(response.message).toBe('Questions generated successfully');
        expect(response.data.length).toBe(2);
        expect(response.data[0].queText).toContain('Newton');
        expect(response.data[1].queOptionsAns[3].value).toBe('Newton');
      });

      const req = httpMock.expectOne(
        `${environment.baseUrl}/${EndPoints.GenerateQuestionFromPromptRequest}`,
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(requestPayload);
      req.flush(mockResponse);
    });

    it('should handle empty response when no questions are generated', () => {
      const requestPayload: GenerateQuestionFromPromptRequest = {
        prompt: 'Generate questions about unknown topic',
        categoryId: 2,
        category: 'Unknown',
        questionSpec: [
          {
            questionDifficultyId: 2,
            questionDifficultyName: 'Medium',
            questionPerQuestionType: [
              {
                questionPerQuestionTypeId: 2,
                questionPerQuestionTypeName: 'True/False',
                noOfQuesitons: 3,
              },
            ],
          },
        ],
      };

      const mockResponse: ApiResponse<QuestionPoolListData[]> = {
        result: true,
        statusCode: 200,
        message: 'No questions generated for the given prompt',
        data: [],
      };

      service.generateQuestionsFromTextPrompt(requestPayload).subscribe((response) => {
        expect(response.result).toBe(true);
        expect(response.data.length).toBe(0);
        expect(response.message).toBe('No questions generated for the given prompt');
      });

      const req = httpMock.expectOne(
        `${environment.baseUrl}/${EndPoints.GenerateQuestionFromPromptRequest}`,
      );
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });

    it('should handle server error when generating questions', () => {
      const requestPayload: GenerateQuestionFromPromptRequest = {
        prompt: 'Generate questions',
        categoryId: 1,
        category: 'Science',
        questionSpec: [],
      };

      const mockErrorResponse: ApiResponse<QuestionPoolListData[]> = {
        result: false,
        statusCode: 500,
        message: 'Internal server error while generating questions',
        data: [],
      };

      service.generateQuestionsFromTextPrompt(requestPayload).subscribe((response) => {
        expect(response.result).toBe(false);
        expect(response.statusCode).toBe(500);
        expect(response.message).toContain('server error');
        expect(response.data.length).toBe(0);
      });

      const req = httpMock.expectOne(
        `${environment.baseUrl}/${EndPoints.GenerateQuestionFromPromptRequest}`,
      );
      expect(req.request.method).toBe('POST');
      req.flush(mockErrorResponse);
    });

    it('should handle validation error for invalid prompt', () => {
      const requestPayload: GenerateQuestionFromPromptRequest = {
        prompt: '', // Empty prompt
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

      const mockErrorResponse: ApiResponse<QuestionPoolListData[]> = {
        result: false,
        statusCode: 400,
        message: 'Prompt cannot be empty',
        data: [],
      };

      service.generateQuestionsFromTextPrompt(requestPayload).subscribe((response) => {
        expect(response.result).toBe(false);
        expect(response.statusCode).toBe(400);
        expect(response.message).toBe('Prompt cannot be empty');
      });

      const req = httpMock.expectOne(
        `${environment.baseUrl}/${EndPoints.GenerateQuestionFromPromptRequest}`,
      );
      expect(req.request.method).toBe('POST');
      req.flush(mockErrorResponse);
    });

    it('should generate mixed question types based on specification', () => {
      const requestPayload: GenerateQuestionFromPromptRequest = {
        prompt: 'Generate mixed questions about mathematics',
        categoryId: 3,
        category: 'Mathematics',
        questionSpec: [
          {
            questionDifficultyId: 1,
            questionDifficultyName: 'Easy',
            questionPerQuestionType: [
              {
                questionPerQuestionTypeId: 1,
                questionPerQuestionTypeName: 'Multiple Choice',
                noOfQuesitons: 3,
              },
              {
                questionPerQuestionTypeId: 2,
                questionPerQuestionTypeName: 'True/False',
                noOfQuesitons: 2,
              },
            ],
          },
          {
            questionDifficultyId: 2,
            questionDifficultyName: 'Medium',
            questionPerQuestionType: [
              {
                questionPerQuestionTypeId: 3,
                questionPerQuestionTypeName: 'Short Answer',
                noOfQuesitons: 1,
              },
            ],
          },
        ],
      };

      const mockResponse: ApiResponse<QuestionPoolListData[]> = {
        result: true,
        statusCode: 200,
        message: 'Questions generated successfully',
        data: [
          {
            id: 201,
            categoryId: 3,
            categoryName: 'Mathematics',
            queDifficultyId: 1,
            queDifficultyName: 'Easy',
            queText: 'What is 2 + 2?',
            queTypeId: 1,
            queTypeName: 'Multiple Choice',
            queOptionsAns: [
              { id: 9, questionId: 201, key: 'option', value: '3' },
              { id: 10, questionId: 201, key: 'option', value: '4' },
              { id: 11, questionId: 201, key: 'option', value: '5' },
              { id: 12, questionId: 201, key: 'answer', value: '4' },
            ],
          },
          {
            id: 202,
            categoryId: 3,
            categoryName: 'Mathematics',
            queDifficultyId: 1,
            queDifficultyName: 'Easy',
            queText: 'Is 5 a prime number?',
            queTypeId: 2,
            queTypeName: 'True/False',
            queOptionsAns: [{ id: 13, questionId: 202, key: 'answer', value: 'True' }],
          },
          {
            id: 203,
            categoryId: 3,
            categoryName: 'Mathematics',
            queDifficultyId: 2,
            queDifficultyName: 'Medium',
            queText: 'Solve for x: 2x + 5 = 15',
            queTypeId: 3,
            queTypeName: 'Short Answer',
            queOptionsAns: [{ id: 14, questionId: 203, key: 'answer', value: '5' }],
          },
        ],
      };

      service.generateQuestionsFromTextPrompt(requestPayload).subscribe((response) => {
        expect(response.data.length).toBe(3);

        const multipleChoiceQuestions = response.data.filter(
          (q) => q.queTypeName === 'Multiple Choice',
        );
        const trueFalseQuestions = response.data.filter((q) => q.queTypeName === 'True/False');
        const shortAnswerQuestions = response.data.filter((q) => q.queTypeName === 'Short Answer');

        expect(multipleChoiceQuestions.length).toBe(1);
        expect(trueFalseQuestions.length).toBe(1);
        expect(shortAnswerQuestions.length).toBe(1);

        expect(multipleChoiceQuestions[0].queDifficultyName).toBe('Easy');
        expect(shortAnswerQuestions[0].queDifficultyName).toBe('Medium');
      });

      const req = httpMock.expectOne(
        `${environment.baseUrl}/${EndPoints.GenerateQuestionFromPromptRequest}`,
      );
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });

    it('should use correct endpoint URL for question generation', () => {
      const requestPayload: GenerateQuestionFromPromptRequest = {
        prompt: 'Test prompt',
        categoryId: 1,
        category: 'Test',
        questionSpec: [],
      };

      const expectedUrl = `${environment.baseUrl}/${EndPoints.GenerateQuestionFromPromptRequest}`;

      service.generateQuestionsFromTextPrompt(requestPayload).subscribe();

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(requestPayload);

      req.flush({
        result: true,
        statusCode: 200,
        message: 'Success',
        data: [],
      });
    });
  });
});
