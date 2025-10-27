import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';
import { MatIcon } from '@angular/material/icon';
import { Navigations } from '../../enums/navigation';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-unauthorized',
  templateUrl: './unauthorized.component.html',
  styleUrl: './unauthorized.component.scss',
  imports: [MatIcon, CommonModule],
})
export class UnauthorizedComponent implements OnInit {
  userRole: string | null = null;

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  ngOnInit(): void {
    this.userRole = this.authService.currentRole$.value;
  }

  /** Navigate user to their respective dashboard */
  navigateToDashboard(): void {
    if (!this.userRole) return;

    const routes: Record<string, string> = {
      admin: `/${Navigations.Admin}/${Navigations.Dashboard}`,
      player: `/${Navigations.User}/${Navigations.Dashboard}`,
    };

    const route = routes[this.userRole];
    if (route) {
      this.router.navigate([route]);
    }
  }

  /** Go back to the previous page */
  goBack(): void {
    window.history.go(-2);
  }
}
