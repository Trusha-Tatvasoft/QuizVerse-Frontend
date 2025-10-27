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
      component.isAnswerSubmitted = true;

      component.ngOnChanges({
        currentQuestionIndex: {
          previousValue: 0,
          currentValue: 1,
          firstChange: false,
          isFirstChange: () => false,
        },
      });

      expect(component.typedAnswer).toBe('');
      expect(component.isAnswerSubmitted).toBe(false);
    });

    it('should not reset when currentQuestionIndex changes on firstChange', () => {
      component.typedAnswer = '';
      component.ngOnChanges({
        currentQuestionIndex: {
          previousValue: undefined,
          currentValue: 0,
          firstChange: true,
          isFirstChange: () => true,
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
      component.isAnswerSubmitted = true;

      component.ngOnChanges({
        showCorrectAnswer: {
          previousValue: true,
          currentValue: false,
          firstChange: false,
          isFirstChange: () => false,
        },
      });

      expect(component.typedAnswer).toBe('');
      expect(component.isAnswerSubmitted).toBe(false);
    });
  });

  describe('submitAnswer', () => {
    it('should emit trimmed typedAnswer and reset typedAnswer & currentAnswer', () => {
      const spy = jest.spyOn(component.answerChanged, 'emit');
      component.typedAnswer = '  B ';

      component.submitAnswer();

      expect(spy).toHaveBeenCalledWith('B');
      expect(component.isAnswerSubmitted).toBe(true);
      expect(component.typedAnswer).toBe('  B ');
    });

    it('should emit empty string if typedAnswer is empty', () => {
      const spy = jest.spyOn(component.answerChanged, 'emit');
      component.typedAnswer = '   ';

      component.submitAnswer();

      expect(spy).toHaveBeenCalledWith('');
      expect(component.isAnswerSubmitted).toBe(true);
    });
  });

  describe('onAnswerChange', () => {
    it('should not process answer change if isAnswerSubmitted is true', () => {
      const spy = jest.spyOn(component.answerChanged, 'emit');
      component.isAnswerSubmitted = true;
      const event = { value: 'A' } as MatRadioChange;

      component.onAnswerChange(event);

      expect(spy).not.toHaveBeenCalled();
      expect(component.currentAnswer).toBe('');
    });

    it('should handle MatRadioChange and set isAnswerSubmitted', () => {
      const spy = jest.spyOn(component.answerChanged, 'emit');
      component.isAnswerSubmitted = false;
      const event = { value: 'A' } as MatRadioChange;

      component.onAnswerChange(event);

      expect(component.currentAnswer).toBe('A');
      expect(component.isAnswerSubmitted).toBe(true);
      expect(spy).toHaveBeenCalledWith('A');
    });

    it('should handle MatSelectChange and set isAnswerSubmitted', () => {
      const spy = jest.spyOn(component.answerChanged, 'emit');
      component.isAnswerSubmitted = false;
      const event = { value: 'B' } as MatSelectChange;

      component.onAnswerChange(event);

      expect(component.currentAnswer).toBe('B');
      expect(component.isAnswerSubmitted).toBe(true);
      expect(spy).toHaveBeenCalledWith('B');
    });

    it('should handle native input Event and set isAnswerSubmitted', () => {
      const spy = jest.spyOn(component.answerChanged, 'emit');
      component.isAnswerSubmitted = false;
      const inputEl = document.createElement('input');
      inputEl.value = 'C';
      const event = new Event('input');
      Object.defineProperty(event, 'target', { value: inputEl });

      component.onAnswerChange(event);

      expect(component.currentAnswer).toBe('C');
      expect(component.isAnswerSubmitted).toBe(true);
      expect(spy).toHaveBeenCalledWith('C');
    });

    it('should extract value from MatRadioChange with value property', () => {
      const spy = jest.spyOn(component.answerChanged, 'emit');
      component.isAnswerSubmitted = false;
      const event = { value: 'D' } as MatRadioChange;

      component.onAnswerChange(event);

      expect(spy).toHaveBeenCalledWith('D');
    });
  });
});
