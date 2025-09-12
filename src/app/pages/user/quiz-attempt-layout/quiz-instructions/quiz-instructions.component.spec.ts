import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizInstructionsComponent } from './quiz-instructions.component';
import { QuizAttemptService } from '../../../../services/user/quiz-attempt/quiz-attempt.service';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { QuizInstructionsResponse } from '../interfaces/quiz-attempt.interface';
import { FilledButtonComponent } from '../../../../shared/components/filled-button/filled-button.component';
import { OutlineButtonComponent } from '../../../../shared/components/outline-button/outline-button.component';
import { TagComponent } from '../../../../shared/components/tag/tag.component';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { Navigations } from '../../../../shared/enums/navigation';
import { platformMessages } from '../../../../utils/constants';

describe('QuizInstructionsComponent', () => {
  let component: QuizInstructionsComponent;
  let fixture: ComponentFixture<QuizInstructionsComponent>;
  let quizAttemptService: jest.Mocked<QuizAttemptService>;
  let snackbarService: jest.Mocked<SnackbarService>;
  let router: jest.Mocked<Router>;
  let activatedRoute: jest.Mocked<ActivatedRoute>;

  const mockQuizInstructions: QuizInstructionsResponse = {
    quizId: 1,
    quizName: 'Sample Quiz',
    totalTime: 30,
    totalQuestion: 10,
    quizDifficultyName: 'Medium',
    quizCategoryName: 'General Knowledge',
    isPaid: true,
    quizPrice: 100,
    description: 'A sample quiz description',
  };

  beforeEach(async () => {
    const quizAttemptServiceMock = {
      getQuizInstructions: jest.fn(),
    };
    const snackbarServiceMock = {
      showError: jest.fn(),
    };
    const routerMock = {
      navigate: jest.fn(),
    };
    const activatedRouteMock = {
      snapshot: {
        paramMap: {
          get: jest.fn().mockReturnValue('MQ=='), // Base64 encoded '1'
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [
        QuizInstructionsComponent,
        CommonModule,
        FilledButtonComponent,
        OutlineButtonComponent,
        TagComponent,
        MatIcon,
      ],
      providers: [
        { provide: QuizAttemptService, useValue: quizAttemptServiceMock },
        { provide: SnackbarService, useValue: snackbarServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizInstructionsComponent);
    component = fixture.componentInstance;
    quizAttemptService = TestBed.inject(QuizAttemptService) as jest.Mocked<QuizAttemptService>;
    snackbarService = TestBed.inject(SnackbarService) as jest.Mocked<SnackbarService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jest.Mocked<ActivatedRoute>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call decodeRouteId on initialization', () => {
      const decodeRouteIdSpy = jest.spyOn(component, 'decodeRouteId');
      component.ngOnInit();
      expect(decodeRouteIdSpy).toHaveBeenCalled();
    });
  });

  describe('decodeRouteId', () => {
    it('should decode valid quiz ID and call getQuizInstructions', () => {
      // Mock the getQuizInstructions method to prevent the error
      quizAttemptService.getQuizInstructions.mockReturnValue(
        of({
          statusCode: 200,
          result: true,
          data: mockQuizInstructions,
          message: 'Data Fetch Successfully',
        }),
      );

      activatedRoute.snapshot.paramMap.get = jest.fn().mockReturnValue('MQ=='); // Base64 for '1'
      const getQuizInstructionsSpy = jest.spyOn(component, 'getQuizInstructions');
      const snackbarSpy = jest.spyOn(snackbarService, 'showError');

      component.decodeRouteId();

      expect(activatedRoute.snapshot.paramMap.get).toHaveBeenCalledWith('id');
      expect(snackbarSpy).not.toHaveBeenCalled();
      expect(component.decodedId).toBe(1);
      expect(getQuizInstructionsSpy).toHaveBeenCalledWith(1);
    });

    it('should handle invalid encoded ID and show error', () => {
      activatedRoute.snapshot.paramMap.get = jest.fn().mockReturnValue('invalid');
      const snackbarSpy = jest.spyOn(snackbarService, 'showError');

      component.decodeRouteId();

      expect(snackbarSpy).toHaveBeenCalledWith(platformMessages.invalidQuizId);
      expect(component.decodedId).toBe(0);
    });

    it('should handle missing encoded ID', () => {
      activatedRoute.snapshot.paramMap.get = jest.fn().mockReturnValue(null);
      const snackbarSpy = jest.spyOn(snackbarService, 'showError');

      component.decodeRouteId();

      expect(snackbarSpy).not.toHaveBeenCalled();
      expect(component.decodedId).toBeUndefined();
    });
  });

  describe('getQuizInstructions', () => {
    it('should set quizInstructions on successful response', () => {
      quizAttemptService.getQuizInstructions.mockReturnValue(
        of({
          statusCode: 200,
          result: true,
          data: mockQuizInstructions,
          message: 'Data Fetch Successfully',
        }),
      );
      component.getQuizInstructions(1);
      expect(component.quizInstructions).toEqual(mockQuizInstructions);
      expect(snackbarService.showError).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should handle failed response and navigate to browse quizzes', () => {
      quizAttemptService.getQuizInstructions.mockReturnValue(
        of({
          statusCode: 400,
          result: false,
          message: 'Error fetching instructions',
          data: {} as QuizInstructionsResponse,
        }),
      );
      component.getQuizInstructions(1);
      expect(snackbarService.showError).toHaveBeenCalledWith('Error fetching instructions');
      expect(router.navigate).toHaveBeenCalledWith(['/user/quizzes/browse-quizzes']);
    });

    it('should handle error response and navigate to browse quizzes', () => {
      quizAttemptService.getQuizInstructions.mockReturnValue(
        throwError(() => ({ message: 'Server error' })),
      );
      component.getQuizInstructions(1);
      expect(snackbarService.showError).toHaveBeenCalledWith('Server error');
      expect(router.navigate).toHaveBeenCalledWith(['/user/quizzes/browse-quizzes']);
    });
  });

  describe('getQuizCategoryTagConfig', () => {
    it('should return correct category tag configuration', () => {
      component.quizInstructions = mockQuizInstructions;
      const result = component.getQuizCategoryTagConfig();
      expect(result).toEqual({
        id: 'general knowledge',
        label: 'General Knowledge',
        type: 'static',
        isSelected: false,
        hasBorder: true,
        backgroundColor: 'white',
        textColor: 'black',
      });
    });
  });

  describe('getDifficultyTagConfig', () => {
    it('should call getTagConfigWithDifficulty with correct difficulty', () => {
      component.quizInstructions = mockQuizInstructions;
      const spy = jest.spyOn(
        require('../../../../utils/quiz-crud-common-functions.utils'),
        'getTagConfigWithDifficulty',
      );
      component.getDifficultyTagConfig();
      expect(spy).toHaveBeenCalledWith('Medium');
    });
  });

  describe('getTagConfigForIsPaid', () => {
    it('should return paid tag configuration for paid quiz', () => {
      component.quizInstructions = mockQuizInstructions;
      const result = component.getTagConfigForIsPaid();
      expect(result).toEqual({
        id: 'paid',
        label: 'Paid',
        type: 'static',
        isSelected: false,
        hasBorder: false,
        backgroundColor: 'lightRed',
        textColor: 'red',
      });
    });

    it('should return free tag configuration for free quiz', () => {
      component.quizInstructions = { ...mockQuizInstructions, isPaid: false };
      const result = component.getTagConfigForIsPaid();
      expect(result).toEqual({
        id: 'free',
        label: 'Free',
        type: 'static',
        isSelected: false,
        hasBorder: false,
        backgroundColor: 'lightGreen',
        textColor: 'green',
      });
    });
  });

  describe('getpriceTagConfig', () => {
    it('should return correct price tag configuration', () => {
      component.quizInstructions = mockQuizInstructions;
      const result = component.getpriceTagConfig();
      expect(result).toEqual({
        id: '₹ 100',
        label: '₹ 100',
        type: 'static',
        isSelected: false,
        hasBorder: true,
        backgroundColor: 'white',
        textColor: 'black',
      });
    });
  });

  describe('StartQuiz', () => {
    it('should navigate to quiz attempt page with encoded ID', () => {
      component.decodedId = 1;
      component.StartQuiz();
      expect(router.navigate).toHaveBeenCalledWith([
        Navigations.User,
        Navigations.QuizList,
        Navigations.QuizAttempt,
        'MQ==', // Base64 encoded '1'
      ]);
    });
  });

  describe('BackToBrowseQuiz', () => {
    it('should navigate to browse quizzes page', () => {
      component.BackToBrowseQuiz();
      expect(router.navigate).toHaveBeenCalledWith([
        Navigations.User,
        Navigations.QuizList,
        Navigations.BrowseQuizzes,
      ]);
    });
  });
});
