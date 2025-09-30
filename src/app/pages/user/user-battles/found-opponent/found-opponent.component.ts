import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { PlayerProfileDTO } from '../interface/search-opponent.interface';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { autoBattleEndMessage, platformMessages } from '../../../../utils/constants';
import { Navigations } from '../../../../shared/enums/navigation';
import { DisableQuizShortcutsDirective } from '../../../../shared/Directives/disable-quiz-shortcuts.directive';
import { CheatPreventionService } from '../../../../shared/service/cheat-prevention/cheat-prevention.service';

@Component({
  selector: 'app-found-opponent',
  imports: [CommonModule, MatIcon, DisableQuizShortcutsDirective],
  templateUrl: './found-opponent.component.html',
  styleUrl: './found-opponent.component.scss',
})
export class FoundOpponentComponent {
  battleId: number | null = null;
  opponent: PlayerProfileDTO | null = null;
  isImageError: boolean = false;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();
  private readonly snackbar = inject(SnackbarService);
  private readonly cheatPrevention = inject(CheatPreventionService);
  private encodedId: string | null;

  ngOnInit(): void {
    this.decodeRouteId();
    this.redirectToBattle();

    this.cheatPrevention.startMonitoring();
    this.cheatPrevention.violations$.pipe(takeUntil(this.destroy$)).subscribe((reason) => {
      this.completeBattle(reason);
    });
  }

  completeBattle(reason: string): void {
    this.snackbar.showError(autoBattleEndMessage(reason));
    const doc = document as Document & {
      webkitExitFullscreen?: () => Promise<void>;
      msExitFullscreen?: () => void;
    };

    // Exit fullscreen only if currently active
    if (doc.fullscreenElement) {
      if (typeof doc.exitFullscreen === 'function') {
        doc.exitFullscreen().catch((err) => {
          this.snackbar.showError(platformMessages.failedToExitFullScreen, err);
        });
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    }

    this.router.navigate([Navigations.User, Navigations.Battles, Navigations.BattleList]); // put battle result route
  }

  redirectToBattle(): void {
    if (this.battleId && this.battleId > 0) {
      setTimeout(() => {
        this.router.navigate([Navigations.User, Navigations.Battles, Navigations.BattleList]); // put battle instrction route
      }, 2000);
    } else {
      this.snackbar.showError(platformMessages.invalideBattleId);
      this.router.navigate([Navigations.User, Navigations.Battles, Navigations.BattleList]);
    }
  }

  imageError() {
    this.isImageError = true;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.cheatPrevention.stopMonitoring();
  }

  private decodeRouteId(): void {
    this.encodedId = this.route.snapshot.paramMap.get('id');
    const state = history.state;
    if (!this.encodedId) {
      this.snackbar.showError(platformMessages.invalideBattleId);
      this.router.navigate([Navigations.User, Navigations.Battles, Navigations.BattleList]);
      return;
    }
    if (state?.opponent) {
      this.opponent = state.opponent;
    }
    try {
      const urlDecoded = decodeURIComponent(this.encodedId);
      const base64Decoded = atob(urlDecoded);
      const asNumber = Number(base64Decoded);

      if (!isNaN(asNumber) && asNumber > 0) {
        this.battleId = asNumber;
      } else {
        throw new Error(platformMessages.invalideBattleId);
      }
    } catch {
      this.snackbar.showError(platformMessages.invalideBattleId);
      this.battleId = null;
      this.router.navigate([Navigations.Battles, Navigations.BattleList]);
    }
  }
}
