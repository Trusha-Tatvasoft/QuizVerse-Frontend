import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizCreationStep1Component } from './quiz-creation-step-1.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { of, throwError } from 'rxjs';
import { QuizCreationService } from '../../../../../services/admin/quiz-management/quiz-creation/quiz-creation.service';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { ValidationErrorService } from '../../../../../shared/service/validation-error/validation-error.service';
import { TagComponent } from '../../../../../shared/components/tag/tag.component';
import { OutlineButtonComponent } from '../../../../../shared/components/outline-button/outline-button.component';
import { QuizStep1Data } from '../../../../../shared/interfaces/quiz-creation.interface';
import { NgModule } from '@angular/core';
import { TagInputConfig } from '../../../../../shared/interfaces/tag-component.interface';
import { quizCRUDMessages } from '../../../../../utils/constants';

@NgModule({})
class NoopAnimationsModuleMock {}

describe('QuizCreationStep1Component', () => {
  let component: QuizCreationStep1Component;
  let fixture: ComponentFixture<QuizCreationStep1Component>;
  let quizService: jest.Mocked<QuizCreationService>;
  let snackbar: jest.Mocked<SnackbarService>;
  let validationError: jest.Mocked<ValidationErrorService>;

  const mockQuizStep1Data: QuizStep1Data = {
    quizTitle: 'Test Quiz',
    quizCategory: 1,
    quizCategoryName: 'General Knowledge',
    difficultyLevel: 2,
    isPaid: true,
    price: 10,
    tags: ['test', 'quiz'],
    totalQuestions: 10,
    difficultyDistribution: [
      { key: 'easyQuestions', value: 4 },
      { key: 'mediumQuestions', value: 4 },
      { key: 'hardQuestions', value: 2 },
    ],
    description: 'This is a sample quiz description',
    quizTiming: 60,
  };

  beforeEach(async () => {
    const quizServiceMock = {
      getDropDownData: jest.fn().mockImplementation((type: number) => {
        switch (type) {
          case 1:
            return of([
              { id: '1', name: 'General Knowledge' },
              { id: '2', name: 'Science' },
            ]);
          case 2:
            return of([
              { id: '2', name: 'Medium' },
              { id: '3', name: 'Hard' },
            ]);
          case 3:
            return of([{ name: 'test' }, { name: 'quiz' }, { name: 'angular' }]);
          case 4:
            return of([{ name: 'Easy' }, { name: 'Medium' }, { name: 'Hard' }]);
          default:
            return of([]);
        }
      }),
    } as unknown as jest.Mocked<QuizCreationService>;

    const snackbarMock = {
      showError: jest.fn(),
      showSuccess: jest.fn(),
      showWarning: jest.fn(),
      showInfo: jest.fn(),
      openSnackbar: jest.fn(),
    } as unknown as jest.Mocked<SnackbarService>;

    const validationMock = {
      getErrorMessage: jest.fn(),
    } as unknown as jest.Mocked<ValidationErrorService>;

    await TestBed.configureTestingModule({
      declarations: [],
      imports: [
        CommonModule,
        ReactiveFormsModule,
        NoopAnimationsModuleMock,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatOptionModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatIconModule,
        MatSlideToggleModule,
        MatDividerModule,
        QuizCreationStep1Component,
        TagComponent,
        OutlineButtonComponent,
      ],
      providers: [
        { provide: QuizCreationService, useValue: quizServiceMock },
        { provide: SnackbarService, useValue: snackbarMock },
        { provide: ValidationErrorService, useValue: validationMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizCreationStep1Component);
    component = fixture.componentInstance;

    quizService = TestBed.inject(QuizCreationService) as jest.Mocked<QuizCreationService>;
    snackbar = TestBed.inject(SnackbarService) as jest.Mocked<SnackbarService>;
    validationError = TestBed.inject(ValidationErrorService) as jest.Mocked<ValidationErrorService>;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should emit category change on quizCategory change', () => {
    const spy = jest.spyOn(component.categoryChanged, 'emit');
    component.ngOnInit();
    fixture.detectChanges();

    component.newQuizForm.get('quizCategory')?.setValue('2');
    expect(spy).toHaveBeenCalled();
  });

  it('should calculate total questions correctly', () => {
    component.ngOnInit();
    fixture.detectChanges();

    component.newQuizForm.get('easyQuestions')?.setValue('2');
    component.newQuizForm.get('mediumQuestions')?.setValue('3');
    component.newQuizForm.get('hardQuestions')?.setValue('1');

    expect(component.totalQuestionsStep1).toBe(6);
  });

  it('should handle dropdown errors gracefully', () => {
    quizService.getDropDownData.mockReturnValueOnce(throwError(() => new Error('API Error')));
    component.ngOnInit();
    fixture.detectChanges();
    expect(snackbar.showError).toHaveBeenCalledWith('Error! undefined', 'Something went wrong.');
  });

  it('should cleanup subscriptions on destroy', () => {
    component.ngOnInit();
    fixture.detectChanges();
    const destroyNextSpy = jest.spyOn(component['destroy$'], 'next');
    const destroyCompleteSpy = jest.spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();
    expect(destroyNextSpy).toHaveBeenCalled();
    expect(destroyCompleteSpy).toHaveBeenCalled();
  });

  it('should not submit form if invalid', () => {
    component.ngOnInit();
    fixture.detectChanges();

    component.newQuizForm.get('quizTitle')?.setValue('');
    const result = component.submitStep1Form();

    expect(result).toBe(false);
    expect(component.newQuizForm.touched).toBeTruthy();
  });

  it('should not add duplicate tags', () => {
    component.tagList = [
      {
        id: '1',
        label: 'duplicate',
        type: 'selectable',
        isSelected: true,
        hasBorder: true,
        backgroundColor: 'blue',
        textColor: 'white',
      },
    ];
    component.tagInput = 'duplicate';
    component.addTag();

    expect(component.tagList.filter((t) => t.label === 'duplicate').length).toBe(1);
  });

  it('should remove tag correctly', () => {
    const tag: TagInputConfig = {
      id: '1',
      label: 'tag1',
      type: 'selectable',
      isSelected: true,
      hasBorder: true,
      backgroundColor: 'blue',
      textColor: 'white',
    };
    component.tagList = [tag];
    component.removeTag(tag);
    expect(component.tagList).toHaveLength(0);
  });

  it('should add price control when isPaid is true', () => {
    component.ngOnInit();
    fixture.detectChanges();

    (component as any).togglePriceValidation(true);
    const control = component.newQuizForm.get('price');

    expect(control).toBeDefined();
    expect(control?.validator).toBeDefined();
  });

  it('should remove price control when isPaid is false', () => {
    component.ngOnInit();
    fixture.detectChanges();

    component.newQuizForm.addControl('price', new FormControl('10'));
    (component as any).togglePriceValidation(false);

    expect(component.newQuizForm.get('price')).toBeNull();
  });

  it('should filter tags based on input', () => {
    component.allTags = ['angular', 'jest', 'testing'];
    component.tagList = [
      {
        id: '1',
        label: 'jest',
        type: 'selectable',
        isSelected: true,
        hasBorder: true,
        backgroundColor: 'blue',
        textColor: 'white',
      },
    ];
    component.tagInput = 'ang';

    const filtered = component.filteredTags();
    expect(filtered).toEqual(['angular']);
  });

  it('should show error if getDifficultyLevels fails', () => {
    quizService.getDropDownData.mockReturnValueOnce(throwError(() => new Error('Diff Error')));
    component.getDifficultyLevels();
    expect(snackbar.showError).toHaveBeenCalledWith('Error! undefined', 'Something went wrong.');
  });

  it('should show error if getQuizCategories fails', () => {
    quizService.getDropDownData.mockReturnValueOnce(throwError(() => new Error('Cat Error')));
    component.getQuizCategories();
    expect(snackbar.showError).toHaveBeenCalledWith('Error! undefined', 'Something went wrong.');
  });

  describe('QuizCreationStep1Component - createTag', () => {
    beforeEach(() => {
      component.tagList = [];
      component.tagInput = '';
    });

    it('should create a tag with correct properties when adding a new tag', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      Object.defineProperty(global, 'crypto', {
        value: { randomUUID: () => uuid },
        writable: true,
      });

      component.tagInput = 'newTag';
      component.addTag();

      const tag = component.tagList[0];

      expect(tag).toBeDefined();
      expect(tag.id).toBe(uuid);
      expect(tag.label).toBe('newTag');
      expect(tag.type).toBe('selectable');
      expect(tag.isSelected).toBe(true);
      expect(tag.hasBorder).toBe(true);
      expect(tag.backgroundColor).toBe('blue');
      expect(tag.textColor).toBe('white');

      expect(component.tagInput).toBe('');
    });

    it('should not add duplicate tags', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      Object.defineProperty(global, 'crypto', {
        value: { randomUUID: () => uuid },
        writable: true,
      });

      component.tagList = [
        {
          id: uuid,
          label: 'existingTag',
          type: 'selectable',
          isSelected: true,
          hasBorder: true,
          backgroundColor: 'blue',
          textColor: 'white',
        },
      ];
      component.tagInput = 'existingTag';

      component.addTag();
      expect(component.tagList.length).toBe(1);
    });
  });

  describe('submitStep1Form', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();

      // Mock filteredNewQuizFields for quizCategory lookup
      component.filteredNewQuizFields = [
        {
          name: 'quizCategory',
          options: [
            { value: '1', label: 'General Knowledge' },
            { value: '2', label: 'Science' },
          ],
          label: '',
          type: '',
          placeholder: '',
          validators: [],
        },
      ];

      // Initialize form with valid default values
      component.newQuizForm.setValue({
        quizTitle: 'Test Quiz',
        quizCategory: '1',
        difficultyLevel: '2',
        isPaid: true,
        price: 10,
        quizTiming: 60,
        easyQuestions: 4,
        mediumQuestions: 4,
        hardQuestions: 2,
        description: 'Sample description',
        tags: '',
      });

      // Mock totalQuestionsStep1
      component.totalQuestionsStep1 = 10;

      // Mock tagList
      component.tagList = [
        {
          id: '1',
          label: 'test',
          type: 'selectable',
          isSelected: true,
          hasBorder: true,
          backgroundColor: 'blue',
          textColor: 'white',
        },
        {
          id: '2',
          label: 'quiz',
          type: 'selectable',
          isSelected: true,
          hasBorder: true,
          backgroundColor: 'blue',
          textColor: 'white',
        },
      ];
    });

    it('should return false and mark form as touched if form is invalid', () => {
      component.newQuizForm.get('quizTitle')?.setValue('');
      const spy = jest.spyOn(component.newQuizForm, 'markAllAsTouched');
      const emitSpy = jest.spyOn(component.formValuesChange, 'emit');

      const result = component.submitStep1Form();

      expect(result).toBe(false);
      expect(spy).toHaveBeenCalled();
      expect(component.newQuizForm.touched).toBe(true);
      expect(emitSpy).not.toHaveBeenCalled();
      expect(snackbar.showError).not.toHaveBeenCalled();
    });

    it('should return false and show error if totalQuestionsStep1 is less than 5', () => {
      component.totalQuestionsStep1 = 4;
      const emitSpy = jest.spyOn(component.formValuesChange, 'emit');

      const result = component.submitStep1Form();

      expect(result).toBe(false);
      expect(snackbar.showError).toHaveBeenCalledWith(
        quizCRUDMessages.minimumNumberOfQuestionError,
      );
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should return false and show error if totalQuestionsStep1 is more than 100', () => {
      component.totalQuestionsStep1 = 101;
      const emitSpy = jest.spyOn(component.formValuesChange, 'emit');

      const result = component.submitStep1Form();

      expect(result).toBe(false);
      expect(snackbar.showError).toHaveBeenCalledWith(
        quizCRUDMessages.minimumNumberOfQuestionError,
      );
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should emit payload and return true for valid form', () => {
      const emitSpy = jest.spyOn(component.formValuesChange, 'emit');

      const expectedPayload = {
        quizTitle: 'Test Quiz',
        quizCategory: '1',
        quizCategoryName: 'General Knowledge',
        difficultyLevel: '2',
        isPaid: true,
        price: 10,
        quizTiming: 60,
        easyQuestions: 4,
        mediumQuestions: 4,
        hardQuestions: 2,
        description: 'Sample description',
        tags: ['test', 'quiz'],
        totalQuestions: 10,
      };

      const result = component.submitStep1Form();

      expect(result).toBe(true);
      expect(emitSpy).toHaveBeenCalledWith(expectedPayload);
      expect(snackbar.showError).not.toHaveBeenCalled();
    });

    it('should set quizCategoryName to empty string if category not found', () => {
      component.newQuizForm.get('quizCategory')?.setValue('999');
      const emitSpy = jest.spyOn(component.formValuesChange, 'emit');

      const expectedPayload = {
        quizTitle: 'Test Quiz',
        quizCategory: '999',
        quizCategoryName: '',
        difficultyLevel: '2',
        isPaid: true,
        price: 10,
        quizTiming: 60,
        easyQuestions: 4,
        mediumQuestions: 4,
        hardQuestions: 2,
        description: 'Sample description',
        tags: ['test', 'quiz'],
        totalQuestions: 10,
      };

      const result = component.submitStep1Form();

      expect(result).toBe(true);
      expect(emitSpy).toHaveBeenCalledWith(expectedPayload);
      expect(snackbar.showError).not.toHaveBeenCalled();
    });

    it('should handle empty tagList correctly', () => {
      component.tagList = [];
      const emitSpy = jest.spyOn(component.formValuesChange, 'emit');

      const expectedPayload = {
        quizTitle: 'Test Quiz',
        quizCategory: '1',
        quizCategoryName: 'General Knowledge',
        difficultyLevel: '2',
        isPaid: true,
        price: 10,
        quizTiming: 60,
        easyQuestions: 4,
        mediumQuestions: 4,
        hardQuestions: 2,
        description: 'Sample description',
        tags: [],
        totalQuestions: 10,
      };

      const result = component.submitStep1Form();

      expect(result).toBe(true);
      expect(emitSpy).toHaveBeenCalledWith(expectedPayload);
      expect(snackbar.showError).not.toHaveBeenCalled();
    });
  });
});
