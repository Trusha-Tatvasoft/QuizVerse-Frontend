import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { QuizComments } from '../../interfaces/quiz-comments.interface';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { Subject, takeUntil } from 'rxjs';
import { QuizResultService } from '../../../../../services/user/quiz-result/quiz-result.service';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { loadMoreButtonConfig } from '../../configs/comment-section.config';
import { OutlineButtonComponent } from '../../../../../shared/components/outline-button/outline-button.component';
import {
  globalGetInitials,
  globalGetInitialsColorClass,
} from '../../../../../utils/get-profile-initials.utils';

@Component({
  selector: 'app-comment-section',
  imports: [CommonModule, MatIcon, MatIconModule, OutlineButtonComponent],
  templateUrl: './comment-section.component.html',
  styleUrl: './comment-section.component.scss',
})
export class CommentSectionComponent {
  @Input() quizId!: number; // Receive quizId from parent

  quizComments: QuizComments[] = [];
  hasMoreComments: boolean = true;
  totalComments: number = 0;
  batchNumber: number = 1;
  loadMoreButton = loadMoreButtonConfig;

  private readonly quizService = inject(QuizResultService);
  private readonly snackBarService = inject(SnackbarService);
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadComments();
    this.getTotalComments();
  }

  loadMoreComments(): void {
    if (this.hasMoreComments) {
      this.batchNumber++;
      this.loadComments();
    }
  }

  formatCommentDate(date: Date | string): string {
    const commentDate = new Date(date);
    const today = new Date();

    const diffTime = today.getTime() - commentDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;

    const day = commentDate.getDate().toString().padStart(2, '0');
    const month = commentDate.toLocaleString('en-US', { month: 'short' });
    const year = commentDate.getFullYear();

    return `${day} ${month} ${year}`;
  }

  // Return initials for a given name
  getInitials(name: string): string {
    return globalGetInitials(name);
  }

  // Return color class for user avatar based on name hash
  getInitialsColorClass(name: string): string {
    return globalGetInitialsColorClass(name);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getTotalComments(): void {
    this.quizService
      .getTotalComments(this.quizId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.statusCode === 200 && res.result && res.data) {
            this.totalComments = res.data;
          }
        },
        error: (err) => {
          this.snackBarService.showError(err.error.message);
        },
      });
  }

  private loadComments(): void {
    this.quizService
      .getComments(this.quizId, this.batchNumber)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.statusCode === 200 && res.result && res.data) {
            this.quizComments.push(...res.data.comments);
            this.hasMoreComments = res.data.hasMoreComments;
          } else {
            this.snackBarService.showError(res.message);
          }
        },
        error: (err) => {
          this.snackBarService.showError(err.error.message);
        },
      });
  }
}
