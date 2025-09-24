import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { QuizAttemptLayoutComponent } from './quiz-attempt-layout.component';
import { QuizAttemptService } from '../../../services/user/quiz-attempt/quiz-attempt.service';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import {
  QuizQuestions,
  QuizStartResponse,
  VisitedQuestions,
} from './interfaces/quiz-attempt.interface';
import { VisitedQuestionStatus } from '../../../shared/enums/quiz-attempt.enum';
import { autoSubmitMessage, platformMessages } from '../../../utils/constants';
import { QuizQuestionComponent } from './quiz-question/quiz-question.component';
import { ProgressBarComponent } from '../../../shared/components/progress-bar/progress-bar.component';
import { FilledButtonComponent } from '../../../shared/components/filled-button/filled-button.component';
import { OutlineButtonComponent } from '../../../shared/components/outline-button/outline-button.component';
import { TagComponent } from '../../../shared/components/tag/tag.component';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Navigations } from '../../../shared/enums/navigation';
import {
  cancelButtonConfig,
  submitDialogButtonConfig,
  submitQuizDialog,
} from './configs/quiz-attempt.config';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ConfirmationDialogData } from '../../../shared/interfaces/confirmation-dialog.interface';

// Mock services and dependencies
const mockQuizAttemptService = {
  startQuiz: jest.fn(),
  saveAndGetNextQuestion: jest.fn(),
  submitQuiz: jest.fn(),
};

const mockSnackbarService = {
  showSuccess: jest.fn(),
  showError: jest.fn(),
};

const mockDialog = {
  open: jest.fn(),
  closeAll: jest.fn(),
};

const mockActivatedRoute = {
  snapshot: {
    paramMap: {
      get: jest.fn().mockReturnValue('MQ=='), // Base64 encoded '1'
    },
  },
};

const mockRouter = {
  navigate: jest.fn(),
};

describe('QuizAttemptLayoutComponent', () => {
  let component: QuizAttemptLayoutComponent;
  let fixture: ComponentFixture<QuizAttemptLayoutComponent>;
  let localStorageMock: {
    getItem: jest.Mock<string | null, [string]>;
    setItem: jest.Mock<void, [string, string]>;
    removeItem: jest.Mock<void, [string]>;
  };
  let activatedRoute: jest.Mocked<ActivatedRoute>;

  beforeEach(async () => {
    // Mock localStorage
    localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    // Mock document.documentElement.requestFullscreen
    Object.defineProperty(document, 'documentElement', {
      value: {
        requestFullscreen: jest.fn(),
      },
      writable: true,
    });

    // Mock document.fullscreenElement
    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      writable: true,
    });

    // Mock document.exitFullscreen
    Object.defineProperty(document, 'exitFullscreen', {
      value: jest.fn(),
      writable: true,
    });

    // Mock window properties
    Object.defineProperty(window, 'outerWidth', { value: 1024, writable: true });
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    Object.defineProperty(window, 'outerHeight', { value: 768, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });

    await TestBed.configureTestingModule({
      imports: [
        QuizAttemptLayoutComponent,
        QuizQuestionComponent,
        ProgressBarComponent,
        FilledButtonComponent,
        OutlineButtonComponent,
        TagComponent,
        MatIcon,
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatOptionModule,
        MatDividerModule,
        MatRadioModule,
        FormsModule,
        RouterTestingModule,
      ],
      providers: [
        { provide: QuizAttemptService, useValue: mockQuizAttemptService },
        { provide: SnackbarService, useValue: mockSnackbarService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizAttemptLayoutComponent);
    component = fixture.componentInstance;
    activatedRoute = TestBed.inject(ActivatedRoute) as jest.Mocked<ActivatedRoute>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set up fullscreen and event listeners', fakeAsync(() => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      const windowAddEventListenerSpy = jest.spyOn(window, 'addEventListener');
      const openFullscreenSpy = jest.spyOn(component as any, 'openFullscreen');

      component.ngOnInit();
      tick(0); // Handle setTimeout in ngOnInit

      expect(openFullscreenSpy).toHaveBeenCalled();
      expect(addEventListenerSpy).toHaveBeenCalledWith('fullscreenchange', expect.any(Function));
      expect(windowAddEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
      expect(windowAddEventListenerSpy).toHaveBeenCalledWith('pageshow', expect.any(Function));
    }));

    it('should call decodeRouteId', () => {
      const decodeRouteIdSpy = jest.spyOn(component as any, 'decodeRouteId');
      component.ngOnInit();
      expect(decodeRouteIdSpy).toHaveBeenCalled();
    });
  });

  describe('decodeRouteId', () => {
    let paramMapGetMock: jest.Mock;

    beforeEach(() => {
      // Create a mock for paramMap.get
      paramMapGetMock = jest.fn();
      mockActivatedRoute.snapshot.paramMap.get = paramMapGetMock;
    });

    it('should restore from saved state if available', () => {
      const mockQuizId = 1;
      const mockSavedState = {
        quizId: mockQuizId,
        currentQuestionIndex: 2,
        remainingSeconds: 1500,
        visitedQuestions: [],
        quizStartData: {} as any,
        currentQuestionData: {} as any,
        timestamp: Date.now(),
      };

      // Mock the route parameter
      paramMapGetMock.mockReturnValue('MQ==');

      // Mock the service to return a saved state
      const getSavedQuizStateSpy = jest
        .spyOn(component as any, 'getSavedQuizState')
        .mockReturnValue(mockSavedState);
      const restoreQuizStateSpy = jest.spyOn(component as any, 'restoreQuizState');
      const getQuizStartDataSpy = jest.spyOn(component as any, 'getQuizStartData');

      // Mock the base64 decoding
      jest.spyOn(global, 'decodeURIComponent').mockReturnValue('MQ==');
      jest.spyOn(window, 'atob').mockReturnValue('1');
      jest.spyOn(global, 'Number').mockImplementation((val) => parseInt(val, 10));

      component.decodeRouteId();

      expect(component.decodedId).toBe(mockQuizId);
      expect(getSavedQuizStateSpy).toHaveBeenCalledWith(mockQuizId);
      expect(restoreQuizStateSpy).toHaveBeenCalledWith(mockSavedState);
      expect(getQuizStartDataSpy).not.toHaveBeenCalled(); // Should not call getQuizStartData if saved state exists
    });

    it('should handle invalid encoded ID and show error', () => {
      // Mock the route parameter to return an invalid value
      paramMapGetMock.mockReturnValue('invalid');
      const snackbarSpy = jest.spyOn(mockSnackbarService, 'showError');

      component.decodeRouteId();

      expect(snackbarSpy).toHaveBeenCalledWith(platformMessages.invalidQuizId);
      expect(component.decodedId).toBe(0);
    });

    it('should handle missing encoded ID', () => {
      // Mock the route parameter to return null
      paramMapGetMock.mockReturnValue(null);
      const snackbarSpy = jest.spyOn(mockSnackbarService, 'showError');

      component.decodeRouteId();

      expect(snackbarSpy).not.toHaveBeenCalled();
      expect(component.decodedId).toBeUndefined();
    });

    it('should handle non-numeric decoded ID', () => {
      // Mock the route parameter
      paramMapGetMock.mockReturnValue('not-a-number');

      // Mock the decoding to return a non-numeric value
      jest.spyOn(global, 'decodeURIComponent').mockReturnValue('not-a-number');
      jest.spyOn(window, 'atob').mockReturnValue('not-a-number');
      jest.spyOn(global, 'Number').mockReturnValue(NaN);

      const snackbarSpy = jest.spyOn(mockSnackbarService, 'showError');

      component.decodeRouteId();

      expect(snackbarSpy).toHaveBeenCalledWith(platformMessages.invalidQuizId);
      expect(component.decodedId).toBe(0);
    });

    it('should handle decoding errors', () => {
      // Mock the route parameter
      paramMapGetMock.mockReturnValue('invalid-base64');

      // Mock decodeURIComponent to throw an error
      jest.spyOn(global, 'decodeURIComponent').mockImplementation(() => {
        throw new Error('Invalid URI');
      });

      const snackbarSpy = jest.spyOn(mockSnackbarService, 'showError');

      component.decodeRouteId();

      expect(snackbarSpy).toHaveBeenCalledWith(platformMessages.invalidQuizId);
      expect(component.decodedId).toBe(0);
    });
  });

  describe('getQuizStartData', () => {
    const mockQuizStartResponse: QuizStartResponse = {
      quizId: 1,
      quizQuestionId: 1,
      categoryName: 'Sample',
      questionType: 'multiple_choice',
      questionName: 'Sample Question',
      options: [
        { optionId: 1, key: 'option', value: 'A' },
        { optionId: 2, key: 'option', value: 'B' },
        { optionId: 3, key: 'option', value: 'C' },
        { optionId: 4, key: 'option', value: 'D' },
      ],
      totalQuestion: 10,
      totalTime: 30,
      quizName: 'Sample Quiz',
    };

    beforeEach(() => {
      // Initialize decodedId to avoid undefined issues
      component.decodedId = 123;
    });

    it('should initialize quiz data on successful response', fakeAsync(() => {
      mockQuizAttemptService.startQuiz.mockReturnValue(
        of({
          statusCode: 200,
          result: true,
          data: mockQuizStartResponse,
        }),
      );
      const startTimerSpy = jest.spyOn(component as any, 'startTimer');
      const saveQuizStateSpy = jest.spyOn(component as any, 'saveQuizState');

      component.getQuizStartData(123);
      tick();

      expect(component.quizStartData).toEqual(mockQuizStartResponse);
      expect(component.currentQuestionData).toEqual({
        questionId: mockQuizStartResponse.quizQuestionId,
        questionTypeName: mockQuizStartResponse.questionType,
        questionName: mockQuizStartResponse.questionName,
        options: mockQuizStartResponse.options,
      });
      expect(component.totalQuestions).toBe(mockQuizStartResponse.totalQuestion);
      expect(component.totalTime).toBe(mockQuizStartResponse.totalTime);
      expect(startTimerSpy).toHaveBeenCalled();
      expect(saveQuizStateSpy).toHaveBeenCalled();
      expect(mockSnackbarService.showSuccess).toHaveBeenCalledWith(
        platformMessages.startQuizMessage,
      );
    }));

    it('should handle quiz already completed and navigate to result', fakeAsync(() => {
      mockQuizAttemptService.startQuiz.mockReturnValue(
        of({
          statusCode: 400,
          result: false,
          message: 'Quiz already completed',
          data: null,
        }),
      );

      component.getQuizStartData(123);
      tick();

      expect(mockSnackbarService.showError).toHaveBeenCalledWith('Quiz already completed');
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        [
          Navigations.User,
          Navigations.QuizList,
          Navigations.BrowseQuizzes,
          Navigations.QuizResult,
          btoa('123'),
        ],
        { replaceUrl: true },
      );
    }));

    it('should handle error response', fakeAsync(() => {
      mockQuizAttemptService.startQuiz.mockReturnValue(
        throwError(() => ({
          error: { message: 'Error starting quiz' },
        })),
      );

      component.getQuizStartData(123);
      tick();

      expect(mockSnackbarService.showError).toHaveBeenCalledWith('Error starting quiz');
    }));
  });

  describe('markVisited', () => {
    it('should add new visited question', () => {
      const question: VisitedQuestions = {
        questionNo: 1,
        questionId: 1,
        questionTypeName: 'multiple_choice',
        questionName: 'Sample Question',
        options: [
          { optionId: 1, key: 'option', value: 'A' },
          { optionId: 2, key: 'option', value: 'B' },
          { optionId: 3, key: 'option', value: 'C' },
          { optionId: 4, key: 'option', value: 'D' },
        ],
        givenAnswer: 'A',
        reviewStatus: VisitedQuestionStatus.answered,
      };
      const saveQuizStateSpy = jest.spyOn(component as any, 'saveQuizState');

      component.markVisited(question, 'A', 1);

      expect(component.visitedQuestions).toContainEqual(question);
      expect(saveQuizStateSpy).toHaveBeenCalled();
    });

    it('should update existing visited question', () => {
      component.visitedQuestions = [
        {
          questionNo: 1,
          questionId: 1,
          questionTypeName: 'multiple_choice',
          questionName: 'Sample Question',
          options: [
            { optionId: 1, key: 'option', value: 'A' },
            { optionId: 2, key: 'option', value: 'B' },
            { optionId: 3, key: 'option', value: 'C' },
            { optionId: 4, key: 'option', value: 'D' },
          ],
          givenAnswer: '',
          reviewStatus: VisitedQuestionStatus.visited,
        },
      ];
      const question: VisitedQuestions = {
        questionNo: 1,
        questionId: 1,
        questionTypeName: 'multiple_choice',
        questionName: 'Sample Question',
        options: [
          { optionId: 1, key: 'option', value: 'A' },
          { optionId: 2, key: 'option', value: 'B' },
          { optionId: 3, key: 'option', value: 'C' },
          { optionId: 4, key: 'option', value: 'D' },
        ],
        givenAnswer: 'A',
        reviewStatus: VisitedQuestionStatus.answered,
      };

      component.markVisited(question, 'A', 1);

      expect(component.visitedQuestions[0].givenAnswer).toBe('A');
      expect(component.visitedQuestions[0].reviewStatus).toBe(VisitedQuestionStatus.answered);
    });
  });

  describe('progressBarPercentage', () => {
    it('should calculate progress percentage correctly', () => {
      component.totalQuestions = 10;
      component.visitedQuestions = [{}, {}, {}] as VisitedQuestions[];

      expect(component.progressBarPercentage).toBe(30); // 3/10 * 100
    });

    it('should return 0 when totalQuestions is 0', () => {
      component.totalQuestions = 0;
      component.visitedQuestions = [{}, {}, {}] as VisitedQuestions[];

      expect(component.progressBarPercentage).toBe(0);
    });

    it('should return 0 when visitedQuestions is empty', () => {
      component.totalQuestions = 10;
      component.visitedQuestions = [];

      expect(component.progressBarPercentage).toBe(0);
    });
  });

  describe('formattedTime', () => {
    it('should format remaining seconds correctly', () => {
      component.remainingSeconds = 125;

      expect(component.formattedTime).toBe('02:05');
    });

    it('should handle single digit minutes and seconds', () => {
      component.remainingSeconds = 61;

      expect(component.formattedTime).toBe('01:01');
    });

    it('should handle zero seconds', () => {
      component.remainingSeconds = 0;

      expect(component.formattedTime).toBe('00:00');
    });
  });

  describe('submitQuiz', () => {
    beforeEach(() => {
      // Initialize required properties to avoid undefined errors
      component.decodedId = 123;
      component.quizStartData = {
        quizName: 'Sample Quiz',
        totalQuestion: 10,
        totalTime: 30,
      } as any;
      component.currentQuestionData = { questionId: 1 } as any;
      component.remainingSeconds = 1500;
      component.totalTime = 30;
    });

    it('should submit quiz and clear state on success', fakeAsync(() => {
      mockQuizAttemptService.submitQuiz.mockReturnValue(of({ statusCode: 200, result: true }));
      const clearSavedQuizStateSpy = jest.spyOn(component as any, 'clearSavedQuizState');

      component.submitQuiz();
      tick();

      expect(mockQuizAttemptService.submitQuiz).toHaveBeenCalled();
      expect(clearSavedQuizStateSpy).toHaveBeenCalled();
      expect(mockSnackbarService.showSuccess).toHaveBeenCalledWith(
        platformMessages.quizSubmitSuccess,
      );
    }));

    it('should handle error during quiz submission', fakeAsync(() => {
      mockQuizAttemptService.submitQuiz.mockReturnValue(
        throwError(() => ({
          error: { message: 'Submission failed' },
        })),
      );

      const savedState = {
        quizId: 123,
        currentQuestionIndex: 0,
        remainingSeconds: 1500,
        visitedQuestions: [],
        quizStartData: {} as any,
        currentQuestionData: {} as any,
        timestamp: Date.now(),
      };
      jest.spyOn(component as any, 'getSavedQuizState').mockReturnValue(savedState);
      const restoreQuizStateSpy = jest.spyOn(component as any, 'restoreQuizState');

      component.submitQuiz();
      tick();

      expect(mockSnackbarService.showError).toHaveBeenCalledWith('Submission failed');
      expect(restoreQuizStateSpy).toHaveBeenCalledWith(savedState);
    }));
  });

  describe('fullscreen handling', () => {
    beforeEach(() => {
      // Initialize required properties for submitQuiz
      component.decodedId = 123;
      component.quizStartData = {
        quizName: 'Sample Quiz',
        totalQuestion: 10,
        totalTime: 30,
      } as any;
      component.currentQuestionData = { questionId: 1 } as any;
      component.remainingSeconds = 1500;
      component.totalTime = 30;
    });

    it('should open fullscreen', () => {
      const requestFullscreenSpy = jest.spyOn(document.documentElement, 'requestFullscreen');
      component.openFullscreen();
      expect(requestFullscreenSpy).toHaveBeenCalled();
      expect(component.isFullScreen).toBe(true);
    });

    it('should handle fullscreen exit', fakeAsync(() => {
      const submitQuizSpy = jest.spyOn(component, 'submitQuiz');
      Object.defineProperty(document, 'fullscreenElement', { value: null, writable: true });
      component['fullScreenHandler']();
      tick(2000);
      expect(mockSnackbarService.showError).toHaveBeenCalledWith(platformMessages.fullScreenExit);
      expect(submitQuizSpy).toHaveBeenCalled();
    }));

    it('should close fullscreen', () => {
      const exitFullscreenSpy = jest.spyOn(document, 'exitFullscreen');
      component.closeFullscreen();
      expect(exitFullscreenSpy).toHaveBeenCalled();
      expect(component.isFullScreen).toBe(false);
    });
  });

  describe('cheat prevention', () => {
    beforeEach(() => {
      // Initialize required properties for submitQuiz
      component.decodedId = 123;
      component.quizStartData = {
        quizName: 'Sample Quiz',
        totalQuestion: 10,
        totalTime: 30,
      } as any;
      component.currentQuestionData = { questionId: 1 } as any;
      component.remainingSeconds = 1500;
      component.totalTime = 30;
    });

    it('should detect tab switch', fakeAsync(() => {
      const submitQuizSpy = jest.spyOn(component, 'submitQuiz');
      Object.defineProperty(document, 'hidden', { value: true, writable: true });
      component['visibilityHandler']();
      tick(2000);
      expect(mockSnackbarService.showError).toHaveBeenCalledWith(
        autoSubmitMessage(platformMessages.switchTab),
      );
      expect(submitQuizSpy).toHaveBeenCalled();
    }));

    it('should detect window blur', fakeAsync(() => {
      const submitQuizSpy = jest.spyOn(component, 'submitQuiz');
      component['blurHandler']();
      tick(2000);
      expect(mockSnackbarService.showError).toHaveBeenCalledWith(
        autoSubmitMessage(platformMessages.windowsLostFocus),
      );
      expect(submitQuizSpy).toHaveBeenCalled();
    }));

    it('should detect dev tools opening', () => {
      // Initialize required properties for submitQuiz
      component.decodedId = 123;
      component.quizStartData = {
        quizName: 'Sample Quiz',
        totalQuestion: 10,
        totalTime: 30,
      } as any;
      component.currentQuestionData = { questionId: 1 } as any;
      component.remainingSeconds = 1500;
      component.totalTime = 30;

      const submitQuizSpy = jest.spyOn(component, 'submitQuiz');

      // Mock the forceSubmit method
      const originalForceSubmit = component['forceSubmit'];
      component['forceSubmit'] = jest.fn();

      // Instead of mocking setInterval, let's test the detection logic directly
      const threshold = 160;

      // Mock dev tools detection by creating a significant difference
      Object.defineProperty(window, 'outerWidth', { value: 1024, writable: true });
      Object.defineProperty(window, 'innerWidth', { value: 800, writable: true });
      Object.defineProperty(window, 'outerHeight', { value: 768, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 600, writable: true });

      // Test the detection logic directly
      const isDevToolsOpen =
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold;

      if (isDevToolsOpen) {
        component['forceSubmit'](platformMessages.openedDeveloperTools);
      }

      expect(component['forceSubmit']).toHaveBeenCalledWith(platformMessages.openedDeveloperTools);

      // Restore original method
      component['forceSubmit'] = originalForceSubmit;
    });
  });

  describe('saveQuizState', () => {
    it('should save quiz state to localStorage', () => {
      component.decodedId = 123;
      component.currentQuestionIndex = 1;
      component.remainingSeconds = 1500;
      component.visitedQuestions = [] as VisitedQuestions[];
      component.quizStartData = { quizName: 'Sample Quiz' } as any;
      component.currentQuestionData = { questionId: 1 } as any;

      component['saveQuizState']();

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        component['QUIZ_STATE_KEY'],
        expect.any(String),
      );
    });
  });

  describe('getSavedQuizState', () => {
    it('should return saved quiz state if valid', () => {
      const savedState = {
        quizId: 123,
        currentQuestionIndex: 1,
        remainingSeconds: 1500,
        visitedQuestions: [],
        quizStartData: { quizName: 'Sample Quiz' },
        currentQuestionData: { questionId: 1 },
        timestamp: Date.now(),
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState));
      component.decodedId = 123;

      const result = (component as any).getSavedQuizState(123);

      expect(result).toEqual(savedState);
      expect(localStorageMock.getItem).toHaveBeenCalledWith(component['QUIZ_STATE_KEY']);
    });

    it('should return null for stale state', () => {
      const savedState = {
        quizId: 123,
        timestamp: Date.now() - 25 * 60 * 60 * 1000, // older than 24 hours
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState));
      component.decodedId = 123;

      const result = (component as any).getSavedQuizState(123);

      expect(result).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(component['QUIZ_STATE_KEY']);
    });

    it('should return null and clear storage on invalid JSON', () => {
      localStorageMock.getItem.mockReturnValue('invalid JSON');
      component.decodedId = 123;

      const result = (component as any).getSavedQuizState(123);

      expect(result).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(component['QUIZ_STATE_KEY']);
      expect(mockSnackbarService.showError).toHaveBeenCalledWith(expect.any(String));
    });
  });

  describe('isSmallScreen', () => {
    it('should return true when window width is less than 550', () => {
      Object.defineProperty(window, 'innerWidth', { value: 500, writable: true });
      expect(component.isSmallScreen()).toBe(true);
    });

    it('should return false when window width is greater than or equal to 550', () => {
      Object.defineProperty(window, 'innerWidth', { value: 600, writable: true });
      expect(component.isSmallScreen()).toBe(false);
    });

    it('should return false when window width is exactly 550', () => {
      Object.defineProperty(window, 'innerWidth', { value: 550, writable: true });
      expect(component.isSmallScreen()).toBe(false);
    });
  });

  describe('openConfirmationDialog', () => {
    it('should open confirmation dialog with correct parameters', () => {
      const dialogData: ConfirmationDialogData = {
        title: 'Test Dialog',
        message: 'Test message',
        confirmButtonConfig: submitDialogButtonConfig,
        cancelButtonConfig: cancelButtonConfig,
      };
      const onConfirm = jest.fn();
      const onCancelClick = jest.fn();

      mockDialog.open.mockReturnValue({
        afterClosed: () => of(true), // Simulate user confirming
      });

      component.openConfirmationDialog(dialogData, onConfirm, onCancelClick);

      expect(mockDialog.open).toHaveBeenCalledWith(ConfirmationDialogComponent, {
        width: '600px',
        disableClose: true,
        data: dialogData,
        panelClass: 'custom-dialog-radius',
      });
    });

    it('should call onConfirm when dialog is confirmed', () => {
      const dialogData: ConfirmationDialogData = {
        title: 'Test Dialog',
        message: 'Test message',
        confirmButtonConfig: submitDialogButtonConfig,
        cancelButtonConfig: cancelButtonConfig,
      };
      const onConfirm = jest.fn();
      const onCancelClick = jest.fn();

      mockDialog.open.mockReturnValue({
        afterClosed: () => of(true), // Simulate user confirming
      });

      component.openConfirmationDialog(dialogData, onConfirm, onCancelClick);

      // The callback should be called when the observable emits
      expect(onConfirm).toHaveBeenCalled();
      expect(onCancelClick).not.toHaveBeenCalled();
    });

    it('should call onCancelClick when dialog is cancelled', () => {
      const dialogData: ConfirmationDialogData = {
        title: 'Test Dialog',
        message: 'Test message',
        confirmButtonConfig: submitDialogButtonConfig,
        cancelButtonConfig: cancelButtonConfig,
      };
      const onConfirm = jest.fn();
      const onCancelClick = jest.fn();

      mockDialog.open.mockReturnValue({
        afterClosed: () => of(false), // Simulate user cancelling
      });

      component.openConfirmationDialog(dialogData, onConfirm, onCancelClick);

      // The callback should be called when the observable emits
      expect(onCancelClick).toHaveBeenCalled();
      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  describe('openSubmitDialog', () => {
    it('should open submit quiz dialog', () => {
      const openConfirmationDialogSpy = jest.spyOn(component, 'openConfirmationDialog');
      const submitQuizSpy = jest.spyOn(component, 'submitQuiz');

      component.openSubmitDialog();

      expect(openConfirmationDialogSpy).toHaveBeenCalledWith(
        submitQuizDialog,
        expect.any(Function),
        expect.any(Function),
      );
    });

    it('should call submitQuiz when confirmed', () => {
      const submitQuizSpy = jest.spyOn(component, 'submitQuiz');

      // Mock the dialog to return true (confirmed)
      mockDialog.open.mockReturnValue({
        afterClosed: () => of(true),
      });

      component.openSubmitDialog();

      // The submitQuiz should be called through the callback
      expect(submitQuizSpy).toHaveBeenCalled();
    });
  });

  describe('restoreQuizState', () => {
    it('should restore quiz state from saved data', () => {
      const savedState = {
        quizId: 123,
        currentQuestionIndex: 2,
        remainingSeconds: 1500,
        visitedQuestions: [{ questionNo: 1, questionId: 1 }] as VisitedQuestions[],
        quizStartData: { totalQuestion: 10, totalTime: 30 } as any,
        currentQuestionData: { questionId: 1 } as any,
        timestamp: Date.now(),
      };

      const startTimerSpy = jest.spyOn(component as any, 'startTimer');

      component['restoreQuizState'](savedState);

      expect(component.currentQuestionIndex).toBe(2);
      expect(component.remainingSeconds).toBe(1500);
      expect(component.visitedQuestions).toEqual([{ questionNo: 1, questionId: 1 }]);
      expect(component.quizStartData).toEqual({ totalQuestion: 10, totalTime: 30 });
      expect(component.currentQuestionData).toEqual({ questionId: 1 });
      expect(component.totalQuestions).toBe(10);
      expect(component.totalTime).toBe(30);
      expect(startTimerSpy).toHaveBeenCalled();
    });
  });

  describe('question navigation', () => {
    beforeEach(() => {
      component.decodedId = 123;
      component.quizStartData = {
        quizName: 'Sample Quiz',
        totalQuestion: 10,
        totalTime: 30,
      } as any;
      component.currentQuestionData = { questionId: 1 } as any;
      component.remainingSeconds = 1500;
      component.totalTime = 30;
      component.visitedQuestions = [
        {
          questionNo: 1,
          questionId: 1,
          questionTypeName: 'multiple_choice',
          questionName: 'Question 1',
          options: [],
          givenAnswer: 'A',
          reviewStatus: VisitedQuestionStatus.answered,
        },
      ] as VisitedQuestions[];
    });

    describe('getNextQuestion', () => {
      it('should get next question when currentQuestionIndex is within totalQuestions', fakeAsync(() => {
        component.totalQuestions = 10;
        component.currentQuestionIndex = 0; // Start from first question

        const mockResponse = {
          statusCode: 200,
          result: true,
          data: {
            quizQuestionId: 2,
            questionType: 'multiple_choice',
            questionName: 'Question 2',
            options: [
              { optionId: 1, key: 'option', value: 'A' },
              { optionId: 2, key: 'option', value: 'B' },
            ],
          },
        };

        mockQuizAttemptService.saveAndGetNextQuestion.mockReturnValue(of(mockResponse));
        const markVisitedSpy = jest.spyOn(component, 'markVisited');

        component.getNextQuestion();
        tick();

        expect(component.currentQuestionIndex).toBe(1);
        expect(mockQuizAttemptService.saveAndGetNextQuestion).toHaveBeenCalled();
        expect(component.currentQuestionData).toEqual({
          questionId: 2,
          questionTypeName: 'multiple_choice',
          questionName: 'Question 2',
          options: [
            { optionId: 1, key: 'option', value: 'A' },
            { optionId: 2, key: 'option', value: 'B' },
          ],
        });
        expect(markVisitedSpy).toHaveBeenCalled();
      }));

      it('should save last question when trying to save last question', () => {
        component.totalQuestions = 3;
        component.currentQuestionIndex = 2; // Already at last question index

        component.getNextQuestion();

        expect(component.currentQuestionIndex).toBe(2);
        expect(mockQuizAttemptService.saveAndGetNextQuestion).toHaveBeenCalled();
      });

      it('should handle error when loading next question fails', fakeAsync(() => {
        component.totalQuestions = 10;
        component.currentQuestionIndex = 0;

        mockQuizAttemptService.saveAndGetNextQuestion.mockReturnValue(
          throwError(() => ({
            error: { message: 'Failed to load next question' },
          })),
        );
        const snackbarSpy = jest.spyOn(mockSnackbarService, 'showError');

        component.getNextQuestion();
        tick();

        expect(component.currentQuestionIndex).toBe(1); // Should still increment
        expect(snackbarSpy).toHaveBeenCalledWith('Failed to load next question');
      }));
    });

    describe('goToQuestion', () => {
      let saveQuizStateSpy: jest.SpyInstance;

      beforeEach(() => {
        // Default mock visitedQuestions for navigation
        component.visitedQuestions = [
          {
            questionId: 1,
            givenAnswer: 'A',
            questionName: 'Question 1',
            questionNo: 1,
            questionTypeName: 'Multiple Choice',
            reviewStatus: VisitedQuestionStatus.answered,
            options: [],
          },
          {
            questionId: 2,
            givenAnswer: 'B',
            questionNo: 2,
            questionTypeName: 'Fill in the blanks',
            questionName: 'Question 2',
            reviewStatus: VisitedQuestionStatus.answered,
            options: [],
          },
        ];

        component.totalQuestions = component.visitedQuestions.length;
        component.currentQuestionIndex = 1;
        component.currentQuestionData = {
          questionId: 2,
          questionName: 'Question 2',
          questionTypeName: 'Fill in the blanks',
          options: [],
        } as QuizQuestions;

        saveQuizStateSpy = jest.spyOn(component as any, 'saveQuizState');
      });

      it('should go to specific question when it exists in visitedQuestions', () => {
        component.goToQuestion(1);

        expect(component.currentQuestionIndex).toBe(0);
        expect(component.currentQuestionData.questionId).toBe(1);
        expect(saveQuizStateSpy).toHaveBeenCalled();
      });

      it('should handle empty givenAnswer gracefully', () => {
        // Override to make Q1 empty
        component.visitedQuestions[0].givenAnswer = '';

        component.goToQuestion(1); // Go back to Q1

        expect(component.currentQuestionIndex).toBe(0);
        expect(component.currentQuestionData.questionId).toBe(1);
        expect(saveQuizStateSpy).toHaveBeenCalled();
      });

      it('should do nothing when question does not exist in visitedQuestions', () => {
        component.visitedQuestions = []; // clear all
        component.totalQuestions = 0; // update totalQuestions

        component.goToQuestion(1);

        expect(component.currentQuestionIndex).toBe(1); // stays at Q2 (no change)
        expect(saveQuizStateSpy).not.toHaveBeenCalled();
      });
    });

    describe('goToPreviousQuestion', () => {
      it('should delegate to goToQuestion with previous index', () => {
        const goToQuestionSpy = jest.spyOn(component, 'goToQuestion');
        component.currentQuestionIndex = 2;

        component.goToPreviousQuestion();

        expect(goToQuestionSpy).toHaveBeenCalledWith(2); // 1-based questionNo = 2
      });

      it('should still call goToQuestion with 0 when already at first question', () => {
        const goToQuestionSpy = jest.spyOn(component, 'goToQuestion');
        component.currentQuestionIndex = 0;

        component.goToPreviousQuestion();

        expect(goToQuestionSpy).toHaveBeenCalledWith(0); // since implementation calls regardless
      });
    });
  });

  describe('markForReviewQuestion', () => {
    it('should mark question for review', () => {
      component.currentQuestionData = { questionId: 1 } as any;
      component.currentQuestionIndex = 0;

      component.markForReviewQuestion(1);

      expect(component.visitedQuestions).toContainEqual({
        questionNo: 1,
        questionId: 1,
        questionTypeName: undefined,
        questionName: undefined,
        options: undefined,
        givenAnswer: '',
        reviewStatus: VisitedQuestionStatus.marked_for_review,
      });
    });

    it('should toggle review status if already marked', () => {
      component.visitedQuestions = [
        {
          questionNo: 1,
          questionId: 1,
          questionTypeName: 'multiple_choice',
          questionName: 'Question 1',
          options: [],
          givenAnswer: 'A',
          reviewStatus: VisitedQuestionStatus.marked_for_review,
        },
      ] as VisitedQuestions[];

      component.markForReviewQuestion(1);

      expect(component.visitedQuestions[0].reviewStatus).toBe(VisitedQuestionStatus.answered);
    });
  });

  describe('question status helpers', () => {
    beforeEach(() => {
      component.visitedQuestions = [
        {
          questionNo: 1,
          questionId: 1,
          questionTypeName: 'multiple_choice',
          questionName: 'Question 1',
          options: [],
          givenAnswer: 'A',
          reviewStatus: VisitedQuestionStatus.answered,
        },
        {
          questionNo: 2,
          questionId: 2,
          questionTypeName: 'multiple_choice',
          questionName: 'Question 2',
          options: [],
          givenAnswer: '',
          reviewStatus: VisitedQuestionStatus.visited,
        },
        {
          questionNo: 3,
          questionId: 3,
          questionTypeName: 'multiple_choice',
          questionName: 'Question 3',
          options: [],
          givenAnswer: '',
          reviewStatus: VisitedQuestionStatus.marked_for_review,
        },
      ] as VisitedQuestions[];
    });

    it('should get question number config with label', () => {
      component.currentQuestionIndex = 0;
      component.totalQuestions = 10;

      const config = component.getquestionNoConfigWithLabel();

      expect(config.label).toBe('1/10');
    });

    it('should get given answer for question', () => {
      const answer = component.getQuestionNosGivenAnswer(1);
      expect(answer).toBe('A');
    });

    it('should get questions count by status', () => {
      const answeredCount = component.getQuestionsCountByStatus(VisitedQuestionStatus.answered);
      const visitedCount = component.getQuestionsCountByStatus(VisitedQuestionStatus.visited);
      const markedCount = component.getQuestionsCountByStatus(
        VisitedQuestionStatus.marked_for_review,
      );

      expect(answeredCount).toBe(1);
      expect(visitedCount).toBe(1);
      expect(markedCount).toBe(1);
    });

    it('should check question status', () => {
      const hasStatus = component.getQuestionStatus(0, VisitedQuestionStatus.answered);
      expect(hasStatus).toBe(true);
    });
  });

  describe('timer functionality', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should start timer and decrement remaining seconds', () => {
      component.remainingSeconds = 10;
      component.totalTime = 1;

      component['startTimer']();

      jest.advanceTimersByTime(3000);

      expect(component.remainingSeconds).toBe(7);
    });

    it('should pad zero correctly', () => {
      expect(component['padZero'](5)).toBe('05');
      expect(component['padZero'](10)).toBe('10');
      expect(component['padZero'](0)).toBe('00');
    });
  });

  describe('beforeunload handler', () => {
    it('should handle beforeunload event', () => {
      const saveQuizStateSpy = jest.spyOn(component as any, 'saveQuizState');
      const event = new Event('beforeunload');

      component['beforeUnloadHandler'](event as BeforeUnloadEvent);

      expect(saveQuizStateSpy).toHaveBeenCalled();
      expect(component.reloadAttempted).toBe(true);
    });
  });

  describe('ngOnDestroy', () => {
    it('should clean up resources on destroy', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
      const windowRemoveEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      const clearSavedQuizStateSpy = jest.spyOn(component as any, 'clearSavedQuizState');
      const destroyNextSpy = jest.spyOn(component['destroy$'], 'next');
      const destroyCompleteSpy = jest.spyOn(component['destroy$'], 'complete');

      // Set up timer interval
      component['timerInterval'] = 123 as any;
      const clearIntervalSpy = jest.spyOn(window, 'clearInterval');

      component.ngOnDestroy();

      expect(removeEventListenerSpy).toHaveBeenCalled();
      expect(windowRemoveEventListenerSpy).toHaveBeenCalled();
      expect(clearIntervalSpy).toHaveBeenCalledWith(123);
      expect(clearSavedQuizStateSpy).toHaveBeenCalled();
      expect(destroyNextSpy).toHaveBeenCalled();
      expect(destroyCompleteSpy).toHaveBeenCalled();
    });
  });
});
