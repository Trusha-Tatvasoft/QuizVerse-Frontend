import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, forkJoin, takeUntil } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { TabComponent } from '../../../shared/components/tab/tab.component';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { OutlineButtonComponent } from '../../../shared/components/outline-button/outline-button.component';
import { FilledButtonComponent } from '../../../shared/components/filled-button/filled-button.component';
import { TagComponent } from '../../../shared/components/tag/tag.component';
import {
  clearFilterButtonConfig,
  loadMoreButtonConfig,
  searchInputConfig,
  showFilterButtonConfig,
} from './configs/browse-quizzes.config';
import { CommonListDropDown } from '../../../shared/interfaces/common-dropdown.interface';
import { TagInputConfig } from '../../../shared/interfaces/tag-component.interface';
import { quizTabConfig } from './configs/browse-quizzes-tab.config';
import { BrowseQuizzesService } from '../../../services/user/browse-quizzes/browse-quizzes.service';
import { BrowseQuizzesRequest, QuizCardConfig } from './interfaces/browsr-quiz-request.interface';
import {
  mapDropdownToTags,
  mapQuizToCardConfig,
  mapSortingEnumToDropdown,
  tabToTypeMap,
  updateTabLabels,
} from './browse-quizzes.mapper';
import { DropDownType } from '../../../shared/enums/dropdown-types.enum';
import { DropdownService } from '../../../shared/service/dropdown/dropdown.service';
import { debounceTimeValue, platformMessages } from '../../../utils/constants';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';

@Component({
  selector: 'app-browse-quizzes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TabComponent,
    SearchInputComponent,
    OutlineButtonComponent,
    FilledButtonComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatSliderModule,
    TagComponent,
  ],
  templateUrl: './browse-quizzes.component.html',
  styleUrl: './browse-quizzes.component.scss',
})
export class BrowseQuizzesComponent implements OnInit {
  tabs = quizTabConfig;
  searchInputConfig = searchInputConfig;
  showFilterBtn = showFilterButtonConfig;
  clearFilterBtn = clearFilterButtonConfig;
  loadMoreBtnConfig = loadMoreButtonConfig;
  tabToTypeMap = tabToTypeMap;

  selectedTab = signal(0);
  currentTabId = signal<string>('featured');
  tabCounts = signal({
    featured: 0,
    allQuizzes: 0,
    free: 0,
    premium: 0,
  });

  batchNumber = 1;
  hasMoreResults = true;
  showFiltersPanel = false;
  searchControl = new FormControl<string | null>(null);

  quizzes: QuizCardConfig[] = [];
  allTags: TagInputConfig[] = [];
  categoryList: CommonListDropDown[] = [];
  difficultyList: CommonListDropDown[] = [];
  typeList: CommonListDropDown[] = [];

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(BrowseQuizzesService);
  private readonly dropdownService = inject(DropdownService);
  private readonly snackbarService = inject(SnackbarService);

  private readonly searchSubject$ = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  filtersForm: FormGroup = this.fb.group({
    quizCategoryId: [null],
    quizDifficultyLevelId: [null],
    browseQuizzesSorting: [null],
    browseQuizzesFilterByType: [null],
    filterRanges: this.fb.group({
      minPrice: [0],
      maxPrice: [1000],
      minRating: [0],
      maxRating: [5],
      minTotalTime: [2],
      maxTotalTime: [180],
    }),
    tagIds: [[]],
  });

  ngOnInit(): void {
    this.fetchQuizzesList();

    this.searchSubject$
      .pipe(debounceTime(debounceTimeValue), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.batchNumber = 1;
        this.fetchQuizzesList(true);
      });

    this.loadDropdowns();
  }

  loadDropdowns(): void {
    forkJoin({
      categories: this.dropdownService.getDropdownData(DropDownType.QuizCategory),
      difficulties: this.dropdownService.getDropdownData(DropDownType.QuizDifficulty),
      tags: this.dropdownService.getDropdownData(DropDownType.QuizTag),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ categories, difficulties, tags }) => {
        this.categoryList = categories;
        this.difficultyList = difficulties;
        this.typeList = mapSortingEnumToDropdown();
        this.allTags = mapDropdownToTags(tags);
      });
  }

  searchInputChange(value: string): void {
    this.searchSubject$.next(value);
  }

  switchToTab(index: number) {
    this.selectedTab.set(index);
    this.currentTabId.set(this.tabs[index].id);

    // type filter for tabs
    const typeFilter = this.tabToTypeMap[this.currentTabId()];
    this.filtersForm.patchValue({ browseQuizzesFilterByType: typeFilter ?? null });

    this.batchNumber = 1;
    this.fetchQuizzesList(true);
  }

  fetchQuizzesList(reset: boolean = false) {
    const tagIds = this.filtersForm.value.tagIds?.length ? this.filtersForm.value.tagIds : null;

    // type from current tab
    const typeFilter = this.tabToTypeMap[this.currentTabId()];

    const payload: BrowseQuizzesRequest = {
      searchText: this.searchControl.value ?? '',
      batchNumber: this.batchNumber,
      ...this.filtersForm.value,
      tagIds,
      browseQuizzesFilterByType: typeFilter ?? this.filtersForm.value.browseQuizzesFilterByType,
    };

    this.service
      .browseQuizzes(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.result && res.data) {
            const records = res.data.quizzes ?? [];
            const mapped = records.map(mapQuizToCardConfig);

            this.quizzes = reset ? mapped : [...this.quizzes, ...mapped];
            this.hasMoreResults = res.data.hasMore;

            this.tabCounts.set({
              featured: res.data.totalFeatured ?? 0,
              allQuizzes: res.data.totalAll ?? 0,
              free: res.data.totalFree ?? 0,
              premium: res.data.totalPremium ?? 0,
            });

            this.tabs = updateTabLabels(this.tabCounts());
          }
        },
        error: () => {
          this.snackbarService.showError(
            platformMessages.errorTitle,
            platformMessages.failedLoadQuesPreview,
          );
        },
      });
  }

  loadMore() {
    this.batchNumber++;
    this.fetchQuizzesList();
  }

  filterChange() {
    this.batchNumber = 1;
    this.fetchQuizzesList(true);
  }

  toggleFilters() {
    this.showFiltersPanel = !this.showFiltersPanel;
  }

  clearFilters() {
    this.filtersForm.reset({
      quizCategoryId: null,
      quizDifficultyLevelId: null,
      browseQuizzesFilterByType: null,
      filterRanges: {
        minPrice: 0,
        maxPrice: 1000,
        minRating: 0,
        maxRating: 5,
        minTotalTime: 2,
        maxTotalTime: 180,
      },
      tagIds: null,
    });
    this.searchControl.setValue(null);
    this.allTags = this.allTags.map((tag) => ({
      ...tag,
      isSelected: false,
    }));
    this.batchNumber = 1;
    this.fetchQuizzesList(true);
  }

  tagSelected(event: { id: string; label: string; isSelected: boolean }): void {
    const currentTags = this.filtersForm.value.tagIds || [];
    if (event.isSelected) {
      this.filtersForm.patchValue({ tagIds: [...currentTags, Number(event.id)] });
    }
    this.filterChange();
  }

  tagClosed(event: { id: string; label: string }): void {
    const updatedTags = (this.filtersForm.value.tagIds || []).filter(
      (tagId: number) => tagId !== Number(event.id),
    );
    this.filtersForm.patchValue({ tagIds: updatedTags.length ? updatedTags : null });
    this.filterChange();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
