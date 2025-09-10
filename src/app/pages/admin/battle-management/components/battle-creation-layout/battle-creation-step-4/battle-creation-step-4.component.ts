import { Component, inject, Input } from '@angular/core';
import { TagComponent } from '../../../../../../shared/components/tag/tag.component';
import { OutlineButtonComponent } from '../../../../../../shared/components/outline-button/outline-button.component';
import { CommonModule } from '@angular/common';
import {
  BattleStep1Data,
  QuestionDifficultyXP,
  QuestionsList,
} from '../../../interfaces/battle-creation.interface';
import { MatDialog } from '@angular/material/dialog';
import { SnackbarService } from '../../../../../../shared/service/snackbar/snackbar.service';
import { BattleManagementService } from '../../../../../../services/admin/battle-management/battle-management.service';
import { exportCsvButtonConfig } from '../../../../quiz-management/configs/quiz-creation.config';
import { Subject, takeUntil } from 'rxjs';
import { TagInputConfig } from '../../../../../../shared/interfaces/tag-component.interface';
import {
  getTagConfigWithCustomization,
  getTagConfigWithDifficulty,
  getTypeTagConfigWithLabel,
} from '../../../../../../utils/quiz-crud-common-functions.utils';
import { platformMessages, quizCRUDMessages } from '../../../../../../utils/constants';
import { ExportQuizQuestionsRequestDto } from '../../../../../../shared/interfaces/quiz-creation.interface';
import { BattleCreationPreviewComponent } from '../battle-creation-preview/battle-creation-preview.component';
import { previewBattleButtonConfig } from '../../../configs/battle-creation.config';

@Component({
  selector: 'app-battle-creation-step-4',
  imports: [TagComponent, OutlineButtonComponent, CommonModule],
  templateUrl: './battle-creation-step-4.component.html',
  styleUrl: './battle-creation-step-4.component.scss',
})
export class BattleCreationStep4Component {
  // Input properties from parent component
  @Input() selectedQuestions: QuestionsList[] = []; // Array of selected questions for the battle
  @Input() battleStep1Data: BattleStep1Data; // Battle configuration data from step 1
  @Input() questionDifficultyOption: { value: number; label: string }[] = []; // Difficulty level options
  @Input() questionsDifficultyXPOption: QuestionDifficultyXP[] = []; // XP configuration for difficulty levels

  // Button configurations for UI
  exportCsvButton = exportCsvButtonConfig; // Configuration for CSV export button
  previewBattleButton = previewBattleButtonConfig; // Configuration for preview button

  // Injected services
  private readonly dialog = inject(MatDialog); // Dialog service for opening modals
  private readonly snackbar = inject(SnackbarService); // Snackbar service for notifications
  private readonly battleManagementService = inject(BattleManagementService); // Battle management service

  // Subject for managing component lifecycle and unsubscribing from observables
  private readonly destroy$ = new Subject<void>();

  /**
   * Calculates the total number of questions from battle step 1 data
   * @param data - Battle configuration data
   * @returns Total number of questions
   */
  totalQuestions(data: BattleStep1Data): number {
    return (Object.keys(data) as Array<Extract<keyof BattleStep1Data, string>>)
      .filter((key) => key.endsWith('Questions') && key !== 'totalQuestion')
      .reduce((sum, key) => sum + (Number(data[key]) || 0), 0);
  }

  /**
   * Gets the difficulty name by difficulty ID
   * @param id - Difficulty level ID
   * @returns Difficulty name or empty string if not found
   */
  getDifficultyName(id: number): string {
    return this.questionDifficultyOption.find((opt) => opt.value === id)?.label || '';
  }

  /**
   * Gets the XP value per question based on difficulty ID
   * @param id - Difficulty level ID
   * @returns XP value or 0 if not found
   */
  getXpPerQuestion(id: number): number {
    return (
      this.questionsDifficultyXPOption.find((opt) => opt.questionDifficultyId === id)?.xpGained || 0
    );
  }

  /**
   * Extracts and formats MCQ options from a question
   * @param q - Question object
   * @returns Comma-separated string of options or empty string
   */
  getMCQOptions(q: QuestionsList): string {
    if (!q.queOptionsAns) return '';
    return q.queOptionsAns
      .filter((opt) => opt.key === 'option')
      .map((opt) => opt.value)
      .join(', ');
  }

  /**
   * Extracts the correct answer from a question
   * @param q - Question object
   * @returns Answer value or empty string if not found
   */
  getAnswer(q: QuestionsList): string {
    if (!q.queOptionsAns) return '';
    const ans = q.queOptionsAns.find((opt) => opt.key === 'answer');
    return ans ? ans.value : '';
  }

  /**
   * Opens a preview dialog showing battle details and questions
   */
  openPreview() {
    if (!this.battleStep1Data) return;

    this.dialog.open(BattleCreationPreviewComponent, {
      width: '800px',
      height: '80vh',
      data: {
        name: this.battleStep1Data.name,
        description: this.battleStep1Data.description,
        tags: [
          getTagConfigWithCustomization(this.battleStep1Data.battleCategoryName!, false),
          getTagConfigWithCustomization(`${this.battleStep1Data.totalTime} minutes`, true),
          getTagConfigWithCustomization(
            `${this.totalQuestions(this.battleStep1Data)} questions`,
            true,
          ),
          getTagConfigWithCustomization(`${this.battleStep1Data.totalXp} Xp`, true),
          getTagConfigWithCustomization(`${this.battleStep1Data.battleTypeName}`, true),
          this.battleStep1Data.startDate && this.battleStep1Data.endDate
            ? getTagConfigWithCustomization(
                `${this.formatDate(this.battleStep1Data.startDate)} - ${this.formatDate(this.battleStep1Data.endDate)}`,
                true,
              )
            : undefined,
        ].filter((t): t is NonNullable<typeof t> => !!t),
        questions: this.selectedQuestions,
        questionsDifficulty: this.battleStep1Data.questionsDifficulty,
        questionDifficultyXP: this.questionsDifficultyXPOption,
      },
    });
  }

  /**
   * Gets tag configuration with label for UI display
   * @param q - Label text
   * @returns Tag configuration object
   */
  getTypeTagConfigWithLabelInCS(q: string): TagInputConfig {
    return getTypeTagConfigWithLabel(q);
  }

  /**
   * Gets tag configuration with difficulty styling for UI display
   * @param q - Difficulty text
   * @returns Tag configuration object
   */
  getTagConfigWithDifficultyInCS(q: string): TagInputConfig {
    return getTagConfigWithDifficulty(q);
  }

  /**
   * Exports selected questions to a CSV file
   */
  exportCsv(): void {
    if (!this.battleStep1Data?.name) {
      this.snackbar.showError(platformMessages.battleTitleNotFoundError);
      return;
    }

    const request: ExportQuizQuestionsRequestDto = {
      quizName: this.battleStep1Data.name,
      questions: this.selectedQuestions.map((q) => ({
        id: q.id,
        categoryId: q.categoryId ?? this.battleStep1Data.categoryId,
        queDifficultyId: q.queDifficultyId!,
        queText: q.queText,
        queTypeId: q.queTypeId!,
        queOptionsAns: (q.queOptionsAns || []).map((opt) => ({
          key: opt.key,
          value: opt.value,
        })),
      })),
    };

    this.battleManagementService
      .exportCsv(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          // Create and trigger download of CSV file
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${request.quizName}_questions.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: () => {
          this.snackbar.showError(quizCRUDMessages.failedToExportQuestions);
        },
      });
  }

  /**
   * Cleanup method to unsubscribe from observables when component is destroyed
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Formats a date string or Date object to a readable format
   * @param date - Date to format
   * @returns Formatted date string (e.g., "01 Jan 2023")
   */
  private formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
