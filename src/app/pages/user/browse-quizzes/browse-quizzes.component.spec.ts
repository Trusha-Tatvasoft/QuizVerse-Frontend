import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BrowseQuizzesComponent } from './browse-quizzes.component';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { BrowseQuizzesService } from '../../../services/user/browse-quizzes/browse-quizzes.service';
import { DropdownService } from '../../../shared/service/dropdown/dropdown.service';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DropDownType } from '../../../shared/enums/dropdown-types.enum';

// Mock data
const mockDropdowns = [
  { id: 1, label: 'Mock Category' },
  { id: 2, label: 'Mock Difficulty' },
];

const mockTags = [
  { id: 1, label: 'Tag1' },
  { id: 2, label: 'Tag2' },
];

const mockQuizResponse = {
  result: true,
  data: {
    quizzes: [
      {
        id: 1,
        title: 'Sample Quiz',
        description: 'Test quiz',
        categoryName: 'Science',
        difficultyLevel: 'Easy',
        rating: 4.5,
        price: 10,
        isFree: true,
        totalQuestions: 10,
        totalTime: 60,
        tagIds: [1],
        isAttempted: false,
      },
    ],
    hasMore: true,
    totalFeatured: 1,
    totalAll: 2,
    totalFree: 3,
    totalPremium: 4,
  },
};

describe('BrowseQuizzesComponent', () => {
  let component: BrowseQuizzesComponent;
  let fixture: ComponentFixture<BrowseQuizzesComponent>;

  let browseQuizzesServiceMock: any;
  let dropdownServiceMock: any;
  let snackbarServiceMock: any;

  beforeEach(async () => {
    browseQuizzesServiceMock = {
      browseQuizzes: jest.fn().mockReturnValue(of(mockQuizResponse)),
    };

    dropdownServiceMock = {
      getDropdownData: jest.fn().mockImplementation((type: number) => {
        return type === 3 ? of(mockTags) : of(mockDropdowns);
      }),
    };

    snackbarServiceMock = {
      showError: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, BrowseQuizzesComponent],
      providers: [
        { provide: BrowseQuizzesService, useValue: browseQuizzesServiceMock },
        { provide: DropdownService, useValue: dropdownServiceMock },
        { provide: SnackbarService, useValue: snackbarServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(BrowseQuizzesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component and fetch data on init', () => {
    expect(component).toBeTruthy();
    expect(browseQuizzesServiceMock.browseQuizzes).toHaveBeenCalled();
    expect(dropdownServiceMock.getDropdownData).toHaveBeenCalledTimes(3);
  });

  it('should switch tabs and fetch data', () => {
    const fetchSpy = jest.spyOn(component, 'fetchQuizzesList');
    component.switchToTab(1);
    expect(component.selectedTab()).toBe(1);
    expect(fetchSpy).toHaveBeenCalledWith(true);
  });

  it('should handle search input with debounce', fakeAsync(() => {
    const spy = jest.spyOn(component as any, 'fetchQuizzesList');
    component.searchInputChange('angular');
    tick(500);
    expect(spy).toHaveBeenCalledWith(true);
  }));

  it('should toggle the filters panel', () => {
    expect(component.showFiltersPanel).toBe(false);
    component.toggleFilters();
    expect(component.showFiltersPanel).toBe(true);
  });

  it('should clear all filters and reset form', () => {
    const spy = jest.spyOn(component, 'fetchQuizzesList');

    component.filtersForm.patchValue({
      quizCategoryId: 1,
      tagIds: [1],
    });

    component.clearFilters();

    expect(component.filtersForm.value.quizCategoryId).toBeNull();
    expect(component.filtersForm.value.tagIds).toBeNull();
    expect(spy).toHaveBeenCalledWith(true);
  });

  it('should fetch more quizzes when loadMore is called', () => {
    const spy = jest.spyOn(component, 'fetchQuizzesList');
    component.batchNumber = 1;
    component.loadMore();
    expect(component.batchNumber).toBe(2);
    expect(spy).toHaveBeenCalled();
  });

  it('should apply tag selection and call filterChange', () => {
    const spy = jest.spyOn(component, 'fetchQuizzesList');
    component.tagSelected({ id: '2', label: 'Tag2', isSelected: true });
    expect(component.filtersForm.value.tagIds).toContain(2);
    expect(spy).toHaveBeenCalledWith(true);
  });

  it('should remove a tag on tagClosed', () => {
    component.filtersForm.patchValue({ tagIds: [1, 2] });
    component.tagClosed({ id: '2', label: 'Tag2' });
    expect(component.filtersForm.value.tagIds).toEqual([1]);
  });

  it('should handle error in fetchQuizzesList', () => {
    browseQuizzesServiceMock.browseQuizzes.mockReturnValueOnce(throwError(() => 'error'));

    component.fetchQuizzesList();

    expect(snackbarServiceMock.showError).toHaveBeenCalled();
  });

  it('should unsubscribe on destroy', () => {
    const destroySpy = jest.spyOn((component as any).destroy$, 'next');
    const completeSpy = jest.spyOn((component as any).destroy$, 'complete');

    component.ngOnDestroy();

    expect(destroySpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should load dropdowns and set category, difficulty, type lists and tags', fakeAsync(() => {
    component.loadDropdowns();

    tick();

    expect(dropdownServiceMock.getDropdownData).toHaveBeenCalledWith(DropDownType.QuizCategory);
    expect(dropdownServiceMock.getDropdownData).toHaveBeenCalledWith(DropDownType.QuizDifficulty);
    expect(dropdownServiceMock.getDropdownData).toHaveBeenCalledWith(DropDownType.QuizTag);

    expect(component.categoryList).toEqual(mockDropdowns);
    expect(component.difficultyList).toEqual(mockDropdowns);
    expect(component.typeList.length).toBeGreaterThan(0);
    expect(component.allTags.length).toBe(mockTags.length);
  }));

  it('filterChange should reset batchNumber and call fetchQuizzesList with reset', () => {
    const spy = jest.spyOn(component, 'fetchQuizzesList');
    component.batchNumber = 5;

    component.filterChange();

    expect(component.batchNumber).toBe(1);
    expect(spy).toHaveBeenCalledWith(true);
  });

  it('tagSelected should add tag id when selected', () => {
    const spy = jest.spyOn(component, 'filterChange');
    component.filtersForm.patchValue({ tagIds: [] });

    component.tagSelected({ id: '3', label: 'Tag3', isSelected: true });

    expect(component.filtersForm.value.tagIds).toContain(3);
    expect(spy).toHaveBeenCalled();
  });

  it('tagSelected should not add tag id when isSelected is false', () => {
    const spy = jest.spyOn(component, 'filterChange');
    component.filtersForm.patchValue({ tagIds: [1] });

    component.tagSelected({ id: '1', label: 'Tag1', isSelected: false });

    expect(component.filtersForm.value.tagIds).toEqual([1]);
    expect(spy).toHaveBeenCalled();
  });

  it('clearFilters should reset form and deselect all tags', () => {
    component.allTags = component.allTags.map((tag) => ({ ...tag, isSelected: true }));

    component.clearFilters();

    expect(component.filtersForm.value.quizCategoryId).toBeNull();
    expect(component.filtersForm.value.tagIds).toBeNull();
    expect(component.allTags.every((tag) => tag.isSelected === false)).toBe(true);
  });

  it('fetchQuizzesList sends correct payload to service', () => {
    browseQuizzesServiceMock.browseQuizzes.mockClear();

    component.searchControl.setValue('test search');
    component.filtersForm.patchValue({
      quizCategoryId: 5,
      tagIds: [10, 20],
      browseQuizzesFilterByType: null,
    });

    component.currentTabId.set('allQuizzes');

    const expectedPayload = {
      searchText: 'test search',
      batchNumber: component.batchNumber,
      quizCategoryId: 5,
      quizDifficultyLevelId: null,
      browseQuizzesSorting: null,
      browseQuizzesFilterByType: null,
      filterRanges: component.filtersForm.value.filterRanges,
      tagIds: [10, 20],
    };

    component.fetchQuizzesList();

    const lastCallArg = browseQuizzesServiceMock.browseQuizzes.mock.calls.slice(-1)[0][0];

    expect(lastCallArg).toEqual(expectedPayload);
  });

  it('should initialize form with correct default values including empty arrays and nulls', () => {
    expect(component.filtersForm.value.quizCategoryId).toBeNull();
    expect(component.filtersForm.value.quizDifficultyLevelId).toBeNull();
    expect(component.filtersForm.value.browseQuizzesSorting).toBeNull();
    expect(component.filtersForm.value.browseQuizzesFilterByType).toBeNull();
    expect(component.filtersForm.value.tagIds).toEqual([]);
  });

  it('should initialize form with correct default values including empty arrays and nulls', () => {
    expect(component.filtersForm.value.quizCategoryId).toBeNull();
    expect(component.filtersForm.value.quizDifficultyLevelId).toBeNull();
    expect(component.filtersForm.value.browseQuizzesSorting).toBeNull();
    expect(component.filtersForm.value.browseQuizzesFilterByType).toBeNull();
    expect(component.filtersForm.value.tagIds).toEqual([]); // empty array initially
  });
  it('clearFilters sets tagIds to null, not empty array', () => {
    component.filtersForm.patchValue({ tagIds: [1, 2, 3] });

    component.clearFilters();

    expect(component.filtersForm.value.tagIds).toBeNull(); // Important to expect null here
  });

  it('tagClosed sets tagIds to null when last tag is removed', () => {
    component.filtersForm.patchValue({ tagIds: [1] });
    component.tagClosed({ id: '1', label: 'Tag1' });

    expect(component.filtersForm.value.tagIds).toBeNull(); // This should pass if your component sets it properly
  });

  it('fetchQuizzesList payload sets tagIds to null if empty array in form', () => {
    component.filtersForm.patchValue({ tagIds: [] });
    component.searchControl.setValue('test');
    component.batchNumber = 1;
    component.currentTabId.set('featured');

    component.fetchQuizzesList();

    const lastCallArg = browseQuizzesServiceMock.browseQuizzes.mock.calls.slice(-1)[0][0];
    expect(lastCallArg.tagIds).toBeNull();
  });
});
