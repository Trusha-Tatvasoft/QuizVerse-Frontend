import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  GenerateQuizRequest,
  QuestionGenerationFormat,
} from '../../interfaces/question-pool-ai-tab.interface';
import { aiQuestionFormTabConfig } from '../../configs/question-pool-tab-config';
import { addButtonConfig, resetBtnConfig } from '../../configs/question-pool.config';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FilledButtonComponent } from '../../../../../shared/components/filled-button/filled-button.component';
import { TabComponent } from '../../../../../shared/components/tab/tab.component';
import { OutlineButtonComponent } from '../../../../../shared/components/outline-button/outline-button.component';
import { TagComponent } from '../../../../../shared/components/tag/tag.component';
import { TagInputConfig } from '../../../../../shared/interfaces/tag-component.interface';
import { BehaviorSubject, forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DropdownService } from '../../../../../shared/service/dropdown/dropdown.service';
import { DropDownType } from '../../../../../shared/enums/dropdown-types.enum';
import { DropDownData } from '../../../../../shared/interfaces/drop-down-data.interface';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { platformMessages } from '../../../../../utils/constants';
import {
  createCategoryTag,
  getTotalQuestions,
  resetFormControlsErrors,
} from './ai-question-tab.helper';

@Component({
  selector: 'app-ai-question-tab',
  imports: [
    FilledButtonComponent,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatIconModule,
    MatInputModule,
    CommonModule,
    TabComponent,
    OutlineButtonComponent,
    TagComponent,
  ],
  templateUrl: './ai-question-tab.component.html',
  styleUrl: './ai-question-tab.component.scss',
})
export class AiQuestionTabComponent implements OnInit, OnDestroy {
  aiQuestionForm!: FormGroup;
  categoryTag!: TagInputConfig;
  configsByDifficulty: QuestionGenerationFormat[] = [];
  categoryList: DropDownData[] = [];
  difficultyList: DropDownData[] = [];
  typeList: DropDownData[] = [];

  totalQuestions = signal(0);
  isCategoryFixed: boolean = false;
  selectedIndex = signal(0);
  formError = '';
  selectedCategory = '';

  tabs = aiQuestionFormTabConfig;
  addBtnConfig = addButtonConfig;
  resetBtnConfig = resetBtnConfig;

  quizConfig$ = new BehaviorSubject<GenerateQuizRequest | null>(null);
  private readonly destroy$ = new Subject<void>();

  private readonly dropdownService = inject(DropdownService);
  private readonly snackbarService = inject(SnackbarService);

  ngOnInit(): void {
    this.buildForm();
    this.loadDropdowns();
  }

  buildForm(): void {
    const fb = new FormBuilder();
    this.aiQuestionForm = fb.group({
      category: [null, Validators.required],
      difficulty: [null, Validators.required],
      type: [null, Validators.required],
      numberOfQuestions: [null, [Validators.required, Validators.min(1), Validators.max(10)]],
    });
  }

  loadDropdowns(): void {
    forkJoin({
      categories: this.dropdownService.getDropdownData(DropDownType.QuizCategory),
      difficulties: this.dropdownService.getDropdownData(DropDownType.QuestionDifficulty),
      tags: this.dropdownService.getDropdownData(DropDownType.QuizTag),
      types: this.dropdownService.getDropdownData(DropDownType.QuestionType),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ categories, difficulties, types }) => {
          this.categoryList = categories;
          this.difficultyList = difficulties;
          this.typeList = types;
        },
        error: () => {
          this.snackbarService.showError(
            platformMessages.errorTitle,
            platformMessages.dropDownLoadFailed,
          );
        },
      });
  }

  switchToTab(index: number): void {
    this.selectedIndex.set(index);
  }

  isFieldInvalid(field: string): boolean {
    const control = this.aiQuestionForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  addConfig(): void {
    this.formError = '';

    if (this.aiQuestionForm.invalid) {
      this.formError = platformMessages.selectRequiredField;
      this.aiQuestionForm.markAllAsTouched();
      return;
    }

    const { category, difficulty, type, numberOfQuestions } = this.aiQuestionForm.getRawValue();

    const categoryObj = this.categoryList.find((c) => c.name === category);
    const difficultyObj = this.difficultyList.find((d) => d.name === difficulty);
    const typeObj = this.typeList.find((t) => t.name === type);

    if (!this.isCategoryFixed) {
      this.selectedCategory = category;
      this.isCategoryFixed = true;
      this.aiQuestionForm.get('category')?.disable();
      this.categoryTag = createCategoryTag(category);
    }

    const currentTotal = getTotalQuestions(this.configsByDifficulty);
    if (currentTotal + numberOfQuestions > 10) {
      this.formError = platformMessages.maxNoOfQueLimit;
      return;
    }

    // Group by difficulty
    let difficultyGroup = this.configsByDifficulty.find(
      (g) => g.questionDifficultyId === difficultyObj?.id,
    );

    if (!difficultyGroup) {
      difficultyGroup = {
        questionDifficultyId: difficultyObj?.id || 0,
        questionDifficultyName: difficulty,
        questionPerQuestionType: [],
      };
      this.configsByDifficulty.push(difficultyGroup);
    }

    const existingQuestion = difficultyGroup.questionPerQuestionType.find(
      (q) => q.questionPerQuestionTypeId === typeObj?.id,
    );

    // if same type que present only increase the count
    if (existingQuestion) {
      existingQuestion.noOfQuesitons += numberOfQuestions;
    } else {
      difficultyGroup.questionPerQuestionType.push({
        questionPerQuestionTypeId: typeObj?.id || 0,
        questionPerQuestionTypeName: type,
        noOfQuesitons: numberOfQuestions,
      });
    }

    this.totalQuestions.set(getTotalQuestions(this.configsByDifficulty));

    // pass detail to child components
    const requestPayload: GenerateQuizRequest = {
      categoryId: categoryObj?.id,
      category: this.selectedCategory,
      questionSpec: this.configsByDifficulty,
    };

    this.quizConfig$.next(requestPayload);

    //reset form
    const currentCategory = this.aiQuestionForm.get('category')?.value;
    this.aiQuestionForm.patchValue({
      category: currentCategory,
      difficulty: null,
      type: null,
      numberOfQuestions: 1,
    });

    if (this.isCategoryFixed) {
      this.aiQuestionForm.get('category')?.disable();
    }
  }

  removeConfig(difficultyIndex: number, questionIndex: number): void {
    const difficultyGroup = this.configsByDifficulty[difficultyIndex];
    if (difficultyGroup) {
      difficultyGroup.questionPerQuestionType.splice(questionIndex, 1);

      if (difficultyGroup.questionPerQuestionType.length === 0) {
        this.configsByDifficulty.splice(difficultyIndex, 1);
      }

      if (this.configsByDifficulty.length === 0) {
        this.isCategoryFixed = false;
        this.selectedCategory = '';
        this.aiQuestionForm.get('category')?.enable();
      }
    }
    this.formError = '';
    this.totalQuestions.set(getTotalQuestions(this.configsByDifficulty));

    const categoryObj = this.categoryList.find((c) => c.name === this.selectedCategory);
    const requestPayload: GenerateQuizRequest = {
      categoryId: categoryObj?.id,
      category: this.selectedCategory,
      questionSpec: this.configsByDifficulty,
    };

    this.quizConfig$.next(requestPayload);
  }

  resetAllConfigs(): void {
    this.configsByDifficulty = [];
    this.isCategoryFixed = false;
    this.selectedCategory = '';
    this.aiQuestionForm.get('category')?.enable();
    this.aiQuestionForm.reset();
    this.formError = '';
    this.totalQuestions.set(0);
    this.quizConfig$.next({ category: '', questionSpec: [] });

    resetFormControlsErrors(this.aiQuestionForm);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
