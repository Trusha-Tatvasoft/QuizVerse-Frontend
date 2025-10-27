import { Component, inject, ViewChild } from '@angular/core';
import { BattleCreationStep1Component } from './battle-creation-step-1/battle-creation-step-1.component';
import { BattleCreationStep2Component } from './battle-creation-step-2/battle-creation-step-2.component';
import { BattleCreationStep4Component } from './battle-creation-step-4/battle-creation-step-4.component';
import { BattleCreationStep3LayoutComponent } from './battle-creation-step-3-layout/battle-creation-step-3-layout.component';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  battleCreationHeaderConfig,
  publishBattleButtonConfig,
  stepsToCreateBattle,
} from '../../configs/battle-creation.config';
import {
  backButtonConfig,
  nextButtonConfig,
} from '../../../quiz-management/configs/quiz-creation.config';
import { Subject, takeUntil } from 'rxjs';
import {
  BattleQuestionDifficulty,
  BattleResponse,
  BattleStep1Data,
  QuestionDifficultyXP,
  QuestionResponseDto,
  QuestionsList,
  SaveBattleRequest,
} from '../../interfaces/battle-creation.interface';
import { CommonModule, Location } from '@angular/common';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { OutlineButtonComponent } from '../../../../../shared/components/outline-button/outline-button.component';
import { FilledButtonComponent } from '../../../../../shared/components/filled-button/filled-button.component';
import { platformMessages, quizCRUDMessages } from '../../../../../utils/constants';
import { BattleManagementService } from '../../../../../services/admin/battle-management/battle-management.service';
import { Navigations } from '../../../../../shared/enums/navigation';

@Component({
  selector: 'app-battle-creation-layout',
  imports: [
    CommonModule,
    PageHeaderComponent,
    FilledButtonComponent,
    OutlineButtonComponent,
    BattleCreationStep1Component,
    BattleCreationStep2Component,
    BattleCreationStep3LayoutComponent,
    BattleCreationStep4Component,
  ],
  templateUrl: './battle-creation-layout.component.html',
  styleUrl: './battle-creation-layout.component.scss',
})
export class BattleCreationLayoutComponent {
  // ViewChild references to step components
  @ViewChild(BattleCreationStep1Component) step1Component!: BattleCreationStep1Component;
  @ViewChild(BattleCreationStep2Component) step2Component!: BattleCreationStep2Component;
  @ViewChild(BattleCreationStep3LayoutComponent)
  step3Component!: BattleCreationStep3LayoutComponent;
  @ViewChild(BattleCreationStep4Component) step4Component!: BattleCreationStep4Component;

  // Configuration and UI properties
  battleCreationHeaderConfiguration = battleCreationHeaderConfig;
  nextButton = nextButtonConfig;
  backButton = backButtonConfig;
  publishBattleButton = publishBattleButtonConfig;
  steps = stepsToCreateBattle;
  activeStep: number = 1;
  readonly maxSteps = 4;

  // Data state management
  isValidSelectedQuestions: boolean = false;
  selectedQuestions: QuestionsList[] = [];
  battleStep1Data: BattleStep1Data;
  selectedIndexStep2: number | null = null;
  questionDifficultyOption: { value: number; label: string }[] = [];
  questionsDifficultyXPOption: QuestionDifficultyXP[] = [];

  // Edit mode properties
  decodedId: number;
  isEditMode: boolean = false;

  // Injected services
  private readonly snackbar = inject(SnackbarService);
  private readonly battleManagementService = inject(BattleManagementService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.decodeRouteId();
  }

  ngAfterViewInit(): void {
    if (this.decodedId) this.loadBattle(this.decodedId);
  }

  // Configuration for edit mode
  getEditBattleConfig() {
    this.battleCreationHeaderConfiguration = {
      ...battleCreationHeaderConfig,
      title: platformMessages.editBattleTitle,
      subtitle: platformMessages.editBattleSubtitle,
    };

    this.steps = stepsToCreateBattle.map((step, index) =>
      index === 0
        ? {
            ...step,
            heading: platformMessages.editBattleTitle,
          }
        : step,
    );
  }

  // Helper functions for data extraction
  getQuestionsCount(list: BattleQuestionDifficulty[], diffId: number): string {
    return String(list.find((d) => d.queDifficultyId === diffId)?.noOfQues ?? 0).padStart(2, '0');
  }

  getTimePerQuestion(list: BattleQuestionDifficulty[], diffId: number): number {
    return list.find((d) => d.queDifficultyId === diffId)?.timePerQuestion ?? 30;
  }

  // Timezone conversion utility
  toTimezoneISO(date: Date | string | null, offsetMinutes: number): string | null {
    if (!date) return null;
    const d = new Date(date);
    const targetTime = d.getTime() + offsetMinutes * 60000;
    return new Date(targetTime).toISOString();
  }

  // UI styling helpers
  getStepClass(index: number): string {
    return index + 1 <= this.activeStep ? 'step-active' : 'step-inactive';
  }

  getTextClass(index: number): string {
    return index + 1 <= this.activeStep ? 'text-active' : 'text-inactive';
  }

  // Route ID decoding for edit mode
  decodeRouteId(): void {
    const encodedId = this.route.snapshot.paramMap.get('id');
    if (!encodedId) return;

    try {
      const urlDecoded = decodeURIComponent(encodedId);
      const base64Decoded = atob(urlDecoded);
      const asNumber = Number(base64Decoded);

      if (!isNaN(asNumber)) {
        this.decodedId = asNumber;
        this.getEditBattleConfig();
      } else {
        this.snackbar.showError(platformMessages.invalideBattleId);
        this.decodedId = 0;
      }
    } catch {
      this.snackbar.showError(platformMessages.invalideBattleId);
      this.decodedId = 0;
    }
  }

  // Step navigation with validation
  goToNextStep(): void {
    if (this.activeStep === 1 && this.step1Component) {
      this.questionsDifficultyXPOption = this.step1Component.questionsDifficultyXPOption;
    }

    if (this.activeStep === 1 && (!this.step1Component || !this.step1Component.submitStep1Form())) {
      return;
    } else if (
      this.activeStep === 2 &&
      (!this.step2Component || !(this.step2Component.selectedIndexStep2 === 0))
    ) {
      this.snackbar.showError(quizCRUDMessages.questionCreationMethodSelectError);
      return;
    } else if (this.activeStep === 3) {
      if (
        !this.step3Component ||
        this.step3Component.selectedQuestions.length != this.battleStep1Data?.totalQuestion
      ) {
        this.snackbar.showError(
          platformMessages.totalQuestionsError(this.battleStep1Data?.totalQuestion),
        );
        return;
      }
      if (!this.isValidSelectedQuestions) {
        this.snackbar.showError(platformMessages.difficultyWiseQuestionSelectionError);
        return;
      }
      if (this.step3Component) {
        this.questionDifficultyOption = this.step3Component.questionDifficultyOption;
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

  // Data mapping and transformation
  mapToSaveBattleRequest(
    battleStep1Data: BattleStep1Data,
    selectedQuestions: QuestionsList[],
  ): SaveBattleRequest {
    return {
      id: battleStep1Data.id,
      name: battleStep1Data.name,
      description: battleStep1Data.description,
      difficultyLevelId: battleStep1Data.difficultyLevelId,
      categoryId: battleStep1Data.categoryId,
      status: battleStep1Data.status,
      battleType: battleStep1Data.battleType,
      startDate: this.toTimezoneISO(battleStep1Data.startDate, 330) ?? null,
      endDate: this.toTimezoneISO(battleStep1Data.endDate, 330) ?? null,
      totalTime: Number(battleStep1Data.totalTime),
      totalQuestion: Number(battleStep1Data.totalQuestion),
      totalXp: Number(battleStep1Data.totalXp),

      questions: selectedQuestions.map((q) => ({
        id: q.id,
        categoryId: q.categoryId ?? battleStep1Data.categoryId,
        queDifficultyId: q.queDifficultyId!,
        queText: q.queText,
        queTypeId: q.queTypeId!,
        queOptionsAns: (q.queOptionsAns || []).map((opt) => ({
          id: opt.id,
          questionId: opt.questionId,
          key: opt.key,
          value: opt.value,
        })),
      })),

      questionsDifficulty: (battleStep1Data.questionsDifficulty || []).map((d) => ({
        id: d.id,
        queDifficultyId: d.queDifficultyId,
        noOfQues: d.noOfQues,
        timePerQuestion: d.timePerQuestion,
      })),
    };
  }

  // Event handlers from child components
  categoryChanged() {
    this.selectedQuestions = [];
  }

  step1ValueChange(val: BattleStep1Data) {
    const updated: BattleStep1Data = { ...val };
    this.battleStep1Data = updated;
  }

  updateSelectedQuestions(questions: QuestionsList[]) {
    this.selectedQuestions = [...questions];
  }

  validSelectedQuestionsChange(isValid: boolean) {
    this.isValidSelectedQuestions = isValid;
  }

  // Backend response mapping for edit mode
  mapBackendBattleResponse(backendResponse: BattleResponse): void {
    const formValues = {
      battleTitle: backendResponse.name,
      battleCategory: backendResponse.categoryId,
      description: backendResponse.description,
      battleType: backendResponse.battleType,
      difficultyLevel: backendResponse.difficultyLevelId,
      startDate: backendResponse.startDate,
      endDate: backendResponse.endDate,
      easyQuestions: this.getQuestionsCount(backendResponse.questionsDifficulty, 2),
      mediumQuestions: this.getQuestionsCount(backendResponse.questionsDifficulty, 3),
      hardQuestions: this.getQuestionsCount(backendResponse.questionsDifficulty, 4),
      easyTime: this.getTimePerQuestion(backendResponse.questionsDifficulty, 2),
      mediumTime: this.getTimePerQuestion(backendResponse.questionsDifficulty, 3),
      hardTime: this.getTimePerQuestion(backendResponse.questionsDifficulty, 4),
    };

    const battleStep1Data: BattleStep1Data = {
      ...formValues,
      id: backendResponse.id,
      name: backendResponse.name,
      description: backendResponse.description,
      difficultyLevelId: backendResponse.difficultyLevelId,
      categoryId: backendResponse.categoryId,
      battleType: backendResponse.battleType,
      startDate: backendResponse.startDate,
      endDate: backendResponse.endDate,
      totalTime: backendResponse.totalTime,
      totalQuestion: backendResponse.totalQuestion,
      totalXp: backendResponse.totalXp,
      questionsDifficulty: backendResponse.questionsDifficulty ?? [],
    };

    const selectedQuestions: QuestionsList[] = (backendResponse.questions ?? []).map(
      (q: QuestionResponseDto) => ({
        id: q.id,
        categoryId: q.categoryId,
        queDifficultyId: q.queDifficultyId,
        queText: q.queText,
        queTypeId: q.queTypeId,
        queOptionsAns: (q.queOptionsAns ?? []).map((opt) => ({
          id: opt.id,
          questionId: opt.questionId,
          key: opt.key,
          value: opt.value,
        })),
      }),
    );

    this.selectedQuestions = selectedQuestions;
    this.battleStep1Data = battleStep1Data;

    if (this.step1Component) {
      this.step1Component.totalTimeStep1 = backendResponse.totalTime;
      this.step1Component.totalXPStep1 = backendResponse.totalXp;
      this.step1Component.totalQuestionsStep1 = backendResponse.totalQuestion;
      this.step1Component.initializeForm();
    }
  }

  // Data loading for edit mode
  loadBattle(battleId: number) {
    this.battleManagementService
      .getBattle(battleId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.mapBackendBattleResponse(res.data);
          this.isEditMode = true;
        },
        error: (err) => {
          const errorMessage = err?.error?.message || platformMessages.errorMessage;
          if (errorMessage.includes('playing')) {
            this.router.navigate([Navigations.Admin, Navigations.BattlesAdmin]);
          }
          this.snackbar.showError(platformMessages.errorTitle, errorMessage);
        },
      });
  }

  // Save battle operation
  saveBattle(): void {
    if (!this.battleStep1Data || !this.selectedQuestions.length) {
      return;
    }

    const payload: SaveBattleRequest = this.mapToSaveBattleRequest(
      this.battleStep1Data,
      this.selectedQuestions,
    );

    if (this.isEditMode) payload.id = this.decodedId;

    this.battleManagementService
      .createOrUpdateBattle(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackbar.showSuccess(
            this.isEditMode ? platformMessages.battleUpdated : platformMessages.battleSaved,
          );
          this.router.navigate([Navigations.Admin, Navigations.BattlesAdmin]);
        },
        error: (err) => {
          this.snackbar.showError(
            platformMessages.errorTitle,
            err?.error?.message || platformMessages.errorMessage,
          );
        },
      });
  }

  /** Go back to the previous page */
  goBack(): void {
    this.location.back();
  }

  // Cleanup subscriptions
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
