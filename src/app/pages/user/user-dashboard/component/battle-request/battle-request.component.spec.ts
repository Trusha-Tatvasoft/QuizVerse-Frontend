import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { BattleRequestComponent } from './battle-request.component';
import { UserDashboardService } from '../../../../../services/user/user-dashboard/user-dashboard.service';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { BattleRequest } from '../../interfaces/battle-request.interface';
import { environment } from '../../../../../../environments/environment.dev';
import { battleRequestMessages, platformMessages } from '../../../../../utils/constants';

describe('BattleRequestComponent (Jest)', () => {
  let component: BattleRequestComponent;
  let fixture: ComponentFixture<BattleRequestComponent>;
  let mockDashboardService: jest.Mocked<UserDashboardService>;
  let mockSnackbarService: jest.Mocked<SnackbarService>;

  const mockRequests: BattleRequest[] = [
    {
      requestId: 1,
      senderUserName: 'john123',
      senderFullName: 'John Doe',
      senderProfilePic: 'profile/john.png',
      battleCategory: 'Math',
      battleDifficulty: 'Easy',
      timeAgo: '2h ago',
      sendingDate: '2025-09-01T10:00:00Z',
    },
  ];

  beforeEach(async () => {
    mockDashboardService = {
      getBattleRequests: jest.fn(),
      updateBattleRequestStatus: jest.fn(),
    } as unknown as jest.Mocked<UserDashboardService>;

    mockSnackbarService = {
      showSuccess: jest.fn(),
      showError: jest.fn(),
    } as unknown as jest.Mocked<SnackbarService>;

    await TestBed.configureTestingModule({
      imports: [BattleRequestComponent],
      providers: [
        { provide: UserDashboardService, useValue: mockDashboardService },
        { provide: SnackbarService, useValue: mockSnackbarService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BattleRequestComponent);
    component = fixture.componentInstance;
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

    it('should set empty requests when API fails', () => {
      mockDashboardService.getBattleRequests.mockReturnValue(
        throwError(() => new Error('API Error')),
      );

      component.loadBattleRequests();

      expect(component.requests).toHaveLength(0);
    });
  });

  describe('acceptRequest', () => {
    it('should call update service and show success message on success', () => {
      const req = { ...mockRequests[0], requestId: 1 } as any;
      mockDashboardService.updateBattleRequestStatus.mockReturnValue(
        of({ result: true, data: true, statusCode: 200, message: '' }),
      );
      const loadSpy = jest.spyOn(component, 'loadBattleRequests');

      component.acceptRequest(req);

      expect(mockDashboardService.updateBattleRequestStatus).toHaveBeenCalledWith({
        requestId: 1,
        status: 1,
      });
      expect(mockSnackbarService.showSuccess).toHaveBeenCalledWith(
        platformMessages.successTitle,
        battleRequestMessages.accepted(req.senderUserName),
      );
      expect(loadSpy).toHaveBeenCalled();
    });

    it('should show error message on failure', () => {
      const req = { ...mockRequests[0], requestId: 1 } as any;
      mockDashboardService.updateBattleRequestStatus.mockReturnValue(
        throwError(() => new Error('API error')),
      );

      component.acceptRequest(req);

      expect(mockSnackbarService.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        battleRequestMessages.acceptFailed(req.senderUserName),
      );
    });
  });

  describe('declineRequest', () => {
    it('should call update service and show success message on success', () => {
      const req = { ...mockRequests[0], requestId: 1 } as any;
      mockDashboardService.updateBattleRequestStatus.mockReturnValue(
        of({ result: true, data: true, statusCode: 200, message: '' }),
      );
      const loadSpy = jest.spyOn(component, 'loadBattleRequests');

      component.declineRequest(req);

      expect(mockDashboardService.updateBattleRequestStatus).toHaveBeenCalledWith({
        requestId: 1,
        status: 2,
      });
      expect(mockSnackbarService.showSuccess).toHaveBeenCalledWith(
        platformMessages.successTitle,
        battleRequestMessages.declined(req.senderUserName),
      );
      expect(loadSpy).toHaveBeenCalled();
    });

    it('should show error message on failure', () => {
      const req = { ...mockRequests[0], requestId: 1 } as any;
      mockDashboardService.updateBattleRequestStatus.mockReturnValue(
        throwError(() => new Error('API error')),
      );

      component.declineRequest(req);

      expect(mockSnackbarService.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        battleRequestMessages.declineFailed(req.senderUserName),
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
});
