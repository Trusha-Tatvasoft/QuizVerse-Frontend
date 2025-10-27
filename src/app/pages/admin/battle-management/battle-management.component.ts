import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { FilledButtonComponent } from '../../../shared/components/filled-button/filled-button.component';
import {
  battleHeaderConfig,
  createNewBattleConfig,
  deleteButtonConfig,
  editButtonConfig,
  loadMoreButtonConfig,
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
import { Router, RouterLink } from '@angular/router';
import { Navigations } from '../../../shared/enums/navigation';
import { ConfirmationDialogData } from '../../../shared/interfaces/confirmation-dialog.interface';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { deleteBattleDialog } from './configs/battle-delete-confirmation-dialog.config';

@Component({
  selector: 'app-battle-management',
  imports: [
    PageHeaderComponent,
    FilledButtonComponent,
    TagComponent,
    MatIcon,
    OutlineButtonComponent,
    CommonModule,
    RouterLink,
  ],
  templateUrl: './battle-management.component.html',
  styleUrls: [
    './battle-management.component.scss',
    '../quiz-difficulty-level/quiz-difficulty-level.component.scss',
  ],
})
export class BattleManagementComponent implements OnInit, OnDestroy {
  // UI configs for header and buttons
  userConfig = battleHeaderConfig;
  createBattleButtonConfig = createNewBattleConfig;
  deleteButtonConfig = deleteButtonConfig;
  editButtonConfig = editButtonConfig;
  loadMoreButtonConfig = loadMoreButtonConfig;
  batchNumber = 1;
  hasMoreData = false;

  // Holds mapped battle data for display
  battleData: ReturnType<typeof battleToBattleCardData>[] = [];

  // Injected services
  private readonly battleService = inject(BattleManagementService);
  private readonly snackbar = inject(SnackbarService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  // Used to clean up subscriptions on destroy
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Load battles when component initializes
    this.loadBattles();
  }

  // Fetch battles from backend
  loadBattles(): void {
    this.battleService
      .getBattles(this.batchNumber)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.result && res.data) {
            const records = res.data.battles ?? [];
            const mappedBattles = records.map(battleToBattleCardData);

            if (this.batchNumber === 1) {
              this.battleData = mappedBattles;
            } else {
              this.battleData = [...this.battleData, ...mappedBattles];
            }

            this.hasMoreData = res.data.hasMore;
          }
        },
        error: (err) => {
          this.snackbar.showError(
            platformMessages.errorTitle,
            err?.error?.message || platformMessages.errorMessage,
          );
        },
      });
  }

  // Navigate to battle creation page
  openAddBattleDialgue() {
    this.router.navigate([
      `/${Navigations.Admin}/${Navigations.BattlesAdmin}/${Navigations.BattleCreation}`,
    ]);
  }

  // Navigate to battle edit page
  editBattle(battleId: number) {
    const encodedId = btoa((battleId as number).toString());
    this.router.navigate([
      `/${Navigations.Admin}/${Navigations.BattlesAdmin}/${Navigations.BattleUpdation}`,
      encodedId,
    ]);
  }

  // Open confirmation dialog with given config and action
  openConfirmationDialog(dialogData: ConfirmationDialogData, onConfirm: () => void): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '600px',
      disableClose: false,
      data: dialogData,
      panelClass: 'custom-dialog-radius',
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) onConfirm();
    });
  }

  // Open delete battle confirmation dialog
  deleteBattleDialog(battleId: number): void {
    this.openConfirmationDialog(deleteBattleDialog, () => this.deleteQuiz(battleId as number));
  }

  loadMore(): void {
    if (!this.hasMoreData) return;
    this.batchNumber++;
    this.loadBattles();
  }

  ngOnDestroy(): void {
    // Cleanup subscriptions when component is destroyed
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Delete battle from backend and reload list
  private deleteQuiz(battleId: number) {
    this.battleService
      .deleteBattle(battleId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.statusCode === 200) {
            this.snackbar.showSuccess(
              platformMessages.successTitle,
              platformMessages.deleteBattleSuccess,
            );
            this.loadBattles();
          } else {
            this.snackbar.showError(
              platformMessages.errorTitle,
              res.message || platformMessages.deleteBattleFailure,
            );
          }
        },
        error: (err) => {
          this.snackbar.showError(
            platformMessages.errorTitle,
            err?.error?.message || platformMessages.errorMessage,
          );
        },
      });
  }
}
