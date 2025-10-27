import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { BattleManagementComponent } from './battle-management.component';
import { BattleManagementService } from '../../../services/admin/battle-management/battle-management.service';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { platformMessages } from '../../../utils/constants';
import { Navigations } from '../../../shared/enums/navigation';
import { TagColor, TagType } from '../../../utils/types/tag-component.type';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

describe('BattleManagementComponent', () => {
  let component: BattleManagementComponent;
  let fixture: ComponentFixture<BattleManagementComponent>;
  let battleService: jest.Mocked<BattleManagementService>;
  let snackbarService: jest.Mocked<SnackbarService>;
  let router: Router;
  let dialog: jest.Mocked<MatDialog>;

  const mockTag = {
    id: '1',
    label: 'Active',
    type: 'static' as TagType,
    isSelected: false,
    hasBorder: true,
    backgroundColor: 'lightGreen' as TagColor,
    textColor: 'green' as TagColor,
  };

  const mockBattleResponse = {
    statusCode: 200,
    result: true,
    message: 'Success',
    data: {
      batchNumber: 1,
      battles: [
        {
          id: 1,
          battleName: 'Test Battle',
          categoryName: 'General',
          description: 'A mock battle',
          totalParticipants: 10,
          totalXp: 100,
          battleTime: 1,
          startDate: new Date('2025-08-19'),
          endDate: new Date('2025-08-20'),
          battleDifficulty: 'Easy',
          totalQuestion: 10,
          battleStatus: 1,
        },
      ],
      hasMore: false,
    },
  };

  beforeEach(async () => {
    const battleServiceMock = {
      getBattles: jest.fn(),
      deleteBattle: jest.fn(),
    };
    const snackbarServiceMock = {
      showSuccess: jest.fn(),
      showError: jest.fn(),
    };
    const dialogMock = {
      open: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        BattleManagementComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        MatDialogModule,
      ],
      providers: [
        { provide: BattleManagementService, useValue: battleServiceMock },
        { provide: SnackbarService, useValue: snackbarServiceMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(BattleManagementComponent);
    component = fixture.componentInstance;
    battleService = TestBed.inject(BattleManagementService) as jest.Mocked<BattleManagementService>;
    snackbarService = TestBed.inject(SnackbarService) as jest.Mocked<SnackbarService>;
    router = TestBed.inject(Router);
    dialog = TestBed.inject(MatDialog) as jest.Mocked<MatDialog>;

    jest.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load battles on init with success', () => {
    battleService.getBattles.mockReturnValue(of(mockBattleResponse));

    fixture.detectChanges();

    expect(battleService.getBattles).toHaveBeenCalledWith(1);
    expect(component.batchNumber).toBe(1);
    expect(component.hasMoreData).toBe(false);
  });

  it('should show error snackbar when loading battles fails', () => {
    const mockError = { error: { message: 'API error' } };
    battleService.getBattles.mockReturnValue(throwError(() => mockError));

    fixture.detectChanges();

    expect(snackbarService.showError).toHaveBeenCalledWith(
      platformMessages.errorTitle,
      mockError.error.message,
    );
  });

  it('should show default error message when error lacks message property', () => {
    const mockError = { error: {} };
    battleService.getBattles.mockReturnValue(throwError(() => mockError));

    fixture.detectChanges();

    expect(snackbarService.showError).toHaveBeenCalledWith(
      platformMessages.errorTitle,
      platformMessages.errorMessage,
    );
  });

  it('should append new battles when batchNumber is greater than 1', () => {
    battleService.getBattles.mockReturnValue(of(mockBattleResponse));
    fixture.detectChanges();

    component.batchNumber = 2;
    battleService.getBattles.mockReturnValue(of(mockBattleResponse));
    component.loadBattles();

    expect(battleService.getBattles).toHaveBeenCalledWith(2);
  });

  it('should reset battles when batchNumber is 1', () => {
    const firstResponse = mockBattleResponse;
    battleService.getBattles.mockReturnValue(of(firstResponse));
    fixture.detectChanges();

    component.batchNumber = 1;
    component.loadBattles();

    expect(battleService.getBattles).toHaveBeenCalledWith(1);
  });

  it('should clean up subscriptions on destroy', () => {
    const nextSpy = jest.spyOn((component as any).destroy$, 'next');
    const completeSpy = jest.spyOn((component as any).destroy$, 'complete');

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should navigate to battle creation page', () => {
    component.openAddBattleDialgue();

    expect(router.navigate).toHaveBeenCalledWith([
      `/${Navigations.Admin}/${Navigations.BattlesAdmin}/${Navigations.BattleCreation}`,
    ]);
  });

  it('should navigate to battle update page with encoded ID', () => {
    const battleId = 1;
    const encodedId = btoa(battleId.toString());

    component.editBattle(battleId);

    expect(router.navigate).toHaveBeenCalledWith([
      `/${Navigations.Admin}/${Navigations.BattlesAdmin}/${Navigations.BattleUpdation}`,
      encodedId,
    ]);
  });

  it('should open confirmation dialog and delete battle on confirm', () => {
    const battleId = 1;
    const mockDialogRef = {
      afterClosed: jest.fn().mockReturnValue(of(true)),
    };
    dialog.open.mockReturnValue(mockDialogRef as any);
    battleService.deleteBattle.mockReturnValue(
      of({ statusCode: 200, result: true, message: 'Success', data: null }),
    );
    const loadBattlesSpy = jest.spyOn(component, 'loadBattles');

    component.deleteBattleDialog(battleId);

    expect(dialog.open).toHaveBeenCalledWith(ConfirmationDialogComponent, {
      width: '600px',
      disableClose: false,
      data: expect.any(Object),
      panelClass: 'custom-dialog-radius',
    });
    expect(battleService.deleteBattle).toHaveBeenCalledWith(battleId);
    expect(snackbarService.showSuccess).toHaveBeenCalledWith(
      platformMessages.successTitle,
      platformMessages.deleteBattleSuccess,
    );
    expect(loadBattlesSpy).toHaveBeenCalled();
  });

  it('should not delete battle when confirmation dialog is canceled', () => {
    const battleId = 1;
    const mockDialogRef = {
      afterClosed: jest.fn().mockReturnValue(of(false)),
    };
    dialog.open.mockReturnValue(mockDialogRef as any);

    component.deleteBattleDialog(battleId);

    expect(dialog.open).toHaveBeenCalled();
    expect(battleService.deleteBattle).not.toHaveBeenCalled();
  });

  it('should show error when deleting battle fails', () => {
    const battleId = 1;
    const mockDialogRef = {
      afterClosed: jest.fn().mockReturnValue(of(true)),
    };
    const mockError = { error: { message: 'Delete failed' } };
    dialog.open.mockReturnValue(mockDialogRef as any);
    battleService.deleteBattle.mockReturnValue(throwError(() => mockError));

    component.deleteBattleDialog(battleId);

    expect(snackbarService.showError).toHaveBeenCalledWith(
      platformMessages.errorTitle,
      mockError.error.message,
    );
  });

  it('should show error with default message when delete error lacks message', () => {
    const battleId = 1;
    const mockDialogRef = {
      afterClosed: jest.fn().mockReturnValue(of(true)),
    };
    const mockError = { error: {} };
    dialog.open.mockReturnValue(mockDialogRef as any);
    battleService.deleteBattle.mockReturnValue(throwError(() => mockError));

    component.deleteBattleDialog(battleId);

    expect(snackbarService.showError).toHaveBeenCalledWith(
      platformMessages.errorTitle,
      platformMessages.errorMessage,
    );
  });

  it('should handle non-200 status code when deleting battle and show snackbar', () => {
    const battleId = 1;
    const mockDialogRef = {
      afterClosed: jest.fn().mockReturnValue(of(true)),
    };
    const mockResponse = {
      statusCode: 400,
      result: false,
      message: 'Delete operation failed',
      data: null,
    };
    dialog.open.mockReturnValue(mockDialogRef as any);
    battleService.deleteBattle.mockReturnValue(of(mockResponse));
    const loadBattlesSpy = jest.spyOn(component, 'loadBattles');

    component.deleteBattleDialog(battleId);

    expect(snackbarService.showError).toHaveBeenCalledWith(
      platformMessages.errorTitle,
      mockResponse.message,
    );
    expect(loadBattlesSpy).not.toHaveBeenCalled();
  });

  it('should increment batch number on loadMore', () => {
    component.hasMoreData = true;
    component.batchNumber = 1;
    battleService.getBattles.mockReturnValue(of(mockBattleResponse));

    component.loadMore();

    expect(component.batchNumber).toBe(2);
    expect(battleService.getBattles).toHaveBeenCalledWith(2);
  });

  it('should not load more when hasMoreData is false', () => {
    component.hasMoreData = false;
    component.batchNumber = 1;
    const initialBatchNumber = component.batchNumber;

    component.loadMore();

    expect(component.batchNumber).toBe(initialBatchNumber);
    expect(battleService.getBattles).not.toHaveBeenCalled();
  });
});
