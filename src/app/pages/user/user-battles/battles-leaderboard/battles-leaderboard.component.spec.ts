import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BattlesLeaderboardComponent } from './battles-leaderboard.component';

describe('BattlesLeaderboardComponent', () => {
  let component: BattlesLeaderboardComponent;
  let fixture: ComponentFixture<BattlesLeaderboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BattlesLeaderboardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BattlesLeaderboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
