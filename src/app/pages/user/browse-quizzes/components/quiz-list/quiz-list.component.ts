import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizCardComponent } from '../quiz-card/quiz-card.component';
import { BrowseQuizzesComponent } from '../../browse-quizzes.component';
import { QuizCardConfig } from '../../interfaces/browsr-quiz-request.interface';

@Component({
  selector: 'app-quiz-list',
  standalone: true,
  imports: [CommonModule, QuizCardComponent],
  templateUrl: './quiz-list.component.html',
  styleUrl: './quiz-list.component.scss',
})
export class QuizListComponent {
  private readonly parent = inject(BrowseQuizzesComponent);

  tabId = computed(() => this.parent.currentTabId());

  cardStyle = computed(() => (this.tabId() === 'featured' ? 'featured' : 'normal'));

  get quizzes(): QuizCardConfig[] {
    return this.parent.quizzes;
  }
}
