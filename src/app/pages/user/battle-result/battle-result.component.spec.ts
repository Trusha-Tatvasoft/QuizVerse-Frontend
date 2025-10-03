import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BattleResultComponent } from './battle-result.component';
import { Router, ActivatedRoute } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
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

  describe('ngOnInit', () => {
    it('should call decodeRouteId and setup if decodedBattleId > 0', () => {
      // mock decodeRouteId to set battleId
      const spyDecode = jest.spyOn(component as any, 'decodeRouteId').mockImplementation(() => {
        component.decodedBattleId = 123;
      });

      // mock getBattleResult so checkInitialBattleStatus() doesn’t crash
      mockUserBattleService.getBattleResult.mockReturnValue(of({ result: false, data: null }));

      const spyCheck = jest.spyOn(component as any, 'checkInitialBattleStatus');
      const spySetup = jest.spyOn(component as any, 'setupBattleHub');

      component.ngOnInit();

      expect(spyDecode).toHaveBeenCalled();
      expect(spyCheck).toHaveBeenCalled();
      expect(spySetup).toHaveBeenCalled();
    });

    it('should not call setup if decodedBattleId <= 0', () => {
      jest.spyOn(component as any, 'decodeRouteId').mockImplementation(() => {
        component.decodedBattleId = 0;
      });
      const spyCheck = jest.spyOn(component as any, 'checkInitialBattleStatus');
      component.ngOnInit();
      expect(spyCheck).not.toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should cleanup resources', () => {
      const spyStop = jest.spyOn(component, 'stopTimer');
      component.ngOnDestroy();
      expect(spyStop).toHaveBeenCalled();
      expect(mockBattleHubService.cleanupBattleSubjects).toHaveBeenCalled();
    });
  });

  describe('decodeRouteId', () => {
    it('should decode valid battle id', () => {
      const id = btoa('123');
      mockRoute.snapshot.paramMap.get.mockReturnValue(encodeURIComponent(id));
      component['decodeRouteId']();
      expect(component.decodedBattleId).toBe(123);
    });

    it('should handle invalid id string', () => {
      mockRoute.snapshot.paramMap.get.mockReturnValue('invalid');
      component['decodeRouteId']();
      expect(mockSnackbar.showError).toHaveBeenCalled();
    });

    it('should handle non-numeric decoded value', () => {
      const id = btoa('abc');
      mockRoute.snapshot.paramMap.get.mockReturnValue(encodeURIComponent(id));
      component['decodeRouteId']();
      expect(mockSnackbar.showError).toHaveBeenCalled();
    });

    it('should handle missing id', () => {
      mockRoute.snapshot.paramMap.get.mockReturnValue(null);
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

    it('should handle error with "running" message', () => {
      component.decodedBattleId = 123;
      mockUserBattleService.getBattleResult.mockReturnValue(
        throwError(() => ({ status: 400, error: { message: 'battle running' } })),
      );
      component['checkInitialBattleStatus']();
      expect(mockRouter.navigate).toHaveBeenCalled();
    });

    it('should handle generic error', () => {
      component.decodedBattleId = 123;
      mockUserBattleService.getBattleResult.mockReturnValue(throwError(() => ({ status: 500 })));
      component['checkInitialBattleStatus']();
      expect(mockSnackbar.showError).toHaveBeenCalled();
    });
  });

  describe('fetchBattleResult', () => {
    it('should set battle result on success', () => {
      const data = { id: 1, winner: 'A' };
      mockUserBattleService.getBattleResult.mockReturnValue(of({ result: true, data }));
      component['fetchBattleResult']();
      expect(component.battleResult).toBeDefined();
    });

    it('should navigate if no result', fakeAsync(() => {
      component.decodedBattleId = 123; // <-- set valid id
      mockUserBattleService.getBattleResult.mockReturnValue(of({ result: false, data: null }));

      component['fetchBattleResult']();
      tick();

      expect(mockRouter.navigate).toHaveBeenCalled();
    }));
    it('should show error on failure', () => {
      mockUserBattleService.getBattleResult.mockReturnValue(throwError(() => new Error('fail')));
      component['fetchBattleResult']();
      expect(mockSnackbar.showError).toHaveBeenCalled();
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

    it('should handle battle ended event with status > 0', () => {
      const spyFetch = jest.spyOn(component as any, 'fetchBattleResult');
      component['setupBattleHub']();
      mockBattleHubService.onBattleEnded.next({ battleStatus: 1 } as any);
      expect(mockSnackbar.showSuccess).toHaveBeenCalled();
      expect(spyFetch).toHaveBeenCalled();
    });

    it('should navigate if battle not completed', () => {
      component.decodedBattleId = 123;
      component['setupBattleHub']();
      mockBattleHubService.onBattleEnded.next({ battleStatus: 0 } as any);
      expect(mockRouter.navigate).toHaveBeenCalled();
    });
  });

  describe('utility functions', () => {
    it('formatTime should return mm:ss format', () => {
      component.timeLeft = 65;
      expect(component.formatTime()).toBe('1:05');
    });

    it('getInitials should return ? for empty string', () => {
      expect(component.getInitials('')).toBe('?');
    });

    it('getInitials should return first letter for single word', () => {
      expect(component.getInitials('Alice')).toBe('A');
    });

    it('getInitials should return initials for multiple words', () => {
      expect(component.getInitials('Alice Bob')).toBe('AB');
    });
  });
});
