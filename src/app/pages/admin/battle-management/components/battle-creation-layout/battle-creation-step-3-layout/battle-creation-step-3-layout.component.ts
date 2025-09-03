import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { TableComponent } from '../../../../../../shared/components/table/table.component';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { BattleCreationStep3Option1Component } from './battle-creation-step-3-option-1/battle-creation-step-3-option-1.component';
import { BattleCreationStep3Option2Component } from './battle-creation-step-3-option-2/battle-creation-step-3-option-2.component';
import { BattleCreationStep3Option3Component } from './battle-creation-step-3-option-3/battle-creation-step-3-option-3.component';
import { BattleStep1Data, QuestionsList } from '../../../interfaces/battle-creation.interface';
import { SnackbarService } from '../../../../../../shared/service/snackbar/snackbar.service';
import { MatDialog } from '@angular/material/dialog';
import {
  questionAdditionOptionsInManualMethod,
  columns,
  deleteQuestionDialog,
} from '../../../../quiz-management/configs/quiz-creation.config';
import { TableData } from '../../../../../../shared/interfaces/table-component.interface';
import { tablePaginationConfig } from '../../../../../../utils/constants';
import { Subject, takeUntil } from 'rxjs';
import { TagInputConfig } from '../../../../../../shared/interfaces/tag-component.interface';
import {
  getTagConfigWithDifficulty,
  getTypeTagConfigWithLabel,
} from '../../../../../../utils/quiz-crud-common-functions.utils';
import { ConfirmationDialogData } from '../../../../../../shared/interfaces/confirmation-dialog.interface';
import { ConfirmationDialogComponent } from '../../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { DropDownType } from '../../../../../../shared/enums/dropdown-types.enum';
import { BattleManagementService } from '../../../../../../services/admin/battle-management/battle-management.service';

@Component({
  selector: 'app-battle-creation-step-3-layout',
  imports: [
    TableComponent,
    CommonModule,
    MatIcon,
    BattleCreationStep3Option1Component,
    BattleCreationStep3Option2Component,
    BattleCreationStep3Option3Component,
  ],
  templateUrl: './battle-creation-step-3-layout.component.html',
  styleUrl: './battle-creation-step-3-layout.component.scss',
})
export class BattleCreationStep3LayoutComponent {
  // Inputs from parent component
  @Input() selectedQuestions: QuestionsList[] = []; // Selected questions list
  @Input() battleStep1Data: BattleStep1Data; // Data from step 1 of battle creation
  @Input() isValidSelectedQuestions = false; // Validation flag for selected questions

  // Outputs to parent component
  @Output() selectedQuestionsChange = new EventEmitter<QuestionsList[]>();
  @Output() validSelectedQuestionsChange = new EventEmitter<boolean>();

  // Config and state variables
  questionAdditionOptionsInManualMethodStep3 = questionAdditionOptionsInManualMethod;
  questionsTableData: TableData[] = []; // Table display data
  columns = columns; // Table column definitions
  pageSizeOptions: number[] = tablePaginationConfig.PageSizeOptions;
  pageSizeSelected = tablePaginationConfig.PageSize;
  selectedQuestionMethodInManualAdditionIndex: number; // Index of selected addition method
  dataSource = signal<QuestionsList[]>([]); // Signal-based reactive source
  totalItems = signal(0); // Total items count
  questionDifficultyOption: { value: number; label: string }[] = []; // Difficulty dropdown options
  questionTypeOptions: { value: number; label: string }[] = []; // Question type dropdown options
  isInnerStep3: boolean = false; // Whether inside a sub-step
  selectedQuestionsTableData: QuestionsList[] = []; // For displaying selected questions
  totalQuestionsSelected = 0; // Count of selected questions
  currentPageSelected = 1; // Current page for pagination

  // Services
  private readonly battleManagementService = inject(BattleManagementService);
  private readonly snackbar = inject(SnackbarService);
  private readonly dialog = inject(MatDialog);

  private readonly destroy$ = new Subject<void>(); // For unsubscribing observables

  ngOnInit() {
    this.getDropDownsData(); // Load dropdowns from API
    this.updateSelectedQuestionsTable(); // Initialize selected questions table
    this.updateSelectedQuestionsValidity(); // Check initial validity
  }

  /**
   * Fill missing labels (difficulty/type) in selected questions using dropdown data
   */
  fillMissingLabelsForSelectedQuestions() {
    if (!this.selectedQuestions || !Array.isArray(this.selectedQuestions)) {
      this.selectedQuestions = [];
      return;
    }

    this.selectedQuestions = this.selectedQuestions.map((q) => {
      const updatedQuestion = { ...q };

      // Fill difficulty name if missing
      if (!updatedQuestion.queDifficultyName && this.questionDifficultyOption?.length) {
        const difficulty = this.questionDifficultyOption.find(
          (d) => d.value === updatedQuestion.queDifficultyId,
        );
        if (difficulty) {
          updatedQuestion.queDifficultyName = difficulty.label;
        }
      }

      // Fill type name if missing
      if (!updatedQuestion.queTypeName && this.questionTypeOptions?.length) {
        const type = this.questionTypeOptions.find((t) => t.value === updatedQuestion.queTypeId);
        if (type) {
          updatedQuestion.queTypeName = type.label;
        }
      }
      return updatedQuestion;
    });

    this.updateSelectedQuestionsTable();
  }

  // Get tag config for displaying type labels
  getTypeTagConfigWithLabelInCS(q: string | undefined): TagInputConfig {
    return getTypeTagConfigWithLabel(q || 'Unknown');
  }

  // Get tag config for displaying difficulty labels
  getTagConfigWithDifficultyInCS(q: string | undefined): TagInputConfig {
    return getTagConfigWithDifficulty(q || 'Unknown');
  }

  // Handle card click for selecting manual addition method
  cardClick(index: number): void {
    this.selectedQuestionMethodInManualAdditionIndex = index;
    this.isInnerStep3 = true;
  }

  // Get difficulty label by value
  getDifficultyLabel(value: number): string {
    const option = this.questionDifficultyOption.find((opt) => opt.value === value);
    return option?.label || '';
  }

  /**
   * Fetch dropdown data for question difficulty and type
   */
  getDropDownsData() {
    // Difficulty dropdown
    this.battleManagementService
      .getDropDownData(DropDownType.QuestionDifficulty)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (Array.isArray(response.data)) {
            this.questionDifficultyOption = response.data.map((item) => ({
              value: item.id,
              label: item.name,
            }));
          }
        },
        error: (err) => {
          this.snackbar.showError(err);
        },
      });

    // Type dropdown
    this.battleManagementService
      .getDropDownData(DropDownType.QuestionType)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (Array.isArray(response.data)) {
            this.questionTypeOptions = response.data.map((item) => ({
              value: item.id,
              label: item.name,
            }));
          }
          this.fillMissingLabelsForSelectedQuestions();
        },
        error: (err) => {
          this.snackbar.showError(err);
        },
      });
  }

  // Check if a question is already selected
  isQuestionSelected(id: number): boolean {
    return this.selectedQuestions.some((q) => q.id === id);
  }

  /**
   * Update selected questions table with pagination
   */
  updateSelectedQuestionsTable() {
    this.selectedQuestions = this.selectedQuestions || [];

    const start = (this.currentPageSelected - 1) * this.pageSizeSelected;
    const end = start + this.pageSizeSelected;

    this.questionsTableData = this.selectedQuestions.slice(start, end).map((q, index) => ({
      queText: q.queText,
      queTypeName: { tagConfig: this.getTypeTagConfigWithLabelInCS(q.queTypeName) },
      queDifficultyName: { tagConfig: this.getTagConfigWithDifficultyInCS(q.queDifficultyName) },
      action: [{ icon: 'delete', tooltip: 'Delete Question' }],
      index: start + index,
    }));

    // If page has no data, go back one page
    if (this.questionsTableData.length === 0 && this.currentPageSelected > 1) {
      this.currentPageSelected = this.currentPageSelected - 1;
      this.updateSelectedQuestionsTable();
      return;
    }

    this.totalQuestionsSelected = this.selectedQuestions.length;
    this.selectedQuestionsChange.emit(this.selectedQuestions);
    this.updateSelectedQuestionsValidity();
  }

  // Handle pagination change
  pageChangeTableSelectedQuestions(event: { pageIndex: number; pageSize: number }) {
    this.currentPageSelected = event.pageIndex + 1;
    this.pageSizeSelected = event.pageSize;
    this.updateSelectedQuestionsTable();
  }

  // Handle delete question action
  handleDeleteAction(event: { action: string; row: TableData }): void {
    if (event.action === 'delete') {
      this.openConfirmationDialog(deleteQuestionDialog, () => {
        const index = event.row['index'] as number;
        this.selectedQuestions.splice(index, 1);

        this.totalQuestionsSelected = this.selectedQuestions.length;
        this.updateSelectedQuestionsTable();
      });
    }
  }

  // Open confirmation dialog
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

  // Validate selected questions and emit result
  updateSelectedQuestionsValidity(): void {
    const isValid = this.areAllSelectedQuestionsWithinLimit();
    this.isValidSelectedQuestions = isValid;
    this.validSelectedQuestionsChange.emit(this.isValidSelectedQuestions);
  }

  // Handle selected questions change from inner components
  selectedQuestionsChangeFromInnerStep3OptionsParent(questions: QuestionsList[]) {
    this.selectedQuestions = [...questions];
    this.totalQuestionsSelected = this.selectedQuestions.length;
    this.fillMissingLabelsForSelectedQuestions();
    this.updateSelectedQuestionsTable();
  }

  // Close manual addition sub-step
  closeQuestionAdditionOptionParent() {
    this.isInnerStep3 = false;
  }

  // Cleanup subscriptions
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Validate whether all selected questions are within allowed limits
   */
  private areAllSelectedQuestionsWithinLimit(): boolean {
    if (!this.battleStep1Data || !Array.isArray(this.selectedQuestions)) {
      return true;
    }

    // Count questions per difficulty
    const difficultyCounts: Record<number, number> = {};
    this.selectedQuestions.forEach((question) => {
      const difficultyId = question.queDifficultyId;
      if (difficultyId === null || difficultyId === undefined) return;
      difficultyCounts[difficultyId] = (difficultyCounts[difficultyId] || 0) + 1;
    });

    // Validate difficulty-specific limits
    for (const dist of this.battleStep1Data.questionsDifficulty ?? []) {
      const difficultyId = dist.queDifficultyId;
      const difficultyLimit = dist.noOfQues ?? 0;
      const count = difficultyCounts[difficultyId] ?? 0;

      if (count > difficultyLimit) {
        return false;
      }
    }

    // Validate total question limit
    const totalLimit = Number(this.battleStep1Data.totalQuestion ?? 0);
    if (this.selectedQuestions.length > totalLimit) {
      return false;
    }

    return true;
  }
}
