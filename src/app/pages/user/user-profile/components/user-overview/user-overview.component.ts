import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { UserProfileService } from '../../../../../services/user/user-profile/user-profile.service';
import { UserOverview } from '../../interfaces/user-profile.interface';
import { mapRecentActivities, mapStats, xpTagConfig } from '../../user-profile.mapper';
import { CommonModule } from '@angular/common';
import { TagComponent } from '../../../../../shared/components/tag/tag.component';
import { TagInputConfig } from '../../../../../shared/interfaces/tag-component.interface';

@Component({
  selector: 'app-user-overview',
  imports: [CommonModule, TagComponent],
  templateUrl: './user-overview.component.html',
  styleUrl: './user-overview.component.scss',
})
export class UserOverviewComponent implements OnInit, OnDestroy {
  recentActivities: { text: string; xp: number }[] = [];
  statsList: { label: string; value: string | number }[] = [];

  private readonly userProfileService = inject(UserProfileService);

  private readonly $destroy = new Subject<void>();

  ngOnInit(): void {
    this.loadUserOverview();
  }

  loadUserOverview(): void {
    this.userProfileService
      .getUserOverview()
      .pipe(takeUntil(this.$destroy))
      .subscribe((res) => {
        if (res.result && res.data) {
          const overview: UserOverview = res.data;

          this.recentActivities = mapRecentActivities(overview);
          this.statsList = mapStats(overview);
        }
      });
  }

  getXpTag(xp: number): TagInputConfig {
    return xpTagConfig(xp);
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
