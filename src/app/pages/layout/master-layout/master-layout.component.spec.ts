import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BattleRequestNotificationsComponent } from '../../user/battle-request-notifications/battle-request-notifications.component';
import { IncomingBattleRequest } from '../../../shared/interfaces/incoming-battle-request.interface';
import { BattleHubService } from '../../../services/user/user-battles/battle-hub.service';
import { of, Subject } from 'rxjs';
import { IncomingRequestNotificationComponent } from '../../../shared/components/incoming-request-notification/incoming-request-notification.component';
import { CommonModule } from '@angular/common';

jest.useFakeTimers();

describe('BattleRequestNotificationsComponent', () => {
  let component: BattleRequestNotificationsComponent;
  let fixture: ComponentFixture<BattleRequestNotificationsComponent>;
  let battleHubServiceMock: Partial<BattleHubService>;
  let battleRequests$: Subject<IncomingBattleRequest[]>;

  const mockRequest: IncomingBattleRequest = {
    requestId: 2,
    senderUserName: 'john_doe',
    senderFullName: 'John Doe',
    senderId: 3,
    battleId: 4,
    senderProfilePic: 'https://example.com/avatar.jpg',
    battleName: 'Battle of Minds',
    battleCategory: 'General Knowledge',
    battleDifficulty: 'Medium',
    sendingDate: new Date(),
    timeAgo: '2 minutes ago',
  };

  beforeEach(async () => {
    battleRequests$ = new Subject<IncomingBattleRequest[]>();

    battleHubServiceMock = {
      connect: jest.fn(),
      onBattleRequest: battleRequests$,
      acceptRequest: jest.fn(),
      declineRequest: jest.fn(),
      removeIncomingRequest: jest.fn(),
      cleanupIncomingRequests: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        BattleRequestNotificationsComponent,
        IncomingRequestNotificationComponent,
        CommonModule,
      ],
      providers: [{ provide: BattleHubService, useValue: battleHubServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(BattleRequestNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should connect to BattleHubService on init', () => {
    component.ngOnInit();
    expect(battleHubServiceMock.connect).toHaveBeenCalled();
  });

  it('should add a new notification from hub', () => {
    component.ngOnInit();
    battleRequests$.next([mockRequest]);

    expect(component.notifications.length).toBe(1);
    expect(component.notifications[0]).toEqual(mockRequest);
  });

  it('should not add duplicate notifications', () => {
    component.addNotification(mockRequest);
    component.addNotification(mockRequest);
    expect(component.notifications.length).toBe(1);
  });

  it('should auto-remove notification after 30s', () => {
    component.addNotification(mockRequest);
    expect(component.notifications.length).toBe(1);

    jest.advanceTimersByTime(30000);
    expect(component.notifications.length).toBe(0);
    expect(battleHubServiceMock.removeIncomingRequest).toHaveBeenCalledWith(mockRequest.requestId);
  });

  it('removeNotification should remove notification immediately', () => {
    component.addNotification(mockRequest);
    expect(component.notifications.length).toBe(1);

    component.removeNotification(mockRequest);
    expect(component.notifications.length).toBe(0);
    expect(battleHubServiceMock.removeIncomingRequest).toHaveBeenCalledWith(mockRequest.requestId);
  });

  it('acceptRequest should call service and remove notification', () => {
    component.addNotification(mockRequest);

    component.acceptRequest(mockRequest);
    expect(battleHubServiceMock.acceptRequest).toHaveBeenCalledWith(mockRequest);
    expect(component.notifications.length).toBe(0);
  });

  it('declineRequest should call service and remove notification', () => {
    component.addNotification(mockRequest);

    component.declineRequest(mockRequest);
    expect(battleHubServiceMock.declineRequest).toHaveBeenCalledWith(mockRequest.requestId);
    expect(component.notifications.length).toBe(0);
  });

  it('ngOnDestroy should complete destroy$ subject', () => {
    const completeSpy = jest.spyOn(component['destroy$'], 'complete');
    const nextSpy = jest.spyOn(component['destroy$'], 'next');

    component.ngOnDestroy();
    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});
