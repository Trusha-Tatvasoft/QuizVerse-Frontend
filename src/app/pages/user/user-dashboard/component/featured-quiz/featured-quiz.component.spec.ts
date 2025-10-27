import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { FeaturedQuizComponent } from './featured-quiz.component';
import { UserDashboardService } from '../../../../../services/user/user-dashboard/user-dashboard.service';
import { FeaturedQuizWithTag } from '../../interfaces/featured-quiz.interface';

describe('FeaturedQuizComponent', () => {
  let component: FeaturedQuizComponent;
  let fixture: ComponentFixture<FeaturedQuizComponent>;
  let mockDashboardService: jest.Mocked<UserDashboardService>;

  const mockQuizzes = [
    {
      quizName: 'Quiz 1',
      categoryName: 'Math',
      difficultyLevel: 'Easy',
      totalAttempts: 10,
      rating: 4,
    },
    {
      quizName: 'Quiz 2',
      categoryName: 'Science',
      difficultyLevel: 'Medium',
      totalAttempts: 20,
      rating: 5,
    },
  ];

  beforeEach(async () => {
    mockDashboardService = {
      getFeaturedQuizzes: jest.fn(),
    } as unknown as jest.Mocked<UserDashboardService>;

    await TestBed.configureTestingModule({
      imports: [FeaturedQuizComponent],
      providers: [{ provide: UserDashboardService, useValue: mockDashboardService }],
    }).compileComponents();

    fixture = TestBed.createComponent(FeaturedQuizComponent);
    component = fixture.componentInstance;

    // default mock to prevent .subscribe errors
    mockDashboardService.getFeaturedQuizzes.mockReturnValue(
      of({ data: { quizzes: [], hasMore: false }, message: '', result: true, statusCode: 200 }),
    );
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadFeaturedQuizzes on init', () => {
    const spy = jest.spyOn(component, 'loadFeaturedQuizzes');

    // ensure service mock is ready before detectChanges
    mockDashboardService.getFeaturedQuizzes.mockReturnValue(
      of({ data: { quizzes: [], hasMore: false }, message: '', result: true, statusCode: 200 }),
    );

    fixture.detectChanges(); // triggers ngOnInit
    expect(spy).toHaveBeenCalled();
  });

  it('should load quizzes successfully (batch 1)', () => {
    mockDashboardService.getFeaturedQuizzes.mockReturnValue(
      of({
        data: { quizzes: mockQuizzes as any, hasMore: true },
        message: '',
        result: true,
        statusCode: 200,
      }),
    );

    component.loadFeaturedQuizzes(1);

    expect(component.quizzesWithTags.length).toBe(2);
    expect(component.hasMore).toBe(true);
    expect(component.errorMessage).toBeNull();
    expect(component.loading).toBe(false);
  });

  it('should append quizzes on subsequent batch load', () => {
    mockDashboardService.getFeaturedQuizzes
      .mockReturnValueOnce(
        of({
          data: { quizzes: [mockQuizzes[0]] as any, hasMore: true },
          message: '',
          result: true,
          statusCode: 200,
        }),
      )
      .mockReturnValueOnce(
        of({
          data: { quizzes: [mockQuizzes[1]] as any, hasMore: false },
          message: '',
          result: true,
          statusCode: 200,
        }),
      );

    component.loadFeaturedQuizzes(1);
    component.loadFeaturedQuizzes(2);

    expect(component.quizzesWithTags.length).toBe(2);
    expect(component.hasMore).toBe(false);
  });

  it('should call loadFeaturedQuizzes with next batch when hasMore = true', () => {
    const spy = jest.spyOn(component, 'loadFeaturedQuizzes');
    component.hasMore = true;
    (component as any).currentBatch = 2;

    component.handleFooterAction();

    expect(spy).toHaveBeenCalledWith(3);
  });

  it('should reset quizzes when hasMore = false', () => {
    component.hasMore = false;
    component.quizzesWithTags = [
      ...Array(10).fill({
        quizName: 'Test',
        categoryName: 'Cat',
        difficultyLevel: 'Easy',
        totalAttempts: 0,
        rating: 0,
        tag: { label: 'Easy', color: 'green', type: 'difficulty' },
      }),
    ] as FeaturedQuizWithTag[];
    (component as any).currentBatch = 4;

    component.handleFooterAction();

    expect(component.quizzesWithTags.length).toBe(5);
    expect((component as any).currentBatch).toBe(1);
    expect(component.hasMore).toBe(true);
  });
});
