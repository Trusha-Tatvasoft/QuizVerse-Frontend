import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportedQuestionsConfirmDialogComponent } from './reported-questions-confirm-dialog.component';
import { SnackbarService } from '../../../../../../shared/service/snackbar/snackbar.service';
import { ReportQuestionsService } from '../../../../../../services/admin/content-moderation/report-questions.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { platformMessages, dialogCloseCorrectly } from '../../../../../../utils/constants';
import { AffectedQuizBattleCategoryGroup } from '../../../interfaces/report-question.interface';

// Mock services
const mockSnackbar = {
  showSuccess: jest.fn(),
  showError: jest.fn(),
};

const mockReportQuestionsService = {
  UpdateReportedQuestion: jest.fn(),
  ActiveQuizBattleAffectedDTO: jest.fn(),
};

const mockDialogRef = {
  close: jest.fn(),
};

const mockDialog = {
  closeAll: jest.fn(),
};

describe('ReportedQuestionsConfirmDialogComponent (Jest)', () => {
  let fixture: ComponentFixture<ReportedQuestionsConfirmDialogComponent>;
  let component: ReportedQuestionsConfirmDialogComponent;

  const mockData = {
    questionId: 123,
    reportId: 456,
    formData: { someField: 'value' },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportedQuestionsConfirmDialogComponent],
      providers: [
        { provide: SnackbarService, useValue: mockSnackbar },
        { provide: ReportQuestionsService, useValue: mockReportQuestionsService },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MatDialog, useValue: mockDialog },
        { provide: MAT_DIALOG_DATA, useValue: mockData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportedQuestionsConfirmDialogComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadAffectedData on init', () => {
    const spy = jest.spyOn<any, any>(component, 'loadAffectedData').mockImplementation();
    component.ngOnInit();
    expect(spy).toHaveBeenCalledWith(mockData.questionId);
  });

  // it('should load affected data successfully', () => {
  //   const grouped: AffectedQuizBattleCategoryGroup[] = [
  //     { categoryName: 'Science', types: [] },
  //   ];
  //   mockReportQuestionsService.ActiveQuizBattleAffectedDTO.mockReturnValue(
  //     of({ result: true, data: [] })
  //   );
  //   const mapperSpy = jest.spyOn(require('./affected-quiz-battle.mapper'), 'mapToAffectedQuizBattleGroupedData')
  //     .mockReturnValue(grouped);

  //   (component as any).loadAffectedData(mockData.questionId);

  //   expect(mockReportQuestionsService.ActiveQuizBattleAffectedDTO).toHaveBeenCalledWith(123);
  //   expect(mapperSpy).toHaveBeenCalled();
  //   expect(component.groupedList).toEqual(grouped);
  // });

  it('should show error when loadAffectedData fails with result false', () => {
    mockReportQuestionsService.ActiveQuizBattleAffectedDTO.mockReturnValue(
      of({ result: false, message: 'Failed' }),
    );

    (component as any).loadAffectedData(mockData.questionId);

    expect(mockSnackbar.showError).toHaveBeenCalledWith(platformMessages.errorTitle, 'Failed');
  });

  it('should show error when loadAffectedData throws error', () => {
    mockReportQuestionsService.ActiveQuizBattleAffectedDTO.mockReturnValue(
      throwError(() => ({ error: { message: 'Network error' } })),
    );

    (component as any).loadAffectedData(mockData.questionId);

    expect(mockSnackbar.showError).toHaveBeenCalledWith(
      platformMessages.errorTitle,
      'Network error',
    );
  });

  it('should call updateQuestion when confirmAction is called', () => {
    const spy = jest.spyOn(component, 'updateQuestion').mockImplementation();
    component.confirmAction();
    expect(spy).toHaveBeenCalled();
  });

  it('should show success when UpdateReportedQuestion succeeds', () => {
    mockReportQuestionsService.UpdateReportedQuestion.mockReturnValue(
      of({ result: true, message: 'Updated successfully' }),
    );

    component.updateQuestion();

    expect(mockReportQuestionsService.UpdateReportedQuestion).toHaveBeenCalledWith(
      mockData.reportId,
      mockData.formData,
    );
    expect(mockSnackbar.showSuccess).toHaveBeenCalledWith(
      platformMessages.successTitle,
      'Updated successfully',
    );
    expect(mockDialogRef.close).toHaveBeenCalledWith(dialogCloseCorrectly);
  });

  it('should show error when UpdateReportedQuestion returns result false', () => {
    mockReportQuestionsService.UpdateReportedQuestion.mockReturnValue(
      of({ result: false, message: 'Validation failed' }),
    );

    component.updateQuestion();

    expect(mockSnackbar.showError).toHaveBeenCalledWith(
      platformMessages.errorTitle,
      'Validation failed',
    );
  });

  it('should show error and close dialog when UpdateReportedQuestion throws', () => {
    mockReportQuestionsService.UpdateReportedQuestion.mockReturnValue(
      throwError(() => ({ error: { message: 'Server down' } })),
    );

    component.updateQuestion();

    expect(mockSnackbar.showError).toHaveBeenCalledWith(platformMessages.errorTitle, 'Server down');
    expect(mockDialogRef.close).toHaveBeenCalledWith(dialogCloseCorrectly);
  });

  it('should close dialog when closeDialog is called', () => {
    component.closeDialog();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should handle missing updateData or reportId gracefully', () => {
    (component as any).dialog = mockDialog as any;

    component.data.reportId = null as any;
    component.data.formData = null as any;

    component.updateQuestion();

    expect(mockSnackbar.showError).toHaveBeenCalledWith(
      platformMessages.errorTitle,
      platformMessages.errorMessage,
    );
    expect(mockDialog.closeAll).toHaveBeenCalled();
  });
});
