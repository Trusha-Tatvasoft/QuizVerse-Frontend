import { Component, inject, signal, WritableSignal } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import {
  addDifficultyButtonConfig,
  difficultyTableConfig,
  quizHeaderConfig,
} from './configs/quiz-difficulty-level.config';
import { TableComponent } from '../../../shared/components/table/table.component';
import { UserListingComponent } from '../user-management/components/user-table/user-listing.component';
import { FilledButtonComponent } from '../../../shared/components/filled-button/filled-button.component';
import { AddDifficultyLevelComponent } from './components/add-difficulty-level/add-difficulty-level.component';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { QuizDifficultyLevelService } from '../../../services/admin/quiz-difficulty-level/quiz-difficulty-level.service';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { TableData } from '../../../shared/interfaces/table-component.interface';
import { platformMessages } from '../../../utils/constants';

@Component({
  selector: 'app-quiz-difficulty-level',
  imports: [
    PageHeaderComponent,
    TableComponent,
    UserListingComponent,
    FilledButtonComponent,
    CommonModule,
  ],
  templateUrl: './quiz-difficulty-level.component.html',
  styleUrl: './quiz-difficulty-level.component.scss',
})
export class QuizDifficultyLevelComponent {
  private readonly difficultyService = inject(QuizDifficultyLevelService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(SnackbarService);

  userConfig = quizHeaderConfig;
  addDifficultyButtonConfig = addDifficultyButtonConfig;
  tableConfig = difficultyTableConfig;

  dataSource: WritableSignal<TableData[]> = signal([]);

  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.fetchDifficultyLevels();
  }

  fetchDifficultyLevels(): void {
    this.difficultyService
      .getAllQuizDifficulties()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (!res.result || res.statusCode !== 200) {
            this.snackbar.showError(
              `${platformMessages.errorTitle} ${res.statusCode}`,
              res.message || platformMessages.errorMessage,
            );
            this.dataSource.set([]);
            return;
          }
          this.dataSource.set(res.data);
        },
        error: (err) => {
          const message = err?.error?.message || platformMessages.errorMessage;
          this.snackbar.showError(`${platformMessages.errorTitle} ${err.statusCode}`, message);
          this.dataSource.set([]);
        },
      });
  }

  openAddDifficultyDialgue() {
    const dialogRef = this.dialog.open(AddDifficultyLevelComponent, {
      width: '600px',
      disableClose: false,
      panelClass: 'custom-dialog-container',
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.snackbar.showSuccess('Success', result);
      }
      this.fetchDifficultyLevels();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
