import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FilledButtonComponent } from '../../../shared/components/filled-button/filled-button.component';
import { OutlineButtonComponent } from '../../../shared/components/outline-button/outline-button.component';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import {
  browseQuizzesButton,
  landingPageFeaturesCardsConfig,
  joinPlatformButton,
  landingPageContent,
  startPlayButton,
} from '../configs/landing-page.component.config';
import { NavbarComponent } from '../navbar/navbar.component';
import { Navigations } from '../../../shared/enums/navigation';
import { LandingPageDataService } from '../../../services/user/landing-page/landing-page-data.service';
import { LandingPageStats } from '../../../shared/interfaces/landing-page-stats.interface';
import { plateformName, platformMessages } from '../../../utils/constants';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { finalize, Subject, takeUntil } from 'rxjs';
import { LoaderService } from '../../../shared/service/loader/loader.service';

@Component({
  selector: 'app-landing-page',
  imports: [CommonModule, FilledButtonComponent, OutlineButtonComponent, MatIcon, NavbarComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly landingPageDataService = inject(LandingPageDataService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly loaderService = inject(LoaderService);

  landingPageContent = landingPageContent;
  quizFeatures = landingPageFeaturesCardsConfig;
  startPlayButton = startPlayButton;
  browseQuizButton = browseQuizzesButton;
  joinPlatFormButton = joinPlatformButton;
  plateformName = plateformName;
  stats: LandingPageStats;
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadLandingPageStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadLandingPageStats(): void {
    this.loaderService.show();
    this.landingPageDataService
      .getStats()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loaderService.hide()),
      )
      .subscribe({
        next: (response) => {
          this.stats = response.data;
          const formattedStats = [
            this.formatCount(this.stats.activePlayer),
            this.formatCount(this.stats.quizCreated),
            this.formatCount(this.stats.questionAns),
          ];
          formattedStats.forEach((val, index) => {
            if (this.landingPageContent.stats[index]) {
              this.landingPageContent.stats[index].value = val;
            }
          });
          this.landingPageContent.quote = this.stats.quote;
        },
        error: (err) => {
          this.snackbarService.showError(
            platformMessages.errorMessage,
            err.error?.message || platformMessages.errorTitle,
          );
        },
      });
  }

  private formatCount(num: number): string {
    if (num >= 1000000) {
      return `${Math.floor(num / 1000000)}M+`;
    } else if (num >= 1000) {
      return `${Math.floor(num / 1000)}K+`;
    } else if (num >= 100) {
      return `${Math.floor(num / 100) * 100}+`;
    } else {
      return `${num}`;
    }
  }

  browseQuizRedirect() {
    this.router.navigate([Navigations.BrowseQuizzes]);
  }

  loginRedirect(): void {
    this.router.navigate([Navigations.Login]);
  }
}
