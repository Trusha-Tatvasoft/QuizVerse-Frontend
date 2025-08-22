import { Component, inject, Input } from '@angular/core';
import { QuizPreviewComponent } from '../quiz-preview/quiz-preview.component';
import { MatDialog } from '@angular/material/dialog';
import { exportCsvButtonConfig, previewQuizButtonConfig } from '../../configs/quiz-creation.config';
import { TagInputConfig } from '../../../../../shared/interfaces/tag-component.interface';
import { TagComponent } from '../../../../../shared/components/tag/tag.component';
import { OutlineButtonComponent } from '../../../../../shared/components/outline-button/outline-button.component';
import { CommonModule } from '@angular/common';
import {
  ExportQuizQuestionsRequestDto,
  QuestionsList,
  QuizStep1Data,
} from '../../../../../shared/interfaces/quiz-creation.interface';
import {
  getTagConfigWithCustomization,
  getTagConfigWithDifficulty,
  getTypeTagConfigWithLabel,
} from '../../../../../utils/quiz-crud-common-functions.utils';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { QuizCreationService } from '../../../../../services/admin/quiz-management/quiz-creation/quiz-creation.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-quiz-creation-step-4',
  imports: [TagComponent, OutlineButtonComponent, CommonModule],
  templateUrl: './quiz-creation-step-4.component.html',
  styleUrl: './quiz-creation-step-4.component.scss',
})
export class QuizCreationStep4Component {
  @Input() selectedQuestions: QuestionsList[] = [];
  @Input() quizStep1Data: QuizStep1Data;

  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(SnackbarService);
  private readonly quizCreationService = inject(QuizCreationService);

  //button configs
  exportCsvButton = exportCsvButtonConfig;
  previewQuizButton = previewQuizButtonConfig;

  private readonly destroy$ = new Subject<void>();

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  totalQuestions(data: QuizStep1Data): number {
    return (Object.keys(data) as Array<Extract<keyof QuizStep1Data, string>>)
      .filter((key) => key.endsWith('Questions') && key !== 'totalQuestions')
      .reduce((sum, key) => sum + (Number(data[key]) || 0), 0);
  }

  getMCQOptions(q: QuestionsList): string {
    if (!q.queOptionsAns) return '';
    return q.queOptionsAns
      .filter((opt) => opt.key === 'option')
      .map((opt) => opt.value)
      .join(', ');
  }

  getAnswer(q: QuestionsList): string {
    if (!q.queOptionsAns) return '';
    const ans = q.queOptionsAns.find((opt) => opt.key === 'answer');
    return ans ? ans.value : '';
  }

  openPreview() {
    if (!this.quizStep1Data) return;

    this.dialog.open(QuizPreviewComponent, {
      width: '800px',
      height: '80vh',
      data: {
        quizName: this.quizStep1Data.quizTitle,
        description: this.quizStep1Data.description,
        tags: [
          getTagConfigWithCustomization(this.quizStep1Data.quizCategoryName!, false),
          getTagConfigWithCustomization(`${this.quizStep1Data.quizTiming} minutes`, true),
          getTagConfigWithCustomization(
            `${this.totalQuestions(this.quizStep1Data)} questions`,
            true,
          ),
        ],
        questions: this.selectedQuestions,
      },
    });
  }

  //get tag configuration with label dynamic
  getTypeTagConfigWithLabelInCS(q: string): TagInputConfig {
    return getTypeTagConfigWithLabel(q);
  }

  //get tag configuration with difficulty dynamic
  getTagConfigWithDifficultyInCS(q: string): TagInputConfig {
    return getTagConfigWithDifficulty(q);
  }

  exportCsv(): void {
    if (!this.quizStep1Data?.quizTitle) {
      this.snackbar.showError('Quiz name not found');
      return;
    }

    const request: ExportQuizQuestionsRequestDto = {
      quizName: this.quizStep1Data.quizTitle,
      questions: this.selectedQuestions.map((q) => ({
        id: q.id,
        categoryId: q.categoryId ?? this.quizStep1Data.quizCategory,
        queDifficultyId: q.queDifficultyId!,
        queText: q.queText,
        queTypeId: q.queTypeId!,
        queOptionsAns: (q.queOptionsAns || []).map((opt) => ({
          key: opt.key,
          value: opt.value,
        })),
      })),
    };

    this.quizCreationService
      .exportCsv(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${request.quizName}_questions.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: () => {
          this.snackbar.showError('Failed to export questions.');
        },
      });
  }
}
