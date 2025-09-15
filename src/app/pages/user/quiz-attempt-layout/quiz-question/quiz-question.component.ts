import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { QuizQuestions } from '../interfaces/quiz-attempt.interface';

@Component({
  selector: 'app-quiz-question',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatDividerModule,
    MatRadioModule,
    FormsModule,
  ],
  templateUrl: './quiz-question.component.html',
  styleUrls: ['./quiz-question.component.scss'],
})
export class QuizQuestionComponent {
  @Input() currentQuestionIndex!: number;
  @Input() currentQuestionData!: QuizQuestions;
  @Input() currentAnswer: string = '';

  @Output() answerChanged = new EventEmitter<string>();

  /** Emits answer back to parent */
  onAnswerChange(event: { value?: string } | Event | null | undefined): void {
    let value: string = '';

    if (event && 'value' in event) {
      value = event.value ?? '';
    } else if (event instanceof Event && event.target instanceof HTMLInputElement) {
      value = event.target.value;
    }

    this.answerChanged.emit(value);
  }
}
