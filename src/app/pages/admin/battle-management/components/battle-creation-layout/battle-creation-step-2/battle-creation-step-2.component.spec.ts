import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BattleCreationStep2Component } from './battle-creation-step-2.component';
import { OutlineButtonComponent } from '../../../../../../shared/components/outline-button/outline-button.component';
import { FilledButtonComponent } from '../../../../../../shared/components/filled-button/filled-button.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SnackbarService } from '../../../../../../shared/service/snackbar/snackbar.service';
import {
  questionCreationMethodsOptions,
  selectQuestionMethodSecondaryButtonConfig,
} from '../../../../quiz-management/configs/quiz-creation.config';
import { quizCRUDMessages } from '../../../../../../utils/constants';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

describe('BattleCreationStep2Component', () => {
  let component: BattleCreationStep2Component;
  let fixture: ComponentFixture<BattleCreationStep2Component>;
  let snackbarService: jest.Mocked<SnackbarService>;

  beforeEach(async () => {
    const snackbarServiceMock = {
      showInfo: jest.fn().mockReturnValue(of(void 0)),
    };

    await TestBed.configureTestingModule({
      imports: [
        BattleCreationStep2Component,
        OutlineButtonComponent,
        FilledButtonComponent,
        CommonModule,
        MatIconModule,
      ],
      providers: [{ provide: SnackbarService, useValue: snackbarServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(BattleCreationStep2Component);
    component = fixture.componentInstance;
    snackbarService = TestBed.inject(SnackbarService) as jest.Mocked<SnackbarService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default selectedIndexStep2 as null', () => {
    expect(component.selectedIndexStep2).toBeNull();
  });

  it('should set selectedIndexStep2 and emit event when selectCard is called with index 0', () => {
    const emitSpy = jest.spyOn(component.selectedIndexStep2Change, 'emit');
    const root = document.documentElement;
    const initialColor = root.style.getPropertyValue('--selected-card-color');

    component.selectCard(0);

    expect(component.selectedIndexStep2).toBe(0);
    expect(emitSpy).toHaveBeenCalledWith(0);
    expect(root.style.getPropertyValue('--selected-card-color')).toBe(
      'var(--global-secondary-color)',
    );
    expect(initialColor).not.toBe('var(--global-secondary-color)');
    emitSpy.mockRestore();
  });

  it('should show info snackbar and not change selectedIndexStep2 when selectCard is called with index other than 0', () => {
    const initialIndex = component.selectedIndexStep2;
    component.selectCard(1);

    expect(component.selectedIndexStep2).toBe(initialIndex);
    expect(snackbarService.showInfo).toHaveBeenCalledWith(quizCRUDMessages.featureNotAvailable);
  });

  it('should render the correct number of cards based on questionCreationMethodsOptionsStep2', () => {
    const cardElements = fixture.nativeElement.querySelectorAll('.grid > div');
    expect(cardElements.length).toBe(questionCreationMethodsOptions.length);
  });

  it('should apply selected-card class to the card when selectedIndexStep2 matches index', () => {
    component.selectedIndexStep2 = 0;
    fixture.detectChanges();

    const selectedCard = fixture.nativeElement.querySelector('.selected-card');
    expect(selectedCard).toBeTruthy();
    expect(selectedCard.querySelector('app-filled-button')).toBeTruthy();
  });

  it('should render outline button when card is not selected', () => {
    component.selectedIndexStep2 = null;
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('.grid > div');
    cards.forEach((card: HTMLElement) => {
      const outlineButton = card.querySelector('app-outline-button');
      expect(outlineButton).toBeTruthy();
      expect(card.querySelector('app-filled-button')).toBeNull();
    });
  });

  it('should render filled button with correct config when card is selected', () => {
    component.selectedIndexStep2 = 0;
    fixture.detectChanges();

    const filledButton = fixture.debugElement.query(By.directive(FilledButtonComponent));
    expect(filledButton).toBeTruthy();
    // Assuming the button config is passed correctly based on index 0
    expect(filledButton.componentInstance.filledButtonConfig).toEqual(
      selectQuestionMethodSecondaryButtonConfig,
    );
  });

  it('should render icons and titles correctly for each card', () => {
    fixture.detectChanges();
    const cards = fixture.nativeElement.querySelectorAll('.grid > div');

    questionCreationMethodsOptions.forEach((option, index) => {
      const card = cards[index];
      expect(card.querySelector('mat-icon').textContent).toContain(option.icon);
      expect(card.querySelector('h3').textContent).toContain(option.title);
      expect(card.querySelector('p').textContent).toContain(option.description);
    });
  });

  it('should render second icon for the last card', () => {
    fixture.detectChanges();
    const lastCard =
      fixture.nativeElement.querySelectorAll('.grid > div')[
        questionCreationMethodsOptions.length - 1
      ];
    const secondIcon = lastCard.querySelectorAll('mat-icon')[1];
    expect(secondIcon).toBeTruthy();
    expect(secondIcon.textContent).toContain(
      questionCreationMethodsOptions[questionCreationMethodsOptions.length - 1].secondIcon,
    );
  });

  it('should trigger selectCard on card click', () => {
    const selectCardSpy = jest.spyOn(component, 'selectCard');
    const card = fixture.debugElement.queryAll(By.css('.grid > div'))[0].nativeElement;
    card.click();
    fixture.detectChanges();

    expect(selectCardSpy).toHaveBeenCalledWith(0);
    selectCardSpy.mockRestore();
  });
});
