import { Component, inject, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import {
  addDifficultyButtonConfig,
  deleteQuestionDifficultyDialog,
  questionDifficultyManagementHeaderConfig,
  questionDifficultyTableColumnsConfig,
} from './configs/question-difficulty.config';
import { FilledButtonComponent } from '../../../shared/components/filled-button/filled-button.component';
import { TableComponent } from '../../../shared/components/table/table.component';
import { TableData } from '../../../shared/interfaces/table-component.interface';
import { Subject, takeUntil } from 'rxjs';
import { QuestionDifficultyService } from '../../../services/admin/question-difficulty/question-difficulty.service';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { platformMessages, questionDifficultyMessages } from '../../../utils/constants';
import { questionDifficultyToTableData } from './question-difficulty.component.mapper';
import { ConfirmationDialogData } from '../../../shared/interfaces/confirmation-dialog.interface';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AddEditQuestionDifficultyComponent } from './Components/add-edit-question-difficulty/add-edit-question-difficulty.component';
import { QuestionDifficultyResponseDTO } from './interfaces/question-difficulty.interface';

@Component({
  selector: 'app-question-difficulty',
  imports: [PageHeaderComponent, FilledButtonComponent, TableComponent],
  templateUrl: './question-difficulty.component.html',
  styleUrl: './question-difficulty.component.scss',
})
export class QuestionDifficultyComponent implements OnInit, OnDestroy {
  // Configs
  questionDifficultyManagementHeaderConfiguration = questionDifficultyManagementHeaderConfig;
  addDifficultyButtonConfig = addDifficultyButtonConfig;
  columnsConfig = questionDifficultyTableColumnsConfig;

  tableDataSource: WritableSignal<TableData[]> = signal([]);

  // Dependencies
  private readonly snackbar = inject(SnackbarService);
  private readonly questionDifficultyService = inject(QuestionDifficultyService);
  private readonly dialog = inject(MatDialog);

  private readonly destroy$ = new Subject<void>();
  private questionDifficulties: QuestionDifficultyResponseDTO[] = [];

  ngOnInit(): void {
    this.loadQuestionDifficulties();
  }

  // Opens the dialog for adding or editing a question difficulty.
  openAddEditDifficultyDialog(questionDifficulty?: QuestionDifficultyResponseDTO): void {
    const dialogRef = this.dialog.open(AddEditQuestionDifficultyComponent, {
      width: '600px',
      disableClose: false,
      panelClass: 'custom-dialog-container',
      autoFocus: false,
      data: questionDifficulty || null,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.snackbar.showSuccess(platformMessages.successTitle, result);
          this.loadQuestionDifficulties();
        }
      });
  }

  // Handles actions from the table component such as edit and delete.
  handleAction(event: { action: string; row: TableData }): void {
    const index = event.row['id'] as number;
    if (event.action === 'delete') {
      this.openConfirmationDialog(deleteQuestionDifficultyDialog, () => {
        this.deleteQuestionDifficulty(index);
      });
    }
    if (event.action === 'edit') {
      this.openAddEditDifficultyDialog(this.questionDifficulties.find((x) => x.id === index));
    }
  }

  // Cleans up active subscriptions when the component is destroyed.
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Opens a confirmation dialog and executes the onConfirm callback if confirmed.
  private openConfirmationDialog(dialogData: ConfirmationDialogData, onConfirm: () => void): void {
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

  // Deletes a question difficulty by its ID and refreshes the list on success.
  private deleteQuestionDifficulty(id: number): void {
    this.questionDifficultyService
      .deleteQuestionDifficulty(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (!res.result || res.statusCode !== 200) {
            this.snackbar.showError(
              `${platformMessages.errorTitle}`,
              res.message || platformMessages.errorMessage,
            );
            return;
          }
          this.snackbar.showSuccess(
            platformMessages.successTitle,
            questionDifficultyMessages.deleteQuestionDifficulty,
          );
          this.loadQuestionDifficulties();
        },
        error: (err) => {
          this.snackbar.showError(
            platformMessages.errorTitle,
            err?.error?.message || platformMessages.errorMessage,
          );
        },
      });
  }

  // Loads all question difficulties from the backend and updates the table data source.
  private loadQuestionDifficulties(): void {
    this.questionDifficultyService
      .getAllQuestionDifficulties()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (!res.result || res.statusCode !== 200) {
            this.snackbar.showError(
              `${platformMessages.errorTitle}`,
              res.message || platformMessages.errorMessage,
            );
            this.tableDataSource.set([]);
            this.questionDifficulties = [];
            return;
          }

          this.questionDifficulties = res.data;
          this.tableDataSource.set(res.data.map(questionDifficultyToTableData));
        },
        error: (err) => {
          this.snackbar.showError(
            platformMessages.errorTitle,
            err?.error?.message || platformMessages.errorMessage,
          );
          this.tableDataSource.set([]);
          this.questionDifficulties = [];
        },
      });
  }
}
