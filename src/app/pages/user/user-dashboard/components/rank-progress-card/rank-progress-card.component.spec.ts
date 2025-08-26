import { TestBed } from '@angular/core/testing';
import { RankProgressCardComponent } from './rank-progress-card.component';
import { MatIconModule } from '@angular/material/icon';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import {} from '../../configs/user-dashboard.config';
import { RankProgress } from '../../interfaces/rank-progress.interface';

// Mock ProgressBarComponent
@Component({ selector: 'app-progress-bar', template: '' })
class MockProgressBarComponent {
  percentage!: number;
  theme!: string;
}

describe('RankProgressCardComponent', () => {
  let component: RankProgressCardComponent;
  let fixture: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RankProgressCardComponent, MatIconModule, MockProgressBarComponent],
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
    expect(rankInfo.textContent).toContain('Current: beginner');
    expect(rankInfo.textContent).toContain('Next: intermediate');

    const xpInfo = fixture.nativeElement.querySelector('.xp-info');
    expect(xpInfo.textContent).toContain('150 more XP needed to reach intermediate rank');

    const progressBar = fixture.debugElement.query(By.css('app-progress-bar')).componentInstance;
    expect(progressBar.percentage).toBe(70);
    expect(progressBar.theme).toBe('secondary');
  });
});
