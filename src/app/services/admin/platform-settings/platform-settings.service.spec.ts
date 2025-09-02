import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { PlatformSettingsService } from './platform-settings.service';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { PlatformConfigurationResponseDTO } from '../../../pages/admin/platform-settings/interfaces/platform-settings.interface';
import { EndPoints } from '../../../shared/enums/end-point.enum';

describe('PlatformSettingsService', () => {
  let service: PlatformSettingsService;
  let httpMock: jest.Mocked<HttpClient>;

  const mockResponse: ApiResponse<PlatformConfigurationResponseDTO> = {
    statusCode: 200,
    result: true,
    message: 'success',
    data: {
      quote: 'Test Quote',
      defaultsColors: {
        primaryColor: '#123456',
        secondaryColor: '#654321',
      },
      logo: 'logo.png',
    },
  };

  beforeEach(() => {
    httpMock = {
      get: jest.fn(),
      post: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [PlatformSettingsService, { provide: HttpClient, useValue: httpMock }],
    });
  });

  it('should be created', () => {
    httpMock.get.mockReturnValue(of(mockResponse));
    service = TestBed.inject(PlatformSettingsService);
    expect(service).toBeTruthy();
  });

  it('should call setPlatformConfigurations on service init (constructor)', () => {
    httpMock.get.mockReturnValue(of(mockResponse));

    service = TestBed.inject(PlatformSettingsService);

    service.platformConfig$.subscribe((config) => {
      expect(config?.quote).toBe('Test Quote');
      expect(config?.logo).toContain('logo.png'); // logo is appended with baseUrl
    });

    expect(httpMock.get).toHaveBeenCalledWith(
      expect.stringContaining(EndPoints.GetPlateformSetting),
    );
    expect(document.documentElement.style.getPropertyValue('--global-primary-color')).toBe(
      '#123456',
    );
    expect(document.documentElement.style.getPropertyValue('--global-secondary-color')).toBe(
      '#654321',
    );
  });

  it('getPlatformConfigurations should call http.get and return response', (done) => {
    httpMock.get.mockReturnValue(of(mockResponse));

    service = TestBed.inject(PlatformSettingsService);

    service.getPlatformConfigurations().subscribe((res) => {
      expect(res).toEqual(mockResponse);
      expect(httpMock.get).toHaveBeenCalledWith(
        expect.stringContaining(EndPoints.GetPlateformSetting),
      );
      done();
    });
  });

  it('updatePlatformConfigurations should call http.post and refresh settings', () => {
    const mockPostResponse: ApiResponse<null> = {
      statusCode: 200,
      result: true,
      message: 'updated',
      data: null,
    };

    httpMock.get.mockReturnValue(of(mockResponse)); // called inside constructor
    httpMock.post.mockReturnValue(of(mockPostResponse));

    service = TestBed.inject(PlatformSettingsService);

    const formData = new FormData();
    service.updatePlatformConfigurations(formData).subscribe((res) => {
      expect(res).toEqual(mockPostResponse);
    });

    expect(httpMock.post).toHaveBeenCalledWith(
      expect.stringContaining(EndPoints.UpdatePlateformSetting),
      formData,
    );
  });
});
