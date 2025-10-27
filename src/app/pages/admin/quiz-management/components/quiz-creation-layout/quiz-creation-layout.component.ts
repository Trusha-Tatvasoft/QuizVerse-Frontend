import { Component, inject, ViewChild } from '@angular/core';
import {
  backButtonConfig,
  nextButtonConfig,
  publishQuizButtonConfig,
  quizCreationHeaderConfig,
  saveDraftButtonConfig,
  stepsToCreateQuiz,
} from '../../configs/quiz-creation.config';
import { CommonModule, Location } from '@angular/common';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { QuizCreationStep1Component } from '../quiz-creation-step-1/quiz-creation-step-1.component';
import { FilledButtonComponent } from '../../../../../shared/components/filled-button/filled-button.component';
import { OutlineButtonComponent } from '../../../../../shared/components/outline-button/outline-button.component';
import { QuizCreationStep2Component } from '../quiz-creation-step-2/quiz-creation-step-2.component';
import { QuizCreationStep4Component } from '../quiz-creation-step-4/quiz-creation-step-4.component';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import {
  QuestionOptionResponseDto,
  QuestionResponseDto,
  QuestionsList,
  QuizResponse,
  QuizStep1Data,
  SaveQuizRequest,
  TagsList,
} from '../../../../../shared/interfaces/quiz-creation.interface';
import { QuizCreationService } from '../../../../../services/admin/quiz-management/quiz-creation/quiz-creation.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Navigations } from '../../../../../shared/enums/navigation';
import { platformMessages, quizCRUDMessages } from '../../../../../utils/constants';
import { Subject, takeUntil } from 'rxjs';
import { QuizCreationStep3LayoutComponent } from '../quiz-creation-step-3-layout/quiz-creation-step-3-layout.component';
import { QuizStatus } from '../../../../../shared/enums/quiz-management.enum';

@Component({
  selector: 'app-quiz-creation-layout',
  imports: [
    CommonModule,
    PageHeaderComponent,
    QuizCreationStep1Component,
    QuizCreationStep2Component,
    QuizCreationStep4Component,
    QuizCreationStep3LayoutComponent,
    FilledButtonComponent,
    OutlineButtonComponent,
  ],
  templateUrl: './quiz-creation-layout.component.html',
  styleUrl: './quiz-creation-layout.component.scss',
})
export class QuizCreationLayoutComponent {
  @ViewChild(QuizCreationStep1Component) step1Component!: QuizCreationStep1Component;
  @ViewChild(QuizCreationStep2Component) step2Component!: QuizCreationStep2Component;
  @ViewChild(QuizCreationStep3LayoutComponent) step3Component!: QuizCreationStep3LayoutComponent;
  @ViewChild(QuizCreationStep4Component) step4Component!: QuizCreationStep4Component;

  private readonly snackbar = inject(SnackbarService);
  private readonly quizCreationService = inject(QuizCreationService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly route = inject(ActivatedRoute);

  // Header configs
  quizCreationHeaderConfiguration = quizCreationHeaderConfig;

  // Button config
  nextButton = nextButtonConfig;
  backButton = backButtonConfig;
  saveDraftButton = saveDraftButtonConfig;
  publishQuizButton = publishQuizButtonConfig;

  // Other config
  steps = stepsToCreateQuiz;

  private readonly destroy$ = new Subject<void>();
  readonly maxSteps = 4;
  activeStep: number = 1;

  //for data transfer between steps components
  isValidSelectedQuestions: boolean = false;
  selectedQuestions: QuestionsList[] = [];
  quizStep1Data: QuizStep1Data;
  selectedIndexStep2: number | null = null;

  //edit
  decodedId: number;
  isEditMode: boolean = false;

  ngOnInit(): void {
    this.decodeRouteId();
  }

  ngAfterViewInit(): void {
    if (this.decodedId) this.loadQuiz(this.decodedId);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  //fetch quiz id for edit
  private decodeRouteId(): void {
    const encodedId = this.route.snapshot.paramMap.get('id');
    if (!encodedId) return;

    try {
      const urlDecoded = decodeURIComponent(encodedId);
      const base64Decoded = atob(urlDecoded);
      const asNumber = Number(base64Decoded);

      if (!isNaN(asNumber)) {
        this.decodedId = asNumber;
        this.getEditQuizConfig();
      } else {
        this.snackbar.showError(quizCRUDMessages.invalideQuizId);
        this.decodedId = 0;
      }
    } catch {
      this.snackbar.showError(quizCRUDMessages.invalideQuizId);
      this.decodedId = 0;
    }
  }

  private getEditQuizConfig() {
    this.quizCreationHeaderConfiguration = {
      ...quizCreationHeaderConfig,
      title: quizCRUDMessages.editQuizTitle,
      subtitle: quizCRUDMessages.editQuizSubtitle,
    };

    this.steps = stepsToCreateQuiz.map((step, index) =>
      index === 0
        ? {
            ...step,
            heading: quizCRUDMessages.editQuizTitle,
          }
        : step,
    );
  }

  /** Go back to the previous page */
  goBack(): void {
    this.location.back();
  }

  //used by step 1 child component to update data
  step1ValueChange(val: QuizStep1Data) {
    // copy val first
    const updated: QuizStep1Data = { ...val };

    // build difficultyDistribution from keys ending in "Questions", skip totalQuestions
    updated.difficultyDistribution = Object.keys(val)
      .filter(
        (key): key is keyof QuizStep1Data => key.endsWith('Questions') && key !== 'totalQuestions',
      )
      .map((key) => ({
        key,
        value: Number(val[key] ?? 0),
      }));

    this.quizStep1Data = updated;
  }

  //used by step 3 child component to update data
  updateSelectedQuestions(questions: QuestionsList[]) {
    this.selectedQuestions = [...questions];
  }

  //used by step 3 child component to update selected question valid boolean
  validSelectedQuestionsChange(isValid: boolean) {
    this.isValidSelectedQuestions = isValid;
  }

  getStepClass(index: number): string {
    return index + 1 <= this.activeStep ? 'step-active' : 'step-inactive';
  }

  getTextClass(index: number): string {
    return index + 1 <= this.activeStep ? 'text-active' : 'text-inactive';
  }

  //navigation for steps
  goToNextStep(): void {
    if (this.activeStep === 1 && !this.step1Component.submitStep1Form()) {
      return;
    } else if (this.activeStep === 2 && !(this.step2Component.selectedIndexStep2 === 0)) {
      this.snackbar.showError(quizCRUDMessages.questionCreationMethodSelectError);
      return;
    } else if (this.activeStep === 3) {
      if (this.step3Component.selectedQuestions.length != this.quizStep1Data?.totalQuestions) {
        this.snackbar.showError(
          quizCRUDMessages.totalQuestionsError(this.quizStep1Data?.totalQuestions),
        );
        return;
      }
      if (!this.isValidSelectedQuestions) {
        this.snackbar.showError(quizCRUDMessages.difficultyWiseQuestionSelectionError);
        return;
      }
    }
    if (this.activeStep < this.maxSteps) {
      this.activeStep++;
    }
  }

  goToPreviousStep(): void {
    if (this.activeStep > 1) {
      this.activeStep--;
    }
  }

  mapToSaveQuizRequest(
    quizStep1Data: QuizStep1Data,
    selectedQuestions: QuestionsList[],
  ): SaveQuizRequest {
    return {
      // Direct mappings
      name: quizStep1Data.quizTitle,
      categoryId: quizStep1Data.quizCategory,
      description: quizStep1Data.description,
      totalTime: Number(quizStep1Data.quizTiming),
      difficultyLevelId: quizStep1Data.difficultyLevel,
      totalQuestion: Number(quizStep1Data.totalQuestions),
      isPaid: quizStep1Data.isPaid === true,
      price: quizStep1Data.isPaid === true ? Number(quizStep1Data.price || 0) : undefined,

      // Default status
      status: QuizStatus.Active,

      // Tags mapping
      tags: (quizStep1Data.tags || []).map((tagName: string) => ({
        name: tagName,
      })),

      // Questions mapping
      questions: selectedQuestions.map((q) => ({
        id: q.id,
        categoryId: q.categoryId ?? quizStep1Data.quizCategory,
        queDifficultyId: q.queDifficultyId!,
        queText: q.queText,
        queTypeId: q.queTypeId!,
        queOptionsAns: (q.queOptionsAns || []).map((opt) => ({
          key: opt.key,
          value: opt.value,
        })),
      })),

      noOfQuestionsPerDifficulty: (this.quizStep1Data?.difficultyDistribution || []).map((d) => ({
        queDifficultyName: d.key.replace(/Questions$/, ''),
        noOfQuestions: d.value,
      })),
    };
  }

  //save quiz req
  saveQuiz(): void {
    if (!this.quizStep1Data || !this.selectedQuestions.length) {
      return;
    }

    const payload: SaveQuizRequest = this.mapToSaveQuizRequest(
      this.quizStep1Data,
      this.selectedQuestions,
    );

    //edit quiz
    if (this.isEditMode) payload.id = this.decodedId;

    // Call the service
    this.quizCreationService
      .createOrUpdateQuiz(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackbar.showSuccess(platformMessages.successTitle, quizCRUDMessages.quizSaved);
          this.router.navigate([Navigations.Admin, Navigations.Quizzes]);
        },
        error: (err) => {
          this.snackbar.showError(
            platformMessages.errorTitle,
            err?.error?.message || platformMessages.errorMessage,
          );
        },
      });
  }

  //draft quiz req
  draftQuiz(): void {
    if (this.activeStep === 1 && !this.step1Component.submitStep1Form()) {
      return;
    } else if (this.activeStep === 2 && !(this.step2Component.selectedIndexStep2 === 0)) {
      this.snackbar.showError(quizCRUDMessages.questionCreationMethodSelectError);
      return;
    } else if (this.activeStep === 3) {
      if (this.step3Component.selectedQuestions.length != this.quizStep1Data?.totalQuestions) {
        this.snackbar.showError(
          quizCRUDMessages.totalQuestionsError(this.quizStep1Data?.totalQuestions),
        );
        return;
      }
      if (!this.isValidSelectedQuestions) {
        this.snackbar.showError(quizCRUDMessages.difficultyWiseQuestionSelectionError);
        return;
      }
    }

    const payload: SaveQuizRequest = this.mapToSaveQuizRequest(
      this.quizStep1Data,
      this.selectedQuestions,
    );

    payload.status = QuizStatus.Draft;
    //edit quiz
    if (this.isEditMode) payload.id = this.decodedId;

    // Call the service
    this.quizCreationService
      .createOrUpdateQuiz(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackbar.showSuccess(platformMessages.successTitle, quizCRUDMessages.quizDrafSaved);
          this.router.navigate([Navigations.Admin, Navigations.Quizzes]);
        },
        error: (err) => {
          this.snackbar.showError(
            platformMessages.errorTitle,
            err?.error?.message || platformMessages.errorMessage,
          );
        },
      });
  }

  //mapping of data
  mapBackendQuizResponse(backendResponse: QuizResponse): void {
    const quizStep1Data: QuizStep1Data = {
      quizTitle: backendResponse.name,
      quizCategory: backendResponse.categoryId,
      description: backendResponse.description,
      quizTiming: backendResponse.totalTime,
      difficultyLevel: backendResponse.difficultyLevelId,
      isPaid: backendResponse.isPaid,
      price: backendResponse.price,
      totalQuestions: backendResponse.totalQuestion,
      tags: backendResponse.tags?.map((tag: TagsList) => tag.name) || [],
      difficultyDistribution: (backendResponse.noOfQuestionsPerDifficulty || []).map((d) => ({
        key: d.queDifficultyName.toLowerCase() + 'Questions',
        value: d.noOfQuestions,
      })),
    };

    const selectedQuestions: QuestionsList[] = (backendResponse.questions ?? []).map(
      (q: QuestionResponseDto) => ({
        id: q.id,
        categoryId: q.categoryId,
        queDifficultyId: q.queDifficultyId,
        queText: q.queText,
        queTypeId: q.queTypeId,
        queOptionsAns: (q.queOptionsAns ?? []).map((opt: QuestionOptionResponseDto) => ({
          id: opt.id,
          questionId: opt.questionId,
          key: opt.key,
          value: opt.value,
        })),
      }),
    );
    this.selectedQuestions = selectedQuestions;
    this.quizStep1Data = quizStep1Data;
    this.step1Component.initializeForm();
  }

  loadQuiz(quizId: number) {
    this.quizCreationService
      .getQuiz(quizId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.mapBackendQuizResponse(res.data);
          this.isEditMode = true;
        },
        error: (err) => {
          const errorMessage = err?.error?.message || platformMessages.errorMessage;
          if (errorMessage.includes('playing')) {
            this.router.navigate([Navigations.Admin, Navigations.Quizzes]);
          }
          this.snackbar.showError(platformMessages.errorTitle, errorMessage);
        },
      });
  }

  categoryChanged() {
    this.selectedQuestions = [];
  }
}
