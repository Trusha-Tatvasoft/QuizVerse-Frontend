import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { navigationItems } from '../../../utils/constants';
import { UserType } from '../../../utils/types/sidebar-component.type';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { BattleRequestNotificationsComponent } from '../../user/battle-request-notifications/battle-request-notifications.component';
import { Role } from '../../../shared/enums/role';

@Component({
  selector: 'app-master-layout',
  imports: [SidebarComponent, NavbarComponent, RouterModule, BattleRequestNotificationsComponent],
  templateUrl: './master-layout.component.html',
  styleUrl: './master-layout.component.scss',
})
export class MasterLayoutComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  private readonly authService = inject(AuthService);
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
