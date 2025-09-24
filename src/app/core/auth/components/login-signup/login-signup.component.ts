import { Component, effect, inject, signal } from '@angular/core';
import { OutlineButtonComponent } from '../../../../shared/components/outline-button/outline-button.component';
import {
  facebookButtonConfig,
  googleButtonConfig,
  loginSignUpTabsConfig,
} from '../../configs/login-signup.component.config';
import { TabComponent } from '../../../../shared/components/tab/tab.component';
import { RouterLink } from '@angular/router';
import { PlatformSettingsService } from '../../../../services/admin/platform-settings/platform-settings.service';
import { CommonModule } from '@angular/common';
import { plateformName } from '../../../../utils/constants';
import { Subject, takeUntil } from 'rxjs';

export const selectedTabIndexSignal = signal<number>(0);

@Component({
  selector: 'app-login-signup',
  imports: [OutlineButtonComponent, TabComponent, RouterLink, CommonModule],
  templateUrl: './login-signup.component.html',
  styleUrl: './login-signup.component.scss',
})
export class LoginSignupComponent {
  googleButton = googleButtonConfig; // Google button configuration
  facebookButton = facebookButtonConfig; // Facebook button configuration
  tabs = loginSignUpTabsConfig; // Tabs for Sign In / Sign Up
  selectedIndex = selectedTabIndexSignal(); // Active tab index
  logoPath: string | null;
  plateformName = plateformName;

  private readonly platformSettingsService = inject(PlatformSettingsService);

  private readonly destroy$ = new Subject<void>();

  constructor() {
    effect(() => {
      this.selectedIndex = selectedTabIndexSignal();
    });
    this.loadPlatformConfig();
  }

  switchToTab(index: number) {
    selectedTabIndexSignal.set(index);
  }

  imageError() {
    this.logoPath = null;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPlatformConfig(): void {
    this.platformSettingsService.platformConfig$
      .pipe(takeUntil(this.destroy$))
      .subscribe((config) => {
        if (config) {
          this.logoPath = config.logo ?? null;
        }
      });
  }
}
