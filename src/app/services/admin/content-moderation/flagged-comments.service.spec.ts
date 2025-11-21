import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FlaggedCommentsService } from './flagged-comments.service';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { skipLoader } from '../../../utils/constants';
import { PaginationRequest } from '../../../shared/interfaces/pagination-request.interface';
import {
  FlaggedComments,
  FlaggedCommentView,
  UpdateFlaggedCommentStatusRequest,
} from '../../../pages/admin/content-moderation/interfaces/flagged-comments.interface';

describe('FlaggedCommentsService', () => {
  let service: FlaggedCommentsService;
  let httpMock: HttpTestingController;

  const mockPaginationRequest: PaginationRequest = {
    pageNumber: 1,
    pageSize: 10,
    searchTerm: '',
    sortColumn: 'date',
    sortDescending: false,
    filters: {},
  };

  const mockFlaggedComments: FlaggedComments[] = [
    {
      id: 1,
      comment: 'Test comment 1',
      author: 'User 1',
      quizName: 'Quiz 1',
      reason: 'Spam',
      date: new Date('2023-01-01'),
      status: 1,
      modifiedBy: 123,
    },
    {
      id: 2,
      comment: 'Test comment 2',
      author: 'User 2',
      quizName: 'Quiz 2',
      reason: 'Inappropriate',
      date: new Date('2023-01-02'),
      status: 2,
      modifiedBy: 124,
    },
  ];

  const mockFlaggedCommentView: FlaggedCommentView = {
    id: 1,
    comment: 'Test comment',
    author: 'Test User',
    quizName: 'Test Quiz',
    reason: 'Spam',
    date: new Date('2023-01-01'),
    status: 1,
    modifiedBy: 123,
    quizCategory: 'Education',
    userId: 456,
  };

  const mockUpdateRequest: UpdateFlaggedCommentStatusRequest = {
    id: 1,
    status: 2,
  };

  const mockApiResponse = {
    result: true,
    statusCode: 200,
    message: 'Success',
    data: {
      records: mockFlaggedComments,
      totalRecords: 2,
    },
  };

  const mockUpdateResponse = {
    result: true,
    statusCode: 200,
    message: 'Updated successfully',
    data: null,
  };

  const mockPreviewResponse = {
    result: true,
    statusCode: 200,
    message: 'Success',
    data: mockFlaggedCommentView,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FlaggedCommentsService],
    });

    service = TestBed.inject(FlaggedCommentsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have flaggedCommentUpdated$ BehaviorSubject', () => {
      expect(service.flaggedCommentUpdated$).toBeTruthy();
      expect(service.flaggedCommentUpdated$.value).toBe(false);
    });
  });

  describe('getFlaggedCommentsList', () => {
    it('should fetch flagged comments list with POST request', () => {
      service.getFlaggedCommentsList(mockPaginationRequest).subscribe((response) => {
        expect(response).toEqual(mockApiResponse);
        expect(response.data.records.length).toBe(2);
        expect(response.data.records[0].id).toBe(1);
        expect(response.data.records[1].id).toBe(2);
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.FlaggedContentList}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockPaginationRequest);

      req.flush(mockApiResponse);
    });

    it('should handle empty response', () => {
      const emptyResponse = {
        result: true,
        statusCode: 200,
        message: 'No data',
        data: {
          records: [],
          totalRecords: 0,
        },
      };

      service.getFlaggedCommentsList(mockPaginationRequest).subscribe((response) => {
        expect(response.data.records).toEqual([]);
        expect(response.data.totalRecords).toBe(0);
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.FlaggedContentList}`);
      req.flush(emptyResponse);
    });

    it('should handle error response', () => {
      const errorResponse = {
        result: false,
        statusCode: 500,
        message: 'Internal server error',
        data: null,
      };

      service.getFlaggedCommentsList(mockPaginationRequest).subscribe((response) => {
        expect(response.result).toBe(false);
        expect(response.statusCode).toBe(500);
        expect(response.message).toBe('Internal server error');
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.FlaggedContentList}`);
      req.flush(errorResponse);
    });

    it('should use the correct endpoint', () => {
      service.getFlaggedCommentsList(mockPaginationRequest).subscribe();

      const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.FlaggedContentList}`);
      expect(req.request.url).toBe(`${environment.baseUrl}/${EndPoints.FlaggedContentList}`);
    });
  });

  describe('updateAction', () => {
    it('should update flagged comment status with PUT request', () => {
      service.updateAction(mockUpdateRequest).subscribe((response) => {
        expect(response).toEqual(mockUpdateResponse);
        expect(response.statusCode).toBe(200);
        expect(response.message).toBe('Updated successfully');
      });

      const req = httpMock.expectOne(
        `${environment.baseUrl}/${EndPoints.ManageFlaggedCommentStatus}`,
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockUpdateRequest);

      req.flush(mockUpdateResponse);
    });

    it('should handle update failure', () => {
      const errorResponse = {
        result: false,
        statusCode: 400,
        message: 'Bad request',
        data: null,
      };

      service.updateAction(mockUpdateRequest).subscribe((response) => {
        expect(response.result).toBe(false);
        expect(response.statusCode).toBe(400);
      });

      const req = httpMock.expectOne(
        `${environment.baseUrl}/${EndPoints.ManageFlaggedCommentStatus}`,
      );
      req.flush(errorResponse);
    });

    it('should use the correct endpoint for update', () => {
      service.updateAction(mockUpdateRequest).subscribe();

      const req = httpMock.expectOne(
        `${environment.baseUrl}/${EndPoints.ManageFlaggedCommentStatus}`,
      );
      expect(req.request.url).toBe(
        `${environment.baseUrl}/${EndPoints.ManageFlaggedCommentStatus}`,
      );
    });
  });

  describe('getFlaggedCommentsPreviewById', () => {
    it('should fetch flagged comment preview by ID with GET request', () => {
      const commentId = 1;

      service.getFlaggedCommentsPreviewById(commentId).subscribe((response) => {
        expect(response).toEqual(mockPreviewResponse);
        expect(response.data.id).toBe(1);
        expect(response.data.quizCategory).toBe('Education');
        expect(response.data.userId).toBe(456);
      });

      const req = httpMock.expectOne(
        `${environment.baseUrl}/${EndPoints.FlaggedCommentsById}/${commentId}`,
      );
      expect(req.request.method).toBe('GET');

      // Check skipLoader header
      expect(req.request.headers.get(skipLoader)).toBe('true');

      req.flush(mockPreviewResponse);
    });

    it('should include skipLoader header in the request', () => {
      const commentId = 1;

      service.getFlaggedCommentsPreviewById(commentId).subscribe();

      const req = httpMock.expectOne(
        `${environment.baseUrl}/${EndPoints.FlaggedCommentsById}/${commentId}`,
      );

      const headers = req.request.headers;
      expect(headers.get(skipLoader)).toBe('true');
      expect(headers.has(skipLoader)).toBe(true);
    });

    it('should handle different comment IDs', () => {
      const commentId = 999;

      service.getFlaggedCommentsPreviewById(commentId).subscribe();

      const req = httpMock.expectOne(
        `${environment.baseUrl}/${EndPoints.FlaggedCommentsById}/${commentId}`,
      );
      expect(req.request.url).toBe(
        `${environment.baseUrl}/${EndPoints.FlaggedCommentsById}/${commentId}`,
      );

      req.flush(mockPreviewResponse);
    });

    it('should handle preview not found', () => {
      const commentId = 999;
      const notFoundResponse = {
        result: false,
        statusCode: 404,
        message: 'Comment not found',
        data: null,
      };

      service.getFlaggedCommentsPreviewById(commentId).subscribe((response) => {
        expect(response.result).toBe(false);
        expect(response.statusCode).toBe(404);
      });

      const req = httpMock.expectOne(
        `${environment.baseUrl}/${EndPoints.FlaggedCommentsById}/${commentId}`,
      );
      req.flush(notFoundResponse);
    });
  });

  describe('notifyFlaggedCommentUpdated', () => {
    it('should update flaggedCommentUpdated$ BehaviorSubject to true', () => {
      // Initial value should be false
      expect(service.flaggedCommentUpdated$.value).toBe(false);

      service.notifyFlaggedCommentUpdated();

      // Value should be updated to true
      expect(service.flaggedCommentUpdated$.value).toBe(true);
    });

    it('should emit new value to subscribers', () => {
      const emittedValues: boolean[] = [];

      service.flaggedCommentUpdated$.subscribe((value) => {
        emittedValues.push(value);
      });

      // Initial emission
      expect(emittedValues).toEqual([false]);

      service.notifyFlaggedCommentUpdated();

      // Should emit true
      expect(emittedValues).toEqual([false, true]);

      service.notifyFlaggedCommentUpdated();

      // Should emit true again
      expect(emittedValues).toEqual([false, true, true]);
    });
  });

  describe('HTTP Error Handling', () => {
    it('should handle HTTP errors for getFlaggedCommentsList', () => {
      const errorMessage = 'Http failure response for test: 500 Internal Server Error';

      service.getFlaggedCommentsList(mockPaginationRequest).subscribe({
        next: () => fail('should have failed with the network error'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Internal Server Error');
        },
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.FlaggedContentList}`);
      req.flush(errorMessage, { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle HTTP errors for updateAction', () => {
      service.updateAction(mockUpdateRequest).subscribe({
        next: () => fail('should have failed with the network error'),
        error: (error) => {
          expect(error.status).toBe(400);
        },
      });

      const req = httpMock.expectOne(
        `${environment.baseUrl}/${EndPoints.ManageFlaggedCommentStatus}`,
      );
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
    });

    it('should handle HTTP errors for getFlaggedCommentsPreviewById', () => {
      const commentId = 1;

      service.getFlaggedCommentsPreviewById(commentId).subscribe({
        next: () => fail('should have failed with the network error'),
        error: (error) => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(
        `${environment.baseUrl}/${EndPoints.FlaggedCommentsById}/${commentId}`,
      );
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('Endpoint Construction', () => {
    it('should construct correct URLs with baseUrl from environment', () => {
      service.getFlaggedCommentsList(mockPaginationRequest).subscribe();

      const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.FlaggedContentList}`);
      expect(req.request.url).toContain(environment.baseUrl);
      expect(req.request.url).toContain(EndPoints.FlaggedContentList);

      req.flush(mockApiResponse);
    });

    it('should use correct HTTP methods for each endpoint', () => {
      // Test POST for getFlaggedCommentsList
      service.getFlaggedCommentsList(mockPaginationRequest).subscribe();
      const postReq = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.FlaggedContentList}`);
      expect(postReq.request.method).toBe('POST');
      postReq.flush(mockApiResponse);

      // Test PUT for updateAction
      service.updateAction(mockUpdateRequest).subscribe();
      const putReq = httpMock.expectOne(
        `${environment.baseUrl}/${EndPoints.ManageFlaggedCommentStatus}`,
      );
      expect(putReq.request.method).toBe('PUT');
      putReq.flush(mockUpdateResponse);

      // Test GET for getFlaggedCommentsPreviewById
      service.getFlaggedCommentsPreviewById(1).subscribe();
      const getReq = httpMock.expectOne(
        `${environment.baseUrl}/${EndPoints.FlaggedCommentsById}/1`,
      );
      expect(getReq.request.method).toBe('GET');
      getReq.flush(mockPreviewResponse);
    });
  });
});
