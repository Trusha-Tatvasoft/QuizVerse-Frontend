import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { QuizCreationLayoutComponent } from './quiz-creation-layout.component';
import { CommonModule, Location } from '@angular/common';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { FilledButtonComponent } from '../../../../../shared/components/filled-button/filled-button.component';
import { OutlineButtonComponent } from '../../../../../shared/components/outline-button/outline-button.component';
import { QuizCreationService } from '../../../../../services/admin/quiz-management/quiz-creation/quiz-creation.service';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, EventEmitter, Output } from '@angular/core';
import { of, throwError } from 'rxjs';
import { platformMessages, quizCRUDMessages } from '../../../../../utils/constants';
import {
  QuizStep1Data,
  SaveQuizRequest,
  QuestionsList,
  QuizResponse,
} from '../../../../../shared/interfaces/quiz-creation.interface';
import { QuizStatus } from '../../../../../shared/enums/quiz-management.enum';
import { Navigations } from '../../../../../shared/enums/navigation';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ChangeDetectorRef } from '@angular/core';

// Stub components to prevent real child component emissions
@Component({
  selector: 'app-quiz-creation-step-1',
  template: '',
})
class QuizCreationStep1StubComponent {
  @Output() step1Value = new EventEmitter<QuizStep1Data>();
  @Output() formValuesChange = new EventEmitter<QuizStep1Data>();
  @Output() categoryChanged = new EventEmitter<void>();
  initialFormValues: QuizStep1Data | null = null;
  isEditMode: boolean = false;
  submitStep1Form = jest.fn().mockImplementation(() => true);
  initializeForm = jest.fn().mockImplementation(() => {});
  form: any = null;
  categories: any[] = [];
  difficulties: any[] = [];
  questionTypes: any[] = [];
  tags: string[] = [];
}

@Component({
  selector: 'app-quiz-creation-step-2',
  template: '',
})
class QuizCreationStep2StubComponent {
  selectedIndexStep2: number | null = 0;
  @Output() selectedIndexStep2Change = new EventEmitter<number | null>();
}

@Component({
  selector: 'app-quiz-creation-step-3-layout',
  template: '',
})
class QuizCreationStep3LayoutStubComponent {
  selectedQuestions: QuestionsList[] = [];
  @Output() selectedQuestionsChange = new EventEmitter<QuestionsList[]>();
  @Output() validSelectedQuestionsChange = new EventEmitter<boolean>();
}

@Component({
  selector: 'app-quiz-creation-step-4',
  template: '',
})
class QuizCreationStep4StubComponent {}

@Component({
  selector: 'app-quiz-creation-step-3-ai-generation',
  template: '',
})
class QuizCreationStep3AiGenerationStubComponent {
  @Output() questionsGenerated = new EventEmitter<QuestionsList[]>();
}

describe('QuizCreationLayoutComponent', () => {
  let component: QuizCreationLayoutComponent;
  let fixture: ComponentFixture<QuizCreationLayoutComponent>;
  let quizCreationService: jest.Mocked<QuizCreationService>;
  let snackbarService: jest.Mocked<SnackbarService>;
  let router: jest.Mocked<Router>;
  let location: jest.Mocked<Location>;
  let route: { snapshot: { paramMap: { get: jest.Mock } } };
  let cdr: ChangeDetectorRef;

  const mockQuizStep1Data: QuizStep1Data = {
    quizTitle: 'Test Quiz',
    quizCategory: 1,
    description: 'Test Description',
    quizTiming: 30,
    difficultyLevel: 2,
    isPaid: true,
    price: 10,
    totalQuestions: 5,
    tags: ['tag1', 'tag2'],
    difficultyDistribution: [
      { key: 'easyQuestions', value: 2 },
      { key: 'mediumQuestions', value: 2 },
      { key: 'hardQuestions', value: 1 },
    ],
  };

  const mockQuestionsList: QuestionsList[] = [
    {
      id: 1,
      categoryId: 1,
      queDifficultyId: 1,
      queDifficultyName: 'Easy',
      queText: 'Test Question',
      queTypeId: 1,
      queTypeName: 'Multiple Choice',
      queOptionsAns: [{ key: 'A', value: 'Option A' }],
    },
  ];

  const defaultQuizStep1Data: QuizStep1Data = {
    quizTitle: '',
    quizCategory: 0,
    description: '',
    quizTiming: 0,
    difficultyLevel: 0,
    isPaid: false,
    price: 0,
    totalQuestions: 0,
    tags: [],
    difficultyDistribution: [],
  };

  beforeEach(async () => {
    quizCreationService = {
      createOrUpdateQuiz: jest
        .fn()
        .mockReturnValue(of({ result: true, statusCode: 200, message: 'Success', data: null })),
      getQuiz: jest.fn().mockReturnValue(
        of({
          result: true,
          statusCode: 200,
          message: 'Quiz fetched',
          data: {} as QuizResponse,
        }),
      ),
      getDropDownData: jest.fn().mockReturnValue(of({ data: [] })),
    } as any;

    snackbarService = {
      showError: jest.fn(),
      showSuccess: jest.fn(),
    } as any;

    router = {
      navigate: jest.fn(),
    } as any;

    location = {
      back: jest.fn(),
    } as any;

    route = {
      snapshot: {
        paramMap: {
          get: jest.fn().mockReturnValue(null),
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        HttpClientTestingModule,
        QuizCreationLayoutComponent,
        PageHeaderComponent,
        FilledButtonComponent,
        OutlineButtonComponent,
      ],
      providers: [
        { provide: QuizCreationService, useValue: quizCreationService },
        { provide: SnackbarService, useValue: snackbarService },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: route },
        { provide: Location, useValue: location },
        ChangeDetectorRef,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizCreationLayoutComponent);
    component = fixture.componentInstance;
    cdr = TestBed.inject(ChangeDetectorRef);

    // Create mock instances for child components
    component.step1Component = {
      submitStep1Form: jest.fn().mockReturnValue(true),
      initializeForm: jest.fn(),
    } as any;

    component.step2Component = {
      selectedIndexStep2: 0,
    } as any;

    component.step3Component = {
      selectedQuestions: [],
    } as any;

    component.step4Component = {} as any;

    // Setup initial data
    component.quizStep1Data = defaultQuizStep1Data;
    component.selectedQuestions = [];

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize component and call decodeRouteId', () => {
      const decodeSpy = jest.spyOn(component as any, 'decodeRouteId');
      component.ngOnInit();
      expect(decodeSpy).toHaveBeenCalled();
    });
  });

  describe('ngAfterViewInit', () => {
    it('should call loadQuiz if decodedId exists', () => {
      component.decodedId = 1;
      const loadQuizSpy = jest.spyOn(component, 'loadQuiz');
      component.ngAfterViewInit();
      expect(loadQuizSpy).toHaveBeenCalledWith(1);
    });

    it('should not call loadQuiz if decodedId is undefined', () => {
      component.decodedId = undefined as any;
      const loadQuizSpy = jest.spyOn(component, 'loadQuiz');
      component.ngAfterViewInit();
      expect(loadQuizSpy).not.toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete subscriptions', fakeAsync(() => {
      const destroyNextSpy = jest.spyOn(component['destroy$'], 'next');
      const destroyCompleteSpy = jest.spyOn(component['destroy$'], 'complete');
      component.ngOnDestroy();
      tick();
      fixture.detectChanges();
      expect(destroyNextSpy).toHaveBeenCalled();
      expect(destroyCompleteSpy).toHaveBeenCalled();
    }));
  });

  describe('ngOnDestroy', () => {
    it('should complete subscriptions', fakeAsync(() => {
      const destroyNextSpy = jest.spyOn(component['destroy$'], 'next');
      const destroyCompleteSpy = jest.spyOn(component['destroy$'], 'complete');
      component.ngOnDestroy();
      tick();
      fixture.detectChanges();
      expect(destroyNextSpy).toHaveBeenCalled();
      expect(destroyCompleteSpy).toHaveBeenCalled();
    }));
  });

  describe('decodeRouteId', () => {
    it('should decode valid id and update edit mode', () => {
      const encodedId = btoa('123');
      route.snapshot.paramMap.get.mockReturnValue(encodedId);
      component.ngOnInit();
      expect(component.decodedId).toBe(123);
    });

    it('should show error for invalid base64', () => {
      route.snapshot.paramMap.get.mockReturnValue('invalid-base64');
      component.ngOnInit();
      expect(snackbarService.showError).toHaveBeenCalledWith(quizCRUDMessages.invalideQuizId);
      expect(component.decodedId).toBe(0);
    });

    it('should show error for non-number decoded value', () => {
      const encodedId = btoa('not-a-number');
      route.snapshot.paramMap.get.mockReturnValue(encodedId);
      component.ngOnInit();
      expect(snackbarService.showError).toHaveBeenCalledWith(quizCRUDMessages.invalideQuizId);
      expect(component.decodedId).toBe(0);
    });

    it('should do nothing if no id is provided', () => {
      route.snapshot.paramMap.get.mockReturnValue(null);
      component.ngOnInit();
      expect(component.decodedId).toBeUndefined();
      expect(snackbarService.showError).not.toHaveBeenCalled();
    });
  });

  describe('getEditQuizConfig', () => {
    it('should update quizCreationHeaderConfiguration and steps for edit mode', () => {
      component['getEditQuizConfig']();
      expect(component.quizCreationHeaderConfiguration.title).toBe(quizCRUDMessages.editQuizTitle);
      expect(component.quizCreationHeaderConfiguration.subtitle).toBe(
        quizCRUDMessages.editQuizSubtitle,
      );
      expect(component.steps[0].heading).toBe(quizCRUDMessages.editQuizTitle);
    });
  });

  describe('updateSelectedQuestions', () => {
    it('should update selectedQuestions', () => {
      component.updateSelectedQuestions(mockQuestionsList);
      expect(component.selectedQuestions).toEqual(mockQuestionsList);
    });
  });

  describe('validSelectedQuestionsChange', () => {
    it('should update isValidSelectedQuestions', () => {
      component.validSelectedQuestionsChange(true);
      expect(component.isValidSelectedQuestions).toBe(true);
    });
  });

  describe('addGeneratedQuestions', () => {
    beforeEach(() => {
      component.quizStep1Data = mockQuizStep1Data;
      component.selectedQuestions = [...mockQuestionsList];
    });

    it('should add generated questions and validate', () => {
      const newQuestions: QuestionsList[] = [
        {
          id: 2,
          categoryId: 1,
          queDifficultyId: 2,
          queDifficultyName: 'Medium',
          queText: 'New Question',
          queTypeId: 1,
          queTypeName: 'Multiple Choice',
          queOptionsAns: [],
        },
      ];

      component.addGeneratedQuestions(newQuestions);

      expect(component.selectedQuestions).toHaveLength(2);
      expect(component.selectedQuestions[1]).toEqual(newQuestions[0]);
    });

    it('should not add questions if array is empty', () => {
      const initialLength = component.selectedQuestions.length;
      component.addGeneratedQuestions([]);
      expect(component.selectedQuestions).toHaveLength(initialLength);
    });
  });

  describe('areSelectedQuestionsValid', () => {
    beforeEach(() => {
      component.quizStep1Data = mockQuizStep1Data;
    });

    it('should return true when questions match distribution', () => {
      const validQuestions: QuestionsList[] = [
        { ...mockQuestionsList[0], queDifficultyName: 'Easy' },
        { ...mockQuestionsList[0], id: 2, queDifficultyName: 'Easy' },
        { ...mockQuestionsList[0], id: 3, queDifficultyName: 'Medium' },
        { ...mockQuestionsList[0], id: 4, queDifficultyName: 'Medium' },
        { ...mockQuestionsList[0], id: 5, queDifficultyName: 'Hard' },
      ];

      component.selectedQuestions = validQuestions;
      const result = (component as any).areSelectedQuestionsValid();

      expect(result).toBe(true);
    });

    it('should return false when questions exceed difficulty limits', () => {
      const invalidQuestions: QuestionsList[] = [
        { ...mockQuestionsList[0], queDifficultyName: 'Easy' },
        { ...mockQuestionsList[0], id: 2, queDifficultyName: 'Easy' },
        { ...mockQuestionsList[0], id: 3, queDifficultyName: 'Easy' }, // One extra Easy
        { ...mockQuestionsList[0], id: 4, queDifficultyName: 'Medium' },
        { ...mockQuestionsList[0], id: 5, queDifficultyName: 'Hard' },
      ];

      component.selectedQuestions = invalidQuestions;
      const result = (component as any).areSelectedQuestionsValid();

      expect(result).toBe(false);
    });

    it('should return false when total questions exceed limit', () => {
      const tooManyQuestions: QuestionsList[] = Array(10)
        .fill(0)
        .map((_, i) => ({
          ...mockQuestionsList[0],
          id: i + 1,
          queDifficultyName: 'Easy',
        }));

      component.selectedQuestions = tooManyQuestions;
      const result = (component as any).areSelectedQuestionsValid();

      expect(result).toBe(false);
    });
  });

  describe('goToNextStep', () => {
    beforeEach(() => {
      // Ensure step2Component is properly mocked
      component.step2Component = { selectedIndexStep2: 0 } as any;
      component.quizStep1Data = mockQuizStep1Data;
      component.selectedQuestions = Array(5).fill(mockQuestionsList[0]);
      component.isValidSelectedQuestions = true;
    });

    it('should not proceed from step 1 if form is invalid', () => {
      component.activeStep = 1;
      component.step1Component.submitStep1Form = jest.fn().mockReturnValue(false);

      component.goToNextStep();

      expect(component.activeStep).toBe(1);
    });

    it('should show error and not proceed from step 2 if no selection', () => {
      component.activeStep = 2;
      component.step2Component.selectedIndexStep2 = null;

      component.goToNextStep();

      expect(snackbarService.showError).toHaveBeenCalledWith(
        quizCRUDMessages.questionCreationMethodSelectError,
      );
      expect(component.activeStep).toBe(2);
    });

    it('should show error if step 3 has incorrect number of questions', () => {
      component.activeStep = 3;
      component.selectedQuestions = [mockQuestionsList[0]]; // Only 1 question

      component.goToNextStep();

      expect(snackbarService.showError).toHaveBeenCalledWith(
        quizCRUDMessages.totalQuestionsError(mockQuizStep1Data.totalQuestions),
      );
      expect(component.activeStep).toBe(3);
    });

    it('should show error if step 3 questions are invalid', () => {
      component.activeStep = 3;
      component.isValidSelectedQuestions = false;

      component.goToNextStep();

      expect(snackbarService.showError).toHaveBeenCalledWith(
        quizCRUDMessages.difficultyWiseQuestionSelectionError,
      );
      expect(component.activeStep).toBe(3);
    });

    it('should not increment beyond maxSteps', () => {
      component.activeStep = 4;
      component.goToNextStep();
      expect(component.activeStep).toBe(4);
    });
  });

  describe('goToPreviousStep', () => {
    it('should decrement activeStep', () => {
      component.activeStep = 2;
      component.goToPreviousStep();
      expect(component.activeStep).toBe(1);
    });

    it('should not decrement below 1', () => {
      component.activeStep = 1;
      component.goToPreviousStep();
      expect(component.activeStep).toBe(1);
    });
  });

  describe('mapToSaveQuizRequest', () => {
    it('should map quiz data correctly', () => {
      component.quizStep1Data = mockQuizStep1Data;
      const result = component.mapToSaveQuizRequest(mockQuizStep1Data, mockQuestionsList);

      const expected: SaveQuizRequest = {
        name: 'Test Quiz',
        categoryId: 1,
        description: 'Test Description',
        totalTime: 30,
        difficultyLevelId: 2,
        totalQuestion: 5,
        isPaid: true,
        price: 10,
        status: QuizStatus.Active,
        tags: [{ name: 'tag1' }, { name: 'tag2' }],
        questions: [
          {
            id: 1,
            categoryId: 1,
            queDifficultyId: 1,
            queText: 'Test Question',
            queTypeId: 1,
            queOptionsAns: [{ key: 'A', value: 'Option A' }],
          },
        ],
        noOfQuestionsPerDifficulty: [
          { queDifficultyName: 'easy', noOfQuestions: 2 },
          { queDifficultyName: 'medium', noOfQuestions: 2 },
          { queDifficultyName: 'hard', noOfQuestions: 1 },
        ],
      };
      expect(result).toEqual(expected);
    });

    it('should handle non-paid quiz', () => {
      component.quizStep1Data = { ...mockQuizStep1Data, isPaid: false };
      const result = component.mapToSaveQuizRequest({ ...mockQuizStep1Data, isPaid: false }, []);
      expect(result.price).toBeUndefined();
    });
  });

  describe('saveQuiz', () => {
    beforeEach(() => {
      component.quizStep1Data = mockQuizStep1Data;
      component.selectedQuestions = mockQuestionsList;
    });

    it('should not save if quizStep1Data is missing', () => {
      component.quizStep1Data = undefined as any;
      component.saveQuiz();
      expect(quizCreationService.createOrUpdateQuiz).not.toHaveBeenCalled();
    });

    it('should not save if selectedQuestions are empty', () => {
      component.selectedQuestions = [];
      component.saveQuiz();
      expect(quizCreationService.createOrUpdateQuiz).not.toHaveBeenCalled();
    });

    it('should save quiz and navigate on success', () => {
      component.saveQuiz();

      expect(quizCreationService.createOrUpdateQuiz).toHaveBeenCalled();
      expect(snackbarService.showSuccess).toHaveBeenCalledWith(
        platformMessages.successTitle,
        quizCRUDMessages.quizSaved,
      );
      expect(router.navigate).toHaveBeenCalledWith([Navigations.Admin, Navigations.Quizzes]);
    });

    it('should set id in edit mode', () => {
      component.isEditMode = true;
      component.decodedId = 1;
      component.saveQuiz();

      const saveRequest = quizCreationService.createOrUpdateQuiz.mock
        .calls[0][0] as SaveQuizRequest;
      expect(saveRequest.id).toBe(1);
    });

    it('should show error on save failure', () => {
      const mockError = { error: { message: 'Save failed' } };
      quizCreationService.createOrUpdateQuiz.mockReturnValue(throwError(() => mockError));

      component.saveQuiz();

      expect(snackbarService.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        'Save failed',
      );
    });
  });

  describe('draftQuiz', () => {
    beforeEach(() => {
      // Ensure all child components are properly mocked
      component.step2Component = { selectedIndexStep2: 0 } as any;
      component.quizStep1Data = mockQuizStep1Data;
      component.selectedQuestions = Array(5).fill(mockQuestionsList[0]);
      component.isValidSelectedQuestions = true;
    });

    it('should not save draft if step 1 form is invalid', () => {
      component.activeStep = 1;
      component.step1Component.submitStep1Form = jest.fn().mockReturnValue(false);
      component.draftQuiz();
      expect(quizCreationService.createOrUpdateQuiz).not.toHaveBeenCalled();
    });

    it('should show error and not save draft from step 2 if no selection', () => {
      component.activeStep = 2;
      component.step2Component.selectedIndexStep2 = null;
      component.draftQuiz();
      expect(snackbarService.showError).toHaveBeenCalledWith(
        quizCRUDMessages.questionCreationMethodSelectError,
      );
      expect(quizCreationService.createOrUpdateQuiz).not.toHaveBeenCalled();
    });

    it('should show error if step 3 has incorrect number of questions', fakeAsync(() => {
      component.activeStep = 3;
      component.step3Component = { selectedQuestions: [mockQuestionsList[0]] } as any;
      component.draftQuiz();
      tick();
      fixture.detectChanges();
      expect(snackbarService.showError).toHaveBeenCalledWith(
        quizCRUDMessages.totalQuestionsError(mockQuizStep1Data.totalQuestions),
      );
      expect(quizCreationService.createOrUpdateQuiz).not.toHaveBeenCalled();
    }));
  });

  describe('loadQuiz', () => {
    it('should load quiz and set edit mode', () => {
      component.loadQuiz(1);

      expect(quizCreationService.getQuiz).toHaveBeenCalledWith(1);
      expect(component.isEditMode).toBe(true);
    });

    it('should handle load error', () => {
      quizCreationService.getQuiz.mockReturnValue(
        throwError(() => ({ error: { message: 'Error loading' } })),
      );

      component.loadQuiz(1);

      expect(snackbarService.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        'Error loading',
      );
    });
  });

  describe('categoryChanged', () => {
    it('should clear selectedQuestions', () => {
      component.selectedQuestions = mockQuestionsList;
      component.categoryChanged();
      expect(component.selectedQuestions).toEqual([]);
    });
  });

  describe('getEditQuizConfig', () => {
    it('should update quizCreationHeaderConfiguration and steps for edit mode', fakeAsync(() => {
      component['getEditQuizConfig']();
      tick();
      fixture.detectChanges();
      expect(component.quizCreationHeaderConfiguration.title).toBe(quizCRUDMessages.editQuizTitle);
      expect(component.quizCreationHeaderConfiguration.subtitle).toBe(
        quizCRUDMessages.editQuizSubtitle,
      );
      expect(component.steps[0].heading).toBe(quizCRUDMessages.editQuizTitle);
    }));
  });

  describe('getEditQuizConfig', () => {
    it('should update quizCreationHeaderConfiguration and steps for edit mode', fakeAsync(() => {
      component['getEditQuizConfig']();
      tick();
      fixture.detectChanges();
      expect(component.quizCreationHeaderConfiguration.title).toBe(quizCRUDMessages.editQuizTitle);
      expect(component.quizCreationHeaderConfiguration.subtitle).toBe(
        quizCRUDMessages.editQuizSubtitle,
      );
      expect(component.steps[0].heading).toBe(quizCRUDMessages.editQuizTitle);
    }));
  });

  describe('goBack', () => {
    it('should call location.back()', () => {
      component.goBack();
      expect(location.back).toHaveBeenCalled();
    });
  });

  describe('getStepClass', () => {
    it('should return step-active for active or completed steps', () => {
      component.activeStep = 2;
      expect(component.getStepClass(0)).toBe('step-active'); // Step 1
      expect(component.getStepClass(1)).toBe('step-active'); // Step 2
    });

    it('should return step-inactive for future steps', () => {
      component.activeStep = 2;
      expect(component.getStepClass(2)).toBe('step-inactive'); // Step 3
    });
  });

  describe('getTextClass', () => {
    it('should return text-active for active or completed steps', () => {
      component.activeStep = 2;
      expect(component.getTextClass(0)).toBe('text-active'); // Step 1
      expect(component.getTextClass(1)).toBe('text-active'); // Step 2
    });

    it('should return text-inactive for future steps', () => {
      component.activeStep = 2;
      expect(component.getTextClass(2)).toBe('text-inactive'); // Step 3
    });
  });
});
