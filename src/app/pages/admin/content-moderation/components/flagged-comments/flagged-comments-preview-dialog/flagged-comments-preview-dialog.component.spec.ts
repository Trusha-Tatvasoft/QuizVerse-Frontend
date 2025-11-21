import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FlaggedCommentsPreviewDialogComponent } from './flagged-comments-preview-dialog.component';
import { FlaggedCommentsService } from '../../../../../../services/admin/content-moderation/flagged-comments.service';
import { SnackbarService } from '../../../../../../shared/service/snackbar/snackbar.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of, throwError, Subject } from 'rxjs';
import { QuizRatingStatus } from '../../../../../../shared/enums/content-moderation.enum';
import { FlaggedCommentView } from '../../../interfaces/flagged-comments.interface';
import { platformMessages } from '../../../../../../utils/constants';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ConfirmationDialogComponent } from '../../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';

describe('FlaggedCommentsPreviewDialogComponent', () => {
  let component: FlaggedCommentsPreviewDialogComponent;
  let fixture: ComponentFixture<FlaggedCommentsPreviewDialogComponent>;
  let mockFlaggedCommentsService: jest.Mocked<FlaggedCommentsService>;
  let mockSnackbarService: jest.Mocked<SnackbarService>;
  let mockDialogRef: jest.Mocked<MatDialogRef<FlaggedCommentsPreviewDialogComponent>>;
  let mockDialog: jest.Mocked<MatDialog>;

  const mockCommentId = 123;
  const mockFlaggedCommentData: FlaggedCommentView = {
    id: 123,
    comment: 'This is a test comment',
    author: 'John Doe',
    quizName: 'Test Quiz',
    reason: 'Inappropriate content',
    date: new Date('2024-01-01'),
    status: QuizRatingStatus.Pending,
    quizCategory: 'Science',
    userId: 456,
  };

  beforeEach(async () => {
    mockFlaggedCommentsService = {
      getFlaggedCommentsPreviewById: jest.fn(),
      updateAction: jest.fn(),
      notifyFlaggedCommentUpdated: jest.fn(),
    } as any;

    mockSnackbarService = {
      showSuccess: jest.fn(),
      showError: jest.fn(),
    } as any;

    mockDialogRef = {
      close: jest.fn(),
    } as any;

    mockDialog = {
      open: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [FlaggedCommentsPreviewDialogComponent],
      providers: [
        { provide: FlaggedCommentsService, useValue: mockFlaggedCommentsService },
        { provide: SnackbarService, useValue: mockSnackbarService },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MatDialog, useValue: mockDialog },
        { provide: MAT_DIALOG_DATA, useValue: mockCommentId },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FlaggedCommentsPreviewDialogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should call loadflaggedCommentPreviewData on ngOnInit', () => {
      jest.spyOn(component, 'loadflaggedCommentPreviewData');
      mockFlaggedCommentsService.getFlaggedCommentsPreviewById.mockReturnValue(
        of({ result: true, statusCode: 200, data: mockFlaggedCommentData, message: 'Success' }),
      );

      component.ngOnInit();

      expect(component.loadflaggedCommentPreviewData).toHaveBeenCalledWith(mockCommentId);
    });

    it('should initialize with correct button configurations', () => {
      expect(component.acceptReportButtonConfig).toBeDefined();
      expect(component.ignoreReportButtonConfig).toBeDefined();
      expect(component.closeButtonConfig).toBeDefined();
    });

    it('should initialize quizRatingStatus enum', () => {
      expect(component.quizRatingStatus).toBe(QuizRatingStatus);
    });
  });

  describe('loadflaggedCommentPreviewData', () => {
    it('should load flagged comment data successfully', () => {
      const mockResponse = {
        result: true,
        statusCode: 200,
        data: mockFlaggedCommentData,
        message: 'Success',
      };
      mockFlaggedCommentsService.getFlaggedCommentsPreviewById.mockReturnValue(of(mockResponse));

      component.loadflaggedCommentPreviewData(mockCommentId);

      expect(mockFlaggedCommentsService.getFlaggedCommentsPreviewById).toHaveBeenCalledWith(
        mockCommentId,
      );
      expect(component.flaggedCommentData).toEqual(mockFlaggedCommentData);
    });

    it('should handle error from service', () => {
      const errorMessage = 'Network error';
      const error = { error: { message: errorMessage } };
      mockFlaggedCommentsService.getFlaggedCommentsPreviewById.mockReturnValue(
        throwError(() => error),
      );

      component.loadflaggedCommentPreviewData(mockCommentId);

      expect(mockSnackbarService.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        errorMessage,
      );
    });

    it('should use default error message when error.error.message is not available', () => {
      mockFlaggedCommentsService.getFlaggedCommentsPreviewById.mockReturnValue(
        throwError(() => ({})),
      );

      component.loadflaggedCommentPreviewData(mockCommentId);

      expect(mockSnackbarService.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        platformMessages.failedToLoadCommentPreview,
      );
    });
  });

  describe('getFlaggedCommentStatusConfig', () => {
    it('should return correct config for Accepted status', () => {
      const config = component.getFlaggedCommentStatusConfig(QuizRatingStatus.Accepted);

      expect(config).toBeDefined();
      expect(config.id).toBe(`${QuizRatingStatus.Accepted}`);
      expect(config.type).toBe('static');
      expect(config.isSelected).toBe(false);
      expect(config.hasBorder).toBe(false);
    });

    it('should return correct config for Ignore status', () => {
      const config = component.getFlaggedCommentStatusConfig(QuizRatingStatus.Ignore);

      expect(config).toBeDefined();
      expect(config.id).toBe(`${QuizRatingStatus.Ignore}`);
    });

    it('should return correct config for Pending status', () => {
      const config = component.getFlaggedCommentStatusConfig(QuizRatingStatus.Pending);

      expect(config).toBeDefined();
      expect(config.id).toBe(`${QuizRatingStatus.Pending}`);
    });

    it('should return correct config for UnderProcessing status', () => {
      const config = component.getFlaggedCommentStatusConfig(QuizRatingStatus.UnderProcessing);

      expect(config).toBeDefined();
      expect(config.id).toBe(`${QuizRatingStatus.UnderProcessing}`);
    });
  });

  describe('getInitials', () => {
    it('should return initials for single name', () => {
      const initials = component.getInitials('John');
      expect(initials).toBeDefined();
      expect(typeof initials).toBe('string');
    });

    it('should return initials for full name', () => {
      const initials = component.getInitials('John Doe');
      expect(initials).toBeDefined();
      expect(typeof initials).toBe('string');
    });

    it('should handle empty string', () => {
      const initials = component.getInitials('');
      expect(initials).toBeDefined();
    });
  });

  describe('getInitialsColorClass', () => {
    it('should return color class for a name', () => {
      const colorClass = component.getInitialsColorClass('John Doe');
      expect(colorClass).toBeDefined();
      expect(typeof colorClass).toBe('string');
    });

    it('should return consistent color class for same name', () => {
      const colorClass1 = component.getInitialsColorClass('John Doe');
      const colorClass2 = component.getInitialsColorClass('John Doe');
      expect(colorClass1).toBe(colorClass2);
    });

    it('should handle empty string', () => {
      const colorClass = component.getInitialsColorClass('');
      expect(colorClass).toBeDefined();
    });
  });

  describe('closeDialog', () => {
    it('should call dialogRef.close', () => {
      component.closeDialog();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should call dialogRef.close only once', () => {
      component.closeDialog();
      expect(mockDialogRef.close).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleFlaggedCommentAction', () => {
    beforeEach(() => {
      jest.spyOn(component, 'openConfirmationDialog');
    });

    it('should not open dialog for Pending status', () => {
      component.handleFlaggedCommentAction(mockCommentId, QuizRatingStatus.Pending);

      expect(component.openConfirmationDialog).not.toHaveBeenCalled();
    });

    it('should not open dialog for UnderProcessing status', () => {
      component.handleFlaggedCommentAction(mockCommentId, QuizRatingStatus.UnderProcessing);

      expect(component.openConfirmationDialog).not.toHaveBeenCalled();
    });
  });

  describe('openConfirmationDialog', () => {
    it('should open confirmation dialog with correct config', () => {
      const mockDialogData = { title: 'Test', message: 'Test message' };
      const mockOnConfirm = jest.fn();
      const mockDialogRefFromOpen = {
        afterClosed: jest.fn().mockReturnValue(of(false)),
      };
      mockDialog.open.mockReturnValue(mockDialogRefFromOpen as any);

      component.openConfirmationDialog(mockDialogData as any, mockOnConfirm);

      expect(mockDialog.open).toHaveBeenCalledWith(ConfirmationDialogComponent, {
        width: '600px',
        disableClose: false,
        data: mockDialogData,
        panelClass: 'custom-dialog-radius',
      });
    });

    it('should call onConfirm when user confirms', () => {
      const mockDialogData = { title: 'Test', message: 'Test message' };
      const mockOnConfirm = jest.fn();
      const mockDialogRefFromOpen = {
        afterClosed: jest.fn().mockReturnValue(of(true)),
      };
      mockDialog.open.mockReturnValue(mockDialogRefFromOpen as any);

      component.openConfirmationDialog(mockDialogData as any, mockOnConfirm);

      expect(mockOnConfirm).toHaveBeenCalled();
    });

    it('should not call onConfirm when user cancels', () => {
      const mockDialogData = { title: 'Test', message: 'Test message' };
      const mockOnConfirm = jest.fn();
      const mockDialogRefFromOpen = {
        afterClosed: jest.fn().mockReturnValue(of(false)),
      };
      mockDialog.open.mockReturnValue(mockDialogRefFromOpen as any);

      component.openConfirmationDialog(mockDialogData as any, mockOnConfirm);

      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('should not call onConfirm when dialog is dismissed', () => {
      const mockDialogData = { title: 'Test', message: 'Test message' };
      const mockOnConfirm = jest.fn();
      const mockDialogRefFromOpen = {
        afterClosed: jest.fn().mockReturnValue(of(undefined)),
      };
      mockDialog.open.mockReturnValue(mockDialogRefFromOpen as any);

      component.openConfirmationDialog(mockDialogData as any, mockOnConfirm);

      expect(mockOnConfirm).not.toHaveBeenCalled();
    });
  });

  describe('updateQueReportStatus', () => {
    it('should update status successfully', () => {
      const mockResponse = {
        result: true,
        statusCode: 200,
        message: 'Status updated successfully',
        data: null,
      };
      mockFlaggedCommentsService.updateAction.mockReturnValue(of(mockResponse));
      mockFlaggedCommentsService.getFlaggedCommentsPreviewById.mockReturnValue(
        of({ result: true, statusCode: 200, data: mockFlaggedCommentData, message: 'Success' }),
      );
      jest.spyOn(component, 'loadflaggedCommentPreviewData');

      component.updateQueReportStatus(mockCommentId, QuizRatingStatus.Accepted);

      expect(mockFlaggedCommentsService.updateAction).toHaveBeenCalledWith({
        id: mockCommentId,
        status: QuizRatingStatus.Accepted,
      });
      expect(mockSnackbarService.showSuccess).toHaveBeenCalledWith(
        platformMessages.successTitle,
        mockResponse.message,
      );
      expect(component.loadflaggedCommentPreviewData).toHaveBeenCalledWith(mockCommentId);
      expect(mockFlaggedCommentsService.notifyFlaggedCommentUpdated).toHaveBeenCalled();
    });

    it('should show error when update fails with result false', () => {
      const mockResponse = {
        result: false,
        statusCode: 400,
        message: 'Update failed',
        data: null,
      };
      mockFlaggedCommentsService.updateAction.mockReturnValue(of(mockResponse));

      component.updateQueReportStatus(mockCommentId, QuizRatingStatus.Accepted);

      expect(mockSnackbarService.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        mockResponse.message,
      );
      expect(mockFlaggedCommentsService.notifyFlaggedCommentUpdated).not.toHaveBeenCalled();
    });

    it('should show error when update fails with non-200 status code', () => {
      const mockResponse = {
        result: true,
        statusCode: 500,
        message: 'Server error',
        data: null,
      };
      mockFlaggedCommentsService.updateAction.mockReturnValue(of(mockResponse));

      component.updateQueReportStatus(mockCommentId, QuizRatingStatus.Ignore);

      expect(mockSnackbarService.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        mockResponse.message,
      );
    });

    it('should handle error from service', () => {
      const errorMessage = 'Network error';
      const error = { error: { message: errorMessage } };
      mockFlaggedCommentsService.updateAction.mockReturnValue(throwError(() => error));

      component.updateQueReportStatus(mockCommentId, QuizRatingStatus.Accepted);

      expect(mockSnackbarService.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        errorMessage,
      );
    });

    it('should use default error message when error.error.message is not available', () => {
      mockFlaggedCommentsService.updateAction.mockReturnValue(throwError(() => ({})));

      component.updateQueReportStatus(mockCommentId, QuizRatingStatus.Accepted);

      expect(mockSnackbarService.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        platformMessages.errorMessage,
      );
    });

    it('should update with Ignore status', () => {
      const mockResponse = {
        result: true,
        statusCode: 200,
        message: 'Status updated successfully',
        data: null,
      };
      mockFlaggedCommentsService.updateAction.mockReturnValue(of(mockResponse));
      mockFlaggedCommentsService.getFlaggedCommentsPreviewById.mockReturnValue(
        of({ result: true, statusCode: 200, data: mockFlaggedCommentData, message: 'Success' }),
      );

      component.updateQueReportStatus(mockCommentId, QuizRatingStatus.Ignore);

      expect(mockFlaggedCommentsService.updateAction).toHaveBeenCalledWith({
        id: mockCommentId,
        status: QuizRatingStatus.Ignore,
      });
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy$ subject', () => {
      const destroySpy = jest.spyOn(component['destroy$'], 'next');
      const completeSpy = jest.spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(destroySpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });

    it('should unsubscribe from all observables', () => {
      const mockResponse = {
        result: true,
        statusCode: 200,
        data: mockFlaggedCommentData,
        message: 'Success',
      };
      mockFlaggedCommentsService.getFlaggedCommentsPreviewById.mockReturnValue(of(mockResponse));

      component.ngOnInit();
      component.ngOnDestroy();

      expect(component['destroy$'].closed).toBe(false);
      expect(component['destroy$'].observers.length).toBe(0);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete flow of accepting a comment', () => {
      const mockDialogRefFromOpen = {
        afterClosed: jest.fn().mockReturnValue(of(true)),
      };
      mockDialog.open.mockReturnValue(mockDialogRefFromOpen as any);

      const mockUpdateResponse = {
        result: true,
        statusCode: 200,
        message: 'Comment accepted',
        data: null,
      };
      mockFlaggedCommentsService.updateAction.mockReturnValue(of(mockUpdateResponse));
      mockFlaggedCommentsService.getFlaggedCommentsPreviewById.mockReturnValue(
        of({ result: true, statusCode: 200, data: mockFlaggedCommentData, message: 'Success' }),
      );

      component.handleFlaggedCommentAction(mockCommentId, QuizRatingStatus.Accepted);

      expect(mockDialog.open).toHaveBeenCalled();
      expect(mockFlaggedCommentsService.updateAction).toHaveBeenCalledWith({
        id: mockCommentId,
        status: QuizRatingStatus.Accepted,
      });
      expect(mockSnackbarService.showSuccess).toHaveBeenCalled();
    });

    it('should handle complete flow of ignoring a comment', () => {
      const mockDialogRefFromOpen = {
        afterClosed: jest.fn().mockReturnValue(of(true)),
      };
      mockDialog.open.mockReturnValue(mockDialogRefFromOpen as any);

      const mockUpdateResponse = {
        result: true,
        statusCode: 200,
        message: 'Comment ignored',
        data: null,
      };
      mockFlaggedCommentsService.updateAction.mockReturnValue(of(mockUpdateResponse));
      mockFlaggedCommentsService.getFlaggedCommentsPreviewById.mockReturnValue(
        of({ result: true, statusCode: 200, data: mockFlaggedCommentData, message: 'Success' }),
      );

      component.handleFlaggedCommentAction(mockCommentId, QuizRatingStatus.Ignore);

      expect(mockDialog.open).toHaveBeenCalled();
      expect(mockFlaggedCommentsService.updateAction).toHaveBeenCalledWith({
        id: mockCommentId,
        status: QuizRatingStatus.Ignore,
      });
    });

    it('should not update status when user cancels confirmation dialog', () => {
      const mockDialogRefFromOpen = {
        afterClosed: jest.fn().mockReturnValue(of(false)),
      };
      mockDialog.open.mockReturnValue(mockDialogRefFromOpen as any);

      component.handleFlaggedCommentAction(mockCommentId, QuizRatingStatus.Accepted);

      expect(mockDialog.open).toHaveBeenCalled();
      expect(mockFlaggedCommentsService.updateAction).not.toHaveBeenCalled();
    });
  });
});
