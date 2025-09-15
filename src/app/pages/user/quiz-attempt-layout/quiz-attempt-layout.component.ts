import { Component, inject } from '@angular/core';
import { QuizQuestionComponent } from './quiz-question/quiz-question.component';
import {
  QuizQuestions,
  QuizStartResponse,
  SaveAndNextQuestionRequest,
  SavedQuizState,
  SubmitQuizRequest,
  VisitedQuestions,
} from './interfaces/quiz-attempt.interface';
import {
  disabledPreviousButtonConfig,
  disabledSaveAndNextButtonConfig,
  getquestionNoConfigWithLabel,
  markedFlagButtonConfig,
  markedForReviewButtonConfig,
  markFlagButtonConfig,
  markForReviewButtonConfig,
  previousButtonConfig,
  resumeQuizDialog,
  saveAndNextButtonConfig,
  submitButtonConfig,
  submitQuizDialog,
} from './configs/quiz-attempt.config';
import { TagInputConfig } from '../../../shared/interfaces/tag-component.interface';
import { VisitedQuestionStatus } from '../../../shared/enums/quiz-attempt.enum';
import { ProgressBarComponent } from '../../../shared/components/progress-bar/progress-bar.component';
import { FilledButtonComponent } from '../../../shared/components/filled-button/filled-button.component';
import { OutlineButtonComponent } from '../../../shared/components/outline-button/outline-button.component';
import { TagComponent } from '../../../shared/components/tag/tag.component';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { QuizAttemptService } from '../../../services/user/quiz-attempt/quiz-attempt.service';
import { Subject, takeUntil } from 'rxjs';
import { autoSubmitMessage, platformMessages, quizPlayStateKey } from '../../../utils/constants';
import { ConfirmationDialogData } from '../../../shared/interfaces/confirmation-dialog.interface';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Navigations } from '../../../shared/enums/navigation';
import {
  getQuestionNosGivenAnswer,
  getQuestionsCountByStatus,
  getQuestionStatus,
  markForReviewQuestion,
  markVisited,
} from '../../../utils/quiz-play-helper-functions.utils';

@Component({
  selector: 'app-quiz-attempt-layout',
  standalone: true,
  imports: [
    ProgressBarComponent,
    FilledButtonComponent,
    OutlineButtonComponent,
    QuizQuestionComponent,
    TagComponent,
    MatIcon,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatDividerModule,
    MatRadioModule,
    FormsModule,
    RouterLink,
  ],
  templateUrl: './quiz-attempt-layout.component.html',
  styleUrl: './quiz-attempt-layout.component.scss',
})
export class QuizAttemptLayoutComponent {
  currentQuestionIndex = 0;
  totalQuestions = 0;
  totalTime = 0; // Total time in minutes
  nextQuestionIndex = 0;

  quizStartData!: QuizStartResponse;
  currentQuestionData!: QuizQuestions;

  nextButtonConfig = saveAndNextButtonConfig;
  previousButtonConfig = previousButtonConfig;
  disabledNextButtonConfig = disabledSaveAndNextButtonConfig;
  disabledPreviousButtonConfig = disabledPreviousButtonConfig;
  markForReviewButtonConfig = markForReviewButtonConfig;
  markedForReviewButtonConfig = markedForReviewButtonConfig;
  markFlagButtonConfig = markFlagButtonConfig;
  markedFlagButtonConfig = markedFlagButtonConfig;
  submitButtonConfig = submitButtonConfig;

  visitedQuestions: VisitedQuestions[] = [];
  remainingSeconds!: number;
  timerInterval!: number;
  decodedId: number;
  isFullScreen = false;
  visitedQuestionStatus = VisitedQuestionStatus;
  reloadAttempted = false;

  private readonly snackbar = inject(SnackbarService);
  private readonly quizAttemptService = inject(QuizAttemptService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly destroy$ = new Subject<void>();
  private readonly QUIZ_STATE_KEY = quizPlayStateKey;

  ngOnInit(): void {
    // Try to enter fullscreen on load
    setTimeout(() => this.openFullscreen(), 0);

    // Keep track of fullscreen changes
    document.addEventListener('fullscreenchange', this.fullScreenHandler);
    window.addEventListener('beforeunload', this.beforeUnloadHandler);
    window.addEventListener('pageshow', this.pageShowHandler);
    // Check after each unload attempt
    this.enableCheatPrevention();
    this.decodeRouteId();
  }

  /**  Progress bar is now a getter so it always reflects latest state */
  get progressBarPercentage(): number {
    return this.totalQuestions !== 0
      ? (this.visitedQuestions.length / this.totalQuestions) * 100
      : 0;
  }

  get formattedTime(): string {
    const minutes = Math.floor(this.remainingSeconds / 60);
    const seconds = this.remainingSeconds % 60;
    return `${this.padZero(minutes)}:${this.padZero(seconds)}`;
  }

  decodeRouteId(): void {
    const encodedId = this.route.snapshot.paramMap.get('id');
    if (!encodedId) return;

    try {
      const asNumber = Number(atob(decodeURIComponent(encodedId)));

      if (!isNaN(asNumber)) {
        this.decodedId = asNumber;

        // Check if we have a saved state for this quiz
        const savedState = this.getSavedQuizState(this.decodedId);

        if (savedState) {
          this.restoreQuizState(savedState);
          this.snackbar.showSuccess(platformMessages.restoreQuizData);
        } else this.getQuizStartData(this.decodedId);
      } else {
        this.snackbar.showError(platformMessages.invalidQuizId);
        this.decodedId = 0;
      }
    } catch {
      this.snackbar.showError(platformMessages.invalidQuizId);
      this.decodedId = 0;
    }
  }

  /**  Load quiz data (demo) */
  getQuizStartData(quizId: number): void {
    this.quizAttemptService
      .startQuiz(quizId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) =>
          res.statusCode === 200 && res.result && res.data
            ? this.initializeQuiz(res.data)
            : this.handleQuizError(res.message),
        error: (err) => this.handleQuizError(err.error.message),
      });
  }

  markVisited(question: QuizQuestions, givenAnswer: string, currentQuestionNo: number): void {
    this.visitedQuestions = markVisited(
      this.visitedQuestions,
      question,
      givenAnswer,
      currentQuestionNo,
    );
    this.saveQuizState();
  }

  markForReviewQuestion(questionNo: number): void {
    this.visitedQuestions = markForReviewQuestion(
      this.visitedQuestions,
      questionNo,
      this.currentQuestionData,
    );
    this.saveQuizState();

    // force new object reference
    this.markForReviewButtonConfig = { ...markForReviewButtonConfig };
    this.markedForReviewButtonConfig = { ...markedForReviewButtonConfig };
  }

  getNextQuestion(): void {
    this.currentQuestionIndex++;
    if (this.currentQuestionIndex + 1 <= this.totalQuestions)
      this.loadQuestion(this.currentQuestionIndex + 1, this.currentQuestionIndex);
    else return this.snackbar.showError(platformMessages.lastQuestion);
  }

  /**  Navigate to previous question */
  goToPreviousQuestion(): void {
    const prevIndex = this.currentQuestionIndex - 1;

    if (prevIndex >= 0) {
      const previousQuestion = this.visitedQuestions.find(
        (vq) => vq.questionNo === prevIndex + 1, // questionNo is usually 1-based
      );

      if (previousQuestion) {
        if (this.currentQuestionIndex === this.totalQuestions - 1) {
          this.gotoQuestion(prevIndex + 1);
        } else {
          this.currentQuestionIndex = prevIndex;
          this.currentQuestionData = {
            questionId: previousQuestion.questionId,
            questionName: previousQuestion.questionName,
            questionTypeName: previousQuestion.questionTypeName,
            options: previousQuestion?.options,
          };
          const givenAnswer = previousQuestion ? previousQuestion.givenAnswer : '';
          this.markVisited(
            this.currentQuestionData,
            givenAnswer ?? '',
            this.currentQuestionIndex + 1,
          );
          this.saveQuizState();
        }
      } else this.gotoQuestion(prevIndex + 1);
    }
  }

  gotoQuestion(questionNo: number): void {
    const currentQuestionNo = this.currentQuestionIndex + 1;
    this.currentQuestionIndex = questionNo - 1;
    this.loadQuestion(this.currentQuestionIndex + 1, currentQuestionNo);
  }

  /**  Tag config helper */
  getquestionNoConfigWithLabel(): TagInputConfig {
    return getquestionNoConfigWithLabel(`${this.currentQuestionIndex + 1}/${this.totalQuestions}`);
  }

  getQuestionNosGivenAnswer(questionNo: number): string {
    return getQuestionNosGivenAnswer(this.visitedQuestions, questionNo);
  }

  getQuestionsCountByStatus(status: VisitedQuestionStatus): number {
    return getQuestionsCountByStatus(this.visitedQuestions, status);
  }

  getQuestionStatus(idx: number, status?: VisitedQuestionStatus): boolean {
    return getQuestionStatus(this.visitedQuestions, idx, status);
  }

  isSmallScreen(): boolean {
    return window.innerWidth < 550;
  }

  openConfirmationDialog(
    dialogData: ConfirmationDialogData,
    onConfirm: () => void,
    onCancelClick: () => void,
  ): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '600px',
      disableClose: true,
      data: dialogData,
      panelClass: 'custom-dialog-radius',
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) onConfirm();
      else onCancelClick();
    });
  }

  openSubmitDialog(): void {
    this.openConfirmationDialog(
      submitQuizDialog,
      () => this.submitQuiz(),
      () => null,
    );
  }

  submitQuiz(): void {
    if (this.isFullScreen) this.closeFullscreen();
    const payload: SubmitQuizRequest = {
      quizId: this.decodedId,
      quizName: this.quizStartData.quizName,
      timeTaken: this.totalTime * 60 - this.remainingSeconds,
      lastVisitedQuestionAndAnswers: {
        questionId: this.currentQuestionData.questionId,
        givenAnswer: this.getQuestionNosGivenAnswer(this.currentQuestionIndex + 1),
      },
    };
    this.quizAttemptService
      .submitQuiz(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.statusCode === 200 && res.result) {
            this.clearSavedQuizState();
            this.snackbar.showSuccess(platformMessages.quizSubmitSuccess);
            this.router.navigate(
              [
                Navigations.User,
                Navigations.QuizList,
                Navigations.BrowseQuizzes,
                Navigations.QuizResult,
                btoa(this.decodedId.toString()),
              ],
              { replaceUrl: true },
            );
          }
        },
        error: (err) => {
          const savedState = this.getSavedQuizState(this.decodedId);

          if (savedState) this.restoreQuizState(savedState);
          this.snackbar.showError(err.error.message);
        },
      });
  }

  openFullscreen(): void {
    const elem = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>;
      msRequestFullscreen?: () => void;
    };
    if (elem.requestFullscreen) elem.requestFullscreen();
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
    this.isFullScreen = true;
  }

  closeFullscreen(): void {
    const doc = document as Document & {
      webkitExitFullscreen?: () => Promise<void>;
      msExitFullscreen?: () => void;
    };
    if (typeof doc.exitFullscreen === 'function') doc.exitFullscreen();
    else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
    else if (doc.msExitFullscreen) doc.msExitFullscreen();
    this.isFullScreen = false;
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);

    //  Remove all global listeners
    document.removeEventListener('fullscreenchange', this.fullScreenHandler);
    document.removeEventListener('visibilitychange', this.visibilityHandler);
    window.removeEventListener('blur', this.blurHandler);
    window.removeEventListener('beforeunload', this.beforeUnloadHandler);
    window.removeEventListener('pageshow', this.pageShowHandler);
    this.clearSavedQuizState();

    //  Complete destroy$ so rxjs subs close
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeQuiz(data: QuizStartResponse): void {
    this.quizStartData = data;
    this.currentQuestionData = {
      questionId: data.quizQuestionId,
      questionTypeName: data.questionType,
      questionName: data.questionName,
      options: data.options,
    };
    this.totalQuestions = data.totalQuestion;
    this.totalTime = data.totalTime;
    this.markVisited(this.currentQuestionData, '', this.currentQuestionIndex + 1);
    this.startTimer();
    this.snackbar.showSuccess(platformMessages.startQuizMessage);
    this.saveQuizState();
  }

  private handleQuizError(message: string): void {
    this.snackbar.showError(message);
    const target = message.includes('completed')
      ? [
          Navigations.User,
          Navigations.QuizList,
          Navigations.BrowseQuizzes,
          Navigations.QuizResult,
          btoa(this.decodedId.toString()),
        ]
      : [Navigations.User, Navigations.QuizList, Navigations.BrowseQuizzes];

    this.router.navigate(target, { replaceUrl: true });
    this.closeFullscreen();
  }

  private loadQuestion(nextQuestionNumber: number, currentQuestionNo: number): void {
    const payLoad: SaveAndNextQuestionRequest = {
      quizId: this.decodedId,
      currentQuestionId: this.currentQuestionData.questionId,
      givenAnswer: this.getQuestionNosGivenAnswer(currentQuestionNo),
      nextQuestionNumber,
    };

    this.quizAttemptService
      .saveAndGetNextQuestion(payLoad)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.statusCode === 200 && res.result && res.data) {
            this.currentQuestionData = {
              questionId: res.data.quizQuestionId,
              questionName: res.data.questionName,
              questionTypeName: res.data.questionType,
              options: res.data.options,
            };

            const thisQuestion = this.visitedQuestions.find(
              (vq) => vq.questionNo === nextQuestionNumber,
            );
            const givenAnswer = thisQuestion ? thisQuestion.givenAnswer : '';
            this.markVisited(this.currentQuestionData, givenAnswer ?? '', nextQuestionNumber);
          }
        },
        error: (err) => this.snackbar.showError(err.error.message),
      });
  }

  private startTimer(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);

    if (this.remainingSeconds === undefined || this.remainingSeconds === null)
      this.remainingSeconds = this.totalTime * 60;

    this.timerInterval = window.setInterval(() => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds--;

        // Save state every 10 seconds to avoid too frequent writes
        if (this.remainingSeconds % 10 === 0) this.saveQuizState();
      } else {
        clearInterval(this.timerInterval);
        this.onTimeUp();
      }
    }, 1000);
  }

  private onTimeUp(): void {
    this.snackbar.showError(platformMessages.timeUp);
    setTimeout(() => {
      this.submitQuiz();
    }, 500); // slight delay to show message
  }

  private padZero(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  private onExitFullScreen(): void {
    this.snackbar.showError(platformMessages.fullScreenExit);
    setTimeout(() => this.submitQuiz(), 2000);
  }

  private readonly fullScreenHandler = () => {
    this.isFullScreen = !!document.fullscreenElement;
    if (!this.isFullScreen) this.onExitFullScreen();
  };

  private readonly visibilityHandler = () => {
    if (document.hidden) this.forceSubmit(platformMessages.switchTab);
  };

  private readonly blurHandler = () => {
    this.forceSubmit(platformMessages.windowsLostFocus);
  };

  private enableCheatPrevention(): void {
    //  Register with removable references
    document.addEventListener('visibilitychange', this.visibilityHandler);
    window.addEventListener('blur', this.blurHandler);

    // DevTools detection
    this.detectDevTools();
  }

  private detectDevTools(): void {
    const threshold = 160;
    const devToolsCheck = setInterval(() => {
      if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
      ) {
        this.forceSubmit(platformMessages.openedDeveloperTools);
        clearInterval(devToolsCheck); // stop after trigger
      }
    }, 1000);

    //  Auto-clear when component destroyed
    this.destroy$.subscribe(() => clearInterval(devToolsCheck));
  }

  private forceSubmit(reason: string): void {
    clearInterval(this.timerInterval);
    this.snackbar.showError(autoSubmitMessage(reason));
    setTimeout(() => this.submitQuiz(), 2000);
  }

  /**  Save quiz state to localStorage */
  private saveQuizState(): void {
    const quizState: SavedQuizState = {
      quizId: this.decodedId,
      currentQuestionIndex: this.currentQuestionIndex,
      remainingSeconds: this.remainingSeconds,
      visitedQuestions: this.visitedQuestions,
      quizStartData: this.quizStartData,
      currentQuestionData: this.currentQuestionData,
      timestamp: Date.now(),
    };

    localStorage.setItem(this.QUIZ_STATE_KEY, JSON.stringify(quizState));
  }

  /**  Get saved quiz state from localStorage */
  private getSavedQuizState(quizId: number): SavedQuizState | null {
    try {
      const savedState = localStorage.getItem(this.QUIZ_STATE_KEY);
      if (!savedState) return null;

      const parsedState: SavedQuizState = JSON.parse(savedState);

      // Check if the saved state is for the current quiz and is not too old (e.g., less than 1 day)
      if (parsedState.quizId === quizId && Date.now() - parsedState.timestamp < 24 * 60 * 60 * 1000)
        return parsedState;

      // Remove stale or incorrect quiz state
      localStorage.removeItem(this.QUIZ_STATE_KEY);
      return null;
    } catch (error) {
      this.snackbar.showError(
        error instanceof Error ? error.message : platformMessages.unKnownErrorMessage,
      );
      localStorage.removeItem(this.QUIZ_STATE_KEY);
      return null;
    }
  }

  /**  Restore quiz state from saved data */
  private restoreQuizState(savedState: SavedQuizState): void {
    this.currentQuestionIndex = savedState.currentQuestionIndex;
    this.remainingSeconds = savedState.remainingSeconds;
    this.visitedQuestions = savedState.visitedQuestions;
    this.quizStartData = savedState.quizStartData;
    this.currentQuestionData = savedState.currentQuestionData;
    this.totalQuestions = this.quizStartData.totalQuestion;
    this.totalTime = this.quizStartData.totalTime;
    this.startTimer();
  }

  /**  Clear saved quiz state */
  private clearSavedQuizState(): void {
    localStorage.removeItem(this.QUIZ_STATE_KEY);
  }

  // Handler implementation
  private readonly beforeUnloadHandler = (event: BeforeUnloadEvent) => {
    // Save state before leaving
    this.reloadAttempted = true;
    this.saveQuizState();

    // Show confirmation message
    return event;
  };

  private showResumeDialog(): void {
    this.openConfirmationDialog(
      resumeQuizDialog,
      () => this.openFullscreen(),
      () => this.submitQuiz(),
    );
  }

  private readonly pageShowHandler = () => {
    this.showResumeDialog();
  };
}
