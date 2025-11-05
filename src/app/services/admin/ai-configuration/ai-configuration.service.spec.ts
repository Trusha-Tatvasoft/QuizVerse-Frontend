import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AiConfigurationService } from './ai-configuration.service';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import {
  AIConfigurationSummary,
  AiUsesDetails,
} from '../../../pages/admin/ai-configuration/interfaces/ai-configuration.interface';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AiConfigurationService (Jest)', () => {
  let service: AiConfigurationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AiConfigurationService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(AiConfigurationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch AI configuration summary data', (done) => {
    const mockResponse: ApiResponse<AIConfigurationSummary> = {
      statusCode: 200,
      result: true,
      message: 'Data fetched successfully',
      data: {
        curruntMonthApiCalls: 1,
        generatedQuestionsCurruntMonth: 0,
        generatedQuestionsLastMonth: 148,
        successRate: 79.19,
      },
    };

    service.getAIConfigCardData().subscribe((res) => {
      expect(res).toEqual(mockResponse);
      expect(res.data.curruntMonthApiCalls).toBe(1);
      expect(res.data.successRate).toBeCloseTo(79.19);
      done();
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.AiConfigurationCardData}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch AI usage details with modelName', (done) => {
    const modelName = 2;
    const mockResponse: ApiResponse<AiUsesDetails> = {
      statusCode: 200,
      result: true,
      message: 'Usage data fetched successfully',
      data: {
        todaysApiCalls: 15,
        averageResponseTimeInSecond: 2.5,
        errorRate: 0.05,
      },
    };

    service.getAiUsageDetails(modelName).subscribe((res) => {
      expect(res).toEqual(mockResponse);
      expect(res.data.todaysApiCalls).toBe(15);
      expect(res.data.errorRate).toBe(0.05);
      done();
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/${EndPoints.AiUsageDetails}?aiModelName=${modelName}`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch AI usage details without modelName (default)', (done) => {
    const mockResponse: ApiResponse<AiUsesDetails> = {
      statusCode: 200,
      result: true,
      message: 'Usage data fetched successfully',
      data: {
        todaysApiCalls: 10,
        averageResponseTimeInSecond: 1.8,
        errorRate: 0.02,
      },
    };

    service.getAiUsageDetails().subscribe((res) => {
      expect(res).toEqual(mockResponse);
      expect(res.data.averageResponseTimeInSecond).toBe(1.8);
      done();
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/${EndPoints.AiUsageDetails}?aiModelName=undefined`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
