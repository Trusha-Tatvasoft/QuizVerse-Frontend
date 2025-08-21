import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { QuizCategoryManagementService } from './quiz-category-management.service';
import { PaginationRequest } from '../../../shared/interfaces/pagination-request.interface';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { PaginatedDataResponse } from '../../../shared/interfaces/paginated-data-response.interface';
import {
  QuizCategoryList,
  SaveQuizCategory,
} from '../../../pages/admin/quiz-categories/interface/quiz-category-list-data.interface';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { skipLoader } from '../../../utils/constants';

describe('QuizCategoryManagementService', () => {
  let service: QuizCategoryManagementService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QuizCategoryManagementService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(QuizCategoryManagementService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch quiz category list', () => {
    const request: PaginationRequest = {
      pageNumber: 1,
      pageSize: 10,
      searchTerm: '',
      sortColumn: '',
      sortDescending: false,
      filters: {},
    };
    const mockResponse: ApiResponse<PaginatedDataResponse<QuizCategoryList>> = {
      result: true,
      statusCode: 200,
      message: 'Fetched',
      data: {
        totalRecords: 1,
        records: [
          {
            id: 1,
            categoryName: 'Science',
            description: 'desc',
            icon: null,
            isActive: true,
            createdDate: '2025-01-01',
            quizCount: 5,
          },
        ],
      },
    };

    service.getQuizCategoryList(request).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.QuizCategoryTableData}`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should handle error when fetching quiz category list', () => {
    const request: PaginationRequest = {
      pageNumber: 1,
      pageSize: 10,
      searchTerm: '',
      sortColumn: '',
      sortDescending: false,
      filters: {},
    };

    service.getQuizCategoryList(request).subscribe({
      error: (error) => {
        expect(error.status).toBe(500);
      },
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.QuizCategoryTableData}`);
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
  });

  it('should create or update quiz category', () => {
    const payload: SaveQuizCategory = {
      id: 0,
      categoryName: 'Math',
      description: 'desc',
      icon: null,
    };
    const mockResponse: ApiResponse<null> = {
      result: true,
      statusCode: 200,
      message: 'Saved',
      data: null,
    };

    service
      .createOrUpdateQuizCategory(payload)
      .subscribe((res) => expect(res).toEqual(mockResponse));

    const req = httpMock.expectOne(
      `${environment.baseUrl}/${EndPoints.CreateOrUpdateQuizCategory}`,
    );
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should handle error when creating/updating quiz category', () => {
    const payload: SaveQuizCategory = {
      id: 0,
      categoryName: 'Math',
      description: 'desc',
      icon: null,
    };

    service.createOrUpdateQuizCategory(payload).subscribe({
      error: (error) => {
        expect(error.status).toBe(400);
      },
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/${EndPoints.CreateOrUpdateQuizCategory}`,
    );
    req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
  });

  it('should get category by id', () => {
    const mockResponse: ApiResponse<QuizCategoryList> = {
      result: true,
      statusCode: 200,
      message: 'Fetched',
      data: {
        id: 1,
        categoryName: 'Science',
        description: 'desc',
        icon: null,
        isActive: true,
        createdDate: '2025-01-01',
        quizCount: 5,
      },
    };

    service.getCategoryById(1).subscribe((res) => expect(res).toEqual(mockResponse));

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.GetQuizCategoryById}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should handle error when getting category by id', () => {
    service.getCategoryById(99).subscribe({
      error: (error) => {
        expect(error.status).toBe(404);
      },
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.GetQuizCategoryById}/99`);
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });
  });

  it('should update quiz category by action', () => {
    const payload = { id: 1, action: 1, newStatus: 1 };
    const mockResponse: ApiResponse<null> = {
      result: true,
      statusCode: 200,
      message: 'Updated',
      data: null,
    };

    service
      .updateQuizCategoryByAction(payload)
      .subscribe((res) => expect(res).toEqual(mockResponse));

    const req = httpMock.expectOne(
      `${environment.baseUrl}/${EndPoints.UpdateQuizCategoryByAction}`,
    );
    expect(req.request.method).toBe('PUT');
    req.flush(mockResponse);
  });

  it('should handle error when updating quiz category by action', () => {
    const payload = { id: 1, action: 1, newStatus: 1 };

    service.updateQuizCategoryByAction(payload).subscribe({
      error: (error) => {
        expect(error.status).toBe(500);
      },
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/${EndPoints.UpdateQuizCategoryByAction}`,
    );
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
  });

  it('should check quiz category name availability without id', () => {
    const mockResponse: ApiResponse<boolean> = {
      result: true,
      statusCode: 200,
      message: 'OK',
      data: true,
    };

    service
      .checkQuizCategoryNameAvailable('Math')
      .subscribe((res) => expect(res).toEqual(mockResponse));

    const req = httpMock.expectOne(
      `${environment.baseUrl}/${EndPoints.CheckQuizCategoryNameAvailable}?categoryName=Math`,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get(skipLoader)).toBe('true');
    req.flush(mockResponse);
  });

  it('should check quiz category name availability with id', () => {
    const mockResponse: ApiResponse<boolean> = {
      result: true,
      statusCode: 200,
      message: 'OK',
      data: false,
    };

    service
      .checkQuizCategoryNameAvailable('Math', 5)
      .subscribe((res) => expect(res).toEqual(mockResponse));

    const req = httpMock.expectOne(
      `${environment.baseUrl}/${EndPoints.CheckQuizCategoryNameAvailable}?categoryName=Math&id=5`,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get(skipLoader)).toBe('true');
    req.flush(mockResponse);
  });

  it('should handle error when checking category name availability', () => {
    service.checkQuizCategoryNameAvailable('Math', 10).subscribe({
      error: (error) => {
        expect(error.status).toBe(500);
      },
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/${EndPoints.CheckQuizCategoryNameAvailable}?categoryName=Math&id=10`,
    );
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
  });
});
