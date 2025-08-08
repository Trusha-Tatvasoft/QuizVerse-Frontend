import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { UserManagementService } from './user-management.service';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { PaginationRequest } from '../../../shared/interfaces/pagination-request.interface';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { UserListData } from '../../../pages/admin/user-management/interfaces/user-list-data.interface';
import { PaginatedDataResponse } from '../../../shared/interfaces/paginated-data-response.interface';
import { provideHttpClient } from '@angular/common/http';
import { UserFormData } from '../../../pages/admin/user-management/interfaces/user-form-data.interface';
import { UserAction, UserStatus } from '../../../shared/enums/user-management.enum';

describe('UserManagementService', () => {
  let service: UserManagementService;
  let httpMock: HttpTestingController;

  const mockRequest: PaginationRequest = {
    pageNumber: 1,
    pageSize: 10,
    searchTerm: 'test',
    sortColumn: 'fullname',
    sortDescending: false,
    filters: {
      status: 1,
      roleId: 2,
    },
  };

  const mockResponseData: PaginatedDataResponse<UserListData> = {
    totalRecords: 2,
    records: [
      {
        id: 1,
        fullName: 'John Doe',
        email: 'john@example.com',
        userName: 'johndoe',
        roleId: 2,
        status: 1,
        createdDate: '2023-01-01T00:00:00Z',
        lastLogin: '2023-01-05T00:00:00Z',
        bio: 'Test bio',
        profilePic: 'profile.jpg',
        attemptedQuizzes: 5,
      },
      {
        id: 2,
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        userName: 'janesmith',
        roleId: 1,
        status: 1,
        createdDate: '2023-01-02T00:00:00Z',
        lastLogin: '2023-01-06T00:00:00Z',
        attemptedQuizzes: 3,
      },
    ],
  };

  const mockUser: UserFormData = {
    id: 1,
    fullName: 'John Doe',
    email: 'john@example.com',
    userName: 'johndoe',
    bio: 'Software Developer',
    password: '',
    profilePic: '',
  };

  const userFetchedMockResponse: ApiResponse<UserFormData> = {
    result: true,
    statusCode: 200,
    message: 'User fetched successfully',
    data: mockUser,
  };

  const userCreateUpdateMockResponse: ApiResponse<null> = {
    result: true,
    statusCode: 200,
    message: 'User created/updated successfully',
    data: null,
  };

  const mockApiResponse: ApiResponse<PaginatedDataResponse<UserListData>> = {
    result: true,
    statusCode: 200,
    message: 'Success',
    data: mockResponseData,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserManagementService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(UserManagementService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    // Verifies service instantiation
    expect(service).toBeTruthy();
  });

  it('should fetch user list with pagination and filters', () => {
    // Verifies successful API call with expected response data
    service.getUsers(mockRequest).subscribe((res) => {
      expect(res).toEqual(mockResponseData);
      expect(res.data.totalRecords).toBe(2);
      expect(res.data.records[0].email).toBe('john@example.com');
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.UserTableData}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockRequest);

    req.flush(mockApiResponse);
  });

  it('should handle empty user list', () => {
    // Verifies API response handling for an empty list
    const emptyResponse = {
      result: true,
      statusCode: 200,
      message: 'No users found',
      data: {
        totalRecords: 0,
        records: [],
      },
    };

    service.getUsers(mockRequest).subscribe((res) => {
      expect(res.data.totalRecords).toBe(0);
      expect(res.data.records.length).toBe(0);
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.UserTableData}`);
    expect(req.request.method).toBe('POST');
    req.flush(emptyResponse);
  });

  it('should throw error for 401 Unauthorized', () => {
    // Simulates and verifies 401 Unauthorized error handling
    const errorMessage = 'Unauthorized';

    service.getUsers(mockRequest).subscribe({
      next: () => fail('Expected an error, but got success'),
      error: (error) => {
        expect(error.status).toBe(401);
        expect(error.statusText).toBe('Unauthorized');
      },
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.UserTableData}`);
    expect(req.request.method).toBe('POST');
    req.flush({ message: errorMessage }, { status: 401, statusText: 'Unauthorized' });
  });

  it('should throw error for 400 Bad Request', () => {
    // Simulates and verifies 400 Bad Request error handling
    service.getUsers(mockRequest).subscribe({
      next: () => fail('Expected an error'),
      error: (error) => {
        expect(error.status).toBe(400);
        expect(error.statusText).toBe('Bad Request');
      },
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.UserTableData}`);
    req.flush({ message: 'Bad request' }, { status: 400, statusText: 'Bad Request' });
  });

  it('should throw error for 403 Forbidden', () => {
    // Simulates and verifies 403 Forbidden error handling
    service.getUsers(mockRequest).subscribe({
      next: () => fail('Expected an error'),
      error: (error) => {
        expect(error.status).toBe(403);
        expect(error.statusText).toBe('Forbidden');
      },
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.UserTableData}`);
    req.flush({ message: 'Access denied' }, { status: 403, statusText: 'Forbidden' });
  });

  it('should throw error for 500 Internal Server Error', () => {
    // Simulates and verifies 500 Internal Server Error handling
    service.getUsers(mockRequest).subscribe({
      next: () => fail('Expected an error'),
      error: (error) => {
        expect(error.status).toBe(500);
        expect(error.statusText).toBe('Internal Server Error');
      },
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.UserTableData}`);
    req.flush({ message: 'Internal error' }, { status: 500, statusText: 'Internal Server Error' });
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

  it('should fetch user data by ID', () => {
    const userId = 1;

    service.getUserById(userId).subscribe((response) => {
      expect(response).toEqual(userFetchedMockResponse);
      expect(response.data.id).toBe(userId);
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.GetUserById}/${userId}`);
    expect(req.request.method).toBe('GET');
    req.flush(userFetchedMockResponse);
  });

  it('should handle error if request fails', () => {
    const userId = 1;
    const errorMsg = '404 Not Found';

    service.getUserById(userId).subscribe({
      next: () => fail('Expected error, but got success response'),
      error: (error) => {
        expect(error.status).toBe(404);
        expect(error.statusText).toBe('Not Found');
      },
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.GetUserById}/${userId}`);
    expect(req.request.method).toBe('GET');
    req.flush(errorMsg, { status: 404, statusText: 'Not Found' });
  });

  it('should successfully create or update a user', () => {
    const formData = new FormData();
    formData.append('fullName', 'Jane Doe');
    formData.append('email', 'jane@example.com');
    formData.append('username', 'janedoe');
    formData.append('bio', 'Frontend Developer');

    service.createOrUpdateUser(formData).subscribe((response) => {
      expect(response).toEqual(userCreateUpdateMockResponse);
      expect(response.result).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.message).toBe('User created/updated successfully');
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.CreateOrUpdateUser}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    req.flush(userCreateUpdateMockResponse);
  });

  it('should handle HTTP error response', () => {
    const formData = new FormData();
    formData.append('username', 'invalid_user');

    service.createOrUpdateUser(formData).subscribe({
      next: () => fail('Expected an error, but got success'),
      error: (error) => {
        expect(error.status).toBe(400);
        expect(error.statusText).toBe('Bad Request');
      },
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.CreateOrUpdateUser}`);
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'Invalid data' }, { status: 400, statusText: 'Bad Request' });
  });

  it('should call PUT API and return expected ApiResponse when updating user status', () => {
    const payload = {
      id: 123,
      action: UserAction.UpdateStatus,
      newStatus: UserStatus.Active,
    };

    const mockResponse: ApiResponse<null> = {
      result: true,
      statusCode: 200,
      message: 'User status updated successfully',
      data: null,
    };

    service.updateUserStatusByAction(payload).subscribe((response) => {
      expect(response).toEqual(mockResponse);
      expect(response.result).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.message).toBe('User status updated successfully');
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.UpdateUserStatusByAction}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush(mockResponse);
  });

  it('should call PUT API and handle deletion action correctly', () => {
    const payload = {
      id: 456,
      action: UserAction.Delete,
    };

    const mockResponse: ApiResponse<null> = {
      result: true,
      statusCode: 200,
      message: 'User deleted successfully',
      data: null,
    };

    service.updateUserStatusByAction(payload).subscribe((response) => {
      expect(response).toEqual(mockResponse);
      expect(response.result).toBe(true);
      expect(response.statusCode).toBe(200);
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.UpdateUserStatusByAction}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush(mockResponse);
  });
});
