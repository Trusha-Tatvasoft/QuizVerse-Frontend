import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { QuizCreationStep3LayoutComponent } from './quiz-creation-step-3-layout.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { QuizCreationService } from '../../../../../services/admin/quiz-management/quiz-creation/quiz-creation.service';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { DynamicFormField } from '../../../../../shared/interfaces/dynamic-form-field.interface';

describe('QuizCreationStep3LayoutComponent', () => {
  let component: QuizCreationStep3LayoutComponent;
  let fixture: ComponentFixture<QuizCreationStep3LayoutComponent>;
  let quizService: jest.Mocked<QuizCreationService>;
  let snackbar: jest.Mocked<SnackbarService>;
  let dialog: jest.Mocked<MatDialog>;

  beforeEach(async () => {
    const quizServiceMock = {
      getDropDownData: jest.fn().mockReturnValue(of({ data: [{ id: 1, name: 'Easy' }] })),
    };
    const snackbarMock = {
      showError: jest.fn(),
      showSuccess: jest.fn(),
      showInfo: jest.fn(),
    };
    const dialogMock = {
      open: jest.fn().mockReturnValue({
        afterClosed: () => of(true),
      } as MatDialogRef<any>),
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, QuizCreationStep3LayoutComponent], // standalone import
      providers: [
        FormBuilder,
        { provide: QuizCreationService, useValue: quizServiceMock },
        { provide: SnackbarService, useValue: snackbarMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizCreationStep3LayoutComponent);
    component = fixture.componentInstance;

    quizService = TestBed.inject(QuizCreationService) as jest.Mocked<QuizCreationService>;
    snackbar = TestBed.inject(SnackbarService) as jest.Mocked<SnackbarService>;
    dialog = TestBed.inject(MatDialog) as jest.Mocked<MatDialog>;

    // Provide required @Input
    component.quizStep1Data = {
      quizCategory: 1,
      difficultyDistribution: [{ key: 'Easy', value: 2 }],
      totalQuestions: 10,
    } as any;

    // Manually call ngOnInit to initialize questionForm
    component.ngOnInit();

    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should build form and fetch dropdowns', () => {
    const buildSpy = jest.spyOn(component as any, 'buildQuestionForm');
    const dropdownSpy = jest.spyOn(component, 'getDropDownsData');
    component.ngOnInit();
    expect(buildSpy).toHaveBeenCalled();
    expect(dropdownSpy).toHaveBeenCalled();
  });

  it('ngOnDestroy should complete destroy$', () => {
    const spyNext = jest.spyOn((component as any).destroy$, 'next');
    const spyComplete = jest.spyOn((component as any).destroy$, 'complete');
    component.ngOnDestroy();
    expect(spyNext).toHaveBeenCalled();
    expect(spyComplete).toHaveBeenCalled();
  });

  it('should fill missing labels', () => {
    component.questionDifficultyOption = [{ value: 1, label: 'Easy' }];
    component.questionTypeOptions = [{ value: 1, label: 'MCQ' }];
    component.selectedQuestions = [{ queDifficultyId: 1, queTypeId: 1, queText: 'Q' } as any];
    component.fillMissingLabelsForSelectedQuestions();
    expect(component.selectedQuestions[0].queDifficultyName).toBe('Easy');
    expect(component.selectedQuestions[0].queTypeName).toBe('MCQ');
  });

  it('should correctly detect true/false type', () => {
    component.questionTypeOptions = [{ value: 1, label: 'True/False' }];
    component.questionForm.get('type')?.setValue(1);
    expect(component.isTrueFalseType()).toBe(true);
  });

  it('should update fields based on type', () => {
    component.questionTypeOptions = [
      { value: 1, label: 'Multiple Choice' },
      { value: 2, label: 'True/False' },
    ];
    component.questionForm = new FormBuilder().group({
      type: [1],
      correctAnswer: [''],
      option1: [''],
      option2: [''],
      option3: [''],
      option4: [''],
    });
    component.updateFieldsBasedOnType(1);
    expect(component.questionForm.get('correctAnswer')?.validator).toBeTruthy();
  });

  it('should add question successfully', () => {
    component.questionTypeOptions = [{ value: 1, label: 'Multiple Choice' }];
    component.questionForm = new FormBuilder().group({
      type: [1],
      difficulty: [1],
      questionText: ['Test'],
      correctAnswer: ['option1'],
      option1: ['option1'],
      option2: ['opt2'],
      option3: ['opt3'],
      option4: ['opt4'],
    });
    component.addQuestion();
    expect(component.selectedQuestions.length).toBe(1);
  });

  it('should handle addQuestion MCQ error when correct answer not in options', () => {
    component.questionTypeOptions = [{ value: 1, label: 'Multiple Choice' }];
    component.questionForm = new FormBuilder().group({
      type: [1],
      difficulty: [1],
      questionText: ['Test'],
      correctAnswer: ['wrongAnswer'],
      option1: ['opt1'],
      option2: ['opt2'],
      option3: ['opt3'],
      option4: ['opt4'],
    });
    component.addQuestion();
    expect(snackbar.showError).toHaveBeenCalled();
    expect(component.selectedQuestions.length).toBe(0);
  });

  it('should update selectedQuestions table', () => {
    component.selectedQuestions = [
      { queText: 'Q1', queTypeName: 'MCQ', queDifficultyName: 'Easy' } as any,
    ];
    component.updateSelectedQuestionsTable();
    expect(component.questionsTableData.length).toBeGreaterThan(0);
  });

  it('should handle page change', () => {
    component.selectedQuestions = Array(10).fill({
      queText: 'Q',
      queTypeName: 'MCQ',
      queDifficultyName: 'Easy',
    } as any);
    component.pageChangeTableSelectedQuestions({ pageIndex: 1, pageSize: 5 });
    expect(component.currentPageSelected).toBe(2);
    expect(component.pageSizeSelected).toBe(5);
  });

  it('should handle delete action with confirmation', fakeAsync(() => {
    const spy = jest.spyOn(component, 'updateSelectedQuestionsTable');
    component.selectedQuestions = [
      { queText: 'Q1', queTypeName: 'MCQ', queDifficultyName: 'Easy' } as any,
    ];
    component.handleDeleteAction({ action: 'delete', row: { index: 0 } } as any);
    tick();
    expect(component.selectedQuestions.length).toBe(0);
    expect(spy).toHaveBeenCalled();
  }));

  it('should update validity correctly', fakeAsync(() => {
    component.selectedQuestions = [{ queDifficultyName: 'Easy' } as any];
    component.updateSelectedQuestionsValidity();
    tick();
    expect(component.isValidSelectedQuestions).toBe(true);
  }));

  it('should return correct isQuestionSelected value', () => {
    component.selectedQuestions = [{ id: 1 } as any];
    expect(component.isQuestionSelected(1)).toBe(true);
    expect(component.isQuestionSelected(2)).toBe(false);
  });

  it('should handle cardClick', () => {
    component.cardClick(1);
    expect(component.selectedQuestionMethodInManualAdditionIndex).toBe(1);
    expect(component.isInnerStep3).toBe(true);
  });

  describe('shouldRenderField', () => {
    beforeEach(() => {
      component.questionForm = new FormBuilder().group({
        type: [1],
        correctAnswer: [''],
        option1: [''],
        option2: [''],
        option3: [''],
        option4: [''],
      });
    });

    it('should return true for always visible fields', () => {
      const field: DynamicFormField = { name: 'type' } as any;
      expect(component.shouldRenderField(field)).toBe(true);
    });

    it('should return true for option fields when type is multiple choice', () => {
      component.questionTypeOptions = [{ value: 1, label: 'Multiple Choice' }];
      component.questionForm.get('type')?.setValue(1);

      const field: DynamicFormField = { name: 'option1' } as any;
      expect(component.shouldRenderField(field)).toBe(true);
    });

    it('should return false for option fields when type is not multiple choice', () => {
      component.questionTypeOptions = [{ value: 1, label: 'True/False' }];
      component.questionForm.get('type')?.setValue(1);

      const field: DynamicFormField = { name: 'option1' } as any;
      expect(component.shouldRenderField(field)).toBe(false);
    });

    it('should return true for correctAnswer when type is true/false', () => {
      component.questionTypeOptions = [{ value: 1, label: 'True/False' }];
      component.questionForm.get('type')?.setValue(1);

      const field: DynamicFormField = { name: 'correctAnswer' } as any;
      expect(component.shouldRenderField(field)).toBe(true);
    });

    it('should return false for unrelated fields', () => {
      component.questionTypeOptions = [{ value: 1, label: 'Subjective' }];
      component.questionForm.get('type')?.setValue(1);

      const field: DynamicFormField = { name: 'randomField' } as any;
      expect(component.shouldRenderField(field)).toBe(false);
    });
  });

  it('should add True/False question (case 2)', () => {
    component.questionTypeOptions = [{ value: 2, label: 'True/False' }];
    component.questionForm = new FormBuilder().group({
      type: [2],
      difficulty: [1],
      questionText: ['Q2'],
      correctAnswer: [true], // true/false
    });

    component.addQuestion();

    expect(component.selectedQuestions.length).toBe(1);
    expect(component.selectedQuestions[0].queOptionsAns![0].value).toBe('True');
  });

  it('should add question for case 3 (Subjective/Fill in the Blank)', () => {
    component.questionTypeOptions = [{ value: 3, label: 'Subjective' }];
    component.questionForm = new FormBuilder().group({
      type: [3],
      difficulty: [1],
      questionText: ['Q3'],
      correctAnswer: ['Some answer'],
    });

    component.addQuestion();

    expect(component.selectedQuestions.length).toBe(1);
    expect(component.selectedQuestions[0].queOptionsAns![0].value).toBe('Some answer');
  });

  it('should add question for case 4 (Descriptive etc.)', () => {
    component.questionTypeOptions = [{ value: 4, label: 'Descriptive' }];
    component.questionForm = new FormBuilder().group({
      type: [4],
      difficulty: [1],
      questionText: ['Q4'],
      correctAnswer: ['Detailed answer'],
    });

    component.addQuestion();

    expect(component.selectedQuestions.length).toBe(1);
    expect(component.selectedQuestions[0].queOptionsAns![0].value).toBe('Detailed answer');
  });

  it('should not add question for default case (invalid type)', () => {
    component.questionTypeOptions = [{ value: 99, label: 'Invalid' }];
    component.questionForm = new FormBuilder().group({
      type: [99], // type not handled in switch
      difficulty: [1],
      questionText: ['QX'],
      correctAnswer: ['something'],
    });

    component.addQuestion();

    // default returns without adding
    expect(component.selectedQuestions.length).toBe(0);
  });

  it('should return early if correctAnswer control does not exist', () => {
    component.questionTypeOptions = [{ value: 1, label: 'Multiple Choice' }];

    component.questionForm = new FormBuilder().group({
      type: [1],
      option1: [''],
      option2: [''],
      option3: [''],
      option4: [''],
    });

    const spy = jest.spyOn(component.questionForm.get('option1')!, 'setValidators');

    component.updateFieldsBasedOnType(1);

    expect(spy).not.toHaveBeenCalled();
  });

  it('should skip updating when option control does not exist', () => {
    component.questionTypeOptions = [{ value: 1, label: 'Multiple Choice' }];

    component.questionForm = new FormBuilder().group({
      type: [1],
      correctAnswer: [''],
      option1: [''],
      option2: [''],
    });

    const spy1 = jest.spyOn(component.questionForm.get('option1')!, 'setValidators');
    const spy2 = jest.spyOn(component.questionForm.get('option2')!, 'setValidators');

    component.updateFieldsBasedOnType(1);

    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();

    expect(component.questionForm.get('option3')).toBeNull();
    expect(component.questionForm.get('option4')).toBeNull();
  });
});
