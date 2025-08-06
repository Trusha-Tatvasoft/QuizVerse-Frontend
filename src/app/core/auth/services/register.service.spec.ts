import { TestBed } from '@angular/core/testing';
import { RegisterService } from './register.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RegisterCredential } from '../interfaces/register.interface';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { environment } from '../../../../environments/environment.dev';

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
});
