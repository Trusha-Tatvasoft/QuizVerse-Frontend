import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { QuizRatingComponent } from './quiz-rating.component';
import { QuizResultService } from '../../../../../services/user/quiz-result.service';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { FilledButtonComponent } from '../../../../../shared/components/filled-button/filled-button.component';
import { OutlineButtonComponent } from '../../../../../shared/components/outline-button/outline-button.component';

describe('QuizRatingComponent', () => {
  let component: QuizRatingComponent;
  let fixture: ComponentFixture<QuizRatingComponent>;
  let quizServiceMock: any;
  let snackbarMock: any;
  let routerMock: any;

  beforeEach(async () => {
    // Mock services with proper Observable returns
    quizServiceMock = {
      getMyQuizRating: jest.fn().mockReturnValue(of({ result: false, data: null })),
      submitQuizRating: jest.fn().mockReturnValue(of({ message: 'Rating submitted!' })),
    };

    snackbarMock = {
      showError: jest.fn(),
      showSuccess: jest.fn(),
    };

    routerMock = {
      navigate: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatIconModule,
        MatButtonModule,
        FilledButtonComponent,
        OutlineButtonComponent,
        QuizRatingComponent, // Standalone component
      ],
      providers: [
        FormBuilder,
        { provide: QuizResultService, useValue: quizServiceMock },
        { provide: SnackbarService, useValue: snackbarMock },
        { provide: Router, useValue: routerMock },
        CdkTextareaAutosize,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizRatingComponent);
    component = fixture.componentInstance;
    component.quizId = 1;

    fixture.detectChanges(); // runs ngOnInit safely
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with quizRatingFormField', () => {
    expect(component.ratingForm.contains('rating')).toBe(true);
    expect(component.ratingForm.contains('feedback')).toBe(true);

    const ratingControl = component.ratingForm.get('rating');
    const feedbackControl = component.ratingForm.get('feedback');

    expect(ratingControl?.value).toBe(0);
    expect(feedbackControl?.value).toBe('');
  });

  describe('setRating()', () => {
    it('should set rating value', () => {
      component.setRating(3);
      expect(component.ratingForm.get('rating')?.value).toBe(3);

      // clicking same star resets to 0
      component.setRating(3);
      expect(component.ratingForm.get('rating')?.value).toBe(0);
    });

    it('should not set rating if ratingSubmitted is true', () => {
      component.ratingSubmitted = true;
      component.setRating(4);
      expect(component.ratingForm.get('rating')?.value).toBe(0);
    });
  });

  describe('getMyQuizRatting()', () => {
    it('should patch form when rating exists', () => {
      const mockResponse = {
        result: true,
        data: { quizRating: 5, feedback: 'Great quiz!' },
      };
      quizServiceMock.getMyQuizRating.mockReturnValue(of(mockResponse));

      component.getMyQuizRatting();

      expect(component.ratingForm.get('rating')?.value).toBe(5);
      expect(component.ratingForm.get('feedback')?.value).toBe('Great quiz!');
      expect(component.ratingSubmitted).toBe(true);
    });

    it('should show error if service fails', () => {
      quizServiceMock.getMyQuizRating.mockReturnValue(
        throwError(() => ({ message: 'Error occurred' })),
      );

      component.getMyQuizRatting();

      expect(snackbarMock.showError).toHaveBeenCalledWith(expect.any(String), 'Error occurred');
    });
  });

  describe('onSubmit()', () => {
    it('should submit form successfully', () => {
      component.ratingForm.get('rating')?.setValue(4);
      component.ratingForm.get('feedback')?.setValue('Nice quiz!');

      const mockSubmitResponse = { message: 'Rating submitted!' };
      quizServiceMock.submitQuizRating.mockReturnValue(of(mockSubmitResponse));

      component.onSubmit();

      expect(quizServiceMock.submitQuizRating).toHaveBeenCalledWith({
        quizId: 1,
        quizRating: 4,
        feedback: 'Nice quiz!',
      });
      expect(snackbarMock.showSuccess).toHaveBeenCalledWith(
        expect.any(String),
        'Rating submitted!',
      );
      expect(component.ratingSubmitted).toBe(true);
    });

    it('should show error if submission fails', () => {
      component.ratingForm.get('rating')?.setValue(4);
      quizServiceMock.submitQuizRating.mockReturnValue(throwError(() => new Error('Failed')));

      component.onSubmit();

      expect(snackbarMock.showError).toHaveBeenCalledWith(
        expect.any(String),
        'Failed to submit rating.',
      );
    });
  });

  describe('navigateToDashboard()', () => {
    it('should navigate to dashboard', () => {
      component.navigateToDashboard();
      expect(routerMock.navigate).toHaveBeenCalledWith(['user/dashboard']);
    });
  });
});
