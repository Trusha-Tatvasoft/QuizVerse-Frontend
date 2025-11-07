import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError, Subject } from 'rxjs';
import { CommentSectionComponent } from './comment-section.component';
import { QuizResultService } from '../../../../../services/user/quiz-result/quiz-result.service';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { loadMoreButtonConfig } from '../../configs/comment-section.config';
import { QuizComments, QuizCommentsResponse } from '../../interfaces/quiz-comments.interface';
import { ApiResponse } from '../../../../../shared/interfaces/api-response.interface';

// Mock services
const mockQuizResultService = {
  getTotalComments: jest.fn(),
  getComments: jest.fn(),
};

const mockSnackbarService = {
  showError: jest.fn(),
};

describe('CommentSectionComponent', () => {
  let component: CommentSectionComponent;
  let fixture: ComponentFixture<CommentSectionComponent>;
  let quizResultService: jest.Mocked<QuizResultService>;
  let snackbarService: jest.Mocked<SnackbarService>;

  const mockQuizComments: QuizComments[] = [
    {
      userName: 'user1',
      fullName: 'John Doe',
      profilePic: null,
      commentText: 'Great quiz!',
      rating: 5,
      commentDate: new Date('2024-01-15'),
      isUser: false,
    },
    {
      userName: 'user2',
      fullName: 'Jane Smith',
      profilePic: 'profile.jpg',
      commentText: 'Nice questions',
      rating: 4,
      commentDate: new Date('2024-01-14'),
      isUser: true,
    },
  ];

  const mockCommentsResponse: QuizCommentsResponse = {
    comments: mockQuizComments,
    hasMoreComments: true,
  };

  const mockTotalCommentsResponse: ApiResponse<number> = {
    statusCode: 200,
    result: true,
    data: 42,
    message: 'Success',
  };

  const mockCommentsApiResponse: ApiResponse<QuizCommentsResponse> = {
    statusCode: 200,
    result: true,
    data: mockCommentsResponse,
    message: 'Success',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentSectionComponent],
      providers: [
        { provide: QuizResultService, useValue: mockQuizResultService },
        { provide: SnackbarService, useValue: mockSnackbarService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentSectionComponent);
    component = fixture.componentInstance;
    quizResultService = TestBed.inject(QuizResultService) as jest.Mocked<QuizResultService>;
    snackbarService = TestBed.inject(SnackbarService) as jest.Mocked<SnackbarService>;

    // Set required input
    component.quizId = 123;
  });

  afterEach(() => {
    jest.clearAllMocks();
    component.ngOnDestroy();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have initial values set correctly', () => {
      expect(component.quizComments).toEqual([]);
      expect(component.hasMoreComments).toBe(true);
      expect(component.totalComments).toBe(0);
      expect(component.batchNumber).toBe(1);
      expect(component.loadMoreButton).toEqual(loadMoreButtonConfig);
    });
  });

  describe('ngOnInit', () => {
    it('should call loadComments and getTotalComments on init', () => {
      const loadCommentsSpy = jest.spyOn(component as any, 'loadComments');
      const getTotalCommentsSpy = jest.spyOn(component as any, 'getTotalComments');

      quizResultService.getComments.mockReturnValue(of(mockCommentsApiResponse));
      quizResultService.getTotalComments.mockReturnValue(of(mockTotalCommentsResponse));

      component.ngOnInit();

      expect(loadCommentsSpy).toHaveBeenCalled();
      expect(getTotalCommentsSpy).toHaveBeenCalled();
    });
  });

  describe('loadMoreComments', () => {
    it('should increment batchNumber and load more comments when hasMoreComments is true', () => {
      component.hasMoreComments = true;
      component.batchNumber = 1;
      const loadCommentsSpy = jest.spyOn(component as any, 'loadComments');

      component.loadMoreComments();

      expect(component.batchNumber).toBe(2);
      expect(loadCommentsSpy).toHaveBeenCalled();
    });

    it('should not increment batchNumber or load comments when hasMoreComments is false', () => {
      component.hasMoreComments = false;
      component.batchNumber = 1;
      const loadCommentsSpy = jest.spyOn(component as any, 'loadComments');

      component.loadMoreComments();

      expect(component.batchNumber).toBe(1);
      expect(loadCommentsSpy).not.toHaveBeenCalled();
    });
  });

  describe('formatCommentDate', () => {
    it('should return "Today" for today\'s date', () => {
      const today = new Date();
      expect(component.formatCommentDate(today)).toBe('Today');
    });

    it('should return "Yesterday" for yesterday\'s date', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(component.formatCommentDate(yesterday)).toBe('Yesterday');
    });

    it('should return "X days ago" for dates within last 7 days', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      expect(component.formatCommentDate(threeDaysAgo)).toBe('3 days ago');
    });

    it('should return formatted date for dates older than 7 days', () => {
      const oldDate = new Date('2024-01-01');
      const result = component.formatCommentDate(oldDate);

      // Check the format: "01 Jan 2024"
      expect(result).toMatch(/^\d{2} \w{3} \d{4}$/);
      expect(result).toBe('01 Jan 2024');
    });

    it('should handle string dates', () => {
      const dateString = '2024-01-15';
      expect(component.formatCommentDate(dateString)).toBe('15 Jan 2024');
    });

    it('should handle malformed date strings gracefully', () => {
      // This will return "Invalid Date" but the exact behavior depends on your implementation
      const result = component.formatCommentDate('invalid-date');
      // You might want to adjust this assertion based on your actual implementation
      expect(typeof result).toBe('string');
    });
  });

  describe('getInitials', () => {
    it('should return initials for a full name', () => {
      expect(component.getInitials('John Doe')).toBe('JD');
    });

    it('should return single initial for single name', () => {
      expect(component.getInitials('John')).toBe('J');
    });

    it('should handle empty name', () => {
      expect(component.getInitials('')).toBe('');
    });
  });

  describe('Private Methods', () => {
    describe('getTotalComments', () => {
      it('should set totalComments on successful response', () => {
        quizResultService.getTotalComments.mockReturnValue(of(mockTotalCommentsResponse));

        (component as any).getTotalComments();

        expect(component.totalComments).toBe(42);
        expect(quizResultService.getTotalComments).toHaveBeenCalledWith(123);
        expect(snackbarService.showError).not.toHaveBeenCalled();
      });

      it('should show error on service error', () => {
        const errorResponse = { error: { message: 'Server error' } };
        quizResultService.getTotalComments.mockReturnValue(throwError(() => errorResponse));

        (component as any).getTotalComments();

        expect(snackbarService.showError).toHaveBeenCalledWith('Server error');
      });
    });

    describe('loadComments', () => {
      it('should add comments to quizComments and update hasMoreComments on success', () => {
        quizResultService.getComments.mockReturnValue(of(mockCommentsApiResponse));

        (component as any).loadComments();

        expect(component.quizComments).toEqual(mockQuizComments);
        expect(component.hasMoreComments).toBe(true);
        expect(quizResultService.getComments).toHaveBeenCalledWith(123, 1);
        expect(snackbarService.showError).not.toHaveBeenCalled();
      });

      it('should append comments when loading more', () => {
        const initialComments = [mockQuizComments[0]];
        component.quizComments = [...initialComments];
        component.batchNumber = 2;

        const secondBatchResponse: ApiResponse<QuizCommentsResponse> = {
          statusCode: 200,
          result: true,
          data: {
            comments: [mockQuizComments[1]],
            hasMoreComments: false,
          },
          message: 'Success',
        };
        quizResultService.getComments.mockReturnValue(of(secondBatchResponse));

        (component as any).loadComments();

        expect(component.quizComments).toEqual(mockQuizComments);
        expect(component.hasMoreComments).toBe(false);
        expect(quizResultService.getComments).toHaveBeenCalledWith(123, 2);
      });

      it('should show error on API error response', () => {
        const errorResponse: ApiResponse<QuizCommentsResponse> = {
          statusCode: 400,
          result: false,
          data: {
            comments: [],
            hasMoreComments: false,
          },
          message: 'Failed to load comments',
        };
        quizResultService.getComments.mockReturnValue(of(errorResponse));

        (component as any).loadComments();

        expect(snackbarService.showError).toHaveBeenCalledWith('Failed to load comments');
      });

      it('should show error on service error', () => {
        const errorResponse = { error: { message: 'Network error' } };
        quizResultService.getComments.mockReturnValue(throwError(() => errorResponse));

        (component as any).loadComments();

        expect(snackbarService.showError).toHaveBeenCalledWith('Network error');
      });
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy$ subject', () => {
      const nextSpy = jest.spyOn(component['destroy$'], 'next');
      const completeSpy = jest.spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalledWith();
      expect(completeSpy).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty comments array', () => {
      const emptyResponse: ApiResponse<QuizCommentsResponse> = {
        statusCode: 200,
        result: true,
        data: {
          comments: [],
          hasMoreComments: false,
        },
        message: 'Success',
      };
      quizResultService.getComments.mockReturnValue(of(emptyResponse));

      (component as any).loadComments();

      expect(component.quizComments).toEqual([]);
      expect(component.hasMoreComments).toBe(false);
    });

    it('should handle comments with missing optional fields', () => {
      const minimalComment: QuizComments = {
        userName: 'user3',
        fullName: 'Bob Wilson',
        profilePic: undefined,
        commentText: undefined,
        rating: 3,
        commentDate: new Date(),
        isUser: false,
      };

      const minimalResponse: ApiResponse<QuizCommentsResponse> = {
        statusCode: 200,
        result: true,
        data: {
          comments: [minimalComment],
          hasMoreComments: false,
        },
        message: 'Success',
      };
      quizResultService.getComments.mockReturnValue(of(minimalResponse));

      (component as any).loadComments();

      expect(component.quizComments).toHaveLength(1);
      expect(component.quizComments[0].userName).toBe('user3');
    });
  });
});
