import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { UserProfileService } from '../../../../../services/user/user-profile/user-profile.service';
import { BadgeType } from '../../../../../shared/enums/user-profile.enum';
import { UserBadges } from '../../interfaces/user-badges.interface';
import { UserAchievementComponent } from './user-achievement.component';
import * as mapper from '../../user-profile.mapper';
import { TagInputConfig } from '../../../../../shared/interfaces/tag-component.interface';

class MockUserProfileService {
  getUserBadges = jest.fn();
}

describe('AchievementComponent', () => {
  let component: UserAchievementComponent;
  let fixture: ComponentFixture<UserAchievementComponent>;
  let userProfileService: MockUserProfileService;

  const mockBadges: UserBadges[] = [
    { badgeType: BadgeType.Gold, badgeName: 'Gold Winner' },
    { badgeType: BadgeType.Silver, badgeName: 'Silver Winner' },
  ] as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserAchievementComponent],
      providers: [{ provide: UserProfileService, useClass: MockUserProfileService }],
    }).compileComponents();

    fixture = TestBed.createComponent(UserAchievementComponent);
    component = fixture.componentInstance;
    userProfileService = TestBed.inject(UserProfileService) as any;
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should load user badges on init', () => {
    userProfileService.getUserBadges.mockReturnValue(of({ result: true, data: mockBadges }));
    component.ngOnInit();

    expect(userProfileService.getUserBadges).toHaveBeenCalled();
    expect(component.badges.length).toBe(2);
  });

  it('should not set badges when result is false', () => {
    userProfileService.getUserBadges.mockReturnValue(of({ result: false, data: [] }));
    component.ngOnInit();

    expect(component.badges.length).toBe(0);
  });

  it('should call getBadgeTagConfig with badge', () => {
    const spy = jest.spyOn(mapper, 'getBadgeTagConfig').mockImplementation(
      (): TagInputConfig => ({
        id: 'gold',
        label: 'test',
        type: 'static',
        textColor: 'black',
        backgroundColor: 'lightWhite',
        isSelected: false,
        hasBorder: true,
      }),
    );

    const badge: UserBadges = { badgeType: BadgeType.Gold, badgeName: 'Gold Winner' } as any;

    component.getTagConfig(badge);

    expect(spy).toHaveBeenCalledWith(badge);
  });

  it('should return correct badge class', () => {
    const badge: UserBadges = { badgeType: BadgeType.Gold, badgeName: 'Gold Winner' } as any;
    const result = component.getBadgeClass(badge);
    expect(result).toBe('gold');
  });

  it('should return empty string for unknown badge type', () => {
    const badge: UserBadges = { badgeType: 999, badgeName: 'Unknown' } as any;
    const result = component.getBadgeClass(badge);
    expect(result).toBe('');
  });

  it('should complete destroy$ on ngOnDestroy', () => {
    const completeSpy = jest.spyOn((component as any).destroy$, 'complete');
    const nextSpy = jest.spyOn((component as any).destroy$, 'next');

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});
