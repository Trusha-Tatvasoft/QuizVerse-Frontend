import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { OutlineButtonComponent } from '../../../../../../shared/components/outline-button/outline-button.component';
import { FilledButtonComponent } from '../../../../../../shared/components/filled-button/filled-button.component';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { SnackbarService } from '../../../../../../shared/service/snackbar/snackbar.service';
import {
  questionCreationMethodsOptions,
  selectQuestionMethodDefaultButtonConfig,
  selectQuestionMethodPrimaryButtonConfig,
  selectQuestionMethodSecondaryButtonConfig,
} from '../../../../quiz-management/configs/quiz-creation.config';
import { quizCRUDMessages } from '../../../../../../utils/constants';

@Component({
  selector: 'app-battle-creation-step-2',
  imports: [OutlineButtonComponent, FilledButtonComponent, CommonModule, MatIcon],
  templateUrl: './battle-creation-step-2.component.html',
  styleUrl: './battle-creation-step-2.component.scss',
})
export class BattleCreationStep2Component {
  @Input() selectedIndexStep2: number | null = null; // Current selected index in step 2 (null means none selected)
  @Output() selectedIndexStep2Change = new EventEmitter<number>(); // Emits when selected index changes (notifies parent component)

  // Button configurations for step 2
  selectQuestionMethodPrimaryButton = selectQuestionMethodPrimaryButtonConfig;
  selectQuestionMethodSecondaryButton = selectQuestionMethodSecondaryButtonConfig;
  selectQuestionMethodDefaultButton = selectQuestionMethodDefaultButtonConfig;

  // Available question creation method options
  questionCreationMethodsOptionsStep2 = questionCreationMethodsOptions;

  // Snackbar service for showing messages
  private readonly snackbar = inject(SnackbarService);

  /**
   * Handles card selection in step 2.
   * If index = 0, apply selection and emit change.
   * Otherwise, show "feature not available" message.
   */
  selectCard(index: number): void {
    const root = document.documentElement;

    if (index === 0) {
      // Update selected index and apply style
      this.selectedIndexStep2 = index;
      root.style.setProperty('--selected-card-color', 'var(--global-secondary-color)');

      // Emit change to parent
      this.selectedIndexStep2Change.emit(this.selectedIndexStep2);
    } else {
      // Show info message for unavailable features
      this.snackbar.showInfo(quizCRUDMessages.featureNotAvailable);
    }
  }
}
