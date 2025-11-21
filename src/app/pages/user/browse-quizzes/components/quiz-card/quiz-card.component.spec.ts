import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizCardComponent } from './quiz-card.component';
import { QuizListComponent } from '../quiz-list/quiz-list.component';
import { BrowseQuizzesComponent } from '../../browse-quizzes.component';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of, Subject } from 'rxjs';
import { TagInputConfig } from '../../../../../shared/interfaces/tag-component.interface';
import { ButtonConfig } from '../../../../../shared/interfaces/button-config.interface';
import { Navigations } from '../../../../../shared/enums/navigation';
import { ReportQuizDialogComponent } from '../report-quiz-dialog/report-quiz-dialog.component';

class MockQuizListComponent {
  cardStyle = jest.fn().mockReturnValue('featured');
}

class MockBrowseQuizzesComponent {
  batchNumber = 0;
  fetchQuizzesList = jest.fn();
}

class MockDialogRef {
  componentInstance = {
    reportSubmitted: new Subject<boolean>(),
  };
  close = jest.fn();
}

class MockMatDialog {
  open = jest.fn().mockReturnValue(new MockDialogRef());
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
  let router: Router;
  let dialog: MatDialog;
  let browseQuizzesComponent: MockBrowseQuizzesComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizCardComponent],
      providers: [
        { provide: QuizListComponent, useClass: MockQuizListComponent },
        { provide: BrowseQuizzesComponent, useClass: MockBrowseQuizzesComponent },
        { provide: MatDialog, useClass: MockMatDialog },
        {
          provide: Router,
          useValue: {
            navigate: jest.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizCardComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    dialog = TestBed.inject(MatDialog);
    browseQuizzesComponent = TestBed.inject(BrowseQuizzesComponent) as any;
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
    const tags = component.displayTags();

    expect(tags.length).toBe(2);
    expect(tags.some((t) => t.label.includes('+'))).toBe(false);
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
    expect(navigateSpy).toHaveBeenCalledWith([
      Navigations.User,
      Navigations.QuizList,
      Navigations.BrowseQuizzes,
      Navigations.QuizResult,
      'MTA=',
    ]);
  });

  it('should navigate to quiz instruction if quiz is not attempted', () => {
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

  describe('setReportButtonConfig', () => {
    beforeEach(() => {
      component.cardConfig = {
        id: 5,
        title: 'Report Test',
        description: 'Desc',
        category: mockTags[0],
        difficulty: mockTags[1],
        duration: '20m',
        questions: 10,
        participants: 100,
        rating: 4.5,
        isFeatured: true,
        isPaid: false,
        isAttempted: true,
        buttonConfig: mockButtonConfig,
        tags: [],
        report: { reportId: 1, reportReason: 'Spam', isEditable: false },
      };
    });

    it('should disable button if attempted and report not editable', () => {
      (component as any).setReportButtonConfig();
      expect(component.reportQuizBtn.isDisabled).toBe(true);
      expect(component.btnDisable()).toBe(true);
    });

    it('should enable button if attempted and report is editable', () => {
      component.cardConfig.report = { reportId: 1, reportReason: 'Spam', isEditable: true };
      (component as any).setReportButtonConfig();
      expect(component.reportQuizBtn.isDisabled).toBe(false);
      expect(component.btnDisable()).toBe(true);
    });

    it('should not disable if not attempted', () => {
      component.cardConfig.isAttempted = false;
      (component as any).setReportButtonConfig();
      expect(component.reportQuizBtn.isDisabled).toBeUndefined();
      expect(component.btnDisable()).toBe(false);
    });

    it('should not disable if no report exists', () => {
      component.cardConfig.report = undefined;
      (component as any).setReportButtonConfig();
      expect(component.reportQuizBtn.isDisabled).toBeUndefined();
      expect(component.btnDisable()).toBe(false);
    });
  });

  describe('openReportDialog', () => {
    it('should open dialog with correct data and handle report submission', () => {
      const dialogSpy = jest.spyOn(dialog, 'open');
      const dialogRef = new MockDialogRef();
      dialogSpy.mockReturnValue(dialogRef as any);

      component.cardConfig = {
        id: 11,
        title: 'Dialog Quiz',
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
        report: { reportId: 2, reportReason: 'Offensive content', isEditable: true },
      };

      component.openReportDialog();

      expect(dialogSpy).toHaveBeenCalledWith(
        ReportQuizDialogComponent,
        expect.objectContaining({
          minWidth: '30vw',
          maxWidth: '100vw',
          data: expect.objectContaining({
            quizId: 11,
            quizTitle: 'Dialog Quiz',
            reason: 'Offensive content',
            reportId: 2,
            isEditMode: true,
          }),
        }),
      );

      // simulate event emission
      dialogRef.componentInstance.reportSubmitted.next(true);

      expect(browseQuizzesComponent.batchNumber).toBe(1);
      expect(browseQuizzesComponent.fetchQuizzesList).toHaveBeenCalledWith(true);
    });

    it('should open dialog with empty report data when no report exists', () => {
      const dialogSpy = jest.spyOn(dialog, 'open');
      const dialogRef = new MockDialogRef();
      dialogSpy.mockReturnValue(dialogRef as any);

      component.cardConfig = {
        id: 12,
        title: 'No Report Quiz',
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

      component.openReportDialog();

      expect(dialogSpy).toHaveBeenCalledWith(
        ReportQuizDialogComponent,
        expect.objectContaining({
          data: expect.objectContaining({
            quizId: 12,
            quizTitle: 'No Report Quiz',
            reason: '',
            reportId: 0,
            isEditMode: false,
          }),
        }),
      );
    });

    it('should not refresh quiz list if report is not submitted', () => {
      const dialogSpy = jest.spyOn(dialog, 'open');
      const dialogRef = new MockDialogRef();
      dialogSpy.mockReturnValue(dialogRef as any);

      component.cardConfig = {
        id: 13,
        title: 'Cancel Quiz',
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

      component.openReportDialog();

      // simulate cancellation
      dialogRef.componentInstance.reportSubmitted.next(false);

      expect(browseQuizzesComponent.batchNumber).toBe(0);
      expect(browseQuizzesComponent.fetchQuizzesList).not.toHaveBeenCalled();
    });
  });
});
