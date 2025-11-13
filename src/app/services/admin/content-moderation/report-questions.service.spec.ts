import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { ReportQuestionsService } from './report-questions.service';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { QuestionOrQuizIssueReportStatus } from '../../../shared/enums/content-moderation.enum';
import { PaginatedDataResponse } from '../../../shared/interfaces/paginated-data-response.interface';
import { QuestionRequest } from '../../../pages/admin/question-pool/interfaces/question-request.interface';
import {
  ActiveQuizBattleAffectedDTO,
  QuestionDetailExtended,
  ReportQuestion,
} from '../../../pages/admin/content-moderation/interfaces/report-question.interface';

describe('ReportQuestionsService', () => {
  let service: ReportQuestionsService;
  let httpMock: jest.Mocked<HttpClient>;

  beforeEach(() => {
    const httpClientMock = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [ReportQuestionsService, { provide: HttpClient, useValue: httpClientMock }],
    });

    service = TestBed.inject(ReportQuestionsService);
    httpMock = TestBed.inject(HttpClient) as jest.Mocked<HttpClient>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call getReportedQuestionList and return data', (done) => {
    const mockRequest = { pageNumber: 1, pageSize: 10, sortDescending: false };
    const mockResponse: ApiResponse<PaginatedDataResponse<ReportQuestion>> = {
      data: {
        totalRecords: 1,
        records: [
          {
            id: 1,
            questionId: 101,
            question: 'Sample?',
            creator: 'John',
            reporter: 'Jane',
            reason: 'Typo',
            severity: 1,
            status: 1,
            markAsReviewBy: null,
            createdDate: '2025-11-11',
          },
        ],
      },
      statusCode: 200,
      message: 'Success',
      result: true,
    };

    httpMock.post.mockReturnValue(of(mockResponse));

    service.getReportedQuestionList(mockRequest).subscribe((res) => {
      expect(res).toEqual(mockResponse);
      done();
    });

    expect(httpMock.post).toHaveBeenCalledWith(
      `${environment.baseUrl}/${EndPoints.ReportQuestionsList}`,
      mockRequest,
    );
    expect(httpMock.post).toHaveBeenCalledTimes(1);
  });

  it('should call updateAction and return success', (done) => {
    const payload = {
      ReportId: 5,
      QuestionOrQuizIssueReportNewStatus: QuestionOrQuizIssueReportStatus.Accepted,
    };

    const mockResponse: ApiResponse<null> = {
      result: true,
      statusCode: 200,
      message: 'Updated successfully',
      data: null,
    };

    httpMock.put.mockReturnValue(of(mockResponse));

    service.updateAction(payload).subscribe((res) => {
      expect(res.message).toBe('Updated successfully');
      done();
    });

    expect(httpMock.put).toHaveBeenCalledWith(
      `${environment.baseUrl}/${EndPoints.ReportQuestionAction}`,
      payload,
    );
  });

  it('should call getReportedQuestionPreviewById with correct ID', (done) => {
    const mockResponse: ApiResponse<QuestionDetailExtended> = {
      data: {
        questionDetail: { id: 1, questionText: 'Detailed question' } as any,
        activeQuizContainCount: 2,
        activeBattleContainCount: 1,
      },
      statusCode: 200,
      message: 'Fetched successfully',
      result: true,
    };

    httpMock.get.mockReturnValue(of(mockResponse));

    const questionId = 10;

    service.getReportedQuestionPreviewById(questionId).subscribe((res) => {
      expect(res.data?.questionDetail?.id).toBe(1);
      expect(res.message).toBe('Fetched successfully');
      done();
    });

    expect(httpMock.get).toHaveBeenCalledWith(
      `${environment.baseUrl}/${EndPoints.GetReportedQuestionPreview}/${questionId}`,
      expect.any(Object),
    );
  });

  it('should call ActiveQuizBattleAffectedDTO with correct question ID', (done) => {
    const queId = 42;
    const mockResponse: ApiResponse<ActiveQuizBattleAffectedDTO[]> = {
      data: [
        {
          id: 1,
          quizTitle: 'Quiz A',
          categoryName: 'Math',
          quizDifficultyLevel: 'Easy',
          totalQuestion: 10,
          type: 1,
        },
      ],
      statusCode: 200,
      message: 'OK',
      result: true,
    };

    httpMock.get.mockReturnValue(of(mockResponse));

    service.ActiveQuizBattleAffectedDTO(queId).subscribe((res) => {
      expect(res?.data[0].quizTitle).toBe('Quiz A');
      done();
    });
    expect(httpMock.get).toHaveBeenCalledWith(
      `${environment.baseUrl}/${EndPoints.GetListOfAffectedQuizAndBattle}/${queId}`,
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });

  it('should call UpdateReportedQuestion and return success', (done) => {
    const reportId = 10;
    const dto: QuestionRequest = { questionText: 'Updated Question?' } as QuestionRequest;

    const mockResponse: ApiResponse<string> = {
      result: true,
      statusCode: 200,
      message: 'Updated successfully',
      data: 'Updated successfully',
    };

    httpMock.post.mockReturnValue(of(mockResponse));

    service.UpdateReportedQuestion(reportId, dto).subscribe((res) => {
      expect(res.result).toBe(true);
      expect(res.message).toBe('Updated successfully');
      done();
    });

    expect(httpMock.post).toHaveBeenCalledWith(
      `${environment.baseUrl}/${EndPoints.UpdateReportedQuestion}/${reportId}`,
      dto,
    );
  });
});
