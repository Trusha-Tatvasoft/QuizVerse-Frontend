import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ContentModerationComponent } from './content-moderation.component';
import { ContentModerationService } from '../../../services/admin/content-moderation/content-moderation.service';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { platformMessages } from '../../../utils/constants';
import { mapContentModerationSummaryToCards } from './content-moderation.mapper';

jest.mock('./content-moderation.mapper', () => ({
  mapContentModerationSummaryToCards: jest.fn(),
}));

describe('ContentModerationComponent (Jest)', () => {
  let component: ContentModerationComponent;
  let fixture: ComponentFixture<ContentModerationComponent>;
  let mockService: jest.Mocked<ContentModerationService>;
  let mockSnackbar: jest.Mocked<SnackbarService>;

  const mockData = {
    pendingReportsCount: 5,
    underReviewReportsCount: 2,
    todayResolvedReportsCount: 7,
    bannedUserCount: 1,
  };

  const mockMappedCards = [
    { title: 'Pending Reports', value: '5' },
    { title: 'Under Review', value: '2' },
  ];

  beforeEach(async () => {
    mockService = {
      getContentModerationMetricsData: jest.fn(),
    } as any;

    mockSnackbar = {
      showError: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [ContentModerationComponent],
      providers: [
        { provide: ContentModerationService, useValue: mockService },
        { provide: SnackbarService, useValue: mockSnackbar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentModerationComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch and map content moderation stats successfully on init', () => {
    // Arrange
    (mapContentModerationSummaryToCards as jest.Mock).mockReturnValue(mockMappedCards);
    mockService.getContentModerationMetricsData.mockReturnValue(
      of({ result: true, message: 'Success', statusCode: 200, data: mockData }),
    );

    // Act
    component.ngOnInit();

    // Assert
    expect(mockService.getContentModerationMetricsData).toHaveBeenCalledTimes(1);
    expect(mapContentModerationSummaryToCards).toHaveBeenCalledWith(mockData);
    expect(component.contentModerationStatsConfigs).toEqual(mockMappedCards);
  });

  it('should handle error when fetching content moderation stats', () => {
    const mockError = { error: { message: 'Server failed' } };

    mockService.getContentModerationMetricsData.mockReturnValue(throwError(() => mockError));

    component.ngOnInit();

    expect(mockService.getContentModerationMetricsData).toHaveBeenCalledTimes(1);
    expect(mockSnackbar.showError).toHaveBeenCalledWith(
      platformMessages.errorTitle,
      mockError.error.message,
    );
  });

  it('should complete destroy$ on ngOnDestroy', () => {
    const nextSpy = jest.spyOn(component['destroy$'], 'next');
    const completeSpy = jest.spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalledTimes(1);
    expect(completeSpy).toHaveBeenCalledTimes(1);
  });

  it('should use default error message when API error message is missing', () => {
    const mockError = {};
    mockService.getContentModerationMetricsData.mockReturnValue(throwError(() => mockError));

    component.ngOnInit();

    expect(mockSnackbar.showError).toHaveBeenCalledWith(
      platformMessages.errorTitle,
      platformMessages.errorMessage,
    );
  });
});
