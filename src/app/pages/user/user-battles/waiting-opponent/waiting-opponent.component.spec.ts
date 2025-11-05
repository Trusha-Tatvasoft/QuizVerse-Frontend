import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { WaitingOpponetComponent } from './waiting-opponent.component';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { BattleHubService } from '../../../../services/user/user-battles/battle-hub.service';
import { CheatPreventionService } from '../../../../shared/service/cheat-prevention/cheat-prevention.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { platformMessages } from '../../../../utils/constants';
import { Navigations } from '../../../../shared/enums/navigation';

describe('WaitingOpponetComponent', () => {
  let component: WaitingOpponetComponent;
  let fixture: ComponentFixture<WaitingOpponetComponent>;

  // Mock dependencies
  const mockRouter = {
    navigate: jest.fn(),
  };

  const mockActivatedRoute = {
    snapshot: { paramMap: new Map() },
  };

  const mockSnackbar = {
    showError: jest.fn(),
    showInfo: jest.fn(),
    showSuccess: jest.fn(),
  };

  const mockBattleHub = {
    connected: false,
    connect: jest.fn(),
    onRequestAccepted: new Subject<any>(),
    onRequestAcceptedConfirmation: new Subject<any>(),
    onBattleStarted: new Subject<any>(),
  };

  const mockCheatPrevention = {
    startMonitoring: jest.fn(),
    violations$: new Subject<string>(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaitingOpponetComponent],
      providers: [
        { provide: SnackbarService, useValue: mockSnackbar },
        { provide: BattleHubService, useValue: mockBattleHub },
        { provide: CheatPreventionService, useValue: mockCheatPrevention },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WaitingOpponetComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should start monitoring and subscribe to violations on init', async () => {
    const connectSpy = jest
      .spyOn<any, any>(component as any, 'connectToHub')
      .mockResolvedValue(undefined);
    const decodeSpy = jest.spyOn<any, any>(component as any, 'decodeRouteId').mockImplementation();

    await component.ngOnInit();

    expect(mockCheatPrevention.startMonitoring).toHaveBeenCalled();
    expect(connectSpy).toHaveBeenCalled();
    expect(decodeSpy).toHaveBeenCalled();
  });

  it('should increment searchSeconds and timeout after 30 seconds', fakeAsync(() => {
    const navigateSpy = jest.spyOn(mockRouter, 'navigate');

    component['startSearchTimer']();
    tick(30000);
    expect(component.isSearchTimeOut).toBe(true);
    expect(mockSnackbar.showInfo).toHaveBeenCalledWith(
      'No opponent found. Redirecting to dashboard...',
    );
    tick(1500);
    expect(navigateSpy).toHaveBeenCalledWith([
      Navigations.User,
      Navigations.Battles,
      Navigations.BattleList,
    ]);
    component['stopTimer']();
  }));

  it('should stop timer properly', () => {
    component['timerInterval'] = setInterval(() => {}, 1000);
    component['stopTimer']();
    expect(component['timerInterval']).toBeNull();
  });

  it('should connect to hub and handle events correctly', async () => {
    mockBattleHub.connected = false;
    mockBattleHub.connect.mockResolvedValueOnce(undefined);

    await component['connectToHub']();

    mockBattleHub.onRequestAccepted.next({
      receiverId: 1,
      battleRequest: { senderFullName: 'John' },
    });
    expect(mockSnackbar.showSuccess).toHaveBeenCalledWith('John accepted the battle request!');

    mockBattleHub.onRequestAcceptedConfirmation.next({
      senderId: 1,
      battleRequest: { senderFullName: 'Alex' },
    });
    expect(mockSnackbar.showSuccess).toHaveBeenCalledWith('Alex accepted the battle request!');
  });

  it('should handle error in connectToHub', async () => {
    mockBattleHub.connect.mockRejectedValueOnce(new Error('Connection failed'));
    await component['connectToHub']();
    expect(mockSnackbar.showError).toHaveBeenCalledWith('Connection failed');
  });

  it('should decode route id and set battleId', () => {
    const encodedId = btoa('10');
    mockActivatedRoute.snapshot.paramMap.get = jest
      .fn()
      .mockReturnValue(encodeURIComponent(encodedId));

    history.replaceState({ battleData: { sample: true } }, '');
    component['decodeRouteId']();

    expect(component.battleId).toBe(10);
    expect(component.battleData).toEqual({ sample: true });
  });

  it('should handle invalid id', () => {
    mockActivatedRoute.snapshot.paramMap.get = jest.fn().mockReturnValue('invalid');
    const navigateSpy = jest.spyOn(mockRouter, 'navigate');

    component['decodeRouteId']();
    expect(mockSnackbar.showError).toHaveBeenCalledWith(platformMessages.invalideBattleId);
    expect(navigateSpy).toHaveBeenCalledWith([
      Navigations.User,
      Navigations.Battles,
      Navigations.BattleList,
    ]);
  });

  it('should call any available fullscreen method', () => {
    const elem = document.documentElement as any;
    elem.requestFullscreen = jest.fn();
    elem.webkitRequestFullscreen = jest.fn();
    elem.msRequestFullscreen = jest.fn();

    component.openFullscreen();

    expect(
      elem.requestFullscreen || elem.webkitRequestFullscreen || elem.msRequestFullscreen,
    ).toBeDefined();
  });
});
