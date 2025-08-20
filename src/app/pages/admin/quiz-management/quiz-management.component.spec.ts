import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizManagementComponent } from './quiz-management.component';
import { QuizManagementService } from '../../../services/admin/quiz-management/quiz-management.service';
import { QuizManagementSummary } from './interfaces/quiz-management-summary.interface';
import { of, throwError } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { CardInputConfig } from '../../../shared/interfaces/card-component.interface';

describe('QuizManagementComponent', () => {
  let component: QuizManagementComponent;
  let fixture: ComponentFixture<QuizManagementComponent>;
  let quizManagementService: jest.Mocked<QuizManagementService>;

  const mockSummary: QuizManagementSummary = {
    totalQuiz: 10,
    totalParticipants: 20,
    activeQuiz: 8,
    totalQuestions: 15,
  };

  const successResponse: ApiResponse<QuizManagementSummary> = {
    result: true,
    statusCode: 200,
    message: 'ok',
    data: mockSummary,
  };

  const failResponse: ApiResponse<QuizManagementSummary> = {
    result: false,
    statusCode: 400,
    message: 'Failed to load stats',
    data: {} as QuizManagementSummary,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizManagementComponent],
      providers: [
        {
          provide: QuizManagementService,
          useValue: {
            getQuizManagementStats: jest.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizManagementComponent);
    component = fixture.componentInstance;

    quizManagementService = TestBed.inject(
      QuizManagementService,
    ) as jest.Mocked<QuizManagementService>;
  });

  it('should create', () => {
    quizManagementService.getQuizManagementStats.mockReturnValue(of(successResponse));

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should populate quizStatsConfigs when service returns success', () => {
      quizManagementService.getQuizManagementStats.mockReturnValue(of(successResponse));

      fixture.detectChanges();

      expect(quizManagementService.getQuizManagementStats).toHaveBeenCalled();
      expect(component.quizStatsConfigs.length).toBe(Object.keys(mockSummary).length);

      const firstCard = component.quizStatsConfigs[0];
      expect(firstCard).toHaveProperty('title');
      expect(firstCard).toHaveProperty('value');
      expect(firstCard).toHaveProperty('icon');
    });

    it('should leave quizStatsConfigs empty if service returns result=false', () => {
      quizManagementService.getQuizManagementStats.mockReturnValue(of(failResponse));

      fixture.detectChanges();

      expect(quizManagementService.getQuizManagementStats).toHaveBeenCalled();
      expect(component.quizStatsConfigs).toEqual([]);
    });

    it('should handle error from service gracefully', () => {
      quizManagementService.getQuizManagementStats.mockReturnValue(
        throwError(() => new Error('backend error')),
      );

      fixture.detectChanges();

      expect(quizManagementService.getQuizManagementStats).toHaveBeenCalled();
      expect(component.quizStatsConfigs).toEqual([]);
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy subject', () => {
      const completeSpy = jest.spyOn(component['destroy'], 'complete');
      const nextSpy = jest.spyOn(component['destroy'], 'next');

      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalledWith();
      expect(completeSpy).toHaveBeenCalled();
    });
  });

  describe('mapQuizManagementStatsToCards', () => {
    it('should transform summary stats into card configs', () => {
      const result = (component as any).mapQuizManagementStatsToCards(mockSummary);

      expect(result.length).toBe(Object.keys(mockSummary).length);

      result.forEach((card: CardInputConfig) => {
        expect(card).toHaveProperty('title');
        expect(card).toHaveProperty('value');
        expect(card.valueColor).toBe('black');
        expect(card.subtitleColor).toBe('black');
      });
    });

    it('should return empty array for empty data', () => {
      const result = (component as any).mapQuizManagementStatsToCards({} as QuizManagementSummary);
      expect(result).toEqual([]);
    });
  });
});
