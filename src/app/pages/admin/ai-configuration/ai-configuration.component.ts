import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import {
  mapAiSummaryToCards,
  qiConfigurationsHeaderConfig,
} from './configs/ai-configuration.config';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ProgressBarComponent } from '../../../shared/components/progress-bar/progress-bar.component';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { AiConfigurationService } from '../../../services/admin/ai-configuration/ai-configuration.service';
import { Subject, takeUntil } from 'rxjs';
import { aiModelLabels, platformMessages } from '../../../utils/constants';
import { CardInputConfig } from '../../../shared/interfaces/card-component.interface';
import { AiUsesDetails } from './interfaces/ai-configuration.interface';
import { MatSelectModule } from '@angular/material/select';
import { AiModelName } from '../../../shared/enums/ai-configuration.enum';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ai-configuration',
  imports: [
    PageHeaderComponent,
    CardComponent,
    ProgressBarComponent,
    MatSelectModule,
    CommonModule,
  ],
  templateUrl: './ai-configuration.component.html',
  styleUrl: './ai-configuration.component.scss',
})
export class AiConfigurationComponent implements OnInit, OnDestroy {
  aiheaderConfig = qiConfigurationsHeaderConfig;
  aiMonitoringData: AiUsesDetails = {
    todaysApiCalls: 0,
    averageResponseTimeInSecond: 0,
    errorRate: 0,
  };

  aiModels = Object.keys(AiModelName)
    .filter((key) => Number.isNaN(Number(key)))
    .map((key) => ({
      label: aiModelLabels[key as keyof typeof aiModelLabels],
      value: AiModelName[key as keyof typeof AiModelName],
    }));
  selectedStatus: number;
  configss: CardInputConfig[] = [];

  private readonly snackbar = inject(SnackbarService);
  private readonly aiConfigurationService = inject(AiConfigurationService);

  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.fetchAiConfigurationCardsData();
    this.fetchAiUsageFilterData(this.selectedStatus ?? '');
  }

  fetchAiConfigurationCardsData(): void {
    this.aiConfigurationService
      .getAIConfigCardData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.configss = mapAiSummaryToCards(res.data);
        },
        error: (err) => {
          this.snackbar.showError(
            platformMessages.errorTitle,
            err?.error?.message || platformMessages.errorMessage,
          );
        },
      });
  }

  fetchAiUsageFilterData(aiModelName?: number): void {
    this.aiConfigurationService
      .getAiUsageDetails(aiModelName)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.aiMonitoringData = res.data;
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
