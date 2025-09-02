import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserLeaderboardComponent } from './user-leaderboard.component';
import { defaultUserLeaderboardTabs } from './configs/user-leaderboard.configs';
import { GlobalLeaderboardCardComponent } from './global-leaderboard-card/global-leaderboard-card.component';
import { TabComponent } from '../../../shared/components/tab/tab.component';
import { By } from '@angular/platform-browser';
import { LeaderboardService } from '../../../services/user/leaderboard/leaderboard.service';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('UserLeaderboardComponent', () => {
  let component: UserLeaderboardComponent;
  let fixture: ComponentFixture<UserLeaderboardComponent>;
  let leaderboardServiceMock: jest.Mocked<LeaderboardService>;

  beforeEach(async () => {
    leaderboardServiceMock = {
      getUserLeaderboardStats: jest.fn().mockReturnValue(of({})),
      getGlobalLeaderboard: jest.fn().mockReturnValue(of({})),
    } as unknown as jest.Mocked<LeaderboardService>;

    await TestBed.configureTestingModule({
      imports: [UserLeaderboardComponent, HttpClientTestingModule],
      providers: [
        {
          provide: LeaderboardService,
          useValue: leaderboardServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserLeaderboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default selectedIndex and tabs', () => {
    expect(component.selectedIndex).toBe(0);
    expect(component.tabs).toEqual(defaultUserLeaderboardTabs);
  });

  it('should update selectedIndex when onTabChanged is called', () => {
    component.onTabChanged(2);
    expect(component.selectedIndex).toBe(2);

    component.onTabChanged(1);
    expect(component.selectedIndex).toBe(1);
  });

  it('should render GlobalLeaderboardCardComponent', () => {
    const card = fixture.debugElement.query(By.directive(GlobalLeaderboardCardComponent));
    expect(card).toBeTruthy();
  });

  it('should render TabComponent with correct inputs', () => {
    const tab = fixture.debugElement.query(By.directive(TabComponent));
    expect(tab).toBeTruthy();

    const tabInstance = tab.componentInstance as TabComponent;
    expect(tabInstance.tabs).toEqual(defaultUserLeaderboardTabs);
    expect(tabInstance.selectedIndex).toBe(0);
  });

  it('should update selectedIndex when TabComponent emits tabChanged', () => {
    const tab = fixture.debugElement.query(By.directive(TabComponent));
    const tabInstance = tab.componentInstance as TabComponent;

    tabInstance.tabChanged.emit(1);
    fixture.detectChanges();

    expect(component.selectedIndex).toBe(1);
    expect((tab.componentInstance as TabComponent).selectedIndex).toBe(1);
  });
});
