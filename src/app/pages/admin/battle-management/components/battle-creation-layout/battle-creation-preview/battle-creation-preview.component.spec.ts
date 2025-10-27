import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BattleCreationPreviewComponent } from './battle-creation-preview.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BattlePreviewData, QuestionsList } from '../../../interfaces/battle-creation.interface';

describe('BattleCreationPreviewComponent', () => {
  let component: BattleCreationPreviewComponent;
  let fixture: ComponentFixture<BattleCreationPreviewComponent>;
  let dialogRef: jest.Mocked<MatDialogRef<BattleCreationPreviewComponent>>;

  const mockDialogData: BattlePreviewData = {
    name: 'Test Battle',
    description: 'A mock battle',
    tags: [
      {
        id: '1',
        label: 'Tag1',
        type: 'static',
        isSelected: false,
        hasBorder: true,
        backgroundColor: 'lightGreen',
        textColor: 'green',
      },
      {
        id: '2',
        label: 'Tag2',
        type: 'static',
        isSelected: false,
        hasBorder: true,
        backgroundColor: 'lightBlue',
        textColor: 'blue',
      },
      {
        id: '3',
        label: 'Tag3',
        type: 'static',
        isSelected: false,
        hasBorder: true,
        backgroundColor: 'lightRed',
        textColor: 'red',
      },
      {
        id: '4',
        label: 'Tag4',
        type: 'static',
        isSelected: false,
        hasBorder: true,
        backgroundColor: 'lightYellow',
        textColor: 'yellow',
      },
      {
        id: '5',
        label: 'Tag5',
        type: 'static',
        isSelected: false,
        hasBorder: true,
        backgroundColor: 'lightPurple',
        textColor: 'purple',
      },
      {
        id: '6',
        label: 'DateTag',
        type: 'static',
        isSelected: false,
        hasBorder: true,
        backgroundColor: 'lightWhite',
        textColor: 'white',
      },
    ],
    questions: [
      {
        id: 1,
        queText: 'What is 2+2?',
        queTypeId: 1,
        queTypeName: 'Multiple Choice',
        queDifficultyId: 1,
        queDifficultyName: 'Easy',
        categoryId: 1,
        queOptionsAns: [
          { id: 1, key: 'option', value: '4' },
          { id: 2, key: 'option', value: '5' },
          { id: 3, key: 'answer', value: '4' },
        ],
      },
      {
        id: 2,
        queText: 'Is the sky blue?',
        queTypeId: 2,
        queTypeName: 'True/False',
        queDifficultyId: 2,
        queDifficultyName: 'Medium',
        categoryId: 1,
        queOptionsAns: [{ id: 4, key: 'answer', value: 'True' }],
      },
      {
        id: 3,
        queText: 'What is the capital of France?',
        queTypeId: 3,
        queTypeName: 'Short Answer',
        queDifficultyId: 1,
        queDifficultyName: 'Easy',
        categoryId: 1,
        queOptionsAns: [{ id: 5, key: 'answer', value: 'Paris' }],
      },
      {
        id: 4,
        queText: 'The ____ is the largest planet.',
        queTypeId: 4,
        queTypeName: 'Fill in the Blank',
        queDifficultyId: 2,
        queDifficultyName: 'Medium',
        categoryId: 1,
        queOptionsAns: [{ id: 6, key: 'answer', value: 'Jupiter' }],
      },
    ],
    questionsDifficulty: [
      { queDifficultyId: 1, noOfQues: 2, timePerQuestion: 30 },
      { queDifficultyId: 2, noOfQues: 2, timePerQuestion: 45 },
    ],
    questionDifficultyXP: [
      { questionDifficultyId: 1, questionDifficultyName: 'Easy', xpGained: 10 },
      { questionDifficultyId: 2, questionDifficultyName: 'Medium', xpGained: 20 },
    ],
  };

  beforeEach(async () => {
    const dialogRefMock = {
      close: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [BattleCreationPreviewComponent, MatDialogModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: MatDialogRef, useValue: dialogRefMock },
      ],
      schemas: [NO_ERRORS_SCHEMA], // Ignore unknown components (e.g., TagComponent)
    }).compileComponents();

    fixture = TestBed.createComponent(BattleCreationPreviewComponent);
    component = fixture.componentInstance;
    dialogRef = TestBed.inject(MatDialogRef) as jest.Mocked<
      MatDialogRef<BattleCreationPreviewComponent>
    >;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with injected dialog data', () => {
    expect(component.data).toEqual(mockDialogData);
    expect(component.data.name).toBe('Test Battle');
    expect(component.data.questions.length).toBe(4);
    expect(component.data.tags.length).toBe(6);
  });

  it('should close dialog when close() is called', () => {
    component.close();
    expect(dialogRef.close).toHaveBeenCalled();
  });

  describe('getOptions', () => {
    it('should return options for a question with queOptionsAns', () => {
      const question: QuestionsList = mockDialogData.questions[0];
      const options = component.getOptions(question);
      expect(options).toEqual([
        { id: 1, key: 'option', value: '4' },
        { id: 2, key: 'option', value: '5' },
      ]);
    });

    it('should return empty array if queOptionsAns is undefined', () => {
      const question: QuestionsList = { queText: 'Test', queTypeId: 1 };
      const options = component.getOptions(question);
      expect(options).toEqual([]);
    });

    it('should return empty array if no options are present', () => {
      const question: QuestionsList = {
        queText: 'Test',
        queTypeId: 1,
        queOptionsAns: [{ id: 1, key: 'answer', value: 'True' }],
      };
      const options = component.getOptions(question);
      expect(options).toEqual([]);
    });
  });

  describe('getAnswer', () => {
    it('should return the answer value for a question', () => {
      const question: QuestionsList = mockDialogData.questions[0];
      const answer = component.getAnswer(question);
      expect(answer).toBe('4');
    });

    it('should return empty string if no answer is found', () => {
      const question: QuestionsList = {
        queText: 'Test',
        queTypeId: 1,
        queOptionsAns: [{ id: 1, key: 'option', value: '4' }],
      };
      const answer = component.getAnswer(question);
      expect(answer).toBe('');
    });

    it('should return empty string if queOptionsAns is undefined', () => {
      const question: QuestionsList = { queText: 'Test', queTypeId: 1 };
      const answer = component.getAnswer(question);
      expect(answer).toBe('');
    });
  });

  describe('getBoolAnswer', () => {
    it('should return lowercase answer for a boolean question', () => {
      const question: QuestionsList = mockDialogData.questions[1];
      const answer = component.getBoolAnswer(question);
      expect(answer).toBe('true');
    });

    it('should return empty string if no answer is found', () => {
      const question: QuestionsList = {
        queText: 'Test',
        queTypeId: 2,
        queOptionsAns: [{ id: 1, key: 'option', value: '4' }],
      };
      const answer = component.getBoolAnswer(question);
      expect(answer).toBe('');
    });

    it('should return empty string if queOptionsAns is undefined', () => {
      const question: QuestionsList = { queText: 'Test', queTypeId: 2 };
      const answer = component.getBoolAnswer(question);
      expect(answer).toBe('');
    });
  });

  describe('getDifficultyLabel', () => {
    it('should return difficulty label for a given ID', () => {
      const label = component.getDifficultyLabel(1);
      expect(label).toBe('Easy');
    });

    it('should return empty string if difficulty ID is not found', () => {
      const label = component.getDifficultyLabel(999);
      expect(label).toBe('');
    });

    it('should return empty string if difficulty ID is undefined', () => {
      const label = component.getDifficultyLabel(undefined);
      expect(label).toBe('');
    });
  });

  describe('getXpPerQuestion', () => {
    it('should return XP for a given difficulty ID', () => {
      const xp = component.getXpPerQuestion(1);
      expect(xp).toBe(10);
    });

    it('should return 0 if difficulty ID is not found', () => {
      const xp = component.getXpPerQuestion(999);
      expect(xp).toBe(0);
    });

    it('should return 0 if difficulty ID is undefined', () => {
      const xp = component.getXpPerQuestion(undefined);
      expect(xp).toBe(0);
    });
  });

  describe('getTimePerQuestion', () => {
    it('should return time per question for a given difficulty ID', () => {
      const time = component.getTimePerQuestion(1);
      expect(time).toBe(30);
    });

    it('should return 0 if difficulty ID is not found', () => {
      const time = component.getTimePerQuestion(999);
      expect(time).toBe(0);
    });

    it('should return 0 if difficulty ID is undefined', () => {
      const time = component.getTimePerQuestion(undefined);
      expect(time).toBe(0);
    });
  });

  it('should render battle name and description', () => {
    const nameElement = fixture.nativeElement.querySelector('h2');
    const descriptionElement = fixture.nativeElement.querySelector('p');
    expect(nameElement.textContent).toContain('Test Battle');
    expect(descriptionElement.textContent).toContain('A mock battle');
  });

  it('should render tags correctly when tags length is greater than 5', () => {
    const tagElements = fixture.nativeElement.querySelectorAll('app-tag');
    expect(tagElements.length).toBe(6); // 5 tags in first row + 1 date tag
  });

  it('should render tags correctly when tags length is 5 or less', () => {
    const modifiedDialogData = {
      ...mockDialogData,
      tags: mockDialogData.tags.slice(0, 5), // Only 5 tags
    };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [BattleCreationPreviewComponent, MatDialogModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: modifiedDialogData },
        { provide: MatDialogRef, useValue: { close: jest.fn() } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(BattleCreationPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const tagElements = fixture.nativeElement.querySelectorAll('app-tag');
    expect(tagElements.length).toBe(5); // All tags in one row
  });

  it('should render questions for Multiple Choice type', () => {
    const questionElements = fixture.nativeElement.querySelectorAll('.questions-container > div');
    expect(questionElements.length).toBe(mockDialogData.questions.length);

    const mcqQuestion = questionElements[0];
    expect(mcqQuestion.querySelector('.font-medium').textContent).toContain('1. What is 2+2?');
    expect(mcqQuestion.querySelector('.text-xs').textContent).toContain('30s, 10 XP');
    const options = mcqQuestion.querySelectorAll('mat-radio-button');
    expect(options.length).toBe(2);
    expect(options[0].textContent).toContain('4');
    expect(options[1].textContent).toContain('5');
  });

  it('should render questions for Short Answer type', () => {
    const questionElements = fixture.nativeElement.querySelectorAll('.questions-container > div');
    const shortAnswerQuestion = questionElements[2];
    expect(shortAnswerQuestion.querySelector('.font-medium').textContent).toContain(
      '3. What is the capital of France?',
    );
    expect(shortAnswerQuestion.querySelector('.text-xs').textContent).toContain('30s, 10 XP');
    const input = shortAnswerQuestion.querySelector('input');
    expect(input).toBeTruthy();
    expect(input.value).toBe('Paris');
  });

  it('should render questions for Fill in the Blank type', () => {
    const questionElements = fixture.nativeElement.querySelectorAll('.questions-container > div');
    const fillBlankQuestion = questionElements[3];
    expect(fillBlankQuestion.querySelector('.font-medium').textContent).toContain(
      '4. The ____ is the largest planet.',
    );
    expect(fillBlankQuestion.querySelector('.text-xs').textContent).toContain('45s, 20 XP');
    const input = fillBlankQuestion.querySelector('input');
    expect(input).toBeTruthy();
    expect(input.value).toBe('Jupiter');
  });

  it('should call close() when close button is clicked', () => {
    jest.spyOn(component, 'close');
    const closeButton = fixture.nativeElement.querySelector('button[mat-icon-button]');
    closeButton.click();
    fixture.detectChanges();
    expect(component.close).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalled();
  });
});
