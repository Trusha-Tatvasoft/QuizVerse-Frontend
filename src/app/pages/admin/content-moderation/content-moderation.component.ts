import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  contentModerationHeaderConfig,
  defaultContentModerationTabs,
} from './configs/content-moderation.config';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { CardInputConfig } from '../../../shared/interfaces/card-component.interface';
import { TabComponent } from '../../../shared/components/tab/tab.component';
import { LazyTab } from '../../../shared/interfaces/tab-component.interface';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { ContentModerationService } from '../../../services/admin/content-moderation/content-moderation.service';
import { Subject, takeUntil } from 'rxjs';
import { platformMessages } from '../../../utils/constants';
import { mapContentModerationSummaryToCards } from './content-moderation.mapper';

@Component({
  selector: 'app-content-moderation',
  imports: [PageHeaderComponent, CardComponent, TabComponent],
  templateUrl: './content-moderation.component.html',
  styleUrl: './content-moderation.component.scss',
})
export class ContentModerationComponent implements OnInit, OnDestroy {
  contentModerationConfig = contentModerationHeaderConfig;
  contentModerationStatsConfigs: CardInputConfig[] = [];
  selectedTab = 0;
  tabs: LazyTab[] = defaultContentModerationTabs;

  private readonly snackbar = inject(SnackbarService);
  private readonly contentModerationService = inject(ContentModerationService);

  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.getContentModerationStats();
  }

  onTabChanged(index: number) {
    this.selectedTab = index;
  }

  private getContentModerationStats(): void {
    this.contentModerationService
      .getContentModerationMetricsData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.contentModerationStatsConfigs = mapContentModerationSummaryToCards(res.data);
        },
        error: (err) => {
          this.snackbar.showError(
            platformMessages.errorTitle,
            err?.error?.message || platformMessages.errorMessage,
          );
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
