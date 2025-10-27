import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';
import { MatIcon } from '@angular/material/icon';
import { Navigations } from '../../enums/navigation';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
  imports: [MatIcon, CommonModule],
})
export class NotFoundComponent implements OnInit {
  userRole: string | null = null;

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly location = inject(Location);

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
    this.location.back();
  }
}
