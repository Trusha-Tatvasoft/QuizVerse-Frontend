import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { FilledButtonComponent } from '../../../shared/components/filled-button/filled-button.component';
import {
  battleHeaderConfig,
  createNewBattleConfig,
  deleteButtonConfig,
  editButtonConfig,
} from './configs/battle-managment.config';
import { TagComponent } from '../../../shared/components/tag/tag.component';
import { MatIcon } from '@angular/material/icon';
import { OutlineButtonComponent } from '../../../shared/components/outline-button/outline-button.component';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { BattleManagementService } from '../../../services/admin/battle-management/battle-management.service';
import { battleToBattleCardData } from './battle-management-list.mapper';
import { platformMessages } from '../../../utils/constants';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';

@Component({
  selector: 'app-battle-management',
  imports: [
    PageHeaderComponent,
    FilledButtonComponent,
    TagComponent,
    MatIcon,
    OutlineButtonComponent,
    CommonModule,
  ],
  templateUrl: './battle-management.component.html',
  styleUrls: [
    './battle-management.component.scss',
    '../quiz-difficulty-level/quiz-difficulty-level.component.scss',
  ],
})
export class BattleManagementComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly battleService = inject(BattleManagementService);
  private readonly snackbar = inject(SnackbarService);

  userConfig = battleHeaderConfig;
  createBattleButtonConfig = createNewBattleConfig;
  deleteButtonConfig = deleteButtonConfig;
  editButtonConfig = editButtonConfig;

  battleData: ReturnType<typeof battleToBattleCardData>[] = [];

  ngOnInit(): void {
    this.loadBattles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBattles() {
    this.battleService
      .getBattles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (battles) => {
          this.battleData = battles;
        },
        error: (err) => {
          const message = err?.error?.message || platformMessages.errorMessage;
          this.snackbar.showError(`${platformMessages.errorTitle} ${err.statusCode}`, message);
        },
      });
  }

  openAddBattleDialgue() {}
  editBattle() {}
  deleteBattle() {}
}
