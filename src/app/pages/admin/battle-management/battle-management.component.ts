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
  private readonly destroy$ = new Subject<void>();
  private readonly battleService = inject(BattleManagementService);
  private readonly snackbar = inject(SnackbarService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

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

  private deleteQuiz(battleId: number) {
    this.battleService
      .deleteBattle(battleId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.statusCode === 200) {
            this.snackbar.showSuccess('Success', platformMessages.deleteBattleSuccess);
            this.loadBattles();
          } else {
            this.snackbar.showError('Error', res.message || platformMessages.deleteBattleFailure);
          }
        },
        error: (err) => {
          this.snackbar.showError(
            'Error',
            err?.error?.message || platformMessages.unavailableMessage,
          );
        },
      });
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

  openAddBattleDialgue() {
    this.router.navigate([
      `/${Navigations.Admin}/${Navigations.BattlesAdmin}/${Navigations.BattleCreation}`,
    ]);
  }

  editBattle(battleId: number) {
    const encodedId = btoa((battleId as number).toString());
    this.router.navigate([
      `/${Navigations.Admin}/${Navigations.BattlesAdmin}/${Navigations.BattleUpdation}`,
      encodedId,
    ]);
  }

  openConfirmationDialog(dialogData: ConfirmationDialogData, onConfirm: () => void): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '600px',
      disableClose: true,
      data: dialogData,
      panelClass: 'custom-dialog-radius',
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) onConfirm();
    });
  }

  deleteBattleDialog(battleId: number): void {
    this.openConfirmationDialog(deleteBattleDialog, () => this.deleteQuiz(battleId as number));
  }
}
