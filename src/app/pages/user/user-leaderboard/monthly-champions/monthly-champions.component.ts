import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ScrollWindowComponent } from '../../../../shared/components/scroll-window/scroll-window.component';
import { CommonListDropDown } from '../../../../shared/interfaces/common-dropdown.interface';
import { MonthlyLeaderEntry } from '../interfaces/user-leaderboard.interface';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { LeaderboardService } from '../../../../services/user/leaderboard/leaderboard.service';
import { of, Subject, switchMap, takeUntil } from 'rxjs';
import { ApiResponse } from '../../../../shared/interfaces/api-response.interface';
import { platformMessages } from '../../../../utils/constants';

@Component({
  selector: 'app-monthly-champions',
  imports: [CommonModule, MatIcon, MatSelectModule, ScrollWindowComponent],
  templateUrl: './monthly-champions.component.html',
  styleUrl: './monthly-champions.component.scss',
})
export class MonthlyChampionsComponent {
  selectedMonth: number | null;
  selectedYear: number | null;
  selectedMonthName: string = '';

  monthList: CommonListDropDown[] = [];
  yearList: CommonListDropDown[] = [];
  leaderboard: MonthlyLeaderEntry[] = [];

  private readonly snackbar = inject(SnackbarService);
  private readonly leaderboardService = inject(LeaderboardService);
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadDropdowns();
  }

  loadDropdowns() {
    this.leaderboardService
      .getAvailableYears()
      .pipe(
        takeUntil(this.destroy$),
        switchMap((years) => {
          this.yearList = years.data;

          this.selectedYear = this.yearList.length > 0 ? this.yearList[0].id : null;

          if (this.selectedYear) {
            return this.leaderboardService.getAvailableMonthsByYear(this.selectedYear);
          }

          return of({ data: [] });
        }),
      )
      .subscribe((months) => {
        this.monthList = months.data ?? [];

        this.selectedMonth =
          this.monthList.length > 0 ? this.monthList[this.monthList.length - 1].id : null;

        if (this.selectedYear && this.selectedMonth) {
          this.onFilterChange();
        }
      });
  }

  fetchMonthlyChampions(month: number, year: number): void {
    this.leaderboardService
      .getMonthlyChampions(month, year)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: ApiResponse<MonthlyLeaderEntry[]>) => {
          this.leaderboard = res.data ?? [];
        },
        error: (err) => {
          this.snackbar.showError(
            platformMessages.errorTitle,
            err.error?.message || platformMessages.errorMessage,
          );
        },
      });
  }

  onFilterChange() {
    if (this.selectedYear && this.selectedMonth) {
      this.selectedMonthName = this.monthList.find((m) => m.id === this.selectedMonth)?.name ?? '';

      this.fetchMonthlyChampions(this.selectedMonth, this.selectedYear);
    }
  }

  getInitials(name: string): string {
    if (!name) return '';
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    } else {
      return words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase();
    }
  }

  getInitialsColorClass(name: string): string {
    if (!name) return 'bg-avatar-0';
    const colorsCount = 12;
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colorsCount;
    return `bg-avatar-${index}`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
