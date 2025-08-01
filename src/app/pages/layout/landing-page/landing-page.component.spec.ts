import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingPageComponent } from './landing-page.component';
import { provideRouter, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FilledButtonComponent } from '../../../shared/components/filled-button/filled-button.component';
import { OutlineButtonComponent } from '../../../shared/components/outline-button/outline-button.component';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import {
  landingPageFeaturesCardsConfig,
  landingPageContent,
} from '../configs/landing-page.component.config';
import { of, Subject, throwError } from 'rxjs';
import { LandingPageDataService } from '../../../services/user/landing-page/landing-page-data.service';
import { LandingPageStats } from '../../../shared/interfaces/landing-page-stats.interface';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';

describe('LandingPageComponent (Jest)', () => {
  let component: LandingPageComponent;
  let fixture: ComponentFixture<LandingPageComponent>;
  let router: Router;

  const mockStats: LandingPageStats = {
    activePlayer: 5230,
    quizCreated: 12800,
    questionAns: 330000,
    quote: 'Learn with AI!',
  };

  const mockLandingPageDataService = {
    getStats: jest.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LandingPageComponent,
        CommonModule,
        MatIconModule,
        FilledButtonComponent,
        OutlineButtonComponent,
      ],
      providers: [
        provideRouter([]),
        { provide: LandingPageDataService, useValue: mockLandingPageDataService },
        { provide: SnackbarService, useValue: { showError: jest.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  beforeEach(() => {
    mockLandingPageDataService.getStats.mockReturnValue(
      of({
        result: true,
        statusCode: 200,
        message: 'success',
        data: mockStats,
      }),
    );
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should call getStats and update landing page stats', () => {
    expect(mockLandingPageDataService.getStats).toHaveBeenCalled();
    expect(component.stats).toEqual(mockStats);
    const active = component.landingPageContent.stats.find((s) => s.label === 'Active Players')!;
    expect(active.value).toBe('5K+');
  });

  it('should format numbers correctly', () => {
    const result = (component as any).formatCount;
    expect(result(50)).toBe('50');
    expect(result(250)).toBe('200+');
    expect(result(1200)).toBe('1K+');
    expect(result(2500000)).toBe('2M+');
    expect(result(999)).toBe('900+'); // Edge case
    expect(result(1000)).toBe('1K+'); // Exact boundary
  });

  it('should complete destroy$ subject on destroy', () => {
    const destroy$ = (component as any).destroy$ as Subject<void>;
    const completeSpy = jest.spyOn(destroy$, 'complete');
    component.ngOnDestroy();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should skip assigning stat if index is missing in content', () => {
    component.landingPageContent.stats = [];
    mockLandingPageDataService.getStats.mockReturnValueOnce(
      of({ result: true, statusCode: 200, message: 'ok', data: mockStats }),
    );
    component['loadLandingPageStats']();
    expect(component.landingPageContent.stats[0]).toBeUndefined();
  });

  it('should show platform first letter as logo', () => {
    const logo = fixture.nativeElement.querySelector('.logo-icon');
    expect(logo.textContent.trim()).toBe('Q');
  });

  it('should render the updated landing quote', () => {
    const quoteEl = fixture.debugElement.query(By.css('.subtitle'));
    expect(quoteEl.nativeElement.textContent.trim()).toBe(mockStats.quote.trim());
  });

  it('should render all stat boxes', () => {
    const statBoxes = fixture.nativeElement.querySelectorAll('.stat-box');
    expect(statBoxes.length).toBe(landingPageContent.stats.length);
  });

  it('should render feature cards', () => {
    const featureCards = fixture.nativeElement.querySelectorAll('.feature-card');
    expect(featureCards.length).toBe(landingPageFeaturesCardsConfig.length);
  });

  it('should render CTA buttons', () => {
    const buttons = fixture.nativeElement.querySelectorAll('app-filled-button, app-outline-button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should render footer brand name', () => {
    const brand = fixture.nativeElement.querySelector('.brand-name');
    expect(brand.textContent).toContain('QuizVerse');
  });

  it('should navigate to login on loginRedirect', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    component.loginRedirect();
    expect(navigateSpy).toHaveBeenCalledWith(['login']);
  });

  it('should navigate to browse on browseQuizRedirect', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    component.browseQuizRedirect();
    expect(navigateSpy).toHaveBeenCalledWith(['browse-quizzes']);
  });

  it('should trigger click events via DOM for buttons', () => {
    const browseBtn = fixture.debugElement.query(By.css('app-outline-button'));
    const spy = jest.spyOn(component, 'browseQuizRedirect');
    browseBtn.triggerEventHandler('buttonClicked');
    expect(spy).toHaveBeenCalled();
  });

  it('should show error snackbar when getStats fails', () => {
    const snackbarSpy = jest.spyOn(TestBed.inject(SnackbarService), 'showError');
    mockLandingPageDataService.getStats.mockReturnValueOnce(
      throwError(() => ({
        error: { message: 'Server error' },
      })),
    );
    fixture = TestBed.createComponent(LandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(snackbarSpy).toHaveBeenCalledWith('Something went wrong.', 'Server error');
  });
});
