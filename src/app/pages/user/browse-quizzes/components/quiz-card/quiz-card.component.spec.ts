import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizCardComponent } from './quiz-card.component';
import { QuizListComponent } from '../quiz-list/quiz-list.component';
import { TagInputConfig } from '../../../../../shared/interfaces/tag-component.interface';
import { ButtonConfig } from '../../../../../shared/interfaces/button-config.interface';
import { Router } from '@angular/router';
import { Navigations } from '../../../../../shared/enums/navigation';

class MockQuizListComponent {
  cardStyle = jest.fn().mockReturnValue('featured');
}

const mockTags: TagInputConfig[] = [
  {
    id: '1',
    label: 'Math',
    type: 'static',
    isSelected: false,
    hasBorder: true,
    backgroundColor: 'lightWhite',
    textColor: 'black',
  },
  {
    id: '2',
    label: 'Science',
    type: 'static',
    isSelected: false,
    hasBorder: true,
    backgroundColor: 'lightWhite',
    textColor: 'black',
  },
  {
    id: '3',
    label: 'GK',
    type: 'static',
    isSelected: false,
    hasBorder: true,
    backgroundColor: 'lightWhite',
    textColor: 'black',
  },
  {
    id: '4',
    label: 'Extra',
    type: 'static',
    isSelected: false,
    hasBorder: true,
    backgroundColor: 'lightWhite',
    textColor: 'black',
  },
];

const mockButtonConfig: ButtonConfig = {
  label: 'Play Free',
  matIcon: 'play_arrow',
  iconFontSet: 'material-icons-outlined',
  variant: 'secondary',
  fontWeight: 600,
};

describe('QuizCardComponent', () => {
  let component: QuizCardComponent;
  let fixture: ComponentFixture<QuizCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizCardComponent],
      providers: [{ provide: QuizListComponent, useClass: MockQuizListComponent }],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizCardComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should expose full tags if <= 3', () => {
    component.cardConfig = {
      id: 1,
      title: 'Quiz 1',
      description: 'Desc',
      category: mockTags[0],
      difficulty: mockTags[1],
      duration: '20m',
      questions: 10,
      participants: 100,
      rating: 4.5,
      isFeatured: true,
      isPaid: false,
      isAttempted: false,
      buttonConfig: mockButtonConfig,
      tags: mockTags.slice(0, 2),
    };

    fixture.detectChanges();

    expect(component.displayTags().length).toBe(2);
    expect(component.displayTags().some((t) => t.label.includes('+'))).toBe(false);
  });

  it('should add "+N more" tag if > 3 tags', () => {
    component.cardConfig = {
      id: 2,
      title: 'Quiz 2',
      description: 'Desc',
      category: mockTags[0],
      difficulty: mockTags[1],
      duration: '20m',
      questions: 10,
      participants: 100,
      rating: 4.5,
      isFeatured: true,
      isPaid: false,
      isAttempted: false,
      buttonConfig: mockButtonConfig,
      tags: mockTags,
    };

    fixture.detectChanges();

    const displayTags = component.displayTags();
    expect(displayTags.length).toBe(4);
    expect(displayTags[3].label).toBe('+1 more');
  });

  it('should get cardStyle from parent', () => {
    expect(component.cardStyle()).toBe('featured');
  });

  it('should navigate to quiz result if quiz is attempted', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.cardConfig = {
      id: 10,
      title: 'Attempted Quiz',
      description: 'Desc',
      category: mockTags[0],
      difficulty: mockTags[1],
      duration: '20m',
      questions: 10,
      participants: 100,
      rating: 4.5,
      isFeatured: false,
      isPaid: true,
      isAttempted: true,
      buttonConfig: mockButtonConfig,
      tags: [],
    };

    component.quizBtnClick();

    expect(navigateSpy).toHaveBeenCalledWith([Navigations.QuizList, Navigations.Quizzes]);
  });

  it('should navigate to quiz instruction if quiz is not attempted', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = jest.spyOn(router, 'navigate');

    const quizId = 20;
    const encodedId = btoa(quizId.toString());

    component.cardConfig = {
      id: quizId,
      title: 'New Quiz',
      description: 'Desc',
      category: mockTags[0],
      difficulty: mockTags[1],
      duration: '20m',
      questions: 10,
      participants: 100,
      rating: 4.5,
      isFeatured: false,
      isPaid: false,
      isAttempted: false,
      buttonConfig: mockButtonConfig,
      tags: [],
    };

    component.quizBtnClick();

    expect(navigateSpy).toHaveBeenCalledWith([
      Navigations.User,
      Navigations.QuizList,
      Navigations.BrowseQuizzes,
      Navigations.QuizInstruction,
      encodedId,
    ]);
  });
});
