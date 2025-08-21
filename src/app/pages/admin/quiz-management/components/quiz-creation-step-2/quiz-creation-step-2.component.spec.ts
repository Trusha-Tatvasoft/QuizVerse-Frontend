import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizCreationStep2Component } from './quiz-creation-step-2.component';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { quizCRUDMessages } from '../../../../../utils/constants';

describe('QuizCreationStep2Component', () => {
  let component: QuizCreationStep2Component;
  let fixture: ComponentFixture<QuizCreationStep2Component>;
  let snackbar: jest.Mocked<SnackbarService>;

  beforeEach(async () => {
    const snackbarMock = { showInfo: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [QuizCreationStep2Component],
      providers: [{ provide: SnackbarService, useValue: snackbarMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizCreationStep2Component);
    component = fixture.componentInstance;
    snackbar = TestBed.inject(SnackbarService) as jest.Mocked<SnackbarService>;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default selectedIndexStep2 as null', () => {
    expect(component.selectedIndexStep2).toBeNull();
  });

  it('should emit selectedIndexStep2Change and set CSS variable when index is 0', () => {
    // Spy on EventEmitter
    const emitSpy = jest.spyOn(component.selectedIndexStep2Change, 'emit');
    component.selectCard(0);
    expect(component.selectedIndexStep2).toBe(0);

    // Expect CSS variable set
    expect(document.documentElement.style.getPropertyValue('--selected-card-color')).toBe(
      'var(--global-secondary-color)',
    );

    // Expect event emitted
    expect(emitSpy).toHaveBeenCalledWith(0);
  });

  it('should show info snackbar when index is not 0', () => {
    component.selectCard(1);
    expect(snackbar.showInfo).toHaveBeenCalledWith(quizCRUDMessages.featureNotAvailable);
  });

  it('should show info snackbar for negative index', () => {
    component.selectCard(-1);
    expect(snackbar.showInfo).toHaveBeenCalledWith(quizCRUDMessages.featureNotAvailable);
  });
});
