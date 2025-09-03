import { Component, inject } from '@angular/core';
import { UserBadges } from '../../../user-profile/interfaces/user-badges.interface';
import { UserProfileService } from '../../../../../services/user/user-profile/user-profile.service';
import { Subject, takeUntil } from 'rxjs';
import { getBadgeTagConfig } from '../../../user-profile/user-profile.mapper';
import { BadgeType } from '../../../../../shared/enums/user-profile.enum';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { TagComponent } from '../../../../../shared/components/tag/tag.component';

@Component({
  selector: 'app-achievement',
  imports: [MatIconModule, CommonModule, TagComponent],
  templateUrl: './achievement.component.html',
  styleUrl: './achievement.component.scss',
})
export class AchievementComponent {
  badges: UserBadges[] = [];

  private readonly userProfileService = inject(UserProfileService);

  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadUserBadges();
  }

  loadUserBadges(): void {
    this.userProfileService
      .getUserBadges()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res.result && res.data) {
          this.badges = res.data;
        }
      });
  }

  getTagConfig(badge: UserBadges) {
    return getBadgeTagConfig(badge);
  }

  getBadgeClass(badge: UserBadges): string {
    const typeName = BadgeType[badge.badgeType];
    return typeName ? typeName.toLowerCase() : '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
