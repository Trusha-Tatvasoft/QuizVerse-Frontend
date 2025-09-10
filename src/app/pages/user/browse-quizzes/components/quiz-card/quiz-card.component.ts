import { Component, computed, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagComponent } from '../../../../../shared/components/tag/tag.component';
import { FilledButtonComponent } from '../../../../../shared/components/filled-button/filled-button.component';
import { MatIconModule } from '@angular/material/icon';
import { TagInputConfig } from '../../../../../shared/interfaces/tag-component.interface';
import { QuizListComponent } from '../quiz-list/quiz-list.component';
import { Router } from '@angular/router';
import { Navigations } from '../../../../../shared/enums/navigation';
import { QuizCardConfig } from '../../interfaces/browsr-quiz-request.interface';

@Component({
  selector: 'app-quiz-card',
  standalone: true,
  imports: [CommonModule, TagComponent, FilledButtonComponent, MatIconModule],
  templateUrl: './quiz-card.component.html',
  styleUrls: ['./quiz-card.component.scss'],
})
export class QuizCardComponent {
  private readonly quizList = inject(QuizListComponent);
  private readonly router = inject(Router);

  cardStyle = computed(() => this.quizList.cardStyle());

  @Input() cardConfig!: QuizCardConfig;

  displayTags = computed<TagInputConfig[]>(() => {
    const tags = this.cardConfig?.tags ?? [];
    if (tags.length <= 3) {
      return tags;
    }

    return [
      ...tags.slice(0, 3),
      {
        id: 'extra',
        label: `+${tags.length - 3} more`,
        type: 'static',
        isSelected: false,
        hasBorder: false,
        backgroundColor: 'lightPurple',
        textColor: 'black',
      } as TagInputConfig,
    ];
  });

  quizBtnClick() {
    const encodedId = btoa(this.cardConfig.id.toString());

    if (this.cardConfig.isAttempted) {
      // redirect to quiz result
      this.router.navigate([Navigations.QuizList, Navigations.Quizzes]);
    } else {
      // redirect to quiz play
      this.router.navigate([
        Navigations.User,
        Navigations.QuizList,
        Navigations.BrowseQuizzes,
        Navigations.QuizInstruction,
        encodedId,
      ]);
    }
  }
}
