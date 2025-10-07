import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WaitingBattleResultComponent } from './waiting-battle-result.component';
import { ActivatedRoute, Router } from '@angular/router';
import { BattleHubService } from '../../../../../services/user/user-battles/battle-hub.service';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { Subject } from 'rxjs';
import { Navigations } from '../../../../../shared/enums/navigation';
import { platformMessages } from '../../../../../utils/constants';
import { UserBattlesService } from '../../../../../services/user/user-battles/user-battles.service';

describe('WaitingBattleResultComponent', () => {
  let component: WaitingBattleResultComponent;
  let fixture: ComponentFixture<WaitingBattleResultComponent>;

  let mockRouter: any;
  let mockBattleHubService: any;
  let mockSnackbarService: any;
  let mockUserBattleService: any;

  let mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: jest.fn(() => encodeURIComponent(btoa('123'))), // default valid id
      },
    },
  };

  beforeEach(async () => {
    mockRouter = { navigate: jest.fn() };
    mockBattleHubService = {
      connected: false,
      connect: jest.fn(),
      onBattleEnded: new Subject(),
      cleanupBattleSubjects: jest.fn(),
      stopConnection: jest.fn(),
    };
    mockSnackbarService = {
      showError: jest.fn(),
      showSuccess: jest.fn(),
    };
    mockUserBattleService = { getBattleResult: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [WaitingBattleResultComponent],
      providers: [
        { provide: UserBattlesService, useValue: mockUserBattleService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: BattleHubService, useValue: mockBattleHubService },
        { provide: SnackbarService, useValue: mockSnackbarService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WaitingBattleResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('decodeRouteId', () => {
    it('should decode valid base64 route ID', () => {
      const id = btoa('123');
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue(encodeURIComponent(id));

      component.decodeRouteId();

      expect(component.decodedBattleId).toBe(123);
    });

    it('should set decodedBattleId=0 and show error for invalid base64 string', () => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue('%%%invalid%%%');

      component.decodeRouteId();

      expect(component.decodedBattleId).toBe(0);
      expect(mockSnackbarService.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        platformMessages.invalidBattleId,
      );
    });

    it('should set decodedBattleId=0 and show error if no ID present', () => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue('');

      component.decodeRouteId();

      expect(component.decodedBattleId).toBe(0);
      expect(mockSnackbarService.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        platformMessages.invalidBattleId,
      );
    });
  });

  describe('ngOnInit', () => {
    it('should connect to BattleHub if not connected', () => {
      component.ngOnInit();
      expect(mockBattleHubService.connect).toHaveBeenCalled();
    });

    it('should not navigate if battleStatus is 0', () => {
      component.decodedBattleId = 123;
      component.ngOnInit();

      mockBattleHubService.onBattleEnded.next({ battleStatus: 0 });
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('redirectToDashboard', () => {
    it('should navigate to dashboard', () => {
      component.redirectToDashboard();
      expect(mockRouter.navigate).toHaveBeenCalledWith([
        `${Navigations.User}/${Navigations.Dashboard}`,
      ]);
    });
  });

  describe('ngOnDestroy', () => {
    it('should cleanup subjects and stop connection', () => {
      component.ngOnDestroy();
      expect(mockBattleHubService.cleanupBattleSubjects).toHaveBeenCalled();
    });
  });
});
