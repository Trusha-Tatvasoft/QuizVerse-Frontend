import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FilledButtonComponent } from '../../../../../shared/components/filled-button/filled-button.component';

import { WelcomeBanner } from '../../interfaces/welcome-banner.interface';
import {
  browseQuizzesButtonConfig,
  quickBattleButtonConfig,
} from '../../configs/dashboard-buttons.config';

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
}
