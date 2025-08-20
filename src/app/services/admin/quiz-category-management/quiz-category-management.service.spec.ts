import { TestBed } from '@angular/core/testing';
import { provideHttpClient, HttpClient } from '@angular/common/http';
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
import { HttpHeaders } from '@angular/common/http';
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
});
