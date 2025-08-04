import { Component, ViewChild } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { NavigationItems } from '../../../utils/constants';
import { UserType } from '../../../utils/types/sidebar-component.type';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-master-layout',
  imports: [SidebarComponent, NavbarComponent, RouterModule],
  templateUrl: './master-layout.component.html',
  styleUrl: './master-layout.component.scss',
})
export class MasterLayoutComponent {
  @ViewChild(SidebarComponent) sidebar!: SidebarComponent;
  @ViewChild(NavbarComponent) navbar!: NavbarComponent;

  role: UserType = 'user';
  isLogin: boolean = true;
  currentXp: number = 500;
  xpLimit: number = 1000;
  notificationCount: number = 0;
  sidebarItems = NavigationItems.UserRoutes.filter((item) => item.label !== 'Profile');
  notifications = [];

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
}
