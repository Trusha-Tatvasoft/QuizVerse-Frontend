import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BattleQuestionComponent } from './battle-question.component';
import { MatRadioChange } from '@angular/material/radio';
import { MatSelectChange } from '@angular/material/select';
import { BattleQuestion } from '../interfaces/battle-attempt.interface';

describe('BattleQuestionComponent', () => {
  let component: BattleQuestionComponent;
  let fixture: ComponentFixture<BattleQuestionComponent>;

  const mockQuestionData: BattleQuestion = {
    questionIndex: 0,
    quizQuestionId: 1,
    questionName: 'What is 2 + 2?',
    questionType: 'multiple-choice',
    options: [
      { key: 'A', value: '3' },
      { key: 'B', value: '4' },
      { key: 'C', value: '5' },
      { key: 'D', value: '6' },
    ],
    timeInSeconds: 30,
  } as BattleQuestion;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BattleQuestionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BattleQuestionComponent);
    component = fixture.componentInstance;
    component.currentQuestionIndex = 0;
    component.currentQuestionData = mockQuestionData;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges', () => {
    it('should reset typedAnswer when currentQuestionIndex changes', () => {
      component.typedAnswer = 'old';
      component.ngOnChanges({
        currentQuestionIndex: {
          previousValue: 0,
          currentValue: 1,
          firstChange: false,
          isFirstChange: () => false,
        },
      });
      expect(component.typedAnswer).toBe('');
    });

    it('should set typedAnswer to userAnswer when showCorrectAnswer is true and userAnswer is provided', () => {
      component.userAnswer = 'B';
      component.showCorrectAnswer = true;

      component.ngOnChanges({
        showCorrectAnswer: {
          previousValue: false,
          currentValue: true,
          firstChange: false,
          isFirstChange: () => false,
        },
        userAnswer: {
          previousValue: '',
          currentValue: 'B',
          firstChange: false,
          isFirstChange: () => false,
        },
      });

      expect(component.typedAnswer).toBe('B');
    });

    it('should clear typedAnswer when showCorrectAnswer changes from true to false', () => {
      component.typedAnswer = 'B';
      component.showCorrectAnswer = false;

      component.ngOnChanges({
        showCorrectAnswer: {
          previousValue: true,
          currentValue: false,
          firstChange: false,
          isFirstChange: () => false,
        },
      });

      expect(component.typedAnswer).toBe('');
    });
  });

  describe('submitAnswer', () => {
    it('should emit trimmed typedAnswer and reset typedAnswer & currentAnswer', () => {
      const spy = jest.spyOn(component.answerChanged, 'emit');
      component.typedAnswer = '  B ';
      component.currentAnswer = 'dummy';

      component.submitAnswer();

      expect(spy).toHaveBeenCalledWith('B');
      expect(component.typedAnswer).toBe('');
      expect(component.currentAnswer).toBe('');
    });

    it('should emit empty string if typedAnswer is empty', () => {
      const spy = jest.spyOn(component.answerChanged, 'emit');
      component.typedAnswer = '   '; // only spaces
      component.currentAnswer = 'X';

      component.submitAnswer();

      expect(spy).toHaveBeenCalledWith('');
      expect(component.typedAnswer).toBe('');
      expect(component.currentAnswer).toBe('');
    });
  });

  describe('onAnswerChange', () => {
    it('should handle MatRadioChange', () => {
      const spy = jest.spyOn(component.answerChanged, 'emit');
      const event = { value: 'A' } as MatRadioChange;

      component.onAnswerChange(event);

      expect(component.currentAnswer).toBe('A');
      expect(spy).toHaveBeenCalledWith('A');
    });

    it('should handle MatSelectChange', () => {
      const spy = jest.spyOn(component.answerChanged, 'emit');
      const event = { value: 'B' } as MatSelectChange;

      component.onAnswerChange(event);

      expect(component.currentAnswer).toBe('B');
      expect(spy).toHaveBeenCalledWith('B');
    });

    it('should handle native input Event', () => {
      const spy = jest.spyOn(component.answerChanged, 'emit');
      const inputEl = document.createElement('input');
      inputEl.value = 'C';
      const event = new Event('input');
      Object.defineProperty(event, 'target', { value: inputEl });

      component.onAnswerChange(event);

      expect(component.currentAnswer).toBe('C');
      expect(spy).toHaveBeenCalledWith('C');
    });
  });
});
