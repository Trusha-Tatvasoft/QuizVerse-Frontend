import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import {
  questionCreationMethodsOptions,
  selectQuestionMethodDefaultButtonConfig,
  selectQuestionMethodPrimaryButtonConfig,
  selectQuestionMethodSecondaryButtonConfig,
} from '../../configs/quiz-creation.config';
import { OutlineButtonComponent } from '../../../../../shared/components/outline-button/outline-button.component';
import { FilledButtonComponent } from '../../../../../shared/components/filled-button/filled-button.component';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { quizCRUDMessages } from '../../../../../utils/constants';

@Component({
  selector: 'app-quiz-creation-step-2',
  imports: [OutlineButtonComponent, FilledButtonComponent, CommonModule, MatIcon],
  templateUrl: './quiz-creation-step-2.component.html',
  styleUrl: './quiz-creation-step-2.component.scss',
})
export class QuizCreationStep2Component {
  @Input() selectedIndexStep2: number | null = null;
  @Output() selectedIndexStep2Change = new EventEmitter<number>();

  private readonly snackbar = inject(SnackbarService);

  //button configs
  selectQuestionMethodPrimaryButton = selectQuestionMethodPrimaryButtonConfig;
  selectQuestionMethodSecondaryButton = selectQuestionMethodSecondaryButtonConfig;
  selectQuestionMethodDefaultButton = selectQuestionMethodDefaultButtonConfig;
  questionCreationMethodsOptionsStep2 = questionCreationMethodsOptions;

  selectCard(index: number): void {
    const root = document.documentElement;

    if (index === 0) {
      this.selectedIndexStep2 = index;
      root.style.setProperty('--selected-card-color', 'var(--global-secondary-color)');

      // Emit change to parent
      this.selectedIndexStep2Change.emit(this.selectedIndexStep2);
    } else if (index === 1) {
      this.selectedIndexStep2 = index;
      root.style.setProperty('--selected-card-color', 'var(--global-primary-color)');

      // Emit change to parent
      this.selectedIndexStep2Change.emit(this.selectedIndexStep2);
    } else {
      this.snackbar.showInfo(quizCRUDMessages.featureNotAvailable);
    }
  }
}
