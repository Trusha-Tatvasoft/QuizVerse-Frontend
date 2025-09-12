import { TestBed, ComponentFixture } from '@angular/core/testing';
import { QuestionDifficultyComponent } from './question-difficulty.component';
import { QuestionDifficultyService } from '../../../services/admin/question-difficulty/question-difficulty.service';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { QuestionDifficultyResponseDTO } from './interfaces/question-difficulty.interface';
import { AddEditQuestionDifficultyComponent } from './Components/add-edit-question-difficulty/add-edit-question-difficulty.component';
import { ConfirmationDialogData } from '../../../shared/interfaces/confirmation-dialog.interface';

describe('QuestionDifficultyComponent (Jest)', () => {
  let fixture: ComponentFixture<QuestionDifficultyComponent>;
  let component: QuestionDifficultyComponent;

  let mockService: jest.Mocked<QuestionDifficultyService>;
  let mockSnackbar: jest.Mocked<SnackbarService>;
  let mockDialog: jest.Mocked<MatDialog>;

  const mockDifficulties: QuestionDifficultyResponseDTO[] = [
    { id: 1, name: 'Easy', description: 'Desc1', xpGained: 10, totalQuestions: 5 },
    { id: 2, name: 'Hard', description: 'Desc2', xpGained: 50, totalQuestions: 15 },
  ];

  beforeEach(async () => {
    mockService = {
      getAllQuestionDifficulties: jest
        .fn()
        .mockReturnValue(of({ result: true, statusCode: 200, message: 'ok', data: [] })),
      deleteQuestionDifficulty: jest
        .fn()
        .mockReturnValue(of({ result: true, statusCode: 200, message: 'ok', data: null })),
    } as any;

    mockSnackbar = {
      showSuccess: jest.fn(),
      showError: jest.fn(),
    } as any;

    mockDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: () => of(true),
      }),
    } as any;

    await TestBed.configureTestingModule({
      imports: [QuestionDifficultyComponent],
      providers: [
        { provide: QuestionDifficultyService, useValue: mockService },
        { provide: SnackbarService, useValue: mockSnackbar },
        { provide: MatDialog, useValue: mockDialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionDifficultyComponent);
    component = fixture.componentInstance;
  });

  it('opens AddEdit dialog for add and reloads after success', () => {
    const afterClosed$ = of('Added successfully');
    (mockDialog.open as jest.Mock).mockReturnValue({ afterClosed: () => afterClosed$ } as any);
    const loadSpy = jest.spyOn<any, any>(component, 'loadQuestionDifficulties');

    component.openAddEditDifficultyDialog();
    expect(mockDialog.open).toHaveBeenCalledWith(
      AddEditQuestionDifficultyComponent,
      expect.any(Object),
    );
    expect(mockSnackbar.showSuccess).toHaveBeenCalledWith('Success', 'Added successfully');
    expect(loadSpy).toHaveBeenCalled();
  });

  it('opens AddEdit dialog for edit', () => {
    const afterClosed$ = of(null);
    (mockDialog.open as jest.Mock).mockReturnValue({ afterClosed: () => afterClosed$ } as any);

    component.openAddEditDifficultyDialog(mockDifficulties[0]);
    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('handles edit action', () => {
    const dialogSpy = jest.spyOn(component, 'openAddEditDifficultyDialog');
    component['questionDifficulties'] = mockDifficulties;

    component.handleAction({ action: 'edit', row: { id: 2 } as any });
    expect(dialogSpy).toHaveBeenCalledWith(mockDifficulties[1]);
  });

  it('loads question difficulties successfully', () => {
    mockService.getAllQuestionDifficulties.mockReturnValue(
      of({
        result: true,
        statusCode: 200,
        message: 'Fetched successfully',
        data: mockDifficulties,
      }),
    );

    (component as any).loadQuestionDifficulties();

    expect(component['questionDifficulties']).toEqual(mockDifficulties);
    expect(component.tableDataSource()).toEqual(expect.any(Array));
  });

  it('handles failure response when loading', () => {
    mockService.getAllQuestionDifficulties.mockReturnValue(
      of({ result: false, statusCode: 400, message: 'fail', data: [] }),
    );

    (component as any).loadQuestionDifficulties();
    expect(mockSnackbar.showError).toHaveBeenCalled();
    expect(component['questionDifficulties']).toEqual([]);
  });

  it('handles error when loading', () => {
    mockService.getAllQuestionDifficulties.mockReturnValue(
      throwError(() => ({ status: 500, error: { message: 'boom' } })),
    );

    (component as any).loadQuestionDifficulties();
    expect(mockSnackbar.showError).toHaveBeenCalled();
    expect(component['questionDifficulties']).toEqual([]);
  });

  it('cleans up subscriptions on destroy', () => {
    const nextSpy = jest.spyOn(component['destroy$'], 'next');
    const completeSpy = jest.spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();
    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should load difficulties successfully', () => {
    mockService.getAllQuestionDifficulties.mockReturnValue(
      of({ result: true, statusCode: 200, message: 'ok', data: mockDifficulties }),
    );

    (component as any).loadQuestionDifficulties();

    expect((component as any).questionDifficulties).toEqual(mockDifficulties);
    expect(mockSnackbar.showError).not.toHaveBeenCalled();
  });

  it('should show default error message when API returns failure without message', () => {
    mockService.getAllQuestionDifficulties.mockReturnValue(
      of({ result: false, statusCode: 400, message: '', data: [] }),
    );

    (component as any).loadQuestionDifficulties();

    expect(mockSnackbar.showError).toHaveBeenCalledWith(`Error! 400`, 'Something went wrong.');
    expect((component as any).questionDifficulties).toEqual([]);
  });

  it('should show backend error message when API returns failure with message', () => {
    mockService.getAllQuestionDifficulties.mockReturnValue(
      of({ result: false, statusCode: 400, message: 'failed', data: [] }),
    );

    (component as any).loadQuestionDifficulties();

    expect(mockSnackbar.showError).toHaveBeenCalledWith(`Error! 400`, 'failed');
    expect((component as any).questionDifficulties).toEqual([]);
  });

  it('should show default error message when API throws error without message', () => {
    mockService.getAllQuestionDifficulties.mockReturnValue(
      throwError(() => ({ status: 500, error: {} })),
    );

    (component as any).loadQuestionDifficulties();

    expect(mockSnackbar.showError).toHaveBeenCalledWith(`Error! 500`, 'Something went wrong.');
    expect((component as any).questionDifficulties).toEqual([]);
  });

  it('should show backend error message when API throws error with message', () => {
    mockService.getAllQuestionDifficulties.mockReturnValue(
      throwError(() => ({ status: 500, error: { message: 'server failed' } })),
    );

    (component as any).loadQuestionDifficulties();

    expect(mockSnackbar.showError).toHaveBeenCalledWith(`Error! 500`, 'server failed');
    expect((component as any).questionDifficulties).toEqual([]);
  });

  it('should call loadQuestionDifficulties on init', () => {
    const loadSpy = jest.spyOn<any, any>(component, 'loadQuestionDifficulties');

    component.ngOnInit();

    expect(loadSpy).toHaveBeenCalled();
  });
});
