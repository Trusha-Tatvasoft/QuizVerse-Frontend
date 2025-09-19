import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FilledButtonComponent } from '../../../../shared/components/filled-button/filled-button.component';
import { OutlineButtonComponent } from '../../../../shared/components/outline-button/outline-button.component';
import { ButtonConfig } from '../../../../shared/interfaces/button-config.interface';
import {
  challengeFriendButtonConfig,
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
import { Subject, takeUntil } from 'rxjs';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { platformMessages } from '../../../../utils/constants';

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
  loading = true;
  error: string | null = null;

  private readonly userBattlesService = inject(UserBattlesService);
  private readonly snakbarService = inject(SnackbarService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.availableBattles();
  }

  navigateToResult(battleId: number): void {
    const encodedId = btoa(battleId.toString());

    this.router.navigate([
      Navigations.User,
      Navigations.Battles,
      Navigations.BattleList,
      Navigations.QuizResult, //change this as per component name
      encodedId,
    ]);
  }

  navigateToBattle(battleId: number): void {
    const encodedId = btoa(battleId.toString());

    this.router.navigate([
      Navigations.User,
      Navigations.Battles,
      Navigations.BattleList,
      Navigations.QuizResult, //change this as per component name
      encodedId,
    ]);
  }

  navigateToChallengeFriend(battleId: number): void {
    const encodedId = btoa(battleId.toString());

    this.router.navigate([
      Navigations.User,
      Navigations.Battles,
      Navigations.BattleList,
      Navigations.QuizResult, //change this as per component name
      encodedId,
    ]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private availableBattles() {
    this.userBattlesService
      .getUserAvailableBattles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.result) {
            // enrich each battle with tags
            this.battles = response.data.map((battle) => ({
              ...battle,
              difficultyTag: getTagConfigWithCustomization(battle.difficulty, false),
            }));
          } else {
            this.error = response.message;
          }
          this.loading = false;
        },
        error: () => {
          this.snakbarService.showError(
            platformMessages.errorTitle,
            platformMessages.serverErrorTitle,
          );
        },
      });
  }
}
