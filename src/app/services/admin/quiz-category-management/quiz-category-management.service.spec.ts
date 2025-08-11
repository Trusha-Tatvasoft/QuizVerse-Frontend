import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { QuizCategoryManagementService } from './quiz-category-management.service';
import { PaginationRequest } from '../../../shared/interfaces/pagination-request.interface';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { PaginatedDataResponse } from '../../../shared/interfaces/paginated-data-response.interface';
import { QuizCategoryList } from '../../../pages/admin/quiz-categories/interface/quiz-category-list-data.interface';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';

describe('QuizCategoryManagementService', () => {
  let service: QuizCategoryManagementService;
  let httpMock: HttpTestingController;

  const endpointUrl = `${environment.baseUrl}/${EndPoints.QuizCategoryTableData}`;

  const mockRequest: PaginationRequest = {
    pageNumber: 1,
    pageSize: 10,
    searchTerm: '',
    sortColumn: 'categoryName',
    sortDescending: false,
    filters: {},
  };

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

  it('should fetch list with pagination', () => {
    const mockResponse: ApiResponse<PaginatedDataResponse<QuizCategoryList>> = {
      result: true,
      message: 'Fetched successfully',
      statusCode: 200,
      data: {
        totalRecords: 1,
        records: [
          {
            id: 1,
            categoryName: 'Science',
            description: 'Science quizzes',
            icon: null,
            isActive: true,
            createdDate: '2025-01-01T00:00:00Z',
            quizCount: 5,
          },
        ],
      },
    };

    service.getQuizCategoryList(mockRequest).subscribe((response) => {
      expect(response).toEqual(mockResponse);
      expect(response.data.totalRecords).toBe(1);
      expect(response.data.records[0].categoryName).toBe('Science');
    });

    const req = httpMock.expectOne(endpointUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockRequest);
    req.flush(mockResponse);
  });

  it('should handle empty response list', () => {
    const emptyResponse: ApiResponse<PaginatedDataResponse<QuizCategoryList>> = {
      result: true,
      message: 'Fetched successfully',
      statusCode: 200,
      data: {
        totalRecords: 0,
        records: [],
      },
    };

    service.getQuizCategoryList(mockRequest).subscribe((response) => {
      expect(response.data.records.length).toBe(0);
      expect(response.data.totalRecords).toBe(0);
    });

    const req = httpMock.expectOne(endpointUrl);
    expect(req.request.method).toBe('POST');
    req.flush(emptyResponse);
  });
});
