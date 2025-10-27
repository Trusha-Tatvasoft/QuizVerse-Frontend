import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TagComponent } from '../../../../../../shared/components/tag/tag.component';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import {
  BattlePreviewData,
  QueOptionsAndAnswers,
  QuestionsList,
} from '../../../interfaces/battle-creation.interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-battle-creation-preview',
  imports: [
    CommonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatDividerModule,
    TagComponent,
    MatRadioModule,
    FormsModule,
    MatIcon,
  ],
  templateUrl: './battle-creation-preview.component.html',
  styleUrl: './battle-creation-preview.component.scss',
})
export class BattleCreationPreviewComponent {
  // Inject dialog data containing battle preview information
  data = inject<BattlePreviewData>(MAT_DIALOG_DATA);

  // Reference to the dialog for closing operations
  private readonly dialogRef = inject(MatDialogRef<BattleCreationPreviewComponent>);

  /**
   * Closes the preview dialog
   */
  close() {
    this.dialogRef.close();
  }

  /**
   * Retrieves all option entries (non-answer choices) for a question
   * @param q - The question object
   * @returns Array of option objects with key 'option'
   */
  getOptions(q: QuestionsList): QueOptionsAndAnswers[] {
    return q.queOptionsAns?.filter((o) => o.key === 'option') || [];
  }

  /**
   * Retrieves the correct answer for a question
   * @param q - The question object
   * @returns The answer value or empty string if not found
   */
  getAnswer(q: QuestionsList): string {
    return q.queOptionsAns?.find((a) => a.key === 'answer')?.value || '';
  }

  /**
   * Retrieves the boolean answer in lowercase for consistent comparison
   * @param q - The question object
   * @returns The boolean answer value in lowercase or empty string
   */
  getBoolAnswer(q: QuestionsList): string {
    return q.queOptionsAns?.find((a) => a.key === 'answer')?.value.toLowerCase() || '';
  }

  /**
   * Gets the difficulty level name based on difficulty ID
   * @param id - Difficulty level ID
   * @returns The difficulty name or empty string if not found
   */
  getDifficultyLabel(id?: number): string {
    return (
      this.data.questionDifficultyXP.find((x) => x.questionDifficultyId === id)
        ?.questionDifficultyName || ''
    );
  }

  /**
   * Gets the XP gained for a question based on difficulty ID
   * @param id - Difficulty level ID
   * @returns The XP value or 0 if not found
   */
  getXpPerQuestion(id?: number): number {
    return this.data.questionDifficultyXP.find((x) => x.questionDifficultyId === id)?.xpGained || 0;
  }

  /**
   * Gets the time allocated per question based on difficulty ID
   * @param id - Difficulty level ID
   * @returns The time in seconds or 0 if not found
   */
  getTimePerQuestion(id?: number): number {
    return (
      this.data.questionsDifficulty.find((d) => d.queDifficultyId === id)?.timePerQuestion || 0
    );
  }
}
