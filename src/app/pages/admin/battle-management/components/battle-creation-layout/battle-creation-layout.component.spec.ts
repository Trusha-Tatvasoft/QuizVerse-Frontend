import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BattleCreationLayoutComponent } from './battle-creation-layout.component';
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { BattleManagementService } from '../../../../../services/admin/battle-management/battle-management.service';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { of, throwError } from 'rxjs';
import { Component, EventEmitter, Output } from '@angular/core';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { FilledButtonComponent } from '../../../../../shared/components/filled-button/filled-button.component';
import { OutlineButtonComponent } from '../../../../../shared/components/outline-button/outline-button.component';
import {
  BattleStep1Data,
  SaveBattleRequest,
  QuestionsList,
  BattleResponse,
  BattleQuestionDifficulty,
  QuestionDifficultyXP,
} from '../../interfaces/battle-creation.interface';
import { quizCRUDMessages, platformMessages } from '../../../../../utils/constants';
import { Navigations } from '../../../../../shared/enums/navigation';
import { ChangeDetectorRef } from '@angular/core';

// Stub components to isolate child component dependencies
@Component({
  selector: 'app-battle-creation-step-1',
  template: '',
})
class BattleCreationStep1StubComponent {
  @Output() formValuesChange = new EventEmitter<BattleStep1Data>();
  @Output() categoryChanged = new EventEmitter<void>();
  initialFormValues: BattleStep1Data;
  isEditMode: boolean = false;
  totalTimeStep1: number = 0;
  totalXPStep1: number = 0;
  totalQuestionsStep1: number = 0;
  questionsDifficultyXPOption: QuestionDifficultyXP[] = []; // Ensure always defined
  submitStep1Form = jest.fn().mockImplementation(() => true);
  initializeForm = jest.fn().mockImplementation(() => {
    this.formValuesChange.emit(this.initialFormValues);
  });
}
@Component({
  selector: 'app-battle-creation-step-2',
  template: '',
})
class BattleCreationStep2StubComponent {
  selectedIndexStep2: number | null = 0;
}

@Component({
  selector: 'app-battle-creation-step-3-layout',
  template: '',
})
class BattleCreationStep3LayoutStubComponent {
  selectedQuestions: QuestionsList[] = [];
  questionDifficultyOption: { value: number; label: string }[] = [];
}

@Component({
  selector: 'app-battle-creation-step-4',
  template: '',
})
class BattleCreationStep4StubComponent {}

describe('BattleCreationLayoutComponent', () => {
  let component: BattleCreationLayoutComponent;
  let fixture: ComponentFixture<BattleCreationLayoutComponent>;
  let battleManagementService: jest.Mocked<BattleManagementService>;
  let snackbarService: jest.Mocked<SnackbarService>;
  let router: jest.Mocked<Router>;
  let route: { snapshot: { paramMap: { get: jest.Mock } } };
  let cdr: ChangeDetectorRef;

  // Mock data
  const mockBattleStep1Data: BattleStep1Data = {
    id: 1,
    name: 'Test Battle',
    description: 'Test Description',
    difficultyLevelId: 2,
    categoryId: 1,
    battleType: 1,
    startDate: new Date('2025-09-01T10:00:00Z'),
    endDate: new Date('2025-09-02T10:00:00Z'),
    totalTime: 30,
    totalQuestion: 5,
    totalXp: 100,
    questionsDifficulty: [
      { queDifficultyId: 2, noOfQues: 2, timePerQuestion: 30 },
      { queDifficultyId: 3, noOfQues: 2, timePerQuestion: 45 },
      { queDifficultyId: 4, noOfQues: 1, timePerQuestion: 60 },
    ],
  };

  const mockQuestionsList: QuestionsList[] = [
    {
      id: 1,
      categoryId: 1,
      queDifficultyId: 2,
      queText: 'Test Question',
      queTypeId: 1,
      queOptionsAns: [{ id: 1, questionId: 1, key: 'A', value: 'Option A' }],
    },
  ];

  const mockBattleResponse: BattleResponse = {
    id: 1,
    name: 'Test Battle',
    description: 'Test Description',
    difficultyLevelId: 2,
    categoryId: 1,
    battleType: 1,
    startDate: new Date('2025-09-01T10:00:00Z'),
    endDate: new Date('2025-09-02T10:00:00Z'),
    totalTime: 30,
    totalQuestion: 5,
    totalXp: 100,
    questions: [
      {
        id: 1,
        categoryId: 1,
        queDifficultyId: 2,
        queText: 'Test Question',
        queTypeId: 1,
        queOptionsAns: [{ id: 1, questionId: 1, key: 'A', value: 'Option A' }],
      },
    ],
    questionsDifficulty: [
      { queDifficultyId: 2, noOfQues: 2, timePerQuestion: 30 },
      { queDifficultyId: 3, noOfQues: 2, timePerQuestion: 45 },
      { queDifficultyId: 4, noOfQues: 1, timePerQuestion: 60 },
    ],
  };

  const defaultBattleStep1Data: BattleStep1Data = {
    name: '',
    description: '',
    difficultyLevelId: 0,
    categoryId: 0,
    battleType: 0,
    startDate: new Date(),
    endDate: new Date(),
    totalTime: 0,
    totalQuestion: 0,
    totalXp: 0,
    questionsDifficulty: [],
  };

  beforeEach(async () => {
    battleManagementService = {
      getBattle: jest.fn().mockReturnValue(
        of({
          result: true,
          statusCode: 200,
          message: 'Battle fetched',
          data: mockBattleResponse,
        }),
      ),
      createOrUpdateBattle: jest.fn().mockReturnValue(
        of({
          result: true,
          statusCode: 200,
          message: 'Success',
          data: null,
        }),
      ),
      getDropDownData: jest.fn().mockImplementation((type: string) =>
        of({
          result: true,
          statusCode: 200,
          message: 'Dropdown data fetched',
          data: [
            { id: 2, name: 'Easy' },
            { id: 3, name: 'Medium' },
            { id: 4, name: 'Hard' },
          ],
        }),
      ),
      getQuestionDifficultyXP: jest.fn().mockReturnValue(
        of({
          result: true,
          statusCode: 200,
          message: 'Question difficulty XP fetched',
          data: [
            { questionDifficultyId: 2, questionDifficultyName: 'Easy', xpGained: 10 },
            { questionDifficultyId: 3, questionDifficultyName: 'Medium', xpGained: 20 },
            { questionDifficultyId: 4, questionDifficultyName: 'Hard', xpGained: 30 },
          ],
        }),
      ),
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
        BattleCreationLayoutComponent,
        BattleCreationStep1StubComponent,
        BattleCreationStep2StubComponent,
        BattleCreationStep3LayoutStubComponent,
        BattleCreationStep4StubComponent,
        PageHeaderComponent,
        FilledButtonComponent,
        OutlineButtonComponent,
      ],
      providers: [
        { provide: BattleManagementService, useValue: battleManagementService },
        { provide: SnackbarService, useValue: snackbarService },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: route },
        ChangeDetectorRef,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BattleCreationLayoutComponent);
    component = fixture.componentInstance;
    cdr = TestBed.inject(ChangeDetectorRef);

    // Setup child component stubs
    component.step1Component = TestBed.createComponent(BattleCreationStep1StubComponent)
      .componentInstance as any;
    component.step2Component = TestBed.createComponent(BattleCreationStep2StubComponent)
      .componentInstance as any;
    component.step3Component = TestBed.createComponent(BattleCreationStep3LayoutStubComponent)
      .componentInstance as any;
    component.step4Component = TestBed.createComponent(BattleCreationStep4StubComponent)
      .componentInstance as any;

    component.battleStep1Data = defaultBattleStep1Data;
    fixture.detectChanges();
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
    it('should call loadBattle if decodedId exists', fakeAsync(() => {
      component.decodedId = 1;
      const loadQuizSpy = jest.spyOn(component, 'loadBattle');
      component.ngAfterViewInit();
      tick();
      fixture.detectChanges();
      expect(loadQuizSpy).toHaveBeenCalledWith(1);
    }));

    it('should not call loadBattle if decodedId is undefined', fakeAsync(() => {
      component.decodedId = null as any;
      const loadQuizSpy = jest.spyOn(component, 'loadBattle');
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
      expect(component.battleCreationHeaderConfiguration.title).toBe(
        platformMessages.editBattleTitle,
      );
    }));

    it('should show error and set decodedId to 0 for invalid base64', fakeAsync(() => {
      route.snapshot.paramMap.get.mockReturnValue('invalid');
      component.ngOnInit();
      tick();
      fixture.detectChanges();
      expect(snackbarService.showError).toHaveBeenCalledWith(platformMessages.invalideBattleId);
      expect(component.decodedId).toBe(0);
    }));

    it('should show error and set decodedId to 0 for non-number decoded value', fakeAsync(() => {
      route.snapshot.paramMap.get.mockReturnValue(btoa('not-a-number'));
      component.ngOnInit();
      tick();
      fixture.detectChanges();
      expect(snackbarService.showError).toHaveBeenCalledWith(platformMessages.invalideBattleId);
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

  describe('getEditBattleConfig', () => {
    it('should update battleCreationHeaderConfiguration and steps for edit mode', fakeAsync(() => {
      component['getEditBattleConfig']();
      tick();
      fixture.detectChanges();
      expect(component.battleCreationHeaderConfiguration.title).toBe(
        platformMessages.editBattleTitle,
      );
      expect(component.battleCreationHeaderConfiguration.subtitle).toBe(
        platformMessages.editBattleSubtitle,
      );
      expect(component.steps[0].heading).toBe(platformMessages.editBattleTitle);
    }));
  });

  describe('getQuestionsCount', () => {
    it('should return the number of questions for a given difficulty', fakeAsync(() => {
      const questionsDifficulty: BattleQuestionDifficulty[] = [
        { queDifficultyId: 2, noOfQues: 3, timePerQuestion: 30 },
      ];
      expect(component.getQuestionsCount(questionsDifficulty, 2)).toBe('03');
      expect(component.getQuestionsCount(questionsDifficulty, 3)).toBe('00');
    }));
  });

  describe('getTimePerQuestion', () => {
    it('should return the time per question for a given difficulty', fakeAsync(() => {
      const questionsDifficulty: BattleQuestionDifficulty[] = [
        { queDifficultyId: 2, noOfQues: 3, timePerQuestion: 45 },
      ];
      expect(component.getTimePerQuestion(questionsDifficulty, 2)).toBe(45);
      expect(component.getTimePerQuestion(questionsDifficulty, 3)).toBe(30);
    }));
  });

  describe('toTimezoneISO', () => {
    it('should convert date to ISO string with offset', fakeAsync(() => {
      const date = new Date('2025-09-01T10:00:00Z');
      const result = component.toTimezoneISO(date, 330); // 330 minutes = 5.5 hours (IST)
      expect(result).toMatch(/2025-09-01T15:30:00\.000Z/); // Include milliseconds and Z
    }));

    it('should return null for null input', fakeAsync(() => {
      expect(component.toTimezoneISO(null, 330)).toBeNull();
    }));
  });

  describe('getStepClass', () => {
    it('should return step-active for active or completed steps', fakeAsync(() => {
      component.activeStep = 2;
      tick();
      fixture.detectChanges();
      expect(component.getStepClass(0)).toBe('step-active');
      expect(component.getStepClass(1)).toBe('step-active');
    }));

    it('should return step-inactive for future steps', fakeAsync(() => {
      component.activeStep = 2;
      tick();
      fixture.detectChanges();
      expect(component.getStepClass(2)).toBe('step-inactive');
    }));
  });

  describe('getTextClass', () => {
    it('should return text-active for active or completed steps', fakeAsync(() => {
      component.activeStep = 2;
      tick();
      fixture.detectChanges();
      expect(component.getTextClass(0)).toBe('text-active');
      expect(component.getTextClass(1)).toBe('text-active');
    }));

    it('should return text-inactive for future steps', fakeAsync(() => {
      component.activeStep = 2;
      tick();
      fixture.detectChanges();
      expect(component.getTextClass(2)).toBe('text-inactive');
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

  describe('step1ValueChange', () => {
    it('should update battleStep1Data', fakeAsync(() => {
      component.step1ValueChange(mockBattleStep1Data);
      tick();
      fixture.detectChanges();
      expect(component.battleStep1Data).toEqual(mockBattleStep1Data);
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

  describe('goToNextStep', () => {
    beforeEach(() => {
      component.step1Component.submitStep1Form = jest.fn().mockImplementation(() => true);
      component.step2Component = { selectedIndexStep2: 0 } as any;
      component.step3Component = {
        selectedQuestions: Array(5).fill(mockQuestionsList[0]),
        questionDifficultyOption: [{ value: 2, label: 'Easy' }],
        validSelectedQuestionsChange: new EventEmitter<boolean>(),
      } as any;
      component.battleStep1Data = mockBattleStep1Data;
      component.isValidSelectedQuestions = true;
      component.step1Component.questionsDifficultyXPOption = [
        { questionDifficultyId: 2, questionDifficultyName: 'Easy', xpGained: 10 },
      ];
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
        platformMessages.totalQuestionsError(mockBattleStep1Data.totalQuestion),
      );
      expect(component.activeStep).toBe(3);
    }));

    it('should update questionsDifficultyXPOption from step 1', fakeAsync(() => {
      component.activeStep = 1;
      component.step1Component = {
        ...component.step1Component,
        questionsDifficultyXPOption: [
          { questionDifficultyId: 2, questionDifficultyName: 'Easy', xpGained: 10 },
          { questionDifficultyId: 3, questionDifficultyName: 'Medium', xpGained: 20 },
        ],
        submitStep1Form: jest.fn().mockImplementation(() => true),
      } as any;
      fixture.detectChanges();
      component.goToNextStep();
      tick();
      expect(component.questionsDifficultyXPOption).toEqual(
        component.step1Component.questionsDifficultyXPOption,
      );
      expect(component.activeStep).toBe(2);
    }));

    it('should update questionDifficultyOption from step 3', fakeAsync(() => {
      component.activeStep = 3;
      component.step3Component.questionDifficultyOption = [{ value: 2, label: 'Easy' }];
      component.goToNextStep();
      tick();
      fixture.detectChanges();
      expect(component.questionDifficultyOption).toEqual(
        component.step3Component.questionDifficultyOption,
      );
      expect(component.activeStep).toBe(4);
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

  describe('mapToSaveBattleRequest', () => {
    it('should map battle data correctly', fakeAsync(() => {
      component.battleStep1Data = mockBattleStep1Data;
      const result = component.mapToSaveBattleRequest(mockBattleStep1Data, mockQuestionsList);
      tick();
      fixture.detectChanges();
      const expected: SaveBattleRequest = {
        id: 1,
        name: 'Test Battle',
        description: 'Test Description',
        difficultyLevelId: 2,
        categoryId: 1,
        battleType: 1,
        startDate: component.toTimezoneISO(mockBattleStep1Data.startDate, 330),
        endDate: component.toTimezoneISO(mockBattleStep1Data.endDate, 330),
        totalTime: 30,
        totalQuestion: 5,
        totalXp: 100,
        questions: [
          {
            id: 1,
            categoryId: 1,
            queDifficultyId: 2,
            queText: 'Test Question',
            queTypeId: 1,
            queOptionsAns: [{ id: 1, questionId: 1, key: 'A', value: 'Option A' }],
          },
        ],
        questionsDifficulty: [
          { queDifficultyId: 2, noOfQues: 2, timePerQuestion: 30 },
          { queDifficultyId: 3, noOfQues: 2, timePerQuestion: 45 },
          { queDifficultyId: 4, noOfQues: 1, timePerQuestion: 60 },
        ],
      };
      expect(result).toEqual(expected);
    }));
  });

  describe('mapBackendBattleResponse', () => {
    it('should map backend response to component data', fakeAsync(() => {
      component.step1Component = {
        initializeForm: jest.fn(),
        totalTimeStep1: 0,
        totalXPStep1: 0,
        totalQuestionsStep1: 0,
      } as any;
      component.mapBackendBattleResponse(mockBattleResponse);
      tick();
      fixture.detectChanges();

      expect(component.battleStep1Data).toEqual({
        ...mockBattleStep1Data,
        battleTitle: mockBattleResponse.name,
        battleCategory: mockBattleResponse.categoryId,
        difficultyLevel: mockBattleResponse.difficultyLevelId,
        easyQuestions: '02',
        mediumQuestions: '02',
        hardQuestions: '01',
        easyTime: 30,
        mediumTime: 45,
        hardTime: 60,
        battleTypeName: undefined,
        battleCategoryName: undefined,
      });
      expect(component.selectedQuestions).toEqual(mockQuestionsList);
      expect(component.step1Component.initializeForm).toHaveBeenCalled();
      expect(component.step1Component.totalTimeStep1).toBe(mockBattleResponse.totalTime);
      expect(component.step1Component.totalXPStep1).toBe(mockBattleResponse.totalXp);
      expect(component.step1Component.totalQuestionsStep1).toBe(mockBattleResponse.totalQuestion);
    }));
  });

  describe('loadBattle', () => {
    it('should load battle and set edit mode on success', fakeAsync(() => {
      const mapBackendSpy = jest.spyOn(component, 'mapBackendBattleResponse');
      component.loadBattle(1);
      tick();
      fixture.detectChanges();
      expect(battleManagementService.getBattle).toHaveBeenCalledWith(1);
      expect(mapBackendSpy).toHaveBeenCalledWith(mockBattleResponse);
      expect(component.isEditMode).toBe(true);
    }));

    it('should show error on load failure', fakeAsync(() => {
      battleManagementService.getBattle.mockReturnValue(
        throwError(() => ({ error: { message: undefined } })),
      );

      component.loadBattle(1);
      tick();
      fixture.detectChanges();

      expect(snackbarService.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        platformMessages.errorMessage,
      );
    }));
  });

  describe('saveBattle', () => {
    beforeEach(fakeAsync(() => {
      component.battleStep1Data = defaultBattleStep1Data;
      component.selectedQuestions = [];
      component.step1Component.initialFormValues = defaultBattleStep1Data;
      tick();
      fixture.detectChanges();
    }));

    it('should not save if battleStep1Data or selectedQuestions are missing', fakeAsync(() => {
      component.battleStep1Data = undefined as any;
      component.selectedQuestions = [];
      component.saveBattle();
      tick();
      fixture.detectChanges();
      expect(battleManagementService.createOrUpdateBattle).not.toHaveBeenCalled();
    }));

    it('should save battle and navigate on success', fakeAsync(() => {
      component.battleStep1Data = mockBattleStep1Data;
      component.selectedQuestions = mockQuestionsList;
      component.saveBattle();
      tick();
      fixture.detectChanges();
      expect(battleManagementService.createOrUpdateBattle).toHaveBeenCalled();
      expect(snackbarService.showSuccess).toHaveBeenCalledWith(platformMessages.battleSaved);
      expect(router.navigate).toHaveBeenCalledWith([Navigations.Admin, Navigations.BattlesAdmin]);
    }));

    it('should set id in edit mode', fakeAsync(() => {
      component.battleStep1Data = mockBattleStep1Data;
      component.selectedQuestions = mockQuestionsList;
      component.isEditMode = true;
      component.decodedId = 1;
      component.saveBattle();
      tick();
      fixture.detectChanges();
      expect(battleManagementService.createOrUpdateBattle).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1 }),
      );
      expect(snackbarService.showSuccess).toHaveBeenCalledWith(platformMessages.battleUpdated);
    }));

    it('should show specific error if error data is provided', fakeAsync(() => {
      component.battleStep1Data = mockBattleStep1Data;
      component.selectedQuestions = mockQuestionsList;
      battleManagementService.createOrUpdateBattle.mockReturnValue(
        throwError(() => ({ error: { message: 'Specific error' } })),
      );

      component.saveBattle();
      tick();
      fixture.detectChanges();
      expect(snackbarService.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        'Specific error',
      );
    }));

    it('should show generic error if no specific error data', fakeAsync(() => {
      component.battleStep1Data = mockBattleStep1Data;
      component.selectedQuestions = mockQuestionsList;
      battleManagementService.createOrUpdateBattle.mockReturnValue(
        throwError(() => ({ error: { message: 'Generic error' } })),
      );

      component.saveBattle();
      tick();
      fixture.detectChanges();
      expect(snackbarService.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        'Generic error',
      );
    }));
  });

  describe('goBack', () => {
    it('Go Back To Battle Management', () => {
      component.goBack();
      expect(router.navigate).toHaveBeenCalledWith([Navigations.Admin, Navigations.BattlesAdmin]);
    });
  });
});
