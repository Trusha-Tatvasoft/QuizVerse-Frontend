import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { environment } from '../../../../environments/environment.dev';
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  ROLE_CLAIM_KEY,
  PlatformMessages,
} from '../../../utils/constants';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { provideHttpClient } from '@angular/common/http';

describe('AuthService (Jest)', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const cookieServiceMock = {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  };

  const routerMock = {
    navigate: jest.fn(),
  };

  const snackbarMock = {
    showError: jest.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CookieService, useValue: cookieServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: SnackbarService, useValue: snackbarMock },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    jest.clearAllMocks();
  });

  afterEach(() => {
    httpMock.verify();
  });

  function createToken(role: string, expiresInSeconds = 3600): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
        [ROLE_CLAIM_KEY]: role,
      }),
    );
    return `${header}.${payload}.signature`;
  }

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save tokens and set currentRole$', () => {
    const token = createToken('admin');
    jest.spyOn(service as any, 'getRoleFromToken').mockReturnValue('admin');

    service.saveTokens(token, 'refresh123', true);

    expect(cookieServiceMock.set).toHaveBeenCalledWith(ACCESS_TOKEN_KEY, token, expect.any(Object));
    expect(cookieServiceMock.set).toHaveBeenCalledWith(
      REFRESH_TOKEN_KEY,
      'refresh123',
      expect.any(Object),
    );
    expect(service.currentRole$.value).toBe('admin');
  });

  it('should set access token and update role', () => {
    const token = createToken('admin');
    jest.spyOn(service as any, 'getRoleFromToken').mockReturnValue('admin');

    service.setAccessToken(token);

    expect(cookieServiceMock.set).toHaveBeenCalledWith(ACCESS_TOKEN_KEY, token, expect.any(Object));
    expect(service.currentRole$.value).toBe('admin');
  });

  it('should get access and refresh tokens from cookies', () => {
    cookieServiceMock.get.mockImplementation((key: string) =>
      key === ACCESS_TOKEN_KEY ? 'access' : key === REFRESH_TOKEN_KEY ? 'refresh' : '',
    );

    expect(service.getAccessToken()).toBe('access');
    expect(service.getRefreshToken()).toBe('refresh');
  });

  it('should get role from valid token', () => {
    const token = createToken('admin');
    expect(service.getRoleFromToken(token)).toBe('admin');
  });

  it('should navigate on invalid token', () => {
    service.getRoleFromToken('invalid.token');
    expect(routerMock.navigate).toHaveBeenCalledWith([PlatformMessages.loginRedirectMessage]);
  });

  it('should return true for matching role', () => {
    const token = createToken('player');
    cookieServiceMock.get.mockReturnValue(token);
    expect(service.hasRole('player')).toBe(true);
  });

  it('should return false if role does not match', () => {
    const token = createToken('admin');
    cookieServiceMock.get.mockReturnValue(token);
    expect(service.hasRole('user')).toBe(false);
  });

  it('should return false if no token', () => {
    cookieServiceMock.get.mockReturnValue('');
    expect(service.hasRole('admin')).toBe(false);
  });

  it('should return true if token is expired', () => {
    const token = createToken('admin', -10);
    expect(service.isTokenExpired(token)).toBe(true);
  });

  it('should return false if token is valid', () => {
    const token = createToken('admin', 3600);
    expect(service.isTokenExpired(token)).toBe(false);
  });

  it('should return EMPTY and show error if no refresh token', () => {
    cookieServiceMock.get.mockReturnValue('');
    service.refreshAccessToken().subscribe((result) => {
      expect(result).toBeFalsy();
    });

    expect(snackbarMock.showError).toHaveBeenCalledWith(
      PlatformMessages.sessionExpiredTitle,
      PlatformMessages.noRefreshTokenMessage,
    );
  });

  it('should handle token refresh success', () => {
    const token = createToken('admin');
    cookieServiceMock.get.mockReturnValue('refresh-token');

    service.refreshAccessToken().subscribe((res) => {
      expect(res).toBe(token);
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.RefreshToken}`);
    req.flush({
      result: true,
      statusCode: 200,
      data: { accessToken: token, refreshToken: 'new-refresh' },
    });
  });

  it('should handle token refresh failure', () => {
    cookieServiceMock.get.mockReturnValue('refresh-token');

    service.refreshAccessToken().subscribe((res) => {
      expect(res).toBe('');
      expect(snackbarMock.showError).toHaveBeenCalledWith(
        PlatformMessages.sessionExpiredTitle,
        expect.any(String),
      );
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.RefreshToken}`);
    req.flush({ message: 'failed' }, { status: 400, statusText: 'Bad Request' });
  });

  it('should call login and save tokens', () => {
    const token = createToken('admin');
    const credentials = { email: 'a', password: 'b', rememberMe: false };

    service.login(credentials).subscribe();

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.Login}`);
    req.flush({
      result: true,
      statusCode: 200,
      data: { accessToken: token, refreshToken: 'ref123' },
    });

    expect(cookieServiceMock.set).toHaveBeenCalled();
  });

  it('should delete tokens on logout', () => {
    service.logout();
    expect(cookieServiceMock.delete).toHaveBeenCalledWith(ACCESS_TOKEN_KEY, '/');
    expect(cookieServiceMock.delete).toHaveBeenCalledWith(REFRESH_TOKEN_KEY, '/');
    expect(service.currentRole$.value).toBeNull();
  });

  it('should verify reset password token', () => {
    service.verifyResetPasswordToken('token123').subscribe((result) => {
      expect(result).toBe(true);
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.VerifyResetPasswordToken}`);
    req.flush({ result: true, data: true, message: '', statusCode: 200 });
  });

  it('should return true when access token exists', () => {
    cookieServiceMock.get.mockReturnValue('token123');
    expect(service.isLoggedIn()).toBe(true);
  });

  it('should return false when access token does not exist', () => {
    cookieServiceMock.get.mockReturnValue('');
    expect(service.isLoggedIn()).toBe(false);
  });

  it('should return null if token has no role', () => {
    const token = createToken('', 3600);
    const parts = token.split('.');
    const payload = JSON.parse(atob(parts[1]));
    delete payload[ROLE_CLAIM_KEY]; // remove role
    const newToken = `${parts[0]}.${btoa(JSON.stringify(payload))}.signature`;
    expect(service.getRoleFromToken(newToken)).toBeNull();
  });

  it('should return EMPTY if refresh response.result is false', () => {
    cookieServiceMock.get.mockReturnValue('refresh-token');
    service.refreshAccessToken().subscribe((res) => {
      expect(res).toBeFalsy(); // Will trigger EMPTY
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.RefreshToken}`);
    req.flush({ result: false, statusCode: 200, data: {} });
    expect(snackbarMock.showError).toHaveBeenCalled();
  });

  it('should return EMPTY if refresh response has missing accessToken', () => {
    cookieServiceMock.get.mockReturnValue('refresh-token');
    service.refreshAccessToken().subscribe((res) => {
      expect(res).toBeFalsy();
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.RefreshToken}`);
    req.flush({ result: true, statusCode: 200, data: { refreshToken: 'some-refresh' } });
    expect(snackbarMock.showError).toHaveBeenCalled();
  });

  it('should fall back to old refresh token if new refresh token is missing', () => {
    const token = createToken('admin');
    const oldRefresh = 'refresh-token';
    cookieServiceMock.get.mockReturnValue(oldRefresh);

    service.refreshAccessToken().subscribe((res) => {
      expect(res).toBe(token);
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.RefreshToken}`);
    req.flush({
      result: true,
      statusCode: 200,
      data: { accessToken: token },
    });

    expect(cookieServiceMock.set).toHaveBeenCalledWith(
      REFRESH_TOKEN_KEY,
      oldRefresh,
      expect.any(Object),
    );
  });

  it('should show fallback error when refresh fails and only error.message exists', () => {
    cookieServiceMock.get.mockReturnValue('refresh-token');

    service.refreshAccessToken().subscribe((res) => {
      expect(res).toBe('');
      expect(snackbarMock.showError).toHaveBeenCalledWith(
        PlatformMessages.sessionExpiredTitle,
        'Network error',
      );
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.RefreshToken}`);
    req.error(new ProgressEvent('error'), {
      status: 400,
      statusText: 'Bad Request',
    });
  });
});
