import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AiConfigurationComponent } from './ai-configuration.component';
import { AiConfigurationService } from '../../../services/admin/ai-configuration/ai-configuration.service';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { mapAiSummaryToCards } from './configs/ai-configuration.config';
import { AIConfigurationSummary, AiUsesDetails } from './interfaces/ai-configuration.interface';
import { platformMessages } from '../../../utils/constants';

jest.mock('./configs/ai-configuration.config', () => ({
  mapAiSummaryToCards: jest.fn(),
  qiConfigurationsHeaderConfig: { title: 'Mock Header' },
}));

describe('AiConfigurationComponent (Jest)', () => {
  let component: AiConfigurationComponent;
  let fixture: ComponentFixture<AiConfigurationComponent>;
  let mockService: jest.Mocked<AiConfigurationService>;
  let mockSnackbar: jest.Mocked<SnackbarService>;

  const mockAiSummary: AIConfigurationSummary = {
    curruntMonthApiCalls: 12,
    generatedQuestionsCurruntMonth: 30,
    generatedQuestionsLastMonth: 20,
    successRate: 88.5,
  };

  const mockAiUsage: AiUsesDetails = {
    todaysApiCalls: 10,
    averageResponseTimeInSecond: 2.5,
    errorRate: 0.05,
  };

  beforeEach(async () => {
    mockService = {
      getAIConfigCardData: jest.fn(),
      getAiUsageDetails: jest.fn(),
    } as any;

    mockSnackbar = {
      showError: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [AiConfigurationComponent],
      providers: [
        { provide: AiConfigurationService, useValue: mockService },
        { provide: SnackbarService, useValue: mockSnackbar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AiConfigurationComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch AI config card data on init', () => {
    const mockMappedCards = [
      { title: 'Monthly API Calls', value: '12' },
      { title: 'Generated Questions', value: '30' },
    ];
    (mapAiSummaryToCards as jest.Mock).mockReturnValue(mockMappedCards);

    mockService.getAIConfigCardData.mockReturnValue(
      of({
        result: true,
        message: 'Success',
        statusCode: 200,
        data: mockAiSummary,
      }),
    );

    mockService.getAiUsageDetails.mockReturnValue(
      of({
        result: true,
        message: 'Fetched successfully',
        statusCode: 200,
        data: {
          todaysApiCalls: 0,
          averageResponseTimeInSecond: 0,
          errorRate: 0,
        },
      }),
    );

    component.ngOnInit();

    expect(mockService.getAIConfigCardData).toHaveBeenCalledTimes(1);
    expect(mapAiSummaryToCards).toHaveBeenCalledWith(mockAiSummary);
    expect(component.configss).toEqual(mockMappedCards);
  });

  it('should handle error while fetching AI config card data', () => {
    const mockError = { error: { message: 'Network error' } };
    mockService.getAIConfigCardData.mockReturnValue(throwError(() => mockError));

    component.fetchAiConfigurationCardsData();

    expect(mockSnackbar.showError).toHaveBeenCalledWith(
      platformMessages.errorTitle,
      'Network error',
    );
  });

  it('should fetch AI usage details successfully', () => {
    mockService.getAiUsageDetails.mockReturnValue(
      of({
        result: true,
        message: 'Fetched successfully',
        statusCode: 200,
        data: mockAiUsage,
      }),
    );

    component.fetchAiUsageFilterData(1);

    expect(mockService.getAiUsageDetails).toHaveBeenCalledWith(1);
    expect(component.aiMonitoringData).toEqual(mockAiUsage);
  });

  it('should handle error while fetching AI usage details', () => {
    const mockError = { error: { message: 'Server error' } };
    mockService.getAiUsageDetails.mockReturnValue(throwError(() => mockError));

    component.fetchAiUsageFilterData(1);

    expect(mockSnackbar.showError).toHaveBeenCalledWith(
      platformMessages.errorTitle,
      'Server error',
    );
  });

  it('should complete destroy$ on ngOnDestroy', () => {
    const nextSpy = jest.spyOn((component as any).destroy$, 'next');
    const completeSpy = jest.spyOn((component as any).destroy$, 'complete');

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  describe('AiConfigurationComponent (error handling)', () => {
    beforeEach(() => {
      mockService.getAiUsageDetails.mockReturnValue(
        of({
          result: true,
          message: 'Fetched successfully',
          statusCode: 200,
          data: { todaysApiCalls: 0, averageResponseTimeInSecond: 0, errorRate: 0 },
        }),
      );
    });

    it('should call snackbar.showError when getAIConfigCardData fails', () => {
      const mockError = {
        error: { message: 'Server Error' },
      };

      mockService.getAIConfigCardData.mockReturnValue(throwError(() => mockError));

      component.fetchAiConfigurationCardsData();

      expect(mockService.getAIConfigCardData).toHaveBeenCalledTimes(1);
      expect(mockSnackbar.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        'Server Error',
      );
    });

    it('should call snackbar.showError with default message when getAIConfigCardData fails without message', () => {
      const mockError = { error: {} };

      mockService.getAIConfigCardData.mockReturnValue(throwError(() => mockError));

      component.fetchAiConfigurationCardsData();

      expect(mockSnackbar.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        platformMessages.errorMessage,
      );
    });

    it('should call snackbar.showError when getAiUsageDetails fails', () => {
      const mockError = {
        error: { message: 'Usage details failed' },
      };

      mockService.getAiUsageDetails.mockReturnValue(throwError(() => mockError));

      component.fetchAiUsageFilterData(1);

      expect(mockService.getAiUsageDetails).toHaveBeenCalledWith(1);
      expect(mockSnackbar.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        'Usage details failed',
      );
    });

    it('should call snackbar.showError with default message when getAiUsageDetails fails without message', () => {
      const mockError = { error: {} };

      mockService.getAiUsageDetails.mockReturnValue(throwError(() => mockError));

      component.fetchAiUsageFilterData(2);

      expect(mockSnackbar.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        platformMessages.errorMessage,
      );
    });
  });
});
