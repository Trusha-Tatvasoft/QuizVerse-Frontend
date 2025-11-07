import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AiQuestionTabComponent } from './ai-question-tab.component';
import { of, throwError } from 'rxjs';
import { DropdownService } from '../../../../../shared/service/dropdown/dropdown.service';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { platformMessages } from '../../../../../utils/constants';
import { FormBuilder } from '@angular/forms';
import { DropDownType } from '../../../../../shared/enums/dropdown-types.enum';

jest.mock('./ai-question-tab.helper', () => ({
  createCategoryTag: jest.fn((category: string) => ({
    id: category,
    label: category,
    type: 'static',
    isSelected: true,
    hasBorder: true,
    backgroundColor: 'yellow',
    textColor: 'lightYellow',
  })),
  getTotalQuestions: jest.fn(() => 5),
  resetFormControlsErrors: jest.fn(),
}));

describe('AiQuestionTabComponent', () => {
  let component: AiQuestionTabComponent;
  let fixture: ComponentFixture<AiQuestionTabComponent>;
  let dropdownServiceMock: jest.Mocked<DropdownService>;
  let snackbarServiceMock: jest.Mocked<SnackbarService>;

  beforeEach(async () => {
    dropdownServiceMock = {
      getDropdownData: jest.fn(),
    } as any;

    snackbarServiceMock = {
      showError: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [AiQuestionTabComponent],
      providers: [
        { provide: DropdownService, useValue: dropdownServiceMock },
        { provide: SnackbarService, useValue: snackbarServiceMock },
        FormBuilder,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AiQuestionTabComponent);
    component = fixture.componentInstance;

    component.categoryList = [
      { id: 1, name: 'Math' },
      { id: 2, name: 'Science' },
    ];
    component.difficultyList = [
      { id: 1, name: 'Easy' },
      { id: 2, name: 'Medium' },
      { id: 3, name: 'Hard' },
    ];
    component.typeList = [
      { id: 1, name: 'MCQ' },
      { id: 2, name: 'True/False' },
    ];

    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the component and initialize form', () => {
    expect(component).toBeTruthy();
    expect(component.aiQuestionForm).toBeDefined();
  });

  describe('loadDropdowns()', () => {
    it('should populate dropdown data successfully', () => {
      dropdownServiceMock.getDropdownData.mockReturnValue(of([{ id: 1, name: 'MockData' }]));

      component.loadDropdowns();

      expect(dropdownServiceMock.getDropdownData).toHaveBeenCalledWith(DropDownType.QuizCategory);
      expect(component.categoryList).toBeDefined();
    });

    it('should show error if dropdown loading fails', () => {
      dropdownServiceMock.getDropdownData.mockReturnValue(throwError(() => new Error('fail')));

      component.loadDropdowns();

      expect(snackbarServiceMock.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        platformMessages.dropDownLoadFailed,
      );
    });
  });

  describe('switchToTab()', () => {
    it('should switch tab index', () => {
      component.switchToTab(1);
      expect(component.selectedIndex()).toBe(1);
    });
  });

  describe('isFieldInvalid()', () => {
    it('should return true for invalid touched control', () => {
      const control = component.aiQuestionForm.get('category');
      control?.markAsTouched();
      control?.setErrors({ required: true });

      expect(component.isFieldInvalid('category')).toBe(true);
    });

    it('should return false for valid control', () => {
      const control = component.aiQuestionForm.get('category');
      control?.setValue('Science');
      expect(component.isFieldInvalid('category')).toBe(false);
    });
  });

  describe('addConfig()', () => {
    beforeEach(() => {
      component.aiQuestionForm.setValue({
        category: 'Math',
        difficulty: 'Easy',
        type: 'MCQ',
        numberOfQuestions: 2,
      });
    });

    it('should set formError if form invalid', () => {
      component.aiQuestionForm.get('category')?.setValue(null);
      component.addConfig();
      expect(component.formError).toBe(platformMessages.selectRequiredField);
    });

    it('should set categoryTag and disable category when adding first config', () => {
      component.addConfig();

      expect(component.isCategoryFixed).toBe(true);
      expect(component.selectedCategory).toBe('Math');
      expect(component.categoryTag.label).toBe('Math');
      expect(component.aiQuestionForm.get('category')?.disabled).toBe(true);
    });

    it('should not exceed total question limit', () => {
      const { getTotalQuestions } = require('./ai-question-tab.helper');
      getTotalQuestions.mockReturnValueOnce(9);

      component.aiQuestionForm.patchValue({ numberOfQuestions: 5 });
      component.addConfig();

      expect(component.formError).toBe(platformMessages.maxNoOfQueLimit);
    });

    it('should add new difficulty and type if not existing', () => {
      component.configsByDifficulty = [];
      component.addConfig();

      expect(component.configsByDifficulty.length).toBe(1);
      expect(component.configsByDifficulty[0].questionPerQuestionType[0]).toEqual({
        questionPerQuestionTypeId: 1,
        questionPerQuestionTypeName: 'MCQ',
        noOfQuesitons: 2,
      });
    });

    it('should increment existing question type count if already exists', () => {
      component.configsByDifficulty = [
        {
          questionDifficultyId: 1,
          questionDifficultyName: 'Easy',
          questionPerQuestionType: [
            {
              questionPerQuestionTypeId: 1,
              questionPerQuestionTypeName: 'MCQ',
              noOfQuesitons: 1,
            },
          ],
        },
      ];

      component.addConfig();

      expect(component.configsByDifficulty[0].questionPerQuestionType[0].noOfQuesitons).toBe(3);
    });

    it('should emit updated quizConfig$', (done) => {
      component.quizConfig$.subscribe((config) => {
        if (config) {
          expect(config.category).toBe('Math');
          expect(config.questionSpec.length).toBeGreaterThan(0);
          done();
        }
      });
      component.addConfig();
    });
  });

  describe('removeConfig()', () => {
    beforeEach(() => {
      component.configsByDifficulty = [
        {
          questionDifficultyId: 1,
          questionDifficultyName: 'Easy',
          questionPerQuestionType: [
            {
              questionPerQuestionTypeId: 1,
              questionPerQuestionTypeName: 'MCQ',
              noOfQuesitons: 1,
            },
            {
              questionPerQuestionTypeId: 2,
              questionPerQuestionTypeName: 'True/False',
              noOfQuesitons: 1,
            },
          ],
        },
      ];
      component.selectedCategory = 'Science';
      component.isCategoryFixed = true;
    });

    it('should remove a question type and update state', () => {
      component.removeConfig(0, 0);
      expect(component.configsByDifficulty[0].questionPerQuestionType.length).toBe(1);
    });

    it('should reset category state if all configs removed', () => {
      component.removeConfig(0, 0);
      component.removeConfig(0, 0); // remove last one

      expect(component.isCategoryFixed).toBe(false);
      expect(component.selectedCategory).toBe('');
      expect(component.aiQuestionForm.get('category')?.enabled).toBe(true);
    });
  });

  it('should reset all state and emit empty config', fakeAsync(() => {
    const { resetFormControlsErrors } = require('./ai-question-tab.helper');
    component.isCategoryFixed = true;
    component.selectedCategory = 'Science';
    component.configsByDifficulty = [
      {
        questionDifficultyId: 1,
        questionDifficultyName: 'Easy',
        questionPerQuestionType: [
          {
            questionPerQuestionTypeId: 1,
            questionPerQuestionTypeName: 'MCQ',
            noOfQuesitons: 2,
          },
        ],
      },
    ];

    let configEmitted = false;

    const sub = component.quizConfig$.subscribe((config) => {
      if (config && config.category === '' && config.questionSpec.length === 0) {
        configEmitted = true;
        expect(component.isCategoryFixed).toBe(false);
        expect(component.configsByDifficulty).toEqual([]);
        expect(component.aiQuestionForm.get('category')?.enabled).toBe(true);
      }
    });

    component.resetAllConfigs();

    expect(resetFormControlsErrors).toHaveBeenCalled();
    tick();
    expect(configEmitted).toBe(true);
    expect(component.quizConfig$.value).toEqual({ category: '', questionSpec: [] });
    sub.unsubscribe();
  }));

  describe('ngOnDestroy()', () => {
    it('should complete destroy$', () => {
      const nextSpy = jest.spyOn(component['destroy$'], 'next');
      const completeSpy = jest.spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });
});
