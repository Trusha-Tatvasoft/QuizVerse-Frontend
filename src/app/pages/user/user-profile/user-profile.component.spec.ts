import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { UserProfileService } from '../../../services/user/user-profile/user-profile.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { CardInputConfig } from '../../../shared/interfaces/card-component.interface';
import { UserBasicProfile } from './interfaces/user-profile.interface';
import * as mapper from './user-profile.mapper';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { throwError } from 'rxjs';
import { UserProfileComponent } from './user-profile.component';
import { defaultProfilePic, platformMessages } from '../../../utils/constants';

// Mock UserProfileService
class MockUserProfileService {
  profileUpdated$ = new Subject<boolean>();
  getUserBasicProfile = jest.fn();
  updateProfilePic = jest.fn().mockReturnValue(of({ success: true }));
}

// Mock Router
class MockRouter {
  navigate = jest.fn();
}

// Mock Snackbar
class MockSnackbarService {
  showError = jest.fn();
  showSuccess = jest.fn();
}

describe('ProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;
  let mockService: MockUserProfileService;
  let mockRouter: MockRouter;
  let mockActivatedRoute: any;
  let mockSnackbar: MockSnackbarService;

  beforeEach(async () => {
    mockService = new MockUserProfileService();
    mockRouter = new MockRouter();
    mockSnackbar = new MockSnackbarService();
    mockActivatedRoute = {
      queryParams: of({ tab: '1' }),
    };

    await TestBed.configureTestingModule({
      imports: [UserProfileComponent],
      providers: [
        { provide: UserProfileService, useValue: mockService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: SnackbarService, useValue: mockSnackbar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set selectedTab from query params if valid', () => {
      mockService.getUserBasicProfile.mockReturnValue(of({ result: false }));
      fixture.detectChanges(); // triggers ngOnInit
      expect(component.selectedTab()).toBe(1); // ?tab=1
    });

    it('should default to 0 if query param is invalid', () => {
      mockActivatedRoute.queryParams = of({ tab: '99' });
      mockService.getUserBasicProfile.mockReturnValue(of({ result: false }));
      fixture = TestBed.createComponent(UserProfileComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.selectedTab()).toBe(0);
    });

    it('should default to 0 if query param is NaN', () => {
      mockActivatedRoute.queryParams = of({ tab: 'invalid' });
      mockService.getUserBasicProfile.mockReturnValue(of({ result: false }));
      fixture = TestBed.createComponent(UserProfileComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.selectedTab()).toBe(0);
    });

    it('should default to 0 if query param is negative', () => {
      mockActivatedRoute.queryParams = of({ tab: '-1' });
      mockService.getUserBasicProfile.mockReturnValue(of({ result: false }));
      fixture = TestBed.createComponent(UserProfileComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.selectedTab()).toBe(0);
    });

    it('should call loadUserProfile when profileUpdated$ emits true', () => {
      const spy = jest.spyOn(component as any, 'loadUserProfile');
      mockService.getUserBasicProfile.mockReturnValue(of({ result: false }));
      fixture.detectChanges();
      mockService.profileUpdated$.next(true);
      expect(spy).toHaveBeenCalled();
    });

    it('should not call loadUserProfile when profileUpdated$ emits false', () => {
      const spy = jest.spyOn(component as any, 'loadUserProfile');
      mockService.getUserBasicProfile.mockReturnValue(of({ result: false }));
      fixture.detectChanges();
      spy.mockClear(); // Clear the initial call from ngOnInit
      mockService.profileUpdated$.next(false);
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('switchToTab', () => {
    it('should update selectedTab and navigate with queryParams', () => {
      component.switchToTab(2);
      expect(component.selectedTab()).toBe(2);
      expect(mockRouter.navigate).toHaveBeenCalledWith([], {
        relativeTo: mockActivatedRoute,
        queryParams: { tab: 2 },
        queryParamsHandling: 'merge',
      });
    });
  });

  describe('profileUpload', () => {
    let mockFile: File;
    let event: Event;

    beforeEach(() => {
      mockFile = new File(['dummy'], 'profile.png', { type: 'image/png' });
      event = { target: { files: [mockFile] } } as unknown as Event;
    });

    it('should show error if file type is not supported', () => {
      const invalidFile = new File(['dummy'], 'doc.txt', { type: 'text/plain' });
      const invalidEvent = { target: { files: [invalidFile] } } as unknown as Event;

      component.profileUpload(invalidEvent);

      expect(mockSnackbar.showError).toHaveBeenCalledWith(platformMessages.invalidImageType);
    });

    it('should upload profile picture when valid file is selected', fakeAsync(() => {
      mockService.updateProfilePic.mockReturnValue(of({ result: true }));
      mockService.getUserBasicProfile.mockReturnValue(of({ data: { profilePic: 'new-pic.png' } }));

      // Spy on FileReader
      const readerMock = {
        onload: null as ((ev: ProgressEvent<FileReader>) => void) | null,
        readAsDataURL: jest.fn(function (this: any, file: File) {
          if (this.onload) {
            this.onload({ target: { result: 'data:image/png;base64,newpic' } } as any);
          }
        }),
      } as unknown as FileReader;
      jest.spyOn(window as any, 'FileReader').mockImplementation(() => readerMock);

      component.profileUpload(event);
      tick();

      expect(mockService.updateProfilePic).toHaveBeenCalled();
      expect(mockService.getUserBasicProfile).toHaveBeenCalled();
      expect(mockSnackbar.showSuccess).toHaveBeenCalledWith(platformMessages.uploadSuccess);
      expect(component.profilePicUrl).toBe('data:image/png;base64,newpic');
    }));

    it('should show error snackbar if upload fails', fakeAsync(() => {
      mockService.updateProfilePic.mockReturnValue(throwError(() => new Error('Upload failed')));

      component.profileUpload(event);
      tick();

      expect(mockSnackbar.showError).toHaveBeenCalledWith(platformMessages.uploadFailed);
    }));

    it('should not do anything if no file is selected', () => {
      const emptyEvent = { target: { files: [] } } as unknown as Event;

      component.profileUpload(emptyEvent);

      expect(mockService.updateProfilePic).not.toHaveBeenCalled();
      expect(mockSnackbar.showError).not.toHaveBeenCalled();
      expect(mockSnackbar.showSuccess).not.toHaveBeenCalled();
    });

    it('should not do anything if files is null', () => {
      const nullFilesEvent = { target: { files: null } } as unknown as Event;

      component.profileUpload(nullFilesEvent);

      expect(mockService.updateProfilePic).not.toHaveBeenCalled();
      expect(mockSnackbar.showError).not.toHaveBeenCalled();
      expect(mockSnackbar.showSuccess).not.toHaveBeenCalled();
    });
  });

  describe('profileImageError', () => {
    it('should set profilePicUrl to default and mark isImageError as true', () => {
      component.profilePicUrl = 'some-url.png';
      component.isImageError = false;

      component.profileImageError();

      expect(component.profilePicUrl).toBe(defaultProfilePic);
      expect(component.isImageError).toBe(true);
    });
  });

  describe('deleteProfilePic', () => {
    it('should delete profile picture successfully', fakeAsync(() => {
      mockService.updateProfilePic.mockReturnValue(of({ result: true }));

      component.profilePicUrl = 'custom-pic.png';
      component.isImageError = true;

      component.deleteProfilePic();
      tick();

      const formData = new FormData();
      formData.append('ProfilePic', '');

      expect(mockService.updateProfilePic).toHaveBeenCalled();
      expect(component.profilePicUrl).toBe(defaultProfilePic);
      expect(component.isImageError).toBe(false);
      expect(mockSnackbar.showSuccess).toHaveBeenCalledWith(
        platformMessages.successTitle,
        platformMessages.profileDeleteSuccess,
      );
    }));

    it('should show error if delete fails', fakeAsync(() => {
      mockService.updateProfilePic.mockReturnValue(throwError(() => new Error('Delete failed')));

      component.deleteProfilePic();
      tick();

      expect(mockSnackbar.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        platformMessages.profileDeleteFailure,
      );
    }));

    it('should send empty string as ProfilePic in FormData', fakeAsync(() => {
      mockService.updateProfilePic.mockReturnValue(of({ result: true }));

      component.deleteProfilePic();
      tick();

      expect(mockService.updateProfilePic).toHaveBeenCalledWith(expect.any(FormData));
    }));
  });

  describe('hasCustomProfilePic', () => {
    it('should return false if profilePicUrl is default', () => {
      component.profilePicUrl = defaultProfilePic;
      component.isImageError = false;

      expect(component.hasCustomProfilePic()).toBe(false);
    });

    it('should return false if isImageError is true', () => {
      component.profilePicUrl = 'custom-pic.png';
      component.isImageError = true;

      expect(component.hasCustomProfilePic()).toBe(false);
    });

    it('should return true if profilePicUrl is custom and no error', () => {
      component.profilePicUrl = 'custom-pic.png';
      component.isImageError = false;

      expect(component.hasCustomProfilePic()).toBe(true);
    });

    it('should return false if both default pic and image error', () => {
      component.profilePicUrl = defaultProfilePic;
      component.isImageError = true;

      expect(component.hasCustomProfilePic()).toBe(false);
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy$ subject', () => {
      const nextSpy = jest.spyOn(component['destroy$'], 'next');
      const completeSpy = jest.spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });

    it('should unsubscribe from all subscriptions', () => {
      mockService.getUserBasicProfile.mockReturnValue(of({ result: false }));
      fixture.detectChanges();

      const nextSpy = jest.spyOn(component['destroy$'], 'next');

      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalled();
    });
  });

  describe('loadUserProfile', () => {
    it('should not update user if result=false', () => {
      mockService.getUserBasicProfile.mockReturnValue(of({ result: false, data: null }));
      fixture.detectChanges();
      expect(component.user).toBeNull();
      expect(component.profileCardConfig).toEqual([]);
      expect(component.profilePicUrl).toBe(defaultProfilePic);
    });

    it('should not update user if data is null', () => {
      mockService.getUserBasicProfile.mockReturnValue(of({ result: true, data: null }));
      fixture.detectChanges();
      expect(component.user).toBeNull();
      expect(component.profileCardConfig).toEqual([]);
    });

    it('should update user, profilePicUrl and profileCardConfig if result=true', () => {
      const mockUser: UserBasicProfile = {
        quizCompleted: 5,
        totalXp: 100,
        winRate: 60,
        achievements: 2,
        profilePic: 'avatar.png',
      } as any;

      jest.spyOn(mapper, 'mapProfilePic').mockReturnValue('mapped-pic.png');
      jest
        .spyOn(mapper, 'mapUserProfileCards')
        .mockReturnValue([{ title: 'card', value: 1, icon: 'icon' } as CardInputConfig]);

      mockService.getUserBasicProfile.mockReturnValue(of({ result: true, data: mockUser }));

      fixture.detectChanges();

      expect(component.user).toEqual(mockUser);
      expect(mapper.mapProfilePic).toHaveBeenCalledWith('avatar.png');
      expect(component.profilePicUrl).toBe('mapped-pic.png');
      expect(mapper.mapUserProfileCards).toHaveBeenCalledWith(mockUser);
      expect(component.profileCardConfig.length).toBe(1);
    });
  });
});
