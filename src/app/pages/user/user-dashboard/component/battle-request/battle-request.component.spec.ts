import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError, Subject } from 'rxjs';
import { BattleRequestComponent } from './battle-request.component';
import { UserDashboardService } from '../../../../../services/user/user-dashboard/user-dashboard.service';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { BattleHubService } from '../../../../../services/user/user-battles/battle-hub.service';
import { environment } from '../../../../../../environments/environment.dev';
import { battleRequestMessages, platformMessages } from '../../../../../utils/constants';
import { IncomingBattleRequest } from '../../../../../shared/interfaces/incoming-battle-request.interface';
import { BattleRequestStatus } from '../../../../../shared/enums/user-dashboard.enum';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FilledButtonComponent } from '../../../../../shared/components/filled-button/filled-button.component';
import { OutlineButtonComponent } from '../../../../../shared/components/outline-button/outline-button.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

describe('BattleRequestComponent (Jest)', () => {
  let component: BattleRequestComponent;
  let fixture: ComponentFixture<BattleRequestComponent>;
  let mockDashboardService: jest.Mocked<UserDashboardService>;
  let mockSnackbarService: jest.Mocked<SnackbarService>;
  let mockBattleHubService: jest.Mocked<BattleHubService>;
  let onBattleRequestSubject: Subject<IncomingBattleRequest[]>;

  const mockRequests: IncomingBattleRequest[] = [
    {
      requestId: 1,
      senderUserName: 'john123',
      senderFullName: 'John Doe',
      senderProfilePic: 'profile/john.png',
      battleCategory: 'Math',
      senderId: 5,
      battleId: 10,
      battleDifficulty: 'Easy',
      timeAgo: '2h ago',
      sendingDate: new Date('2025-09-01T10:00:00Z'),
      battleName: 'Algebra Battle',
    },
  ];

  beforeEach(async () => {
    onBattleRequestSubject = new Subject<IncomingBattleRequest[]>();
    // Mock services
    mockDashboardService = {
      getBattleRequests: jest.fn().mockReturnValue(of({ result: true, data: mockRequests }) as any),
      updateBattleRequestStatus: jest.fn().mockReturnValue(of({ result: true, data: {} }) as any),
    } as unknown as jest.Mocked<UserDashboardService>;

    mockSnackbarService = {
      showSuccess: jest.fn(),
      showError: jest.fn(),
    } as unknown as jest.Mocked<SnackbarService>;

    mockBattleHubService = {
      ensureConnection: jest.fn().mockResolvedValue(void 0),
      onBattleRequest: onBattleRequestSubject,
      cleanupIncomingRequests: jest.fn(),
      acceptRequest: jest.fn(),
      declineRequest: jest.fn(),
    } as unknown as jest.Mocked<BattleHubService>;

    await TestBed.configureTestingModule({
      imports: [
        MatIconModule,
        CommonModule,
        FilledButtonComponent,
        OutlineButtonComponent,
        MatTooltipModule,
      ],
    })
      .overrideProvider(UserDashboardService, { useValue: mockDashboardService })
      .overrideProvider(SnackbarService, { useValue: mockSnackbarService })
      .overrideProvider(BattleHubService, { useValue: mockBattleHubService })
      .compileComponents();

    fixture = TestBed.createComponent(BattleRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  describe('loadBattleRequests', () => {
    it('should map requests with image and initials when API returns data', () => {
      mockDashboardService.getBattleRequests.mockReturnValue(
        of({ result: true, data: mockRequests, message: '', statusCode: 200 }),
      );

      component.loadBattleRequests();

      expect(component.requests).toHaveLength(1);
      expect(component.requests[0].displayImage).toBe(
        `${environment.imageBaseUrl}/profile/john.png`,
      );
      expect(component.requests[0].initials).toBe('JD');
      expect(component.requests[0].initialsColor).toMatch(/bg-avatar-/);
    });
  });

  describe('acceptRequest', () => {
    it('should call decline request via hub and show success message', () => {
      const req = { requestId: 1, senderUserName: 'John' } as any;
      const loadSpy = jest.spyOn(component, 'loadBattleRequests');

      mockBattleHubService.declineRequest.mockImplementation(() => {}); // mock hub call

      component.declineRequest(req);

      expect(mockBattleHubService.declineRequest).toHaveBeenCalledWith(1);
      expect(mockSnackbarService.showSuccess).toHaveBeenCalledWith(
        platformMessages.successTitle,
        battleRequestMessages.declined('John'),
      );
      expect(loadSpy).not.toHaveBeenCalled(); // hub version doesn’t reload
    });

    it('should show success message when request is accepted', () => {
      const req = { requestId: 1, senderUserName: 'john123' } as any;
      component.requests = [req];

      component.acceptRequest(req);

      expect(mockBattleHubService.acceptRequest).toHaveBeenCalledWith(req);
      expect(mockSnackbarService.showSuccess).toHaveBeenCalledWith(
        platformMessages.successTitle,
        battleRequestMessages.accepted(req.senderUserName),
      );
    });
  });

  describe('declineRequest', () => {
    it('should call battleHubService.declineRequest and show success message on success', () => {
      const req = { requestId: 1, senderUserName: 'John' } as any;
      component.requests = [req];

      component.declineRequest(req);

      expect(mockBattleHubService.declineRequest).toHaveBeenCalledWith(1);
      expect(component.requests).toEqual([]);
      expect(mockSnackbarService.showSuccess).toHaveBeenCalledWith(
        platformMessages.successTitle,
        battleRequestMessages.declined('John'),
      );
    });
  });

  describe('handleImageError', () => {
    it('should remove displayImage and hide broken img element', () => {
      const req: any = { displayImage: 'broken.png' };
      const mockImg = document.createElement('img');
      const mockEvent = { target: mockImg } as unknown as Event;

      component.handleImageError(mockEvent, req);

      expect(req.displayImage).toBeNull();
      expect(mockImg.style.display).toBe('none');
    });
  });

  describe('utility methods', () => {
    it('getInitials should return initials for full name', () => {
      expect((component as any).getInitials('John Doe')).toBe('JD');
    });

    it('getInitials should return single initial when only one word', () => {
      expect((component as any).getInitials('John')).toBe('J');
    });

    it('getInitialsColorClass should return consistent class for same name', () => {
      const class1 = (component as any).getInitialsColorClass('John Doe');
      const class2 = (component as any).getInitialsColorClass('John Doe');
      expect(class1).toBe(class2);
      expect(class1).toMatch(/bg-avatar-/);
    });
  });

  describe('subscribeToBattleHub', () => {
    it('should add new requests from hub', (done) => {
      const newRequest: IncomingBattleRequest = {
        requestId: 2,
        senderUserName: 'jane456',
        battleId: 4,
        senderId: 5,
        senderFullName: 'Jane Smith',
        senderProfilePic: 'profile/jane.png',
        battleCategory: 'Coding',
        battleDifficulty: 'Medium',
        timeAgo: '1h ago',
        sendingDate: new Date(),
        battleName: 'JS Battle',
      };

      component.subscribeToBattleHub();

      (mockBattleHubService.onBattleRequest as Subject<IncomingBattleRequest[]>).next([newRequest]);

      setTimeout(() => {
        expect(component.requests[0].senderUserName).toBe('jane456');
        expect(component.requests[0].displayImage).toBe('profile/jane.png');
        done();
      }, 0);
    });
  });
});
