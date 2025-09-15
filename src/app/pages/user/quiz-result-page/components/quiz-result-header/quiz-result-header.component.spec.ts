import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { QuizResultHeaderComponent } from './quiz-result-header.component';
import { QuizResultService } from '../../../../../services/user/quiz-result.service';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { ApiResponse } from '../../../../../shared/interfaces/api-response.interface';
import { QuizCompletedSummary } from '../../interfaces/quiz-completed-summary.interface';
import { defaultQuizCompletedSummary } from '../../configs/default-quiz-completed-summary.interface';
import { platformMessages } from '../../../../../utils/constants';

describe('QuizResultHeaderComponent', () => {
  let component: QuizResultHeaderComponent;
  let fixture: ComponentFixture<QuizResultHeaderComponent>;
  let mockQuizService: any;
  let mockSnackbar: any;

  beforeEach(async () => {
    mockQuizService = {
      getQuizSummary: jest
        .fn()
        .mockReturnValue(
          of({ data: defaultQuizCompletedSummary } as ApiResponse<QuizCompletedSummary>),
        ),
    };
    mockSnackbar = {
      showError: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [QuizResultHeaderComponent],
      providers: [
        { provide: QuizResultService, useValue: mockQuizService },
        { provide: SnackbarService, useValue: mockSnackbar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizResultHeaderComponent);
    component = fixture.componentInstance;

    // Provide required input before ngOnInit
    component.quizId = 123;
    fixture.detectChanges(); // triggers ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadQuizSummary on ngOnInit if quizId is provided', () => {
    expect(mockQuizService.getQuizSummary).toHaveBeenCalledWith(123);
    expect(component.quizSummary).toEqual(defaultQuizCompletedSummary);
  });

  it('should handle error when getQuizSummary fails', () => {
    const errorMock = throwError(() => new Error('API Error'));
    mockQuizService.getQuizSummary.mockReturnValueOnce(errorMock);

    component.loadQuizSummary(123);

    expect(mockSnackbar.showError).toHaveBeenCalledWith(
      platformMessages.errorMessage,
      platformMessages.failedLoadQuizResultSummary,
    );
    expect(component.quizSummary).toEqual(defaultQuizCompletedSummary);
  });
});
