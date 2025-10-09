import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionPreviewDialogComponent } from './question-preview-dialog.component';
import { QuestionPoolService } from '../../../../../services/admin/question-pool/question-pool.service';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { QuestionDetail } from '../../interfaces/question-pool-preview.interface';

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

  const questionPoolServiceMock = {};

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
        { provide: MAT_DIALOG_DATA, useValue: mockQuestion },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionPreviewDialogComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set questionData from injected MAT_DIALOG_DATA on init', () => {
    component.ngOnInit();

    expect(component.questionData).toEqual(mockQuestion);
  });

  it('should return correct tag config for Easy difficulty', () => {
    const config = component.getDifficultyTagConfig('Easy');

    expect(config.label).toBe('Easy');
    expect(config.id).toBe('tag-easy');
    expect(config.type).toBe('static');
    expect(config.isSelected).toBe(false);
    expect(config.hasBorder).toBe(false);
    expect(config.backgroundColor).toBe('lightGreen');
    expect(config.textColor).toBe('green');
  });

  it('should return correct tag config for Medium difficulty', () => {
    const config = component.getDifficultyTagConfig('Medium');

    expect(config.label).toBe('Medium');
    expect(config.id).toBe('tag-medium');
    expect(config.backgroundColor).toBe('lightYellow');
    expect(config.textColor).toBe('yellow');
  });

  it('should return correct tag config for Hard difficulty', () => {
    const config = component.getDifficultyTagConfig('Hard');

    expect(config.label).toBe('Hard');
    expect(config.id).toBe('tag-hard');
    expect(config.backgroundColor).toBe('lightRed');
    expect(config.textColor).toBe('red');
  });

  it('should close dialog when closeDialog is called', () => {
    component.closeDialog();
    expect(dialogRefMock.close).toHaveBeenCalled();
  });

  it('should complete destroy$ on ngOnDestroy', () => {
    const nextSpy = jest.spyOn(component['destroy$'], 'next');
    const completeSpy = jest.spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should handle question data with no options', () => {
    const questionWithoutOptions: QuestionDetail = {
      id: 2,
      questionText: 'True or False question?',
      questionType: 'True/False',
      difficulty: 'Easy',
      category: 'General',
      options: [],
      correctAnswer: 'True',
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [QuestionPreviewDialogComponent],
      providers: [
        { provide: QuestionPoolService, useValue: questionPoolServiceMock },
        { provide: SnackbarService, useValue: snackbarMock },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: questionWithoutOptions },
      ],
    });

    fixture = TestBed.createComponent(QuestionPreviewDialogComponent);
    component = fixture.componentInstance;
    component.ngOnInit();

    expect(component.questionData).toEqual(questionWithoutOptions);
    expect(component.questionData.options).toEqual([]);
  });
});
