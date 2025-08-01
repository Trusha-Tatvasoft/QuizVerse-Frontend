import { Component, HostListener, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { NavigationItems } from '../../../utils/constants';
import { UserType } from '../../../utils/types/sidebar-component.type';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-master-layout',
  imports: [SidebarComponent, NavbarComponent, RouterModule],
  templateUrl: './master-layout.component.html',
  styleUrl: './master-layout.component.scss',
})
export class MasterLayoutComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  private readonly authService = inject(AuthService);
  @ViewChild(SidebarComponent) sidebar!: SidebarComponent;
  @ViewChild(NavbarComponent) navbar!: NavbarComponent;

  role: UserType = 'player';
  isLogin: boolean = true;
  currentXp: number = 500;
  xpLimit: number = 1000;
  notificationCount: number = 0;
  sidebarItems = NavigationItems.UserRoutes.filter((item) => item.label !== 'Profile');
  notifications = [];

  ngOnInit(): void {
    this.authService.currentRole$.pipe(takeUntil(this.destroy$)).subscribe((role) => {
      if (role === 'admin' || role === 'player') {
        this.role = role as UserType;
        this.sidebarItems =
          role === 'admin'
            ? NavigationItems.AdminRoutes
            : NavigationItems.UserRoutes.filter((item) => item.label !== 'Profile');
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
