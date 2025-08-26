import { TestBed } from '@angular/core/testing';
import { WelcomeBannerComponent } from './welcome-banner.component';
import { FilledButtonComponent } from '../../../../../shared/components/filled-button/filled-button.component';
import { MatIconModule } from '@angular/material/icon';
import { Component, Input } from '@angular/core';
import { By } from '@angular/platform-browser';
import { WelcomeBanner } from '../../interfaces/welcome-banner.interface';
import {
  quickBattleButtonConfig,
  browseQuizzesButtonConfig,
} from '../../configs/dashboard-buttons.config';

// Mock FilledButtonComponent
@Component({ selector: 'app-filled-button', template: '' })
class MockFilledButtonComponent {
  @Input() filledButtonConfig: any;
}

describe('WelcomeBannerComponent', () => {
  let component: WelcomeBannerComponent;
  let fixture: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatIconModule, WelcomeBannerComponent, MockFilledButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WelcomeBannerComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display user details correctly', () => {
    const mockUser: WelcomeBanner = { userName: 'Alice', currentRank: 12 };
    component.userDetails = mockUser;
    fixture.detectChanges();

    const titleEl = fixture.nativeElement.querySelector('.title');
    expect(titleEl.textContent).toContain('Welcome back, Alice!');

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
});
