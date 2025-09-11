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
import { BattleCardData } from './interfaces/battle-management.interface';
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

  const mockBattles: BattleCardData[] = [
    {
      id: 1,
      battleName: 'Test Battle',
      category: 'General',
      description: 'A mock battle',
      participants: 10,
      totalXp: 100,
      battleTime: 1,
      dateRange: { start: new Date('2025-08-19'), end: new Date('2025-08-20') },
      statusTag: { ...mockTag, id: 'status-1' },
      difficultyTag: { ...mockTag, id: 'difficulty-1', label: 'Easy' },
      questionTag: { ...mockTag, id: 'question-1', label: '10 Qs' },
      timeTag: { ...mockTag, id: 'time-1', label: 'Permanent' },
    },
  ];

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
      schemas: [NO_ERRORS_SCHEMA], // Ignore unknown components for simplicity
    }).compileComponents();

    fixture = TestBed.createComponent(BattleManagementComponent);
    component = fixture.componentInstance;
    battleService = TestBed.inject(BattleManagementService) as jest.Mocked<BattleManagementService>;
    snackbarService = TestBed.inject(SnackbarService) as jest.Mocked<SnackbarService>;
    router = TestBed.inject(Router);
    dialog = TestBed.inject(MatDialog) as jest.Mocked<MatDialog>;

    // Spy on router.navigate
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load battles on init (success case)', () => {
    battleService.getBattles.mockReturnValue(of(mockBattles));

    fixture.detectChanges(); // Triggers ngOnInit

    expect(battleService.getBattles).toHaveBeenCalled();
    expect(component.battleData).toEqual(mockBattles);
  });

  it('should handle error when loading battles and show snackbar', () => {
    const mockError = { statusCode: 500, error: { message: 'API error' } };
    battleService.getBattles.mockReturnValue(throwError(() => mockError));

    fixture.detectChanges();

    expect(battleService.getBattles).toHaveBeenCalled();
    expect(snackbarService.showError).toHaveBeenCalledWith(
      `${platformMessages.errorTitle}`,
      mockError.error.message,
    );
  });

  it('should handle error when loading battles with missing error message', () => {
    const mockError = { statusCode: 400, error: {} };
    battleService.getBattles.mockReturnValue(throwError(() => mockError));

    fixture.detectChanges();

    expect(battleService.getBattles).toHaveBeenCalled();
    expect(snackbarService.showError).toHaveBeenCalledWith(
      `${platformMessages.errorTitle}`,
      platformMessages.errorMessage,
    );
  });

  it('should clean up subscriptions on destroy', () => {
    const nextSpy = jest.spyOn((component as any).destroy$, 'next');
    const completeSpy = jest.spyOn((component as any).destroy$, 'complete');

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should navigate to battle creation page on openAddBattleDialgue', () => {
    component.openAddBattleDialgue();

    expect(router.navigate).toHaveBeenCalledWith([
      `/${Navigations.Admin}/${Navigations.BattlesAdmin}/${Navigations.BattleCreation}`,
    ]);
  });

  it('should navigate to battle update page on editBattle', () => {
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
      disableClose: true,
      data: expect.any(Object),
      panelClass: 'custom-dialog-radius',
    });
    expect(mockDialogRef.afterClosed).toHaveBeenCalled();
    expect(battleService.deleteBattle).toHaveBeenCalledWith(battleId);
    expect(snackbarService.showSuccess).toHaveBeenCalledWith(
      'Success',
      platformMessages.deleteBattleSuccess,
    );
    expect(loadBattlesSpy).toHaveBeenCalled();
  });

  it('should not delete battle if confirmation dialog is canceled', () => {
    const battleId = 1;
    const mockDialogRef = {
      afterClosed: jest.fn().mockReturnValue(of(false)),
    };
    dialog.open.mockReturnValue(mockDialogRef as any);

    component.deleteBattleDialog(battleId);

    expect(dialog.open).toHaveBeenCalled();
    expect(mockDialogRef.afterClosed).toHaveBeenCalled();
    expect(battleService.deleteBattle).not.toHaveBeenCalled();
  });

  it('should handle error when deleting battle and show snackbar', () => {
    const battleId = 1;
    const mockDialogRef = {
      afterClosed: jest.fn().mockReturnValue(of(true)),
    };
    const mockError = { error: { message: 'Delete failed' } };
    dialog.open.mockReturnValue(mockDialogRef as any);
    battleService.deleteBattle.mockReturnValue(throwError(() => mockError));

    component.deleteBattleDialog(battleId);

    expect(battleService.deleteBattle).toHaveBeenCalledWith(battleId);
    expect(snackbarService.showError).toHaveBeenCalledWith(
      platformMessages.errorTitle,
      mockError.error.message || platformMessages.deleteBattleFailure,
    );
  });

  // New test case to cover the uncovered line
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

    expect(battleService.deleteBattle).toHaveBeenCalledWith(battleId);
    expect(snackbarService.showError).toHaveBeenCalledWith('Error', mockResponse.message);
    expect(loadBattlesSpy).not.toHaveBeenCalled();
  });

  it('should handle error when deleting battle with missing error message', () => {
    const battleId = 1;
    const mockDialogRef = {
      afterClosed: jest.fn().mockReturnValue(of(true)),
    };
    const mockError = { error: {} };
    dialog.open.mockReturnValue(mockDialogRef as any);
    battleService.deleteBattle.mockReturnValue(throwError(() => mockError));

    component.deleteBattleDialog(battleId);

    expect(battleService.deleteBattle).toHaveBeenCalledWith(battleId);
    expect(snackbarService.showError).toHaveBeenCalledWith(
      platformMessages.errorTitle,
      platformMessages.errorMessage,
    );
  });

  it('should display "No battles available" when battleData is empty', () => {
    battleService.getBattles.mockReturnValue(of([]));
    fixture.detectChanges();

    const noDataElement = fixture.nativeElement.querySelector('.no-data-message');
    expect(noDataElement.textContent).toBe('No battles available.');
  });

  it('should render battle cards when battleData is not empty', () => {
    battleService.getBattles.mockReturnValue(of(mockBattles));
    fixture.detectChanges();

    const battleCards = fixture.nativeElement.querySelectorAll('.battle-card');
    expect(battleCards.length).toBe(1);
    expect(battleCards[0].querySelector('h2').textContent).toContain('Test Battle');
    expect(battleCards[0].querySelector('.battle-data span').textContent).toContain(
      'A mock battle',
    );
  });

  it('should display date range when battleType is TimeLimited', () => {
    const mockBattleWithDateRange: BattleCardData[] = [
      {
        ...mockBattles[0],
        battleTime: 2,
        dateRange: { start: new Date('2025-08-31'), end: new Date('2025-09-01') },
      },
    ];
    battleService.getBattles.mockReturnValue(of(mockBattleWithDateRange));
    fixture.detectChanges();

    const dateRangeElement = fixture.nativeElement.querySelector('.battle-card span.date-range');
    expect(dateRangeElement.textContent).toContain('31-08-2025 to 01-09-2025');
  });
});
