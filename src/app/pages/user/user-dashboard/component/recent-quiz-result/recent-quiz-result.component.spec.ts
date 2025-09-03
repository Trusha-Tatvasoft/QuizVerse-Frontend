import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecentQuizResultComponent } from './recent-quiz-result.component';
import { UserDashboardService } from '../../../../../services/user/user-dashboard/user-dashboard.service';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { QuizResult } from '../../interfaces/quiz-result.interface';
import { platformMessages } from '../../../../../utils/constants';
import { createDifficultyTag } from '../../../../../utils/types/difficulty-tag.type';

describe('RecentQuizResultComponent', () => {
  let fixture: ComponentFixture<RecentQuizResultComponent>;
  let component: RecentQuizResultComponent;

  let dashboardService: jest.Mocked<UserDashboardService>;
  let snackBarService: jest.Mocked<SnackbarService>;
  let router: jest.Mocked<Router>;

  beforeEach(async () => {
    const dashboardServiceMock: Partial<jest.Mocked<UserDashboardService>> = {
      getRecentQuizzes: jest.fn(),
    };

    const snackBarServiceMock: Partial<jest.Mocked<SnackbarService>> = {
      showError: jest.fn(),
    };

    const routerMock: Partial<jest.Mocked<Router>> = {
      navigate: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [RecentQuizResultComponent],
      providers: [
        { provide: UserDashboardService, useValue: dashboardServiceMock },
        { provide: SnackbarService, useValue: snackBarServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RecentQuizResultComponent);
    component = fixture.componentInstance;

    dashboardService = TestBed.inject(UserDashboardService) as jest.Mocked<UserDashboardService>;
    snackBarService = TestBed.inject(SnackbarService) as jest.Mocked<SnackbarService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load recent quizzes and map tags on success', () => {
    const mockQuizzes: QuizResult[] = [
      {
        quizName: 'Math Quiz',
        categoryName: 'Mathematics',
        difficultyLevel: 'Easy',
        score: 90,
        attemptedOn: '2025-09-01T10:00:00Z',
      },
      {
        quizName: 'Science Quiz',
        categoryName: 'Science',
        difficultyLevel: 'Hard',
        score: 75,
        attemptedOn: '2025-09-01T11:00:00Z',
      },
    ];

    dashboardService.getRecentQuizzes.mockReturnValue(
      of({ result: true, data: mockQuizzes, message: '', statusCode: 200 }),
    );

    fixture.detectChanges(); // triggers ngOnInit -> loadRecentQuizzes

    expect(dashboardService.getRecentQuizzes).toHaveBeenCalledWith(false);
    expect(component.quizzesWithTags).toHaveLength(2);
    expect(component.quizzesWithTags[0].tag).toEqual(createDifficultyTag('Easy'));
    expect(component.quizzesWithTags[1].tag).toEqual(createDifficultyTag('Hard'));
  });

  it('should call snackbar on API error', () => {
    dashboardService.getRecentQuizzes.mockReturnValue(throwError(() => new Error('API failure')));

    fixture.detectChanges();

    expect(snackBarService.showError).toHaveBeenCalledWith(
      platformMessages.errorTitle,
      platformMessages.errorMessage,
    );
  });

  it('should navigate to Profile tab=1 when viewAll() is called', () => {
    component.viewAll();

    expect(router.navigate).toHaveBeenCalledWith(['profile'], {
      queryParams: { tab: 1 },
    });
  });
});
