import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserExportService } from './user-export.service';
import { PaginationRequest } from '../../shared/interfaces/pagination-request.interface';
import { environment } from '../../../environments/environment.dev';
import { EndPoints } from '../../shared/enums/end-point.enum';

describe('UserExportService', () => {
  let service: UserExportService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserExportService],
    });

    service = TestBed.inject(UserExportService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should send a POST request and return a Blob', () => {
    const requestData: PaginationRequest = {
      pageNumber: 1,
      pageSize: 10,
      searchTerm: 'test',
      sortColumn: 'email',
      sortDescending: true,
      filters: {
        status: 1,
        role: 1,
      },
    };

    const mockBlob = new Blob(['mock data'], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    service.exportUsersToExcel(requestData).subscribe((response: Blob) => {
      expect(response).toEqual(mockBlob);
      expect(response instanceof Blob).toBe(true);
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.UserExport}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(requestData);
    expect(req.request.responseType).toBe('blob');

    req.flush(mockBlob);
  });

  it('should handle error when export fails and return appropriate message', () => {
    const requestData: PaginationRequest = {
      pageNumber: 1,
      pageSize: 10,
      searchTerm: '',
      sortColumn: 'email',
      sortDescending: true,
      filters: { status: 1, role: 1 },
    };

    const mockErrorResponse = {
      result: false,
      statusCode: 500,
      message: 'Export failed',
      data: null,
    };

    service.exportUsersToExcel(requestData).subscribe({
      next: () => fail('Expected error, but got success'),
      error: (error) => {
        expect(error.status).toBe(500);

        // Read blob as JSON text to validate it
        const reader = new FileReader();
        reader.onload = () => {
          const parsed = JSON.parse(reader.result as string);
          expect(parsed.message).toBe('Export failed');
        };
        reader.readAsText(error.error);
      },
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.UserExport}`);
    expect(req.request.method).toBe('POST');

    const blobError = new Blob([JSON.stringify(mockErrorResponse)], {
      type: 'application/json',
    });

    req.flush(blobError, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  });
});
