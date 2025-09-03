import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';
import { TagComponent } from '../../../../../shared/components/tag/tag.component';
import { UserProfileService } from '../../../../../services/user/user-profile/user-profile.service';
import { BadgeType } from '../../../../../shared/enums/user-profile.enum';
import { UserBadges } from '../../interfaces/user-badges.interface';
import { getBadgeTagConfig } from '../../user-profile.mapper';

@Component({
  selector: 'app-achievement',
  imports: [MatIconModule, CommonModule, TagComponent],
  templateUrl: './user-achievement.component.html',
  styleUrl: './user-achievement.component.scss',
  standalone: true,
})
export class UserAchievementComponent implements OnInit, OnDestroy {
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
