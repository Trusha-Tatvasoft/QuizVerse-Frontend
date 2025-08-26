import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalLeaderboardCardComponent } from './global-leaderboard-card.component';

describe('GlobalLeaderboardCardComponent', () => {
  let component: GlobalLeaderboardCardComponent;
  let fixture: ComponentFixture<GlobalLeaderboardCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalLeaderboardCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalLeaderboardCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
