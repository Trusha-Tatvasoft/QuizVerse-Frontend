import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionPreviewDialogComponent } from './question-preview-dialog.component';
import { QuestionPoolService } from '../../../../../services/admin/question-pool/question-pool.service';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { QuestionDetail } from '../../interfaces/question-pool-preview.interface';
import { platformMessages } from '../../../../../utils/constants';

describe('QuestionPreviewDialogComponent', () => {
  let component: QuestionPreviewDialogComponent;
  let fixture: ComponentFixture<QuestionPreviewDialogComponent>;

  const mockQuestion: QuestionDetail = {
    id: 1,
    questionText: 'What is 2 + 2?',
    questionType: 'Multiple Choice',
    difficulty: 'Easy',
    category: 'Math',
    options: [
      { label: 'A', value: '3', isCorrect: false },
      { label: 'B', value: '4', isCorrect: true },
      { label: 'C', value: '5', isCorrect: false },
    ],
    correctAnswer: '4',
  };

  const questionPoolServiceMock = {
    getQuestionPreviewById: jest.fn(),
  };

  const snackbarMock = {
    showError: jest.fn(),
  };

  const dialogRefMock = {
    close: jest.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionPreviewDialogComponent],
      providers: [
        { provide: QuestionPoolService, useValue: questionPoolServiceMock },
        { provide: SnackbarService, useValue: snackbarMock },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: { id: 1 } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionPreviewDialogComponent);
    component = fixture.componentInstance;
  });

  it('should fetch question on init (success case)', () => {
    questionPoolServiceMock.getQuestionPreviewById.mockReturnValue(of({ data: mockQuestion }));

    component.ngOnInit();

    expect(questionPoolServiceMock.getQuestionPreviewById).toHaveBeenCalledWith(1);
    expect(component.questionData).toEqual(mockQuestion);
  });

  it('should show default error message when error response has no message', () => {
    const errorResponse = { error: {} };
    questionPoolServiceMock.getQuestionPreviewById.mockReturnValue(throwError(() => errorResponse));

    component.ngOnInit();

    expect(snackbarMock.showError).toHaveBeenCalledWith(
      platformMessages.errorTitle,
      platformMessages.failedLoadQuesPreview,
    );
    expect(dialogRefMock.close).toHaveBeenCalled();
  });

  it('should return correct tag config for difficulty', () => {
    const config = component.getDifficultyTagConfig('Easy');
    expect(config.label).toBe('Easy');
    expect(config.backgroundColor).toBe('lightGreen');
    expect(config.textColor).toBe('green');
    expect(config.type).toBe('static');
    expect(config.isSelected).toBe(false);
  });

  it('should close dialog when closeDialog is called', () => {
    component.closeDialog();
    expect(dialogRefMock.close).toHaveBeenCalled();
  });
});
