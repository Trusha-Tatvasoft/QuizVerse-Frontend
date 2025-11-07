import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { navigationItems } from '../../../utils/constants';
import { UserType } from '../../../utils/types/sidebar-component.type';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { Role } from '../../../shared/enums/role';
import { BattleRequestNotificationsComponent } from '../../user/battle-request-notifications/battle-request-notifications.component';
import { BattleHubService } from '../../../services/user/user-battles/battle-hub.service';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { IncomingBattleRequest } from '../../../shared/interfaces/incoming-battle-request.interface';
import { BattleStartDetails } from '../../user/user-battles/interface/search-opponent.interface';
import { Navigations } from '../../../shared/enums/navigation';

@Component({
  selector: 'app-master-layout',
  imports: [SidebarComponent, NavbarComponent, RouterModule, BattleRequestNotificationsComponent],
  templateUrl: './master-layout.component.html',
  styleUrl: './master-layout.component.scss',
})
export class MasterLayoutComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly battleHub = inject(BattleHubService);
  private readonly snackbar = inject(SnackbarService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  battleStartDetails: BattleStartDetails | null;
  battleId: number;

  @ViewChild(SidebarComponent) sidebar!: SidebarComponent;
  @ViewChild(NavbarComponent) navbar!: NavbarComponent;

  role: UserType = Role.Player;
  isLogin: boolean = true;
  isAdmin: boolean = false;
  sidebarItems = navigationItems.UserRoutes.filter((item) => item.label !== 'Profile');

  ngOnInit(): void {
    this.authService.currentRole$.pipe(takeUntil(this.destroy$)).subscribe((role) => {
      if (role === Role.Admin || role === Role.SuperAdmin || role === Role.Player) {
        this.role = role as UserType;

        this.isAdmin = role === Role.Admin || role === Role.SuperAdmin;

        this.sidebarItems =
          role === Role.Admin || role === Role.SuperAdmin
            ? navigationItems.AdminRoutes
            : navigationItems.UserRoutes.filter((item) => item.label !== 'Profile');
      }
    });

    if (!this.isAdmin) {
      if (!this.battleHub.connected) this.battleHub.connect();

      this.battleHub.onRequestAccepted
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: { receiverId: number; battleRequest: IncomingBattleRequest }) => {
          const request = data.battleRequest;
          this.battleId = request.battleId;
          this.snackbar.showSuccess(`${request.senderFullName} accepted the battle request!`);
        });

      this.battleHub.onRequestAcceptedConfirmation
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: { senderId: number; battleRequest: IncomingBattleRequest }) => {
          const request = data.battleRequest;
          this.battleId = request.battleId;
          // Show snackbar
          this.snackbar.showSuccess(`${request.senderFullName} accepted the battle request!`);
        });

      this.battleHub.onBattleStarted
        .pipe(takeUntil(this.destroy$))
        .subscribe((result: BattleStartDetails) => {
          if (result) {
            this.battleStartDetails = result;
            if (this.battleId) {
              setTimeout(() => this.openFullscreen(), 0);
              this.router.navigate(
                [
                  Navigations.User,
                  Navigations.Battles,
                  Navigations.BattleList,
                  Navigations.FoundOpponent,
                  btoa(encodeURIComponent(this.battleId.toString())),
                ],
                {
                  state: {
                    battleStartDetails: this.battleStartDetails,
                    opponent: result.opponentProfile,
                  },
                },
              );
            }
          }
        });
    }
  }

  openFullscreen(): void {
    const elem = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>;
      msRequestFullscreen?: () => void;
    };
    if (elem.requestFullscreen) elem.requestFullscreen();
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
  }

  toggleSidebarFromParent(): void {
    this.sidebar?.toggleSidebar();
  }

  handleSidebarOpen(): void {
    this.sidebar?.openSidebar();
  }

  handleSidebarClose(): void {
    this.sidebar?.closeSidebar();
  }

  handleSidebarClosedByBackdrop(): void {
    this.navbar?.sidebarClosedByBackdrop();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
