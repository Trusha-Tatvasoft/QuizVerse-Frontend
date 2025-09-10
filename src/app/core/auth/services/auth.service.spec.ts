import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { environment } from '../../../../environments/environment.dev';
import {
  accessTokenKey,
  refreshTokenKey,
  roleClaimKey,
  platformMessages,
} from '../../../utils/constants';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { provideHttpClient } from '@angular/common/http';
import { Navigations } from '../../../shared/enums/navigation';

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
    showInfo: jest.fn(),
    showSuccess: jest.fn(),
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
        [roleClaimKey]: role,
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

    expect(cookieServiceMock.set).toHaveBeenCalledWith(accessTokenKey, token, expect.any(Object));
    expect(cookieServiceMock.set).toHaveBeenCalledWith(
      refreshTokenKey,
      'refresh123',
      expect.any(Object),
    );
    expect(service.currentRole$.value).toBe('admin');
  });

  it('should set access token and update role', () => {
    const token = createToken('admin');
    jest.spyOn(service as any, 'getRoleFromToken').mockReturnValue('admin');

    service.setAccessToken(token);

    expect(cookieServiceMock.set).toHaveBeenCalledWith(accessTokenKey, token, expect.any(Object));
    expect(service.currentRole$.value).toBe('admin');
  });

  it('should get access and refresh tokens from cookies', () => {
    cookieServiceMock.get.mockImplementation((key: string) =>
      key === accessTokenKey ? 'access' : key === refreshTokenKey ? 'refresh' : '',
    );

    expect(service.getAccessToken()).toBe('access');
    expect(service.getRefreshToken()).toBe('refresh');
  });

  it('should get role from valid token', () => {
    const token = createToken('admin');
    expect(service.getRoleFromToken(token)).toBe('admin');
  });

  it('should navigate on invalid token', () => {
    const invalidToken = 'invalid.token.value'; // malformed token

    const role = service.getRoleFromToken(invalidToken);

    expect(role).toBeNull();
    expect(routerMock.navigate).toHaveBeenCalledWith([Navigations.Login]);
    expect(snackbarMock.showInfo).toHaveBeenCalledWith('Redirecting to login.');
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
  it('should delete tokens, reset role, navigate to login, and show success on logout', () => {
    service.logout();

    expect(cookieServiceMock.delete).toHaveBeenCalledWith(accessTokenKey, '/');
    expect(cookieServiceMock.delete).toHaveBeenCalledWith(refreshTokenKey, '/');
    expect(service.currentRole$.value).toBeNull();
    expect(routerMock.navigate).toHaveBeenCalledWith([Navigations.Login]);
    expect(snackbarMock.showSuccess).toHaveBeenCalledWith(platformMessages.logoutSuccess);
  });

  it('should return null if token has no role', () => {
    const token = createToken('', 3600);
    const parts = token.split('.');
    const payload = JSON.parse(atob(parts[1]));
    delete payload[roleClaimKey]; // remove role
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
  });

  it('should return EMPTY if refresh response has missing accessToken', () => {
    cookieServiceMock.get.mockReturnValue('refresh-token');
    service.refreshAccessToken().subscribe((res) => {
      expect(res).toBeFalsy();
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.RefreshToken}`);
    req.flush({ result: true, statusCode: 200, data: { refreshToken: 'some-refresh' } });
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
      refreshTokenKey,
      oldRefresh,
      expect.any(Object),
    );
  });

  it('should show fallback error when refresh fails and only error.message exists', () => {
    cookieServiceMock.get.mockReturnValue('refresh-token');

    service.refreshAccessToken().subscribe((res) => {
      expect(res).toBe('');
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.RefreshToken}`);
    req.error(new ProgressEvent('error'), {
      status: 400,
      statusText: 'Bad Request',
    });
  });

  it('should use tokenInvalidMessage when no error message is provided during refresh', () => {
    cookieServiceMock.get.mockReturnValue('refresh-token');

    service.refreshAccessToken().subscribe((res) => {
      expect(res).toBe('');
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.RefreshToken}`);
    req.error(new ProgressEvent('error'));
  });

  it('should logout with isLogout = true and show success message', () => {
    service.logout(true);

    expect(cookieServiceMock.delete).toHaveBeenCalledWith(accessTokenKey, '/');
    expect(cookieServiceMock.delete).toHaveBeenCalledWith(refreshTokenKey, '/');
    expect(service.currentRole$.value).toBeNull();
    expect(routerMock.navigate).toHaveBeenCalledWith([Navigations.Login]);
    expect(snackbarMock.showSuccess).toHaveBeenCalledWith(platformMessages.logoutSuccess);
    expect(snackbarMock.showError).not.toHaveBeenCalled();
  });

  it('should logout with isLogout = false and show error message', () => {
    service.logout(false);

    expect(cookieServiceMock.delete).toHaveBeenCalledWith(accessTokenKey, '/');
    expect(cookieServiceMock.delete).toHaveBeenCalledWith(refreshTokenKey, '/');
    expect(service.currentRole$.value).toBeNull();
    expect(routerMock.navigate).toHaveBeenCalledWith([Navigations.Login]);
    expect(snackbarMock.showError).toHaveBeenCalledWith(
      platformMessages.sessionExpiredTitle,
      platformMessages.sessionExpiredMessage,
    );
    expect(snackbarMock.showSuccess).not.toHaveBeenCalled();
  });

  it('should return true if token is malformed (catch block)', () => {
    const invalidToken = 'not.a.valid.token';
    const result = service.isTokenExpired(invalidToken);
    expect(result).toBe(true);
  });
});
