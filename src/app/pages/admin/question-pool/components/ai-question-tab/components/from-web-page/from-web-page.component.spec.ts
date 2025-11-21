import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FromWebPageComponent } from './from-web-page.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of, Subject, throwError } from 'rxjs';
import { SnackbarService } from '../../../../../../../shared/service/snackbar/snackbar.service';
import { ValidationErrorService } from '../../../../../../../shared/service/validation-error/validation-error.service';
import { AiQuestionTabComponent } from '../../ai-question-tab.component';
import { QuestionPoolService } from '../../../../../../../services/admin/question-pool/question-pool.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
  platformMessages,
  fetchContentFromUrlMessages,
} from '../../../../../../../utils/constants';

describe('FromWebPageComponent', () => {
  let component: FromWebPageComponent;
  let fixture: ComponentFixture<FromWebPageComponent>;

  // Mock services
  const snackbarService = {
    showError: jest.fn(),
    showSuccess: jest.fn(),
  };

  const validationErrorService = {
    getErrorMessage: jest.fn().mockReturnValue('Mock error'),
  };

  const aiQuestionTabComponent = {
    quizConfig$: new Subject(),
  };

  const questionPoolService = {
    getQuestionsUsingWebUrl: jest.fn(),
  };

  const dialogRef = {
    close: jest.fn(),
    afterClosed: jest.fn().mockReturnValue(of(true)),
  };

  const matDialog = {
    open: jest.fn().mockReturnValue(dialogRef),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FromWebPageComponent],
      providers: [
        FormBuilder,
        { provide: SnackbarService, useValue: snackbarService },
        { provide: ValidationErrorService, useValue: validationErrorService },
        { provide: AiQuestionTabComponent, useValue: aiQuestionTabComponent },
        { provide: QuestionPoolService, useValue: questionPoolService },
        { provide: MatDialog, useValue: matDialog },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FromWebPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create component and initialize form', () => {
    expect(component).toBeTruthy();
    expect(component.uploadForm).toBeTruthy();
    expect(component.fields.length).toBeGreaterThan(0);
  });

  it('should update generate button state when form and config are valid', () => {
    const urlControl = component.uploadForm.get('url');
    urlControl?.setValue('https://example.com');

    component.quizConfig = {
      categoryId: 1,
      questionSpec: [
        {
          questionDifficultyId: 1,
          questionDifficultyName: 'Easy',
          questionPerQuestionType: [],
        },
      ],
    };

    (component as any).updateGenerateButtonState();

    expect(component.generateBtnConfig.isDisabled).toBe(false);
  });

  it('should disable generate button if url invalid or config missing', () => {
    const urlControl = component.uploadForm.get('url');
    urlControl?.setValue('');
    component.quizConfig = null;

    (component as any).updateGenerateButtonState();

    expect(component.generateBtnConfig.isDisabled).toBe(true);
  });

  it('should show error if URL invalid on generateQuestion', () => {
    const urlControl = component.uploadForm.get('url');
    urlControl?.setValue('invalid url');

    component.generateQuestion();

    expect(snackbarService.showError).toHaveBeenCalledWith(
      platformMessages.errorTitle,
      fetchContentFromUrlMessages.enterValidUrl,
    );
  });

  it('should show error if quizConfig missing on generateQuestion', () => {
    const urlControl = component.uploadForm.get('url');
    urlControl?.setValue('https://example.com');
    component.quizConfig = null;

    component.generateQuestion();

    expect(snackbarService.showError).toHaveBeenCalledWith(
      platformMessages.errorTitle,
      platformMessages.aiConfigRequired,
    );
  });

  it('should call API and open preview dialog on success', () => {
    const urlControl = component.uploadForm.get('url');
    urlControl?.setValue('https://example.com');
    component.quizConfig = {
      questionSpec: [
        { questionDifficultyId: 1, questionDifficultyName: 'Easy', questionPerQuestionType: [] },
      ],
    };

    const mockResponse = { data: [{ id: 1 }], result: true };
    questionPoolService.getQuestionsUsingWebUrl.mockReturnValue(of(mockResponse));

    component.generateQuestion();

    expect(questionPoolService.getQuestionsUsingWebUrl).toHaveBeenCalled();
    expect(snackbarService.showSuccess).toHaveBeenCalledWith(
      platformMessages.successTitle,
      fetchContentFromUrlMessages.questionGeneratedSuccess,
    );
    expect(matDialog.open).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should handle API error gracefully', () => {
    const urlControl = component.uploadForm.get('url');
    urlControl?.setValue('https://example.com');
    component.quizConfig = {
      questionSpec: [
        { questionDifficultyId: 1, questionDifficultyName: 'Easy', questionPerQuestionType: [] },
      ],
    };

    questionPoolService.getQuestionsUsingWebUrl.mockReturnValue(
      throwError(() => ({ error: { message: 'Failed to fetch' } })),
    );

    component.generateQuestion();

    expect(snackbarService.showError).toHaveBeenCalledWith(
      platformMessages.errorTitle,
      'Failed to fetch',
    );
  });

  it('should handle API error without message', () => {
    const urlControl = component.uploadForm.get('url');
    urlControl?.setValue('https://example.com');
    component.quizConfig = {
      questionSpec: [
        { questionDifficultyId: 1, questionDifficultyName: 'Easy', questionPerQuestionType: [] },
      ],
    };

    questionPoolService.getQuestionsUsingWebUrl.mockReturnValue(throwError(() => ({})));

    component.generateQuestion();

    expect(snackbarService.showError).toHaveBeenCalledWith(
      platformMessages.errorTitle,
      fetchContentFromUrlMessages.questionGeneratedFailed,
    );
  });

  it('should return correct error message from getError()', () => {
    const urlControl = component.uploadForm.get('url');
    urlControl?.markAsTouched();

    const message = component.getError('url');
    expect(message).toBe('Mock error');
    expect(validationErrorService.getErrorMessage).toHaveBeenCalled();
  });

  it('should handle ngOnDestroy cleanup', () => {
    const spyNext = jest.spyOn((component as any).destroy$, 'next');
    const spyComplete = jest.spyOn((component as any).destroy$, 'complete');

    component.ngOnDestroy();

    expect(spyNext).toHaveBeenCalled();
    expect(spyComplete).toHaveBeenCalled();
  });

  it('should open preview dialog and close parent when result is true', () => {
    const questions = [{ id: 1 } as any];
    component['openPreviewDialog'](questions);

    expect(matDialog.open).toHaveBeenCalled();
    expect(dialogRef.afterClosed).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });
});
