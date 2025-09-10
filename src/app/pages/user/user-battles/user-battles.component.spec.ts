import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserBattlesComponent } from './user-battles.component';
import { TabComponent } from '../../../shared/components/tab/tab.component';
import { userBattlesLeaderboardTabs } from './configs/user-battles.configs';

describe('UserBattlesComponent', () => {
  let component: UserBattlesComponent;
  let fixture: ComponentFixture<UserBattlesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserBattlesComponent, TabComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserBattlesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have default selectedIndex = 0', () => {
    expect(component.selectedIndex).toBe(0);
  });

  it('should set tabs from config', () => {
    expect(component.tabs).toEqual(userBattlesLeaderboardTabs);
    expect(component.tabs.length).toBe(3);
  });

  it('should update selectedIndex when onTabChanged is called', () => {
    component.onTabChanged(2);
    expect(component.selectedIndex).toBe(2);
  });
});
