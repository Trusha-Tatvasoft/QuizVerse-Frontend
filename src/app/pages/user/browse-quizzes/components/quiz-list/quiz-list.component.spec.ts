import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizListComponent } from './quiz-list.component';
import { QuizCardComponent } from '../quiz-card/quiz-card.component';
import { BrowseQuizzesComponent } from '../../browse-quizzes.component';
import { signal } from '@angular/core';
import { QuizCardConfig } from '../../interfaces/browsr-quiz-request.interface';

describe('QuizListComponent', () => {
  let component: QuizListComponent;
  let fixture: ComponentFixture<QuizListComponent>;

  const mockQuizzes: QuizCardConfig[] = [
    {
      id: 1,
      title: 'Quiz 1',
      description: 'Test quiz 1',
      category: {
        id: '1',
        label: 'Math',
        type: 'static',
        isSelected: false,
        hasBorder: true,
        backgroundColor: 'lightYellow',
        textColor: 'yellow',
      },
      difficulty: {
        id: 'easy',
        label: 'Easy',
        type: 'static',
        isSelected: false,
        hasBorder: true,
        backgroundColor: 'lightWhite',
        textColor: 'black',
      },
      duration: '10m',
      questions: 5,
      participants: 20,
      rating: 4.5,
      isFeatured: false,
      isPaid: false,
      isAttempted: false,
      buttonConfig: {
        label: 'Play Free',
        matIcon: 'play_arrow',
        iconFontSet: 'material-icons-outlined',
        variant: 'secondary',
        fontWeight: 600,
      },
    },
  ];

  class MockBrowseQuizzesComponent {
    quizzes = mockQuizzes;
    currentTabId = signal('free');
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizListComponent, QuizCardComponent],
      providers: [{ provide: BrowseQuizzesComponent, useClass: MockBrowseQuizzesComponent }],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should return quizzes from the parent component', () => {
    expect(component.quizzes).toEqual(mockQuizzes);
  });

  it('should compute the correct tabId from parent signal', () => {
    expect(component.tabId()).toBe('free');
  });

  it('should compute the correct card style for non-featured tab', () => {
    expect(component.cardStyle()).toBe('normal');
  });

  it('should compute "featured" card style when tabId is "featured"', () => {
    const parent = TestBed.inject(BrowseQuizzesComponent) as MockBrowseQuizzesComponent;
    parent.currentTabId.set('featured');
    fixture.detectChanges();
    expect(component.cardStyle()).toBe('featured');
  });
});
