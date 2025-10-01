import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BattleResultComponent } from './battle-result.component';
import { Router, ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';
import { UserBattlesService } from '../../../services/user/user-battles/user-battles.service';
import { BattleHubService } from '../../../services/user/user-battles/battle-hub.service';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { Navigations } from '../../../shared/enums/navigation';

describe('BattleResultComponent', () => {
  let component: BattleResultComponent;
  let fixture: ComponentFixture<BattleResultComponent>;
  let mockRoute: any;
  let mockRouter: any;
  let mockUserBattleService: any;
  let mockBattleHubService: any;
  let mockSnackbar: any;

  beforeEach(async () => {
    mockRoute = { snapshot: { paramMap: { get: jest.fn() } } };
    mockRouter = { navigate: jest.fn() };
    mockUserBattleService = { getBattleResult: jest.fn() };
    mockBattleHubService = {
      connected: false,
      connect: jest.fn(),
      onBattleEnded: new Subject(),
      cleanupBattleSubjects: jest.fn(),
    };
    mockSnackbar = { showError: jest.fn(), showSuccess: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [BattleResultComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: Router, useValue: mockRouter },
        { provide: UserBattlesService, useValue: mockUserBattleService },
        { provide: BattleHubService, useValue: mockBattleHubService },
        { provide: SnackbarService, useValue: mockSnackbar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BattleResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  describe('decodeRouteId', () => {
    it('should decode valid battle id', () => {
      const id = btoa('123');
      mockRoute.snapshot.paramMap.get.mockReturnValue(encodeURIComponent(id));
      component['decodeRouteId']();
      expect(component.decodedBattleId).toBe(123);
    });

    it('should handle invalid battle id', () => {
      mockRoute.snapshot.paramMap.get.mockReturnValue('invalid');
      component['decodeRouteId']();
      expect(mockSnackbar.showError).toHaveBeenCalled();
    });
  });

  describe('checkInitialBattleStatus', () => {
    it('should navigate if result not ready', () => {
      component.decodedBattleId = 123;
      mockUserBattleService.getBattleResult.mockReturnValue(of({ result: false, data: null }));
      component['checkInitialBattleStatus']();
      expect(mockRouter.navigate).toHaveBeenCalled();
    });

    it('should set battleResult if result exists', () => {
      const data = { id: 1, winner: 'A' };
      component.decodedBattleId = 123;
      mockUserBattleService.getBattleResult.mockReturnValue(of({ result: true, data }));
      component['checkInitialBattleStatus']();
      expect(component.battleResult).toBeDefined();
      expect(component.loading).toBe(false);
    });
  });

  describe('timer', () => {
    jest.useFakeTimers();

    it('should countdown timer and navigate when finished', fakeAsync(() => {
      component.timeLeft = 2;
      component.startTimer();
      tick(1000);
      expect(component.timeLeft).toBe(1);
      tick(1000);
      expect(component.timeLeft).toBe(0);
      tick(1000);
      expect(mockRouter.navigate).toHaveBeenCalledWith([
        `${Navigations.User}/${Navigations.Dashboard}`,
      ]);
      component.stopTimer();
      jest.clearAllTimers();
    }));
  });

  describe('setupBattleHub', () => {
    it('should connect if not connected', () => {
      component['setupBattleHub']();
      expect(mockBattleHubService.connect).toHaveBeenCalled();
    });

    it('should handle battle ended event', () => {
      const spyFetch = jest.spyOn(component as any, 'fetchBattleResult');
      component['setupBattleHub']();
      mockBattleHubService.onBattleEnded.next({ battleStatus: 1 } as any);
      expect(mockSnackbar.showSuccess).toHaveBeenCalled();
      expect(spyFetch).toHaveBeenCalled();
    });
  });
});
