import { Component, inject, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import {
  addDifficultyButtonConfig,
  questionDifficultyManagementHeaderConfig,
  questionDifficultyTableColumnsConfig,
} from './configs/question-difficulty.config';
import { FilledButtonComponent } from '../../../shared/components/filled-button/filled-button.component';
import { TableComponent } from '../../../shared/components/table/table.component';
import { TableData } from '../../../shared/interfaces/table-component.interface';
import { Subject, takeUntil } from 'rxjs';
import { QuestionDifficultyService } from '../../../services/admin/question-difficulty/question-difficulty.service';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { platformMessages } from '../../../utils/constants';
import { questionDifficultyToTableData } from './question-difficulty.component.mapper';
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
          this.snackbar.showSuccess('Success', result);
          this.loadQuestionDifficulties();
        }
      });
  }

  // Handles actions from the table component such as edit.
  handleAction(event: { action: string; row: TableData }): void {
    const index = event.row['id'] as number;
    if (event.action === 'edit') {
      this.openAddEditDifficultyDialog(this.questionDifficulties.find((x) => x.id === index));
    }
  }

  // Cleans up active subscriptions when the component is destroyed.
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
              `${platformMessages.errorTitle} ${res.statusCode}`,
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
          const message = err?.error?.message || platformMessages.errorMessage;
          this.snackbar.showError(`${platformMessages.errorTitle} ${err.status}`, message);
          this.tableDataSource.set([]);
          this.questionDifficulties = [];
        },
      });
  }
}
