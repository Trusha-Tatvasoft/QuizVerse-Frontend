import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { DropdownService } from '../../../../shared/service/dropdown/dropdown.service';
import { CommonListDropDown } from '../../../../shared/interfaces/common-dropdown.interface';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { DropDownType } from '../../../../shared/enums/dropdown-types.enum';
import { MatSelectModule } from '@angular/material/select';
import { LeaderboardService } from '../../../../services/user/leaderboard/leaderboard.service';
import { ApiResponse } from '../../../../shared/interfaces/api-response.interface';
import { CategoryLeaderEntry } from '../interfaces/user-leaderboard.interface';
import { platformMessages } from '../../../../utils/constants';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { ScrollWindowComponent } from '../../../../shared/components/scroll-window/scroll-window.component';
import {
  globalGetInitials,
  globalGetInitialsColorClass,
} from '../../../../utils/get-profile-initials.utils';

@Component({
  selector: 'app-category-leaders',
  imports: [CommonModule, MatIcon, MatSelectModule, ScrollWindowComponent],
  templateUrl: './category-leaders.component.html',
  styleUrl: './category-leaders.component.scss',
})
export class CategoryLeadersComponent {
  selectedCategory: number;
  selectedCategoryName = '';
  categoryList: CommonListDropDown[] = [];
  leaderboard: CategoryLeaderEntry[] = [];

  private readonly dropdownService = inject(DropdownService);
  private readonly snackbar = inject(SnackbarService);
  private readonly leaderboardService = inject(LeaderboardService);
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadDropdowns();
  }

  fetchCategoryLeaderboard(categoryId: number): void {
    this.leaderboardService
      .getCategoryLeaderboard(categoryId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: ApiResponse<CategoryLeaderEntry[]>) => {
          this.leaderboard = res.data;
        },
        error: (err) => {
          this.snackbar.showError(
            platformMessages.errorTitle,
            err?.error?.message || platformMessages.errorMessage,
          );
        },
      });
  }

  loadDropdowns() {
    forkJoin({
      categories: this.dropdownService.getDropdownData(DropDownType.QuizCategory),
    }).subscribe(({ categories }) => {
      this.categoryList = categories;

      if (this.categoryList.length > 0) {
        this.selectedCategory = this.categoryList[0].id;
        this.selectedCategoryName = this.categoryList[0].name;
        this.onFilterChange();
      }
    });
  }

  onFilterChange() {
    const selected = this.categoryList.find((c) => c.id === this.selectedCategory);
    this.selectedCategoryName = selected ? selected.name : 'Unknown';

    this.fetchCategoryLeaderboard(this.selectedCategory);
  }

  getInitials(name: string): string {
    return globalGetInitials(name);
  }

  getInitialsColorClass(name: string): string {
    return globalGetInitialsColorClass(name);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
