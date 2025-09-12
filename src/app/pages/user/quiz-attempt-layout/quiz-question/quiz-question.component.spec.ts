import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizQuestionComponent } from './quiz-question.component';
import { QuizQuestions } from '../interfaces/quiz-attempt.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { By } from '@angular/platform-browser';

describe('QuizQuestionComponent', () => {
  let component: QuizQuestionComponent;
  let fixture: ComponentFixture<QuizQuestionComponent>;

  const mockQuestionData: QuizQuestions = {
    questionId: 1,
    questionTypeName: 'Multiple Choice',
    questionName: 'What is the capital of France?',
    options: [
      { optionId: 1, key: 'option', value: 'Paris' },
      { optionId: 2, key: 'option', value: 'London' },
      { optionId: 3, key: 'option', value: 'Berlin' },
      { optionId: 4, key: 'option', value: 'Madrid' },
    ],
  };

  const mockTrueFalseQuestion: QuizQuestions = {
    questionId: 2,
    questionTypeName: 'True/False',
    questionName: 'The Earth is flat.',
    options: [],
  };

  const mockShortAnswerQuestion: QuizQuestions = {
    questionId: 3,
    questionTypeName: 'Short Answer',
    questionName: 'What is the largest planet in our solar system?',
    options: [],
  };

  const mockFillBlankQuestion: QuizQuestions = {
    questionId: 4,
    questionTypeName: 'Fill in the Blank',
    questionName: 'The chemical symbol for gold is ____.',
    options: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        QuizQuestionComponent,
        CommonModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatOptionModule,
        MatDividerModule,
        MatRadioModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizQuestionComponent);
    component = fixture.componentInstance;
    component.currentQuestionIndex = 0;
    component.currentQuestionData = mockQuestionData;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input Properties', () => {
    it('should accept currentQuestionIndex input', () => {
      component.currentQuestionIndex = 5;
      fixture.detectChanges();
      expect(component.currentQuestionIndex).toBe(5);
    });

    it('should accept currentQuestionData input', () => {
      component.currentQuestionData = mockTrueFalseQuestion;
      fixture.detectChanges();
      expect(component.currentQuestionData.questionTypeName).toBe('True/False');
    });

    it('should accept currentAnswer input', () => {
      component.currentAnswer = 'Paris';
      fixture.detectChanges();
      expect(component.currentAnswer).toBe('Paris');
    });
  });

  describe('Rendering', () => {
    it('should display question number and text', () => {
      const questionNumber = fixture.debugElement.query(By.css('h3'));
      const questionText = fixture.debugElement.query(By.css('p.text-gray-800'));

      expect(questionNumber.nativeElement.textContent).toContain('Question 1');
      expect(questionText.nativeElement.textContent).toContain('What is the capital of France?');
    });

    it('should render Multiple Choice question type correctly', () => {
      component.currentQuestionData = mockQuestionData;
      fixture.detectChanges();

      const radioGroup = fixture.debugElement.query(By.css('mat-radio-group'));
      const radioButtons = fixture.debugElement.queryAll(By.css('mat-radio-button'));

      expect(radioGroup).toBeTruthy();
      expect(radioButtons.length).toBe(4);
      expect(radioButtons[0].nativeElement.textContent).toContain('Paris');
    });

    it('should render True/False question type correctly', () => {
      component.currentQuestionData = mockTrueFalseQuestion;
      fixture.detectChanges();

      const select = fixture.debugElement.query(By.css('mat-select'));
      expect(select).toBeTruthy();
    });

    it('should render Short Answer question type correctly', () => {
      component.currentQuestionData = mockShortAnswerQuestion;
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('input[matInput]'));
      expect(input).toBeTruthy();
      expect(input.attributes['placeholder']).toBe('Enter your answer');
    });

    it('should render Fill in the Blank question type correctly', () => {
      component.currentQuestionData = mockFillBlankQuestion;
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('input[matInput]'));
      expect(input).toBeTruthy();
      expect(input.attributes['placeholder']).toBe('Enter your answer');
    });

    it('should display unsupported message for unknown question types', () => {
      component.currentQuestionData = {
        ...mockQuestionData,
        questionTypeName: 'Unknown Type',
      };
      fixture.detectChanges();

      const message = fixture.debugElement.query(By.css('p.text-gray-500'));
      expect(message.nativeElement.textContent).toContain('Unsupported question type');
    });
  });

  describe('Answer Change Events', () => {
    it('should emit answer change event for Multiple Choice', () => {
      jest.spyOn(component.answerChanged, 'emit');
      component.currentQuestionData = mockQuestionData;
      fixture.detectChanges();

      // Get the radio group and trigger change event directly
      const radioGroup = fixture.debugElement.query(By.css('mat-radio-group'));
      radioGroup.triggerEventHandler('change', { value: 'Paris' });

      expect(component.answerChanged.emit).toHaveBeenCalledWith('Paris');
    });

    it('should emit answer change event for True/False selection', () => {
      jest.spyOn(component.answerChanged, 'emit');
      component.currentQuestionData = mockTrueFalseQuestion;
      fixture.detectChanges();

      // Simulate select change
      component.onAnswerChange({ value: 'true' });

      expect(component.answerChanged.emit).toHaveBeenCalledWith('true');
    });

    it('should emit answer change event for input fields', () => {
      jest.spyOn(component.answerChanged, 'emit');
      component.currentQuestionData = mockShortAnswerQuestion;
      fixture.detectChanges();

      // Simulate input event
      const mockEvent = { target: { value: 'Jupiter' } };
      component.onAnswerChange(mockEvent);

      expect(component.answerChanged.emit).toHaveBeenCalledWith('Jupiter');
    });

    it('should handle undefined event values gracefully', () => {
      jest.spyOn(component.answerChanged, 'emit');

      component.onAnswerChange(null);
      expect(component.answerChanged.emit).toHaveBeenCalledWith('');

      component.onAnswerChange({});
      expect(component.answerChanged.emit).toHaveBeenCalledWith('');
    });
  });

  describe('Two-way Data Binding', () => {
    it('should reflect currentAnswer in Multiple Choice', () => {
      component.currentQuestionData = mockQuestionData;
      component.currentAnswer = 'Paris';
      fixture.detectChanges();

      const radioGroup = fixture.debugElement.query(By.css('mat-radio-group'));
      expect(radioGroup.attributes['ng-reflect-value']).toBe('Paris');
    });

    it('should reflect currentAnswer in True/False select', () => {
      component.currentQuestionData = mockTrueFalseQuestion;
      component.currentAnswer = 'true';
      fixture.detectChanges();

      const select = fixture.debugElement.query(By.css('mat-select'));
      expect(select.attributes['ng-reflect-value']).toBe('true');
    });

    it('should reflect currentAnswer in input fields', () => {
      component.currentQuestionData = mockShortAnswerQuestion;
      component.currentAnswer = 'Jupiter';
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('input'));
      expect(input.nativeElement.value).toBe('Jupiter');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined currentQuestionData', () => {
      component.currentQuestionData = undefined as any;
      fixture.detectChanges();

      // Should not crash and should show some default content
      const questionNumber = fixture.debugElement.query(By.css('h3'));
      expect(questionNumber.nativeElement.textContent).toContain('Question 1');
    });

    it('should handle undefined options in Multiple Choice', () => {
      component.currentQuestionData = {
        ...mockQuestionData,
        options: undefined as any,
      };
      fixture.detectChanges();

      // Should not crash and should handle gracefully
      const radioGroup = fixture.debugElement.query(By.css('mat-radio-group'));
      expect(radioGroup).toBeTruthy();
    });

    it('should handle empty options array', () => {
      component.currentQuestionData = {
        ...mockQuestionData,
        options: [],
      };
      fixture.detectChanges();

      const radioButtons = fixture.debugElement.queryAll(By.css('mat-radio-button'));
      expect(radioButtons.length).toBe(0);
    });
  });

  describe('onAnswerChange Method', () => {
    it('should extract value from event object with value property', () => {
      jest.spyOn(component.answerChanged, 'emit');

      const mockEvent = { value: 'test-value' };
      component.onAnswerChange(mockEvent);

      expect(component.answerChanged.emit).toHaveBeenCalledWith('test-value');
    });

    it('should extract value from event target', () => {
      jest.spyOn(component.answerChanged, 'emit');

      const mockEvent = { target: { value: 'target-value' } };
      component.onAnswerChange(mockEvent);

      expect(component.answerChanged.emit).toHaveBeenCalledWith('target-value');
    });

    it('should return empty string for undefined event', () => {
      jest.spyOn(component.answerChanged, 'emit');

      component.onAnswerChange(undefined);

      expect(component.answerChanged.emit).toHaveBeenCalledWith('');
    });

    it('should return empty string for null event', () => {
      jest.spyOn(component.answerChanged, 'emit');

      component.onAnswerChange(null);

      expect(component.answerChanged.emit).toHaveBeenCalledWith('');
    });
  });
});
