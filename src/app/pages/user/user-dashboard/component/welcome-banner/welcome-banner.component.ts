import { Component, inject, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FilledButtonComponent } from '../../../../../shared/components/filled-button/filled-button.component';

import { WelcomeBanner } from '../../interfaces/welcome-banner.interface';
import {
  browseQuizzesButtonConfig,
  quickBattleButtonConfig,
} from '../../configs/dashboard-buttons.config';
import { Router } from '@angular/router';
import { Navigations } from '../../../../../shared/enums/navigation';

@Component({
  selector: 'app-welcome-banner',
  imports: [MatIconModule, FilledButtonComponent],
  templateUrl: './welcome-banner.component.html',
  styleUrl: './welcome-banner.component.scss',
})
export class WelcomeBannerComponent {
  @Input() userDetails: WelcomeBanner;

  quickBattleConfig = quickBattleButtonConfig;
  browseQuizzesConfig = browseQuizzesButtonConfig;

  private readonly router = inject(Router);

  quickBattleNavigate() {
    this.router.navigate([Navigations.User, Navigations.Battles, Navigations.BattleList]);
  }

  browseQuizNavigate() {
    this.router.navigate([Navigations.User, Navigations.QuizList, Navigations.BrowseQuizzes]);
  }
}
