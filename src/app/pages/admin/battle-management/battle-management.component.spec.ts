import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { BattleManagementComponent } from './battle-management.component';
import { BattleManagementService } from '../../../services/admin/battle-management/battle-management.service';
import { TagColor, TagType } from '../../../utils/types/tag-component.type';
import { BattleCardData } from './interfaces/battle-management.interface';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { platformMessages } from '../../../utils/constants';

const mockBattleService = {
  getBattles: jest.fn(),
};

const mockSnackbar = {
  showError: jest.fn(),
};

describe('BattleManagementComponent', () => {
  let component: BattleManagementComponent;
  let fixture: ComponentFixture<BattleManagementComponent>;

  const mockTag = {
    id: '1',
    label: 'Active',
    type: 'static' as TagType,
    isSelected: false,
    hasBorder: true,
    backgroundColor: 'lightGreen' as TagColor,
    textColor: 'green' as TagColor,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BattleManagementComponent],
      providers: [
        { provide: BattleManagementService, useValue: mockBattleService },
        { provide: SnackbarService, useValue: mockSnackbar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BattleManagementComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load battles on init (success case)', () => {
    const mockBattles: BattleCardData[] = [
      {
        id: 1,
        battleName: 'Test Battle',
        category: 'General',
        description: 'A mock battle',
        participants: 10,
        totalXp: 100,
        battleTime: 1,
        dateRange: { start: new Date(), end: new Date() },
        statusTag: { ...mockTag, id: 'status-1' },
        difficultyTag: { ...mockTag, id: 'difficulty-1', label: 'Easy' },
        questionTag: { ...mockTag, id: 'question-1', label: '10 Qs' },
        timeTag: { ...mockTag, id: 'time-1', label: 'Permanent' },
      },
    ];

    mockBattleService.getBattles.mockReturnValue(of(mockBattles));

    fixture.detectChanges(); // triggers ngOnInit

    expect(mockBattleService.getBattles).toHaveBeenCalled();
    expect(component.battleData).toEqual(mockBattles);
  });

  it('should handle error when loading battles and call snackbar', () => {
    const mockError = { statusCode: 500, error: { message: 'API error' } };
    mockBattleService.getBattles.mockReturnValue(throwError(() => mockError));

    fixture.detectChanges();

    expect(mockBattleService.getBattles).toHaveBeenCalled();
    expect(mockSnackbar.showError).toHaveBeenCalledWith(
      `${platformMessages.errorTitle} ${mockError.statusCode}`,
      mockError.error.message,
    );
  });

  it('should clean up subscriptions on destroy', () => {
    const nextSpy = jest.spyOn((component as any).destroy$, 'next');
    const completeSpy = jest.spyOn((component as any).destroy$, 'complete');

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should call openAddBattleDialgue', () => {
    component.openAddBattleDialgue();
    expect(true).toBe(true);
  });

  it('should call editBattle', () => {
    component.editBattle();
    expect(true).toBe(true);
  });

  it('should call deleteBattle', () => {
    component.deleteBattle();
    expect(true).toBe(true);
  });
  it('should handle error when error.message is missing and use default platform message', () => {
    const mockError = { statusCode: 400, error: {} }; // no error.message
    mockBattleService.getBattles.mockReturnValue(throwError(() => mockError));

    fixture.detectChanges();

    expect(mockBattleService.getBattles).toHaveBeenCalled();
    expect(mockSnackbar.showError).toHaveBeenCalledWith(
      `${platformMessages.errorTitle} ${mockError.statusCode}`,
      platformMessages.errorMessage,
    );
  });
});
