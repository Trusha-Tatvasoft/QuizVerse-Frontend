import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subject, takeUntil } from 'rxjs';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { FilledButtonComponent } from '../../../../../shared/components/filled-button/filled-button.component';
import { platformMessages, quizRating } from '../../../../../utils/constants';
import { OutlineButtonComponent } from '../../../../../shared/components/outline-button/outline-button.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Router } from '@angular/router';
import { Navigations } from '../../../../../shared/enums/navigation';
import {
  submitRatingButtonConfig,
  backToDashboardButtonConfig,
} from '../../configs/quiz-result-buttons.configs';
import { QuizResultService } from '../../../../../services/user/quiz-result.service';
import { QuizRating } from '../../interfaces/quiz-ratting.interface';
import { DynamicFormField } from '../../../../../shared/interfaces/dynamic-form-field.interface';
import { quizRatingFormField } from '../../configs/quiz-rating-form-field.configs';

@Component({
  selector: 'app-quiz-rating',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    FilledButtonComponent,
    OutlineButtonComponent,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    CdkTextareaAutosize,
  ],
  templateUrl: './quiz-rating.component.html',
  styleUrls: ['./quiz-rating.component.scss'],
})
export class QuizRatingComponent implements OnInit, OnDestroy {
  submitRattingButtonConfig = submitRatingButtonConfig;
  dashboardButtonConfig = backToDashboardButtonConfig;

  @Input() quizId!: number;

  private readonly fb = inject(FormBuilder);
  private readonly snackbar = inject(SnackbarService);
  private readonly router = inject(Router);
  private readonly quizService = inject(QuizResultService);

  ratingForm!: FormGroup;
  stars = quizRating;
  private readonly destroy$ = new Subject<void>();
  ratingSubmitted = false; // lock after submission

  formFields: DynamicFormField[] = quizRatingFormField;

  ngOnInit(): void {
    this.initForm();

    if (this.quizId) {
      this.getMyQuizRatting();
    }
  }

  getMyQuizRatting() {
    this.quizService
      .getMyQuizRating(+this.quizId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.result && res.data) {
            this.ratingForm.patchValue({
              rating: res.data.quizRating,
              feedback: res.data.feedback ?? '',
            });
            this.ratingSubmitted = true;
          }
        },
        error: (res) => {
          this.snackbar.showError(platformMessages.errorTitle, res.message);
        },
      });
  }

  setRating(value: number): void {
    if (this.ratingSubmitted) return; // lock stars after submit

    const current = this.ratingForm.get('rating')?.value;
    if (current === value) {
      this.ratingForm.get('rating')?.setValue(0);
    } else {
      this.ratingForm.get('rating')?.setValue(value);
    }
  }

  get currentRating(): number {
    return this.ratingForm.get('rating')?.value || 0;
  }

  onSubmit(): void {
    if (this.ratingForm.invalid) {
      this.ratingForm.markAllAsTouched();
      return;
    }

    const payload: QuizRating = {
      quizId: this.quizId,
      quizRating: this.ratingForm.value.rating,
      feedback: this.ratingForm.value.feedback?.trim(),
    };

    this.quizService
      .submitQuizRating(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.snackbar.showSuccess(platformMessages.successTitle, res.message);
          this.ratingSubmitted = true; // lock UI
        },
        error: () => {
          this.snackbar.showError(platformMessages.errorTitle, 'Failed to submit rating.');
        },
      });
  }

  navigateToDashboard() {
    const route = `${Navigations.User}/${Navigations.Dashboard}`;
    this.router.navigate([route]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm() {
    const group: { [key: string]: any } = {};

    this.formFields.forEach((field) => {
      group[field.name] = [
        field.type === 'star-rating' ? 0 : '', // default value
        field.validators || [],
      ];
    });

    this.ratingForm = this.fb.group(group);
  }
}
