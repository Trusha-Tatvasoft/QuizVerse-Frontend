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
});
