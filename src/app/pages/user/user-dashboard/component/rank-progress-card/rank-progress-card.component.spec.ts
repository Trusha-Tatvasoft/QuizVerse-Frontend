import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RankProgressCardComponent } from './rank-progress-card.component';
import { MatIconModule } from '@angular/material/icon';
import { Component, Input } from '@angular/core';
import { By } from '@angular/platform-browser';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RankProgress } from '../../interfaces/rank-progress.interface';
import { UserDashboardService } from '../../../../../services/user/user-dashboard/user-dashboard.service';
import { provideHttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { platformMessages } from '../../../../../utils/constants';

// ✅ Mock ProgressBarComponent
@Component({
  selector: 'app-progress-bar',
  template: '',
  standalone: false, // ensure it's treated as non-standalone
})
class MockProgressBarComponent {
  @Input() percentage!: number;
  @Input() theme!: string;
}

// ✅ Mock UserDashboardService
const mockUserDashboardService = {
  // mock only what you need for this component
  getRankData: jest.fn(),
  getRankProgress: jest.fn().mockReturnValue(
    of({
      currentRank: 'Beginner',
      nextRank: 'Intermediate',
      progressPercent: 70,
      xpNeeded: 150,
    }),
  ),
};

describe('RankProgressCardComponent', () => {
  let component: RankProgressCardComponent;
  let fixture: ComponentFixture<RankProgressCardComponent>;
  const mockSnackbarService = {
    showError: jest.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RankProgressCardComponent, MatIconModule],
      declarations: [MockProgressBarComponent],
      providers: [
        { provide: UserDashboardService, useValue: mockUserDashboardService },
        { provide: SnackbarService, useValue: mockSnackbarService },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RankProgressCardComponent);
    component = fixture.componentInstance;
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should display rank data correctly', () => {
    const mockRank: RankProgress = {
      currentRank: 'beginner',
      nextRank: 'intermediate',
      progressPercent: 70,
      xpNeeded: 150,
    };

    component.rankData = mockRank;
    fixture.detectChanges();

    const rankInfo = fixture.nativeElement.querySelector('.rank-info');
    expect(rankInfo.textContent).toContain('Current: BeginnerNext: Intermediate');

    const xpInfo = fixture.nativeElement.querySelector('.xp-info');
    expect(xpInfo.textContent).toContain(' 150 more XP needed to reach Intermediate rank ');

    const progressBar = fixture.debugElement.query(By.css('app-progress-bar')).componentInstance;
    expect(progressBar.percentage).toBe(70);
    expect(progressBar.theme).toBe('secondary');
  });

  it('should call SnackbarService.showError when service errors', () => {
    mockUserDashboardService.getRankProgress.mockReturnValue(
      // simulate error
      new Observable(() => {
        throw new Error('Service failed');
      }),
    );

    fixture.detectChanges();

    expect(mockSnackbarService.showError).toHaveBeenCalledWith(
      platformMessages.errorTitle,
      platformMessages.errorMessage,
    );
  });
});
