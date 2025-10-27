import { TestBed } from '@angular/core/testing';
import { RegisterService } from './register.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RegisterCredential } from '../interfaces/register.interface';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { environment } from '../../../../environments/environment.dev';
import { skipLoader } from '../../../utils/constants';

describe('RegisterService', () => {
  let service: RegisterService;
  let httpMock: HttpTestingController;

  const mockCredentials: RegisterCredential = {
    fullName: 'Jane Doe',
    userName: 'jane_doe',
    email: 'jane@example.com',
    password: 'SecurePass123!',
    confirmPassword: 'SecurePass123!',
    bio: 'A test user',
  };

  const mockResponse: ApiResponse<null> = {
    result: true,
    statusCode: 201,
    message: 'User registered successfully',
    data: null,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RegisterService],
    });

    service = TestBed.inject(RegisterService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Make sure no pending requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send POST request to register user with correct payload and return expected response', () => {
    service.registerUser(mockCredentials).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.RegisterUser}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockCredentials);

    req.flush(mockResponse);
  });

  it('should call checkUserNameExists without id and return expected response', () => {
    const mockResponse: ApiResponse<boolean> = {
      result: true,
      statusCode: 200,
      message: 'Available',
      data: true,
    };

    service.checkUserNameExists('new_user').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/${EndPoints.UserNameAvailable}?userName=new_user`,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get(skipLoader)).toBe('true');
    expect(req.request.params.get('userName')).toBe('new_user');
    expect(req.request.params.has('id')).toBeFalsy();

    req.flush(mockResponse);
  });

  it('should call checkUserNameExists with id and return expected response', () => {
    const mockResponse: ApiResponse<boolean> = {
      result: true,
      statusCode: 200,
      message: 'Available',
      data: true,
    };

    service.checkUserNameExists('existing_user', 5).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/${EndPoints.UserNameAvailable}?userName=existing_user&id=5`,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get(skipLoader)).toBe('true');
    expect(req.request.params.get('userName')).toBe('existing_user');
    expect(req.request.params.get('id')).toBe('5');

    req.flush(mockResponse);
  });

  it('should call checkEmailExists and return expected response', () => {
    const mockResponse: ApiResponse<boolean> = {
      result: true,
      statusCode: 200,
      message: 'Available',
      data: true,
    };

    service.checkEmailExists('test@example.com').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/${EndPoints.EmailAvailable}?email=test@example.com`,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get(skipLoader)).toBe('true');
    expect(req.request.params.get('email')).toBe('test@example.com');

    req.flush(mockResponse);
  });
});
