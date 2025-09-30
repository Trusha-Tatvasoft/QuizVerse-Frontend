import { TestBed } from '@angular/core/testing';
import { WelcomeBannerComponent } from './welcome-banner.component';
import { MatIconModule } from '@angular/material/icon';
import { Component, Input } from '@angular/core';
import { By } from '@angular/platform-browser';
import { WelcomeBanner } from '../../interfaces/welcome-banner.interface';
import {
  browseQuizzesButtonConfig,
  quickBattleButtonConfig,
} from '../../configs/dashboard-buttons.config';
import { Router } from '@angular/router';
import { Navigations } from '../../../../../shared/enums/navigation';

// Mock FilledButtonComponent (standalone friendly)
@Component({ selector: 'app-filled-button', template: '' })
class MockFilledButtonComponent {
  @Input() filledButtonConfig: any;
}

describe('WelcomeBannerComponent (standalone)', () => {
  let component: WelcomeBannerComponent;
  let fixture: any;
  let router: jest.Mocked<Router>;

  beforeEach(async () => {
    const routerMock: jest.Mocked<Router> = {
      navigate: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [MatIconModule, WelcomeBannerComponent, MockFilledButtonComponent],
      providers: [{ provide: Router, useValue: routerMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(WelcomeBannerComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display user details correctly', () => {
    const mockUser: WelcomeBanner = { userName: 'Alice', currentRank: 12 };
    component.userDetails = mockUser;
    fixture.detectChanges();

    const titleEl = fixture.nativeElement.querySelector('.title');
    expect(titleEl.textContent).toContain('Welcome, Alice!');

    const subtitleEl = fixture.nativeElement.querySelector('.subtitle');
    expect(subtitleEl.textContent).toContain('#12');
  });

  it('should bind button configs correctly', () => {
    component.userDetails = { userName: 'Alice', currentRank: 12 };

    fixture.detectChanges();

    const buttons = fixture.debugElement.queryAll(By.css('app-filled-button'));
    expect(buttons.length).toBe(2);

    const firstButton = buttons[0].componentInstance;
    const secondButton = buttons[1].componentInstance;

    expect(firstButton.filledButtonConfig).toEqual(quickBattleButtonConfig);
    expect(secondButton.filledButtonConfig).toEqual(browseQuizzesButtonConfig);
  });

  it('should navigate to quick battle when quickBattleNavigate is called', () => {
    component.quickBattleNavigate();
    expect(router.navigate).toHaveBeenCalledWith([
      Navigations.User,
      Navigations.Battles,
      Navigations.BattleList,
    ]);
  });

  it('should navigate to browse quizzes when browseQuizNavigate is called', () => {
    component.browseQuizNavigate();
    expect(router.navigate).toHaveBeenCalledWith([
      Navigations.User,
      Navigations.QuizList,
      Navigations.BrowseQuizzes,
    ]);
  });
});
