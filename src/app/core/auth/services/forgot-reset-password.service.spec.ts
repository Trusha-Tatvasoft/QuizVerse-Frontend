import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ForgotResetPasswordService } from './forgot-reset-password.service';
import { ForgotCredential, ResetCredential } from '../interfaces/forgot-reset-password.interface';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { environment } from '../../../../environments/environment.dev';

describe('ForgotResetPasswordService', () => {
  let service: ForgotResetPasswordService;
  let httpMock: HttpTestingController;

  const baseUrl = `${environment.baseUrl}`;

  const forgotPayload: ForgotCredential = {
    email: 'user@example.com',
  };

  const resetPayload: ResetCredential = {
    password: 'NewPass123!',
    resetPasswordToken: 'abc123token',
  };

  const mockNullResponse: ApiResponse<null> = {
    result: true,
    statusCode: 200,
    message: 'Success',
    data: null,
  };

  const mockBooleanResponse: ApiResponse<boolean> = {
    result: true,
    statusCode: 200,
    message: 'Valid token',
    data: true,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ForgotResetPasswordService],
    });
    service = TestBed.inject(ForgotResetPasswordService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send reset link via POST', () => {
    service.sendResetLink(forgotPayload).subscribe((response) => {
      expect(response).toEqual(mockNullResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/${EndPoints.ForgotPassword}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(forgotPayload);

    req.flush(mockNullResponse);
  });

  it('should reset password via POST', () => {
    service.resetPassword(resetPayload).subscribe((response) => {
      expect(response).toEqual(mockNullResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/${EndPoints.ResetPassword}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(resetPayload);

    req.flush(mockNullResponse);
  });

  it('should verify reset token via POST', () => {
    const token = 'verifyToken123';
    service.verifyResetToken(token).subscribe((response) => {
      expect(response).toEqual(mockBooleanResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/${EndPoints.VerifyTokenRestPassword}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ resetPasswordToken: token });

    req.flush(mockBooleanResponse);
  });
});
