import { Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SidebarItem } from '../../interfaces/sidebar-component.interface';

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  isMobile: boolean = false;
  isOpen: boolean = true;
  sidenavMode: 'side' | 'over' = 'side';

  @Input() sidebarItems: SidebarItem[] = [];
  @Input() role: 'user' | 'admin' = 'user';

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    this.setSidenavMode(window.innerWidth);

    if (this.sidebarItems.length > 0 && this.router.url === '/') {
      const firstRoute = this.sidebarItems[0].route;
      if (firstRoute) {
        this.router.navigate([firstRoute]);
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.setSidenavMode(event.target.innerWidth);
  }

  setSidenavMode(width: number): void {
    this.isMobile = width < 1024;
    this.sidenavMode = this.isMobile ? 'over' : 'side';
    this.isOpen = !this.isMobile;
  }

  toggleSidebar(): void {
    this.sidenav.toggle();
  }

  closeSidebar(): void {
    if (this.isMobile) {
      this.sidenav.close();
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.closeSidebar();
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }
}
