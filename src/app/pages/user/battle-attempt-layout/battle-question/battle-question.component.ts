import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { BattleQuestion } from '../interfaces/battle-attempt.interface';
import { nextQuestionButtonConfig } from '../configs/battle-attempt.config';
import { FilledButtonComponent } from '../../../../shared/components/filled-button/filled-button.component';

@Component({
  selector: 'app-battle-question',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatRadioModule,
    MatIconModule,
    FilledButtonComponent,
  ],
  templateUrl: './battle-question.component.html',
  styleUrls: ['./battle-question.component.scss'],
})
export class BattleQuestionComponent {
  @Input() currentQuestionIndex!: number;
  @Input() currentQuestionData!: BattleQuestion;
  @Input() currentAnswer: string = '';
  @Input() showCorrectAnswer: boolean = false;
  @Input() correctAnswer: string = '';
  @Input() isUserAnswerCorrect: boolean = false;
  @Input() userAnswer: string = '';
  @Output() answerChanged = new EventEmitter<string>();
  typedAnswer: string = '';
  nextQuesBtnConfig = nextQuestionButtonConfig;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentQuestionIndex'] && !changes['currentQuestionIndex'].firstChange) {
      this.typedAnswer = '';
    }

    if (changes['showCorrectAnswer'] || changes['userAnswer']) {
      if (this.showCorrectAnswer && this.userAnswer) {
        this.typedAnswer = this.userAnswer;
      }
    }

    if (!this.showCorrectAnswer && changes['showCorrectAnswer']?.previousValue === true) {
      this.typedAnswer = '';
    }
  }

  submitAnswer() {
    const answer: string = this.typedAnswer?.trim() || '';
    this.answerChanged.emit(answer);
    this.typedAnswer = '';
    this.currentAnswer = '';
  }

  onAnswerChange(event: MatRadioChange | MatSelectChange | Event): void {
    let value = '';

    if ('value' in event) {
      value = (event as MatRadioChange | MatSelectChange).value;
    } else if (event instanceof Event && event.target instanceof HTMLInputElement) {
      value = event.target.value;
    }

    this.currentAnswer = value;
    this.answerChanged.emit(value);
  }
}
