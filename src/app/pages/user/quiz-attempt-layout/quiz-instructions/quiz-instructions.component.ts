import { Component, inject } from '@angular/core';
import { FilledButtonComponent } from '../../../../shared/components/filled-button/filled-button.component';
import { OutlineButtonComponent } from '../../../../shared/components/outline-button/outline-button.component';
import { CommonModule } from '@angular/common';
import { TagComponent } from '../../../../shared/components/tag/tag.component';
import { MatIcon } from '@angular/material/icon';
import { QuizInstructionsResponse } from '../interfaces/quiz-attempt.interface';
import {
  backToBrowseQuizButtonConfig,
  startQuizButtonConfig,
} from '../configs/quiz-attempt.config';
import { TagInputConfig } from '../../../../shared/interfaces/tag-component.interface';
import { getTagConfigWithDifficulty } from '../../../../utils/quiz-crud-common-functions.utils';
import { TagColor } from '../../../../utils/types/tag-component.type';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { QuizAttemptService } from '../../../../services/user/quiz-attempt/quiz-attempt.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { platformMessages } from '../../../../utils/constants';
import { Navigations } from '../../../../shared/enums/navigation';

@Component({
  selector: 'app-quiz-instructions',
  imports: [FilledButtonComponent, OutlineButtonComponent, CommonModule, TagComponent, MatIcon],
  templateUrl: './quiz-instructions.component.html',
  styleUrl: './quiz-instructions.component.scss',
})
export class QuizInstructionsComponent {
  quizInstructions: QuizInstructionsResponse;
  startQuizButtonConfig = startQuizButtonConfig;
  backToBrowseQuizButtonConfig = backToBrowseQuizButtonConfig;
  decodedId: number;

  // Injected services
  private readonly snackbar = inject(SnackbarService);
  private readonly quizAttemptService = inject(QuizAttemptService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.decodeRouteId();
  }

  /** Decode quiz ID from route param (base64 encoded) */
  decodeRouteId(): void {
    const encodedId = this.route.snapshot.paramMap.get('id');
    if (!encodedId) return;

    try {
      const urlDecoded = decodeURIComponent(encodedId);
      const base64Decoded = atob(urlDecoded);
      const asNumber = Number(base64Decoded);

      if (!isNaN(asNumber)) {
        this.decodedId = asNumber;
        this.getQuizInstructions(this.decodedId);
      } else {
        this.snackbar.showError(platformMessages.invalidQuizId);
        this.decodedId = 0;
      }
    } catch {
      this.snackbar.showError(platformMessages.invalidQuizId);
      this.decodedId = 0;
    }
  }

  /** Fetch quiz instructions from API */
  getQuizInstructions(quizId: number): void {
    this.quizAttemptService
      .getQuizInstructions(quizId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.statusCode === 200 && res.result && res.data) {
            this.quizInstructions = res.data;
          } else {
            this.snackbar.showError(res.message);
            this.router.navigate(['/user/quizzes/browse-quizzes']);
          }
        },
        error: (err) => {
          this.snackbar.showError(err.message);
          this.router.navigate(['/user/quizzes/browse-quizzes']);
        },
      });
  }

  /** Build tag config for quiz category */
  getQuizCategoryTagConfig(): TagInputConfig {
    const label = `${this.quizInstructions.quizCategoryName}`;
    return {
      id: label.toLowerCase(),
      label,
      type: 'static',
      isSelected: false,
      hasBorder: true,
      backgroundColor: 'white',
      textColor: 'black',
    };
  }

  /** Build tag config for difficulty */
  getDifficultyTagConfig(): TagInputConfig {
    return getTagConfigWithDifficulty(this.quizInstructions.quizDifficultyName);
  }

  /** Build tag config for Paid/Free */
  getTagConfigForIsPaid(): TagInputConfig {
    let backgroundColor: TagColor;
    let textColor: TagColor;

    switch (this.quizInstructions.isPaid) {
      case true:
        backgroundColor = 'lightRed';
        textColor = 'red';
        break;
      case false:
        backgroundColor = 'lightGreen';
        textColor = 'green';
        break;
    }

    return {
      id: this.quizInstructions.isPaid ? 'paid' : 'free',
      label: this.quizInstructions.isPaid ? 'Paid' : 'Free',
      type: 'static',
      isSelected: false,
      hasBorder: false,
      backgroundColor,
      textColor,
    };
  }

  /** Build tag config for quiz price */
  getpriceTagConfig(): TagInputConfig {
    const label = `₹ ${this.quizInstructions.quizPrice}`;
    return {
      id: label.toLowerCase(),
      label,
      type: 'static',
      isSelected: false,
      hasBorder: true,
      backgroundColor: 'white',
      textColor: 'black',
    };
  }

  /** Navigate to quiz attempt screen */
  startQuiz() {
    const encodedId = btoa((this.decodedId as number).toString());
    this.router.navigate([
      Navigations.User,
      Navigations.QuizList,
      Navigations.QuizAttempt,
      encodedId,
    ]);
  }

  /** Navigate back to browse quiz list */
  backToBrowseQuiz() {
    this.router.navigate([Navigations.User, Navigations.QuizList, Navigations.BrowseQuizzes]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
