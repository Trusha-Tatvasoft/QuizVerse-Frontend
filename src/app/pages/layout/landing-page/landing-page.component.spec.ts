import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingPageComponent } from './landing-page.component';
import { provideRouter, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FilledButtonComponent } from '../../../shared/components/filled-button/filled-button.component';
import { OutlineButtonComponent } from '../../../shared/components/outline-button/outline-button.component';

import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { FEATURES, LANDING_PAGE_CONTENT } from '../configs/landing-page.component.config';

describe('LandingPageComponent', () => {
  let component: LandingPageComponent;
  let fixture: ComponentFixture<LandingPageComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LandingPageComponent,
        CommonModule,
        MatIconModule,
        FilledButtonComponent,
        OutlineButtonComponent,
      ],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should render the correct landing quote from config', () => {
    const quoteDe = fixture.debugElement.query(By.css('.subtitle'));
    expect(quoteDe).toBeTruthy();

    const actualText = quoteDe.nativeElement.textContent.trim();
    const expectedText = LANDING_PAGE_CONTENT.quote.trim();

    expect(actualText).toBe(expectedText);
  });

  it('should render all statistics', () => {
    const statBoxes = fixture.nativeElement.querySelectorAll('.stat-box');
    expect(statBoxes.length).toBe(LANDING_PAGE_CONTENT.stats.length);
  });

  it('should render all features', () => {
    const featureCards = fixture.nativeElement.querySelectorAll('.feature-card');
    expect(featureCards.length).toBe(FEATURES.length);
  });

  it('should navigate to root when browseQuiz is clicked', () => {
    const navigateSpy = jest.spyOn(router, 'navigateByUrl');
    component.browseQuiz();
    expect(navigateSpy).toHaveBeenCalledWith('/');
  });

  it('should navigate to root when playQuiz is clicked', () => {
    const navigateSpy = jest.spyOn(router, 'navigateByUrl');
    component.playQuiz();
    expect(navigateSpy).toHaveBeenCalledWith('/');
  });

  it('should render the CTA buttons', () => {
    const buttons = fixture.nativeElement.querySelectorAll('app-filled-button, app-outline-button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should render the feature section header', () => {
    const featureTitle = fixture.nativeElement.querySelector('.feature-title');
    expect(featureTitle.textContent).toContain('Why Choose QuizVerse?');
  });

  it('should render the footer sections', () => {
    const columns = fixture.nativeElement.querySelectorAll('.footer-column');
    expect(columns.length).toBe(3);
  });

  it('should render the footer brand name', () => {
    const brand = fixture.nativeElement.querySelector('.brand-name');
    expect(brand.textContent).toContain('QuizVerse');
  });

  it('should render the copyright', () => {
    const copyright = fixture.nativeElement.querySelector('.footer-bottom .copyright');
    expect(copyright.textContent.trim()).toContain('© 2024 QuizVerse');
  });
});
