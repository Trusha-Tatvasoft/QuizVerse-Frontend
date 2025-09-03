import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserProfileService } from '../../../services/user/user-profile/user-profile.service';
import { CardInputConfig } from '../../../shared/interfaces/card-component.interface';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { allowedImageTypes, defaultProfilePic, platformMessages } from '../../../utils/constants';
import { playerProfileTabConfig } from './configs/profile-tab.config';
import { UserBasicProfile } from './interfaces/user-profile.interface';
import { mapProfilePic, mapUserProfileCards } from './user-profile.mapper';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ProgressBarComponent } from '../../../shared/components/progress-bar/progress-bar.component';
import { TabComponent } from '../../../shared/components/tab/tab.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-user-profile',
  imports: [ProgressBarComponent, CardComponent, TabComponent, CommonModule, MatIconModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
})
export class UserProfileComponent implements OnInit, OnDestroy {
  profileCardConfig: CardInputConfig[] = [];
  tabs = playerProfileTabConfig;
  profilePicUrl: string = defaultProfilePic;
  user: UserBasicProfile | null = null;
  totalTabs = this.tabs.length;

  selectedTab = signal(0);

  private readonly userProfileService = inject(UserProfileService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackbar = inject(SnackbarService);

  private readonly destroy$ = new Subject<void>();

  ngOnInit() {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      let tabIndex = +params['tab'] || 0;

      if (isNaN(tabIndex) || tabIndex < 0 || tabIndex >= this.totalTabs) {
        tabIndex = 0;
      }

      this.selectedTab.set(tabIndex);

      this.userProfileService.profileUpdated$
        .pipe(takeUntil(this.destroy$))
        .subscribe((updated) => {
          if (updated) {
            this.loadUserProfile();
          }
        });
    });

    this.loadUserProfile();
  }

  switchToTab(index: number) {
    this.selectedTab.set(index);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: index },
      queryParamsHandling: 'merge',
    });
  }

  profileUpload(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file: File = input.files[0];

      if (!allowedImageTypes.includes(file.type)) {
        this.snackbar.showError(platformMessages.invalidImageType);
        return;
      }

      const formData = new FormData();
      formData.append('ProfilePic', file);

      this.userProfileService
        .updateProfilePic(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            if (res.result) {
              const reader = new FileReader();
              reader.onload = (e: ProgressEvent<FileReader>) => {
                if (e.target && e.target.result) {
                  this.profilePicUrl = e.target.result as string;
                }
              };
              reader.readAsDataURL(file);

              this.loadUserProfile();
              this.snackbar.showSuccess(platformMessages.uploadSuccess);
            }
          },
          error: () => {
            this.snackbar.showError(platformMessages.uploadFailed);
          },
        });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserProfile() {
    this.userProfileService
      .getUserBasicProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe((profile) => {
        if (!profile.result || !profile.data) return;

        this.user = profile.data;

        this.profilePicUrl = mapProfilePic(this.user.profilePic);
        this.profileCardConfig = mapUserProfileCards(this.user);
      });
  }
}
