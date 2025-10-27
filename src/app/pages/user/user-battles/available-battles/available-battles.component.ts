import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FilledButtonComponent } from '../../../../shared/components/filled-button/filled-button.component';
import { OutlineButtonComponent } from '../../../../shared/components/outline-button/outline-button.component';
import { ButtonConfig } from '../../../../shared/interfaces/button-config.interface';
import {
  challengeFriendButtonConfig,
  loadMoreButtonConfig,
  quickBattleButtonConfig,
  waitingResultButtonConfig,
} from '../configs/quiz-battles-button.configs';
import { UserBattlesService } from '../../../../services/user/user-battles/user-battles.service';
import { AvailableBattle } from '../interface/quiz-battles.interface';
import { getTagConfigWithCustomization } from '../../../../utils/quiz-crud-common-functions.utils';
import { TagComponent } from '../../../../shared/components/tag/tag.component';
import { TagInputConfig } from '../../../../shared/interfaces/tag-component.interface';
import { Router } from '@angular/router';
import { Navigations } from '../../../../shared/enums/navigation';
import { distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { platformMessages } from '../../../../utils/constants';
import { BattleData } from '../interface/battle-data.interface';
import { MatDialog } from '@angular/material/dialog';
import { ChallengeFriendComponent } from './components/challenge-friend/challenge-friend.component';

@Component({
  selector: 'app-available-battles',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    FilledButtonComponent,
    OutlineButtonComponent,
    TagComponent,
  ],
  templateUrl: './available-battles.component.html',
  styleUrl: './available-battles.component.scss',
})
export class AvailableBattlesComponent implements OnInit, OnDestroy {
  quickBattle: ButtonConfig = quickBattleButtonConfig;
  challengeFriend: ButtonConfig = challengeFriendButtonConfig;
  waitingResultButtonConfig: ButtonConfig = waitingResultButtonConfig;
  battles: (AvailableBattle & { difficultyTag: TagInputConfig })[] = [];
  error: string | null = null;
  runFirstTime: boolean = true;
  loadMoreButtonConfig = loadMoreButtonConfig;
  batchNumber = 1;
  hasMoreData = false;

  private readonly userBattlesService = inject(UserBattlesService);
  private readonly snakbarService = inject(SnackbarService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();
  private readonly dialog = inject(MatDialog);
  private readonly updateBattleResults$ = this.userBattlesService.updateBattleResultsObservable$;

  ngOnInit(): void {
    this.availableBattles();

    this.updateBattleResults$
      .pipe(takeUntil(this.destroy$), distinctUntilChanged())
      .subscribe((update) => {
        if (!this.runFirstTime) {
          if (update) {
            setTimeout(() => {
              this.availableBattles();
              this.userBattlesService.updateBattleResults$.next(false);
            }, 100);
          }
        }
        this.runFirstTime = false;
      });
  }

  navigateToResult(battleId: number): void {
    const encodedId = btoa(battleId.toString());

    this.router.navigate([
      Navigations.User,
      Navigations.Battles,
      Navigations.BattleList,
      Navigations.QuizResult, // replace with correct target component
      encodedId,
    ]);
  }

  navigateToBattle(battle: AvailableBattle & { difficultyTag: TagInputConfig }): void {
    if (this.isDevToolsOpen()) {
      this.snakbarService.showError(platformMessages.inspectOpenBattle);
      return;
    }
    const encodedId = btoa(battle.battleId.toString());
    const battleData: BattleData = {
      battleName: battle.battleName,
      battleCategory: battle.category,
      battleXp: battle.maxXP,
      battleDifficulty: battle.difficulty,
    };
    this.router.navigate(
      [
        Navigations.User,
        Navigations.Battles,
        Navigations.BattleList,
        Navigations.SearchOpponent, // replace with correct target component
        encodedId,
      ],
      {
        state: { battleData }, // pass battle object
      },
    );
  }

  openChallengeFriendDialgue(battle: AvailableBattle) {
    const dialogRef = this.dialog.open(ChallengeFriendComponent, {
      width: '600px',
      disableClose: false,
      panelClass: 'custom-dialog-container',
      autoFocus: false,
      data: {
        battleId: battle.battleId,
        battleName: battle.battleName,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.availableBattles();
      }
    });
  }

  loadMore(): void {
    if (!this.hasMoreData) return;
    this.batchNumber++;
    this.availableBattles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private availableBattles() {
    this.userBattlesService
      .getUserAvailableBattles(this.batchNumber)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.result) {
            // enrich each battle with tags
            const mappedBattles = response.data.battles.map((battle) => ({
              ...battle,
              difficultyTag: getTagConfigWithCustomization(battle.difficulty, false),
            }));

            if (this.batchNumber === 1) {
              this.battles = mappedBattles;
            } else {
              this.battles = [...this.battles, ...mappedBattles];
            }

            this.hasMoreData = response.data.hasMore;
          } else {
            this.error = response.message;
          }
        },
        error: () => {
          this.snakbarService.showError(
            platformMessages.errorTitle,
            platformMessages.serverErrorTitle,
          );
        },
      });
  }

  private isDevToolsOpen(): boolean {
    const threshold = 160; // pixels, typical devtools width/height
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    return widthThreshold || heightThreshold;
  }
}
