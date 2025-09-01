import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AchievementComponent } from './achievement.component';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { dummyAchievement } from '../../interfaces/achievement.interface';

describe('AchievementComponent', () => {
  let component: AchievementComponent;
  let fixture: ComponentFixture<AchievementComponent>;
  let routerMock: { navigate: jest.Mock };

  beforeEach(async () => {
    routerMock = { navigate: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [AchievementComponent],
      providers: [{ provide: Router, useValue: routerMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(AchievementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should load achievements on init', () => {
    expect(component.achievements).toEqual(dummyAchievement);
  });

  it('should render achievements', () => {
    const cards = fixture.debugElement.queryAll(By.css('.achievement-card'));
    expect(cards.length).toBe(dummyAchievement.length);
  });

  it('should navigate to profile (tab=1) when viewAllAchievement is called', () => {
    component.viewAllAchievement();
    expect(routerMock.navigate).toHaveBeenCalledWith(['profile'], {
      queryParams: { tab: 1 },
    });
  });

  it('should navigate when footer button is clicked', () => {
    const button = fixture.debugElement.query(By.css('app-text-button'));
    button.triggerEventHandler('buttonClicked', null);

    expect(routerMock.navigate).toHaveBeenCalledWith(['profile'], {
      queryParams: { tab: 1 },
    });
  });
});
