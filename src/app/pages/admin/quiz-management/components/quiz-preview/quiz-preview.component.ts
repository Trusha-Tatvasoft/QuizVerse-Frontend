import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

// Angular Material
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { TagComponent } from '../../../../../shared/components/tag/tag.component';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import {
  QueOptionsAndAnswers,
  QuestionsList,
  QuizPreviewData,
} from '../../../../../shared/interfaces/quiz-creation.interface';
// Your custom components

@Component({
  selector: 'app-quiz-preview',
  standalone: true,
  templateUrl: './quiz-preview.component.html',
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
  ],
})
export class QuizPreviewComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: QuizPreviewData,
    private readonly dialogRef: MatDialogRef<QuizPreviewComponent>,
  ) {}

  close() {
    this.dialogRef.close();
  }

  getOptions(q: QuestionsList): QueOptionsAndAnswers[] {
    return q.queOptionsAns?.filter((o) => o.key === 'option') || [];
  }

  getAnswer(q: QuestionsList): string {
    return q.queOptionsAns?.find((a) => a.key === 'answer')?.value || '';
  }

  getAnswerTF(q: QuestionsList): string {
    return q.queOptionsAns?.find((a) => a.key === 'answer')?.value.toLowerCase() || '';
  }
}
