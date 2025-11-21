import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { of, throwError, Subject } from 'rxjs';
import { FlaggedCommentsComponent } from './flagged-comments.component';
import { FlaggedCommentsService } from '../../../../../services/admin/content-moderation/flagged-comments.service';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { AuthService } from '../../../../../core/auth/services/auth.service';
import { ConfirmationDialogComponent } from '../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { FlaggedCommentsPreviewDialogComponent } from './flagged-comments-preview-dialog/flagged-comments-preview-dialog.component';
import { FlaggedCommentsTableComponent } from './flagged-comments-table/flagged-comments-table.component';
import { TableData } from '../../../../../shared/interfaces/table-component.interface';
import { PaginationRequest } from '../../../../../shared/interfaces/pagination-request.interface';
import {
  flaggedCommentsAction,
  platformMessages,
  tablePaginationConfig,
} from '../../../../../utils/constants';
import {
  FlaggedComments,
  UpdateFlaggedCommentStatusRequest,
} from '../../interfaces/flagged-comments.interface';
import { QuizRatingStatus } from '../../../../../shared/enums/content-moderation.enum';

// Mock services
const mockFlaggedCommentsService = {
  getFlaggedCommentsList: jest.fn(),
  updateAction: jest.fn(),
  flaggedCommentUpdated$: new Subject<boolean>(),
};

const mockSnackbarService = {
  showSuccess: jest.fn(),
  showError: jest.fn(),
};

const mockMatDialog = {
  open: jest.fn(),
};

describe('FlaggedCommentsComponent', () => {
  let component: FlaggedCommentsComponent;
  let fixture: ComponentFixture<FlaggedCommentsComponent>;
  let flaggedCommentsService: jest.Mocked<FlaggedCommentsService>;
  let snackbarService: jest.Mocked<SnackbarService>;
  let dialog: jest.Mocked<MatDialog>;

  const mockFlaggedComments: FlaggedComments[] = [
    {
      id: 1,
      comment: 'Test comment 1',
      status: QuizRatingStatus.Pending,
      date: new Date(),
      author: 'User1',
      quizName: 'Quiz1',
      reason: 'Inappropriate content',
      modifiedBy: 1,
    },
    {
      id: 2,
      comment: 'Test comment 2',
      status: QuizRatingStatus.Pending,
      date: new Date(),
      author: 'User2',
      quizName: 'Quiz2',
      reason: 'Inappropriate content',
      modifiedBy: 1,
    },
  ];

  const mockTableData: TableData[] = [
    { id: 1, comment: 'Test comment 1', status: 'Pending' },
    { id: 2, comment: 'Test comment 2', status: 'Pending' },
  ];

  const mockApiResponse = {
    result: true,
    statusCode: 200,
    message: 'Success',
    data: {
      records: mockFlaggedComments,
      totalRecords: 2,
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlaggedCommentsComponent, MatDialogModule, MatSelectModule],
      providers: [
        { provide: FlaggedCommentsService, useValue: mockFlaggedCommentsService },
        { provide: SnackbarService, useValue: mockSnackbarService },
        { provide: MatDialog, useValue: mockMatDialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FlaggedCommentsComponent);
    component = fixture.componentInstance;

    flaggedCommentsService = TestBed.inject(
      FlaggedCommentsService,
    ) as jest.Mocked<FlaggedCommentsService>;
    snackbarService = TestBed.inject(SnackbarService) as jest.Mocked<SnackbarService>;
    dialog = TestBed.inject(MatDialog) as jest.Mocked<MatDialog>;

    // Reset all mocks
    jest.clearAllMocks();
    mockFlaggedCommentsService.flaggedCommentUpdated$ = new Subject<boolean>();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.dataSource()).toEqual([]);
      expect(component.totalItems()).toBe(0);
      expect(component.pagination()).toEqual({
        pageNumber: 1,
        pageSize: tablePaginationConfig.PageSize,
      });
      expect(component.sort()).toEqual({
        sortColumn: '',
        sortDescending: false,
      });
    });

    it('should call getFlaggedCommentsData on init', () => {
      const getDataSpy = jest.spyOn(component as any, 'getFlaggedCommmentsData');
      flaggedCommentsService.getFlaggedCommentsList.mockReturnValue(of(mockApiResponse));

      component.ngOnInit();

      expect(getDataSpy).toHaveBeenCalled();
    });

    it('should subscribe to flaggedCommentUpdated$ and refresh data when updated', () => {
      const getDataSpy = jest.spyOn(component as any, 'getFlaggedCommmentsData');
      flaggedCommentsService.getFlaggedCommentsList.mockReturnValue(of(mockApiResponse));

      component.ngOnInit();

      // Simulate update event
      flaggedCommentsService.flaggedCommentUpdated$.next(true);

      expect(getDataSpy).toHaveBeenCalledTimes(2); // Once on init, once on update
      expect(flaggedCommentsService.flaggedCommentUpdated$.next).toBeDefined();
    });
  });

  describe('Pagination and Sorting', () => {
    beforeEach(() => {
      flaggedCommentsService.getFlaggedCommentsList.mockReturnValue(of(mockApiResponse));
    });

    it('should handle page change', () => {
      const getDataSpy = jest.spyOn(component as any, 'getFlaggedCommmentsData');
      const pageEvent = { pageIndex: 1, pageSize: 20 };

      component.onPageChange(pageEvent);

      expect(component.pagination()).toEqual({
        pageNumber: 2,
        pageSize: 20,
      });
      expect(getDataSpy).toHaveBeenCalled();
    });

    it('should handle sort change', () => {
      const getDataSpy = jest.spyOn(component as any, 'getFlaggedCommmentsData');
      const sortEvent = { active: 'comment', direction: 'desc' };

      component.onSortChange(sortEvent);

      expect(component.sort()).toEqual({
        sortColumn: 'comment',
        sortDescending: true,
      });
      expect(getDataSpy).toHaveBeenCalled();
    });

    it('should handle filter change and reset to first page', () => {
      const getDataSpy = jest.spyOn(component as any, 'getFlaggedCommmentsData');

      // Set current page to something other than 1
      component.pagination.set({ pageNumber: 3, pageSize: 10 });

      component.onFilterChange();

      expect(component.pagination().pageNumber).toBe(1);
      expect(getDataSpy).toHaveBeenCalled();
    });
  });

  describe('Flagged Comment Actions', () => {
    const mockTableRow: TableData = { id: 1, comment: 'Test comment', status: 'Pending' };

    beforeEach(() => {
      flaggedCommentsService.getFlaggedCommentsList.mockReturnValue(of(mockApiResponse));
      dialog.open.mockReturnValue({
        afterClosed: () => of(true),
      } as any);
    });

    it('should handle VIEW action and open preview dialog', () => {
      const loadPreviewSpy = jest.spyOn(component, 'loadFlaggedCommentPreview');

      component.handleFlaggedCommentAction({
        action: flaggedCommentsAction.VIEW,
        row: mockTableRow,
      });

      expect(loadPreviewSpy).toHaveBeenCalledWith(1);
    });

    it('should handle ACCEPTED action and open confirmation dialog', () => {
      const openDialogSpy = jest.spyOn(component, 'openConfirmationDialog');

      component.handleFlaggedCommentAction({
        action: flaggedCommentsAction.ACCEPTED,
        row: mockTableRow,
      });

      expect(openDialogSpy).toHaveBeenCalled();
    });

    it('should handle IGNORED action and open confirmation dialog', () => {
      const openDialogSpy = jest.spyOn(component, 'openConfirmationDialog');

      component.handleFlaggedCommentAction({
        action: flaggedCommentsAction.IGNORED,
        row: mockTableRow,
      });

      expect(openDialogSpy).toHaveBeenCalled();
    });

    it('should not do anything for unknown action', () => {
      const consoleSpy = jest.spyOn(console, 'warn');

      component.handleFlaggedCommentAction({
        action: 'UNKNOWN_ACTION',
        row: mockTableRow,
      });

      // Should not throw error or call any service
      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe('Confirmation Dialog', () => {
    it('should open confirmation dialog and execute onConfirm when confirmed', () => {
      const mockOnConfirm = jest.fn();
      const mockDialogRef = {
        afterClosed: () => of(true),
      };
      dialog.open.mockReturnValue(mockDialogRef as any);

      component.openConfirmationDialog({ title: 'Test' } as any, mockOnConfirm);

      expect(dialog.open).toHaveBeenCalledWith(ConfirmationDialogComponent, {
        width: '600px',
        disableClose: false,
        data: { title: 'Test' },
        panelClass: 'custom-dialog-radius',
      });

      // The callback should be called when dialog returns true
      expect(mockOnConfirm).toHaveBeenCalled();
    });

    it('should not execute onConfirm when dialog is cancelled', () => {
      const mockOnConfirm = jest.fn();
      const mockDialogRef = {
        afterClosed: () => of(false),
      };
      dialog.open.mockReturnValue(mockDialogRef as any);

      component.openConfirmationDialog({ title: 'Test' } as any, mockOnConfirm);

      expect(mockOnConfirm).not.toHaveBeenCalled();
    });
  });

  describe('Update Comment Status', () => {
    const mockPayload: UpdateFlaggedCommentStatusRequest = {
      id: 1,
      status: QuizRatingStatus.Accepted,
    };

    it('should successfully update comment status', () => {
      const successResponse = {
        result: true,
        statusCode: 200,
        message: 'Status updated successfully',
        data: null,
      };
      flaggedCommentsService.updateAction.mockReturnValue(of(successResponse));
      const getDataSpy = jest.spyOn(component as any, 'getFlaggedCommmentsData');

      component.updateQueReportStatus(1, QuizRatingStatus.Accepted);

      expect(flaggedCommentsService.updateAction).toHaveBeenCalledWith(mockPayload);
      expect(snackbarService.showSuccess).toHaveBeenCalledWith(
        platformMessages.successTitle,
        successResponse.message,
      );
      expect(getDataSpy).toHaveBeenCalled();
    });

    it('should handle update failure', () => {
      const errorResponse = {
        result: false,
        statusCode: 400,
        message: 'Update failed',
        data: null,
      };
      flaggedCommentsService.updateAction.mockReturnValue(of(errorResponse));

      component.updateQueReportStatus(1, QuizRatingStatus.Accepted);

      expect(snackbarService.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        errorResponse.message,
      );
    });

    it('should handle update error', () => {
      const mockError = { error: { message: 'Server error' } };
      flaggedCommentsService.updateAction.mockReturnValue(throwError(() => mockError));

      component.updateQueReportStatus(1, QuizRatingStatus.Accepted);

      expect(snackbarService.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        'Server error',
      );
    });
  });

  describe('Load Flagged Comment Preview', () => {
    it('should open preview dialog with correct parameters', () => {
      component.loadFlaggedCommentPreview(1);

      expect(dialog.open).toHaveBeenCalledWith(FlaggedCommentsPreviewDialogComponent, {
        width: '600px',
        maxHeight: '80vh',
        data: 1,
      });
    });
  });

  describe('Data Fetching', () => {
    it('should fetch flagged comments data successfully', fakeAsync(() => {
      flaggedCommentsService.getFlaggedCommentsList.mockReturnValue(of(mockApiResponse));

      (component as any).getFlaggedCommmentsData();

      tick();

      expect(flaggedCommentsService.getFlaggedCommentsList).toHaveBeenCalled();
      expect(component.dataSource().length).toBe(2);
      expect(component.totalItems()).toBe(2);
    }));

    it('should handle API error when fetching data', () => {
      const mockError = { error: { message: 'Server error' } };
      flaggedCommentsService.getFlaggedCommentsList.mockReturnValue(throwError(() => mockError));

      (component as any).getFlaggedCommmentsData();

      expect(snackbarService.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        'Server error',
      );
    });

    it('should apply status filter when selected', () => {
      component.selectedStatus = QuizRatingStatus.Pending;
      flaggedCommentsService.getFlaggedCommentsList.mockReturnValue(of(mockApiResponse));

      (component as any).getFlaggedCommmentsData();

      const expectedRequest: PaginationRequest = {
        ...component.pagination(),
        searchTerm: '',
        sortColumn: component.sort().sortColumn,
        sortDescending: component.sort().sortDescending,
        filters: {
          commentStatus: QuizRatingStatus.Pending,
        },
      };

      expect(flaggedCommentsService.getFlaggedCommentsList).toHaveBeenCalledWith(expectedRequest);
    });
  });

  describe('Cleanup', () => {
    it('should complete destroy$ on ngOnDestroy', () => {
      const nextSpy = jest.spyOn(component['destroy$'], 'next');
      const completeSpy = jest.spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalledWith();
      expect(completeSpy).toHaveBeenCalled();
    });
  });

  describe('Flagged Comment Status Options', () => {
    it('should have correct flagged comment status options', () => {
      expect(component.flaggedCommentStatus).toBeDefined();
      expect(Array.isArray(component.flaggedCommentStatus)).toBe(true);

      // Should filter out numeric keys and only keep string keys
      component.flaggedCommentStatus.forEach((option) => {
        expect(option).toHaveProperty('label');
        expect(option).toHaveProperty('value');
        expect(typeof option.label).toBe('string');
        expect(typeof option.value).toBe('number');
      });
    });
  });
});
