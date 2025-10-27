import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NavbarDataService } from './navbar-data.service';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { NavbarData } from '../../../pages/layout/interfaces/navbar.component.interface';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';

describe('NavbarDataService', () => {
  let service: NavbarDataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), NavbarDataService],
    });

    service = TestBed.inject(NavbarDataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch navbar data successfully', () => {
    const mockResponse: ApiResponse<NavbarData> = {
      result: true,
      message: 'Success',
      data: {
        profilePic: 'avatar.png',
        notificationCount: 3,
        progressPercentage: 42.5,
      } as unknown as NavbarData,
      statusCode: 200,
    };

    service.getNavbarData().subscribe((res) => {
      expect(res).toEqual(mockResponse);
      expect(res.data.notificationCount).toBe(3);
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.NavbarData}`);
    expect(req.request.method).toBe('GET');

    req.flush(mockResponse);
  });

  it('should handle error response', () => {
    const errorMessage = 'Server error';

    service.getNavbarData().subscribe({
      next: () => fail('Expected error, not success'),
      error: (err) => {
        expect(err.status).toBe(500);
        expect(err.statusText).toBe('Internal Server Error');
      },
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.NavbarData}`);
    req.flush(errorMessage, { status: 500, statusText: 'Internal Server Error' });
  });
});
