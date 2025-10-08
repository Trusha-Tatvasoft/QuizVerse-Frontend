import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { Navigations } from '../../../../../shared/enums/navigation';
import { FilledButtonComponent } from '../../../../../shared/components/filled-button/filled-button.component';
import { backToDashboardButtonConfig } from '../../../quiz-result-page/configs/quiz-result-buttons.configs';
import { BattleHubService } from '../../../../../services/user/user-battles/battle-hub.service';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { BattleCompletionResult } from '../../interfaces/battle-completion.interface';
import { platformMessages } from '../../../../../utils/constants';

@Component({
  selector: 'app-waiting-battle-result',
  templateUrl: './waiting-battle-result.component.html',
  styleUrls: ['./waiting-battle-result.component.scss'],
  imports: [FilledButtonComponent],
  standalone: true,
})
export class WaitingBattleResultComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly battleHubService = inject(BattleHubService);
  private readonly snackbar = inject(SnackbarService);
  private readonly destroy$ = new Subject<void>();

  dashboardButtonConfig = backToDashboardButtonConfig;
  decodedBattleId!: number;

  ngOnInit(): void {
    this.decodeRouteId();

    // Connect to BattleHub if not connected
    this.subscribeToBattleEnded();
  }

  /**
   * Decode the battle ID from route params
   */
  decodeRouteId(): void {
    const encodedId = this.route.snapshot.paramMap.get('id');
    if (encodedId) {
      try {
        const urlDecoded = decodeURIComponent(encodedId);
        const base64Decoded = atob(urlDecoded);
        this.decodedBattleId = Number(base64Decoded);
      } catch {
        this.decodedBattleId = 0;
        this.snackbar.showError(platformMessages.errorTitle, platformMessages.invalidBattleId);
      }
    } else {
      this.snackbar.showError(platformMessages.errorTitle, platformMessages.invalidBattleId);
      this.decodedBattleId = 0;
    }
  }

  /**
   * Redirect user to dashboard
   */
  redirectToDashboard(): void {
    this.router.navigate([`${Navigations.User}/${Navigations.Dashboard}`]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.battleHubService.cleanupBattleSubjects) {
      this.battleHubService.cleanupBattleSubjects();
    }
    if (this.battleHubService.stopConnection) {
      this.battleHubService.stopConnection();
    }
  }

  private subscribeToBattleEnded(): void {
    // Ensure connection
    if (!this.battleHubService.connected) {
      this.battleHubService.connect();
    }

    // Subscribe to battle ended event
    this.battleHubService.onBattleEnded
      .pipe(takeUntil(this.destroy$))
      .subscribe((battleCompletion: BattleCompletionResult) => {
        if (battleCompletion?.battleStatus > 0) {
          const encodedId = btoa(encodeURIComponent(this.decodedBattleId));
          this.router.navigate([
            `${Navigations.User}/${Navigations.Battles}/${Navigations.BattleList}/${Navigations.BattleResult}/${encodedId}`,
          ]);
        }
      });
  }
}
