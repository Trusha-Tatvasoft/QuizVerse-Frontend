import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizDifficultyLevelComponent } from './quiz-difficulty-level.component';
import { QuizDifficultyLevelService } from '../../../services/admin/quiz-difficulty-level/quiz-difficulty-level.service';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { AddDifficultyLevelComponent } from './components/add-difficulty-level/add-difficulty-level.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { platformMessages } from '../../../utils/constants';

describe('QuizDifficultyLevelComponent (Jest)', () => {
  let component: QuizDifficultyLevelComponent;
  let fixture: ComponentFixture<QuizDifficultyLevelComponent>;
  let difficultyService: jest.Mocked<QuizDifficultyLevelService>;
  let snackbar: jest.Mocked<SnackbarService>;
  let dialog: jest.Mocked<MatDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizDifficultyLevelComponent],
      providers: [
        {
          provide: QuizDifficultyLevelService,
          useValue: {
            getAllQuizDifficulties: jest.fn(),
          },
        },
        {
          provide: SnackbarService,
          useValue: {
            showError: jest.fn(),
            showSuccess: jest.fn(),
          },
        },
        {
          provide: MatDialog,
          useValue: {
            open: jest.fn(),
          },
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizDifficultyLevelComponent);
    component = fixture.componentInstance;
    difficultyService = TestBed.inject(
      QuizDifficultyLevelService,
    ) as jest.Mocked<QuizDifficultyLevelService>;
    snackbar = TestBed.inject(SnackbarService) as jest.Mocked<SnackbarService>;
    dialog = TestBed.inject(MatDialog) as jest.Mocked<MatDialog>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle failure response from service', () => {
    const mockData = {
      result: false,
      statusCode: 400,
      message: 'Error',
      data: [],
    };

    difficultyService.getAllQuizDifficulties.mockReturnValue(of(mockData));

    component.fetchDifficultyLevels();

    expect(snackbar.showError).toHaveBeenCalledWith('Error! 400', 'Error');
    expect(component.dataSource()).toEqual([]);
  });

  it('should handle thrown error during fetch', () => {
    const error = {
      statusCode: 500,
      error: { message: 'Server error' },
    };

    difficultyService.getAllQuizDifficulties.mockReturnValue(throwError(() => error));

    component.fetchDifficultyLevels();

    expect(snackbar.showError).toHaveBeenCalledWith('Error! 500', 'Server error');
    expect(component.dataSource()).toEqual([]);
  });

  it('should open dialog and handle positive result', () => {
    const afterClosed$ = of('Level Added');
    const mockDialogRef = { afterClosed: () => afterClosed$ } as any;
    (dialog.open as jest.Mock).mockReturnValue(mockDialogRef);
    const fetchSpy = jest.spyOn(component, 'fetchDifficultyLevels');

    component.openAddDifficultyDialgue();

    expect(dialog.open).toHaveBeenCalledWith(AddDifficultyLevelComponent, expect.any(Object));
    expect(snackbar.showSuccess).toHaveBeenCalledWith('Success', 'Level Added');
    expect(fetchSpy).toHaveBeenCalled();
  });

  it('should open dialog and handle null result', () => {
    const afterClosed$ = of(null);
    const mockDialogRef = { afterClosed: () => afterClosed$ } as any;
    (dialog.open as jest.Mock).mockReturnValue(mockDialogRef);
    const fetchSpy = jest.spyOn(component, 'fetchDifficultyLevels');

    component.openAddDifficultyDialgue();

    expect(dialog.open).toHaveBeenCalled();
    expect(snackbar.showSuccess).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('should clean up on destroy', () => {
    const nextSpy = jest.spyOn(component['destroy$'], 'next');
    const completeSpy = jest.spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should call fetchDifficultyLevels on init', () => {
    const fetchSpy = jest.spyOn(component, 'fetchDifficultyLevels').mockImplementation(() => {});
    component.ngOnInit();
    expect(fetchSpy).toHaveBeenCalled();
  });

  it('should set dataSource with data on successful fetch', () => {
    const mockData = {
      result: true,
      statusCode: 200,
      message: 'Success',
      data: [{ id: 1, name: 'Easy', description: 'An easy difficulty level' }],
    };

    difficultyService.getAllQuizDifficulties.mockReturnValue(of(mockData));

    component.fetchDifficultyLevels();

    expect(component.dataSource()).toEqual(mockData.data);
    expect(snackbar.showError).not.toHaveBeenCalled();
  });

  it('should use platformMessages.errorMessage when res.message is missing', () => {
    const mockData = {
      result: false,
      statusCode: 404,
      message: '',
      data: [],
    };

    difficultyService.getAllQuizDifficulties.mockReturnValue(of(mockData));

    component.fetchDifficultyLevels();

    expect(snackbar.showError).toHaveBeenCalledWith('Error! 404', platformMessages.errorMessage);
    expect(component.dataSource()).toEqual([]);
  });

  it('should use platformMessages.errorMessage when error.error.message is missing', () => {
    const error = {
      statusCode: 500,
      error: {},
    };

    difficultyService.getAllQuizDifficulties.mockReturnValue(throwError(() => error));

    component.fetchDifficultyLevels();

    expect(snackbar.showError).toHaveBeenCalledWith('Error! 500', platformMessages.errorMessage);
    expect(component.dataSource()).toEqual([]);
  });
});
