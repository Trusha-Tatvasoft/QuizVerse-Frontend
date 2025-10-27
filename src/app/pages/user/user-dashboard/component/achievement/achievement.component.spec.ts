import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { AchievementComponent } from './achievement.component';
import { UserProfileService } from '../../../../../services/user/user-profile/user-profile.service';
import { TagComponent } from '../../../../../shared/components/tag/tag.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { UserBadges } from '../../../user-profile/interfaces/user-badges.interface';
import { BadgeType } from '../../../../../shared/enums/user-profile.enum';

// Mock data
const mockBadges: UserBadges[] = [
  {
    badgeId: 1,
    name: 'First Win',
    description: 'Win your first game',
    earned: true,
    badgeType: BadgeType.Gold,
  },
  {
    badgeId: 2,
    name: 'Quiz Master',
    description: 'Complete 100 quizzes',
    earned: false,
    badgeType: BadgeType.Silver,
  },
  {
    badgeId: 3,
    name: 'Champion',
    description: 'Top the leaderboard',
    earned: true,
    badgeType: BadgeType.Platinum,
  },
  {
    badgeId: 4,
    name: 'Bronze Player',
    description: 'Start your journey',
    earned: true,
    badgeType: BadgeType.Bronze,
  },
  {
    badgeId: 5,
    name: 'Extra Badge',
    description: 'Should not be shown',
    earned: true,
    badgeType: BadgeType.Gold,
  },
];

// Mock Service
class MockUserProfileService {
  getUserBadges = jest.fn().mockReturnValue(of({ result: true, data: mockBadges }));
}

describe('AchievementComponent', () => {
  let component: AchievementComponent;
  let fixture: ComponentFixture<AchievementComponent>;
  let userProfileService: MockUserProfileService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AchievementComponent, MatIconModule, CommonModule, TagComponent],
      providers: [{ provide: UserProfileService, useClass: MockUserProfileService }],
    }).compileComponents();

    fixture = TestBed.createComponent(AchievementComponent);
    component = fixture.componentInstance;
    userProfileService = TestBed.inject(UserProfileService) as unknown as MockUserProfileService;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load badges on init', () => {
    const spy = jest.spyOn(userProfileService, 'getUserBadges');
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
    expect(component.badges.length).toBe(5);
  });

  it('should return correct badge class from enum', () => {
    const badge: UserBadges = {
      badgeId: 1,
      name: 'Gold Badge',
      description: '',
      earned: true,
      badgeType: BadgeType.Gold,
    };
    const className = component.getBadgeClass(badge);
    expect(className).toBe('gold');
  });

  it('should unsubscribe on destroy', () => {
    const spy = jest.spyOn(component['destroy$'], 'next');
    component.ngOnDestroy();
    expect(spy).toHaveBeenCalled();
  });

  it('should display only 4 badges in template', () => {
    component.ngOnInit();
    fixture.detectChanges();

    const badgeElements = fixture.nativeElement.querySelectorAll('.badge-item');
    expect(badgeElements.length).toBe(3);
    expect(badgeElements[0].querySelector('h4').textContent).toContain('First Win');
  });

  it('should render header title and icon', () => {
    fixture.detectChanges();
    const header = fixture.nativeElement.querySelector('.title');
    const icon = fixture.nativeElement.querySelector('.header-icon');

    expect(header.textContent).toContain('Achievements');
    expect(icon.textContent).toContain('emoji_events');
  });

  it('should apply earned/locked classes correctly', () => {
    component.ngOnInit();
    fixture.detectChanges();

    const badgeItems = fixture.nativeElement.querySelectorAll('.badge-item');
    expect(badgeItems[0].classList).toContain('earned');
    expect(badgeItems[1].classList).toContain('locked');
  });
});
