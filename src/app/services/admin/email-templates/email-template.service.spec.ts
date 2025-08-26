import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EmailTemplateService } from './email-template.service';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { PaginatedDataResponse } from '../../../shared/interfaces/paginated-data-response.interface';
import { EmailTemplatesResponseDto } from '../../../pages/admin/email-template/configs/email-template.component.config';
import { PaginationRequest } from '../../../shared/interfaces/pagination-request.interface';

describe('EmailTemplateService (Jest)', () => {
  let service: EmailTemplateService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EmailTemplateService],
    });

    service = TestBed.inject(EmailTemplateService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all email templates (POST)', () => {
    const request: PaginationRequest = {
      pageNumber: 1,
      pageSize: 10,
      sortColumn: 'id',
      sortDescending: false,
    };

    const mockResponse: ApiResponse<PaginatedDataResponse<EmailTemplatesResponseDto>> = {
      result: true,
      statusCode: 200,
      message: 'Fetched successfully',
      data: {
        totalRecords: 2,
        records: [
          {
            id: 1,
            title: 'Welcome Email',
            subject: 'Welcome to our platform',
            templateType: 0,
            status: true,
            body: null,
          },
          {
            id: 2,
            title: 'Reminder Email',
            subject: 'Don’t forget to complete your profile',
            templateType: 1,
            status: false,
            body: null,
          },
        ],
      },
    };

    service.getAllEmailTemplates(request).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.EmailTemplateList}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(mockResponse);
  });
});
