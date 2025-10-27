import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { HttpHeaders } from '@angular/common/http';
import { EmailTemplateService } from './email-template.service';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { PaginatedDataResponse } from '../../../shared/interfaces/paginated-data-response.interface';
import { EmailTemplatesResponseDto } from '../../../pages/admin/email-template/configs/email-template.component.config';
import { PaginationRequest } from '../../../shared/interfaces/pagination-request.interface';
import { EmailTemplateAction } from '../../../shared/enums/email-template.enum';
import { EmailTemplatesRequest } from '../../../pages/admin/email-template/interfaces/email-template-request.interface';
import { skipLoader } from '../../../utils/constants';

describe('EmailTemplateService (Jest)', () => {
  let service: EmailTemplateService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EmailTemplateService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(EmailTemplateService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

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

  it('should fetch email template by ID (GET) with skipLoader header', () => {
    const templateId = 1;
    const mockResponse: ApiResponse<EmailTemplatesResponseDto> = {
      result: true,
      statusCode: 200,
      message: 'Fetched successfully',
      data: {
        id: 1,
        title: 'Welcome Email',
        subject: 'Welcome to our platform',
        templateType: 0,
        status: true,
        body: null,
      },
    };

    service.getEmailTemplateById(templateId).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/${EndPoints.GetEmailTemplateById}/${templateId}`,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get(skipLoader)).toBe('true');
    req.flush(mockResponse);
  });

  it('should update email template (PUT)', () => {
    const request = { id: 1, action: EmailTemplateAction.UpdateStatus };
    const mockResponse: ApiResponse<object> = {
      result: true,
      statusCode: 200,
      message: 'Updated successfully',
      data: { updated: true },
    };

    service.updateEmailTemplateByAction(request).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/${EndPoints.UpdateEmailTemplateByAction}`,
    );
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);
    req.flush(mockResponse);
  });

  it('should add or edit email template (POST)', () => {
    const request: EmailTemplatesRequest = {
      id: 1,
      title: 'Updated Welcome Email',
      templateType: 0,
      subject: 'Hello',
      body: '<p>Body</p>',
      status: true,
    };
    const mockResponse: ApiResponse<object> = {
      result: true,
      statusCode: 201,
      message: 'Created successfully',
      data: { saved: true },
    };

    service.addOrEditEmailTemplate(request).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.AddOrEditEmailTemplate}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(mockResponse);
  });

  it('should handle error response for getEmailTemplateById', () => {
    const templateId = 999;
    const mockErrorResponse = {
      result: false,
      statusCode: 404,
      message: 'Template not found',
      data: null,
    };

    service.getEmailTemplateById(templateId).subscribe({
      next: () => fail('should have failed with 404 error'),
      error: (error) => {
        expect(error.status).toBe(404);
        expect(error.error).toEqual(mockErrorResponse);
      },
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/${EndPoints.GetEmailTemplateById}/${templateId}`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockErrorResponse, { status: 404, statusText: 'Not Found' });
  });

  it('should handle error response for updateEmailTemplateByAction', () => {
    const request = { id: 999, action: EmailTemplateAction.Delete };
    const mockErrorResponse = {
      result: false,
      statusCode: 400,
      message: 'Invalid action',
      data: null,
    };

    service.updateEmailTemplateByAction(request).subscribe({
      next: () => fail('should have failed with 400 error'),
      error: (error) => {
        expect(error.status).toBe(400);
        expect(error.error).toEqual(mockErrorResponse);
      },
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/${EndPoints.UpdateEmailTemplateByAction}`,
    );
    expect(req.request.method).toBe('PUT');
    req.flush(mockErrorResponse, { status: 400, statusText: 'Bad Request' });
  });

  it('should handle error response for addOrEditEmailTemplate', () => {
    const request: EmailTemplatesRequest = {
      id: 999,
      title: 'Broken Email',
      templateType: 1,
      subject: 'Invalid',
      body: '<p>Error</p>',
      status: false,
    };

    const mockErrorResponse = {
      result: false,
      statusCode: 500,
      message: 'Internal server error',
      data: null,
    };

    service.addOrEditEmailTemplate(request).subscribe({
      next: () => fail('should have failed with 500 error'),
      error: (error) => {
        expect(error.status).toBe(500);
        expect(error.error).toEqual(mockErrorResponse);
      },
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.AddOrEditEmailTemplate}`);
    expect(req.request.method).toBe('POST');
    req.flush(mockErrorResponse, { status: 500, statusText: 'Internal Server Error' });
  });
});
