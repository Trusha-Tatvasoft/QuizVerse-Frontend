import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { QuizPreviewComponent } from './quiz-preview.component';
import { QuestionsList } from '../../../../../shared/interfaces/quiz-creation.interface';

describe('QuizPreviewComponent', () => {
  let component: QuizPreviewComponent;
  let fixture: ComponentFixture<QuizPreviewComponent>;
  let dialogRefSpy: jest.Mocked<MatDialogRef<QuizPreviewComponent>>;

  beforeEach(async () => {
    dialogRefSpy = {
      close: jest.fn(),
    } as unknown as jest.Mocked<MatDialogRef<QuizPreviewComponent>>;

    await TestBed.configureTestingModule({
      imports: [QuizPreviewComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: dialogRefSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should close dialog on close()', () => {
    component.close();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('getOptions should return only options', () => {
    const q: QuestionsList = {
      queOptionsAns: [
        { key: 'option', value: 'A' },
        { key: 'answer', value: 'B' },
      ],
    } as any;
    expect(component.getOptions(q)).toEqual([{ key: 'option', value: 'A' }]);
  });

  it('getOptions should return empty array when no options', () => {
    expect(component.getOptions({} as any)).toEqual([]);
  });

  it('getAnswer should return the answer if present', () => {
    const q: QuestionsList = {
      queOptionsAns: [{ key: 'answer', value: 'Correct' }],
    } as any;
    expect(component.getAnswer(q)).toBe('Correct');
  });

  it('getAnswer should return empty string if no answer', () => {
    expect(component.getAnswer({} as any)).toBe('');
  });

  it('getAnswerTF should return lowercased answer if present', () => {
    const q: QuestionsList = {
      queOptionsAns: [{ key: 'answer', value: 'TRUE' }],
    } as any;
    expect(component.getAnswerTF(q)).toBe('true');
  });

  it('getAnswerTF should return empty string if no answer', () => {
    expect(component.getAnswerTF({} as any)).toBe('');
  });
});
