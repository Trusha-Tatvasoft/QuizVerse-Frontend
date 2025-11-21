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

  describe('selectCard', () => {
    it('should set selectedIndexStep2 to 0 and emit event when index is 0', () => {
      const emitSpy = jest.spyOn(component.selectedIndexStep2Change, 'emit');

      component.selectCard(0);

      expect(component.selectedIndexStep2).toBe(0);
      expect(document.documentElement.style.getPropertyValue('--selected-card-color')).toBe(
        'var(--global-secondary-color)',
      );
      expect(emitSpy).toHaveBeenCalledWith(0);
      expect(snackbar.showInfo).not.toHaveBeenCalled();
    });

    it('should set selectedIndexStep2 to 1 and emit event when index is 1', () => {
      const emitSpy = jest.spyOn(component.selectedIndexStep2Change, 'emit');

      component.selectCard(1);

      expect(component.selectedIndexStep2).toBe(1);
      expect(document.documentElement.style.getPropertyValue('--selected-card-color')).toBe(
        'var(--global-primary-color)',
      );
      expect(emitSpy).toHaveBeenCalledWith(1);
      expect(snackbar.showInfo).not.toHaveBeenCalled();
    });

    it('should show info snackbar when index is not 0 or 1', () => {
      component.selectCard(2);
      expect(snackbar.showInfo).toHaveBeenCalledWith(quizCRUDMessages.featureNotAvailable);
      expect(component.selectedIndexStep2).toBeNull(); // Should not change
    });

    it('should show info snackbar for negative index', () => {
      component.selectCard(-1);
      expect(snackbar.showInfo).toHaveBeenCalledWith(quizCRUDMessages.featureNotAvailable);
      expect(component.selectedIndexStep2).toBeNull(); // Should not change
    });

    it('should show info snackbar for decimal index', () => {
      component.selectCard(1.5);
      expect(snackbar.showInfo).toHaveBeenCalledWith(quizCRUDMessages.featureNotAvailable);
      expect(component.selectedIndexStep2).toBeNull(); // Should not change
    });
  });

  describe('Input and Output', () => {
    it('should accept selectedIndexStep2 input', () => {
      component.selectedIndexStep2 = 1;
      fixture.detectChanges();
      expect(component.selectedIndexStep2).toBe(1);
    });

    it('should emit selectedIndexStep2Change when valid index is selected', () => {
      const emitSpy = jest.spyOn(component.selectedIndexStep2Change, 'emit');

      component.selectCard(0);

      expect(emitSpy).toHaveBeenCalledWith(0);
    });
  });
});
