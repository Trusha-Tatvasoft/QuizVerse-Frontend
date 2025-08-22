import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { QuizCreationLayoutComponent } from './quiz-creation-layout.component';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { FilledButtonComponent } from '../../../../../shared/components/filled-button/filled-button.component';
import { OutlineButtonComponent } from '../../../../../shared/components/outline-button/outline-button.component';
import { QuizCreationService } from '../../../../../services/admin/quiz-management/quiz-creation/quiz-creation.service';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, EventEmitter, Output } from '@angular/core';
import { of, throwError } from 'rxjs';
import { quizCRUDMessages } from '../../../../../utils/constants';
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
}

@Component({
  selector: 'app-quiz-creation-step-3-layout',
  template: '',
})
class QuizCreationStep3LayoutStubComponent {
  selectedQuestions: QuestionsList[] = [];
}

@Component({
  selector: 'app-quiz-creation-step-4',
  template: '',
})
class QuizCreationStep4StubComponent {}

describe('QuizCreationLayoutComponent', () => {
  let component: QuizCreationLayoutComponent;
  let fixture: ComponentFixture<QuizCreationLayoutComponent>;
  let quizCreationService: jest.Mocked<QuizCreationService>;
  let snackbarService: jest.Mocked<SnackbarService>;
  let router: jest.Mocked<Router>;
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

  beforeAll(() => {
    if (!(global as any).crypto) {
      (global as any).crypto = {};
    }
    (global as any).crypto.randomUUID = () =>
      'mock-uuid-' + Math.random().toString(36).substring(2, 9);
  });

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
        QuizCreationStep1StubComponent,
        QuizCreationStep2StubComponent,
        QuizCreationStep3LayoutStubComponent,
        QuizCreationStep4StubComponent,
        PageHeaderComponent,
        FilledButtonComponent,
        OutlineButtonComponent,
      ],
      providers: [
        { provide: QuizCreationService, useValue: quizCreationService },
        { provide: SnackbarService, useValue: snackbarService },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: route },
        ChangeDetectorRef,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizCreationLayoutComponent);
    component = fixture.componentInstance;
    cdr = TestBed.inject(ChangeDetectorRef);

    // Setup initial data and stub components
    component.quizStep1Data = defaultQuizStep1Data;
    component.step1Component = TestBed.createComponent(QuizCreationStep1StubComponent)
      .componentInstance as any;
    component.step2Component = TestBed.createComponent(QuizCreationStep2StubComponent)
      .componentInstance as any;
    component.step3Component = TestBed.createComponent(QuizCreationStep3LayoutStubComponent)
      .componentInstance as any;
    component.step4Component = TestBed.createComponent(QuizCreationStep4StubComponent)
      .componentInstance as any;

    fixture.detectChanges(); // Ensure Angular lifecycle hooks run
  });

  it('should create', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    expect(component).toBeTruthy();
  }));

  describe('ngOnInit', () => {
    it('should initialize component', fakeAsync(() => {
      component.ngOnInit();
      tick();
      fixture.detectChanges();
      expect(component.activeStep).toBe(1);
      expect(component.maxSteps).toBe(4);
    }));
  });

  describe('ngAfterViewInit', () => {
    it('should call loadQuiz if decodedId exists', fakeAsync(() => {
      component.decodedId = 1;
      const loadQuizSpy = jest.spyOn(component, 'loadQuiz');
      component.ngAfterViewInit();
      tick();
      fixture.detectChanges();
      expect(loadQuizSpy).toHaveBeenCalledWith(1);
    }));

    it('should not call loadQuiz if decodedId is undefined', fakeAsync(() => {
      component.decodedId = null as any;
      const loadQuizSpy = jest.spyOn(component, 'loadQuiz');
      component.ngAfterViewInit();
      tick();
      fixture.detectChanges();
      expect(loadQuizSpy).not.toHaveBeenCalled();
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
    it('should decode valid id and update edit mode', fakeAsync(() => {
      route.snapshot.paramMap.get.mockReturnValue(btoa('123'));
      component.ngOnInit();
      tick();
      fixture.detectChanges();
      expect(component.decodedId).toBe(123);
      expect(component.quizCreationHeaderConfiguration.title).toBe(quizCRUDMessages.editQuizTitle);
    }));

    it('should show error and set decodedId to 0 for invalid base64', fakeAsync(() => {
      route.snapshot.paramMap.get.mockReturnValue('invalid');
      component.ngOnInit();
      tick();
      fixture.detectChanges();
      expect(snackbarService.showError).toHaveBeenCalledWith(quizCRUDMessages.invalideQuizId);
      expect(component.decodedId).toBe(0);
    }));

    it('should show error and set decodedId to 0 for non-number decoded value', fakeAsync(() => {
      route.snapshot.paramMap.get.mockReturnValue(btoa('not-a-number'));
      component.ngOnInit();
      tick();
      fixture.detectChanges();
      expect(snackbarService.showError).toHaveBeenCalledWith(quizCRUDMessages.invalideQuizId);
      expect(component.decodedId).toBe(0);
    }));

    it('should do nothing if no id is provided', fakeAsync(() => {
      route.snapshot.paramMap.get.mockReturnValue(null);
      component.ngOnInit();
      tick();
      fixture.detectChanges();
      expect(component.decodedId).toBeUndefined();
      expect(snackbarService.showError).not.toHaveBeenCalled();
    }));
  });

  describe('updateSelectedQuestions', () => {
    it('should update selectedQuestions', fakeAsync(() => {
      component.updateSelectedQuestions(mockQuestionsList);
      tick();
      fixture.detectChanges();
      expect(component.selectedQuestions).toEqual(mockQuestionsList);
    }));
  });

  describe('validSelectedQuestionsChange', () => {
    it('should update isValidSelectedQuestions', fakeAsync(() => {
      component.validSelectedQuestionsChange(true);
      tick();
      fixture.detectChanges();
      expect(component.isValidSelectedQuestions).toBe(true);
    }));
  });

  describe('getStepClass', () => {
    it('should return step-active for active or completed steps', fakeAsync(() => {
      component.activeStep = 2;
      tick();
      fixture.detectChanges();
      expect(component.getStepClass(0)).toBe('step-active'); // Step 1
      expect(component.getStepClass(1)).toBe('step-active'); // Step 2
    }));

    it('should return step-inactive for future steps', fakeAsync(() => {
      component.activeStep = 2;
      tick();
      fixture.detectChanges();
      expect(component.getStepClass(2)).toBe('step-inactive'); // Step 3
    }));
  });

  describe('getTextClass', () => {
    it('should return text-active for active or completed steps', fakeAsync(() => {
      component.activeStep = 2;
      tick();
      fixture.detectChanges();
      expect(component.getTextClass(0)).toBe('text-active'); // Step 1
      expect(component.getTextClass(1)).toBe('text-active'); // Step 2
    }));

    it('should return text-inactive for future steps', fakeAsync(() => {
      component.activeStep = 2;
      tick();
      fixture.detectChanges();
      expect(component.getTextClass(2)).toBe('text-inactive'); // Step 3
    }));
  });

  describe('goToNextStep', () => {
    beforeEach(() => {
      component.step1Component.submitStep1Form = jest.fn().mockImplementation(() => true);
      component.step2Component = { selectedIndexStep2: 0 } as any;
      component.step3Component = { selectedQuestions: Array(5).fill(mockQuestionsList[0]) } as any;
      component.quizStep1Data = mockQuizStep1Data;
      component.isValidSelectedQuestions = true;
    });

    it('should not proceed from step 1 if form is invalid', fakeAsync(() => {
      component.activeStep = 1;
      component.step1Component.submitStep1Form = jest.fn().mockImplementation(() => false);
      component.goToNextStep();
      tick();
      fixture.detectChanges();
      expect(component.activeStep).toBe(1);
    }));

    it('should show error and not proceed from step 2 if no selection', fakeAsync(() => {
      component.activeStep = 2;
      component.step2Component.selectedIndexStep2 = null;
      component.goToNextStep();
      tick();
      fixture.detectChanges();
      expect(snackbarService.showError).toHaveBeenCalledWith(
        quizCRUDMessages.questionCreationMethodSelectError,
      );
      expect(component.activeStep).toBe(2);
    }));

    it('should show error if step 3 has incorrect number of questions', fakeAsync(() => {
      component.activeStep = 3;
      component.step3Component.selectedQuestions = [mockQuestionsList[0]];
      component.goToNextStep();
      tick();
      fixture.detectChanges();
      expect(snackbarService.showError).toHaveBeenCalledWith(
        quizCRUDMessages.totalQuestionsError(mockQuizStep1Data.totalQuestions),
      );
      expect(component.activeStep).toBe(3);
    }));

    it('should show error if step 3 questions are invalid', fakeAsync(() => {
      component.activeStep = 3;
      component.isValidSelectedQuestions = false;
      component.goToNextStep();
      tick();
      fixture.detectChanges();
      expect(snackbarService.showError).toHaveBeenCalledWith(
        quizCRUDMessages.difficultyWiseQuestionSelectionError,
      );
      expect(component.activeStep).toBe(3);
    }));

    it('should increment activeStep when valid', fakeAsync(() => {
      component.activeStep = 1;
      component.goToNextStep();
      tick();
      fixture.detectChanges();
      expect(component.activeStep).toBe(2);
    }));

    it('should not increment beyond maxSteps', fakeAsync(() => {
      component.activeStep = 4;
      component.goToNextStep();
      tick();
      fixture.detectChanges();
      expect(component.activeStep).toBe(4);
    }));
  });

  describe('goToPreviousStep', () => {
    it('should decrement activeStep', fakeAsync(() => {
      component.activeStep = 2;
      component.goToPreviousStep();
      tick();
      fixture.detectChanges();
      expect(component.activeStep).toBe(1);
    }));

    it('should not decrement below 1', fakeAsync(() => {
      component.activeStep = 1;
      component.goToPreviousStep();
      tick();
      fixture.detectChanges();
      expect(component.activeStep).toBe(1);
    }));
  });

  describe('mapToSaveQuizRequest', () => {
    it('should map quiz data correctly', fakeAsync(() => {
      component.quizStep1Data = mockQuizStep1Data;
      const result = component.mapToSaveQuizRequest(mockQuizStep1Data, mockQuestionsList);
      tick();
      fixture.detectChanges();
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
    }));

    it('should handle non-paid quiz', fakeAsync(() => {
      component.quizStep1Data = { ...mockQuizStep1Data, isPaid: false };
      const result = component.mapToSaveQuizRequest({ ...mockQuizStep1Data, isPaid: false }, []);
      tick();
      fixture.detectChanges();
      expect(result.price).toBeUndefined();
    }));
  });

  describe('saveQuiz', () => {
    beforeEach(fakeAsync(() => {
      component.quizStep1Data = defaultQuizStep1Data;
      component.selectedQuestions = [];
      component.step1Component.initialFormValues = defaultQuizStep1Data;
      component.step3Component = { selectedQuestions: Array(5).fill(mockQuestionsList[0]) } as any;
      tick();
      fixture.detectChanges();
    }));

    it('should not save if quizStep1Data or selectedQuestions are missing', fakeAsync(() => {
      component.quizStep1Data = undefined as any;
      component.selectedQuestions = [];
      component.saveQuiz();
      tick();
      fixture.detectChanges();
      expect(quizCreationService.createOrUpdateQuiz).not.toHaveBeenCalled();
    }));

    it('should save quiz and navigate on success', fakeAsync(() => {
      component.quizStep1Data = mockQuizStep1Data;
      component.selectedQuestions = mockQuestionsList;
      component.saveQuiz();
      tick();
      fixture.detectChanges();
      expect(quizCreationService.createOrUpdateQuiz).toHaveBeenCalled();
      expect(snackbarService.showSuccess).toHaveBeenCalledWith(quizCRUDMessages.quizSaved);
      expect(router.navigate).toHaveBeenCalledWith([Navigations.Admin, Navigations.Quizzes]);
    }));

    it('should set id in edit mode', fakeAsync(() => {
      component.quizStep1Data = mockQuizStep1Data;
      component.selectedQuestions = mockQuestionsList;
      component.isEditMode = true;
      component.decodedId = 1;
      component.saveQuiz();
      tick();
      fixture.detectChanges();
      expect(quizCreationService.createOrUpdateQuiz).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1 }),
      );
    }));

    it('should show error on save failure', fakeAsync(() => {
      component.quizStep1Data = mockQuizStep1Data;
      component.selectedQuestions = mockQuestionsList;
      quizCreationService.createOrUpdateQuiz.mockReturnValue(throwError(() => 'error'));
      component.saveQuiz();
      tick();
      fixture.detectChanges();
      expect(snackbarService.showError).toHaveBeenCalledWith('error');
    }));
  });

  describe('draftQuiz', () => {
    beforeEach(fakeAsync(() => {
      component.step1Component.submitStep1Form = jest.fn().mockImplementation(() => true);
      component.step2Component = { selectedIndexStep2: 0 } as any;
      component.step3Component = { selectedQuestions: Array(5).fill(mockQuestionsList[0]) } as any;
      component.quizStep1Data = mockQuizStep1Data;
      component.isValidSelectedQuestions = true;
      tick();
      fixture.detectChanges();
    }));

    it('should not save draft if step 1 form is invalid', fakeAsync(() => {
      component.activeStep = 1;
      component.step1Component.submitStep1Form = jest.fn().mockImplementation(() => false);
      component.draftQuiz();
      tick();
      fixture.detectChanges();
      expect(quizCreationService.createOrUpdateQuiz).not.toHaveBeenCalled();
    }));

    it('should show error and not save draft from step 2 if no selection', fakeAsync(() => {
      component.activeStep = 2;
      component.step2Component = { selectedIndexStep2: null } as any;
      component.draftQuiz();
      tick();
      fixture.detectChanges();
      expect(snackbarService.showError).toHaveBeenCalledWith(
        quizCRUDMessages.questionCreationMethodSelectError,
      );
      expect(quizCreationService.createOrUpdateQuiz).not.toHaveBeenCalled();
    }));

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

    it('should show error if step 3 questions are invalid', fakeAsync(() => {
      component.activeStep = 3;
      component.isValidSelectedQuestions = false;
      component.draftQuiz();
      tick();
      fixture.detectChanges();
      expect(snackbarService.showError).toHaveBeenCalledWith(
        quizCRUDMessages.difficultyWiseQuestionSelectionError,
      );
      expect(quizCreationService.createOrUpdateQuiz).not.toHaveBeenCalled();
    }));

    it('should save draft and navigate on success', fakeAsync(() => {
      component.draftQuiz();
      tick();
      fixture.detectChanges();

      expect(quizCreationService.createOrUpdateQuiz).toHaveBeenCalledWith(
        expect.objectContaining({ status: QuizStatus.Draft }),
      );
      expect(snackbarService.showSuccess).toHaveBeenCalledWith(quizCRUDMessages.quizDrafSaved);
      expect(router.navigate).toHaveBeenCalledWith([Navigations.Admin, Navigations.Quizzes]);
    }));

    it('should set id in edit mode for draft', fakeAsync(() => {
      component.isEditMode = true;
      component.decodedId = 1;
      component.draftQuiz();
      tick();
      fixture.detectChanges();
      expect(quizCreationService.createOrUpdateQuiz).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, status: QuizStatus.Draft }),
      );
    }));
  });

  // describe('mapBackendQuizResponse', () => {
  //   it('should map backend response to component data', fakeAsync(() => {
  //     // Arrange: mock backend response
  //     const backendResponse: QuizResponse = {
  //       name: 'Test Quiz',
  //       categoryId: 1,
  //       description: 'Test Description',
  //       totalTime: 30,
  //       difficultyLevelId: 2,
  //       isPaid: true,
  //       price: 10,
  //       totalQuestion: 5,
  //       status: QuizStatus.Active,
  //       tags: [{ name: 'tag1' }, { name: 'tag2' }],
  //       questions: [
  //         {
  //           id: 1,
  //           category_id: 1,
  //           que_difficulty_id: 1,
  //           que_text: 'Test Question',
  //           que_type_id: 1,
  //           que_options_ans: [{ id: 1, question_id: 1, key: 'A', value: 'Option A' }],
  //         },
  //       ],
  //       noOfQuestionsPerDifficulty: [
  //         { que_difficulty_name: 'easy', no_of_questions: 2 },
  //         { que_difficulty_name: 'medium', no_of_questions: 2 },
  //         { que_difficulty_name: 'hard', no_of_questions: 1 },
  //       ],
  //     };

  //     // Make sure step1Component exists and is mocked
  //     component.step1Component = { initializeForm: jest.fn() } as any;

  //     // Act: call the mapping function
  //     component.mapBackendQuizResponse(backendResponse);
  //     tick();
  //     fixture.detectChanges();

  //     // Assert: quizStep1Data mapped correctly
  //     expect(component.quizStep1Data).toEqual({
  //       quizTitle: 'Test Quiz',
  //       quizCategory: 1,
  //       description: 'Test Description',
  //       quizTiming: 30,
  //       difficultyLevel: 2,
  //       isPaid: true,
  //       price: 10,
  //       totalQuestions: 5,
  //       tags: ['tag1', 'tag2'],
  //       difficultyDistribution: [
  //         { key: 'easyQuestions', value: 2 },
  //         { key: 'mediumQuestions', value: 2 },
  //         { key: 'hardQuestions', value: 1 },
  //       ],
  //     });

  //     // Assert: selectedQuestions mapped correctly
  //     expect(component.selectedQuestions).toEqual([
  //       {
  //         id: 1,
  //         categoryId: 1,
  //         queDifficultyId: 1,
  //         queText: 'Test Question',
  //         queTypeId: 1,
  //         queOptionsAns: [{ id: 1, question_id: 1, key: 'A', value: 'Option A' }],
  //       },
  //     ]);

  //     // Assert: initializeForm called
  //     expect(component.step1Component.initializeForm).toHaveBeenCalled();
  //   }));

  // });

  describe('loadQuiz', () => {
    it('should load quiz and set edit mode on success', fakeAsync(() => {
      const mockResponse: QuizResponse = {
        name: 'Test Quiz',
        categoryId: 1,
        description: 'Test Description',
        totalTime: 30,
        difficultyLevelId: 2,
        isPaid: true,
        price: 10,
        totalQuestion: 5,
        status: QuizStatus.Active,
        tags: [],
        questions: [],
        noOfQuestionsPerDifficulty: [],
      };
      quizCreationService.getQuiz.mockReturnValue(
        of({
          result: true,
          statusCode: 200,
          message: 'Quiz fetched',
          data: mockResponse,
        }),
      );
      const mapBackendSpy = jest.spyOn(component, 'mapBackendQuizResponse');
      component.loadQuiz(1);
      tick();
      fixture.detectChanges();
      expect(quizCreationService.getQuiz).toHaveBeenCalledWith(1);
      expect(mapBackendSpy).toHaveBeenCalledWith(mockResponse);
      expect(component.isEditMode).toBe(true);
    }));

    it('should show error on load failure', fakeAsync(() => {
      quizCreationService.getQuiz.mockReturnValue(throwError(() => 'error'));
      component.loadQuiz(1);
      tick();
      fixture.detectChanges();
      expect(snackbarService.showError).toHaveBeenCalledWith('error');
    }));
  });

  describe('categoryChanged', () => {
    it('should clear selectedQuestions', fakeAsync(() => {
      component.selectedQuestions = mockQuestionsList;
      component.categoryChanged();
      tick();
      fixture.detectChanges();
      expect(component.selectedQuestions).toEqual([]);
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
});
