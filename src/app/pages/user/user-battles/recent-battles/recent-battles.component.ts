import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  inject,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { TagComponent } from '../../../../shared/components/tag/tag.component';
import { TagInputConfig } from '../../../../shared/interfaces/tag-component.interface';
import { TagColor } from '../../../../utils/types/tag-component.type';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { UserBattlesService } from '../../../../services/user/user-battles/user-battles.service';
import { Subject, takeUntil } from 'rxjs';
import {
  battleFilterDisplayNames,
  BattleFilterType,
  battleTimeFilterDisplayNames,
  BattleTimeFilterType,
} from '../../../../shared/enums/user-recent-battle.enum';
import {
  UserRecentBattles,
  UserRecentBattlesRequestDto,
  UserRecentBattlesWindow,
} from '../interface/recent-battles.interface';
import { MatOption, MatSelect, MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { loadMoreButtonConfig } from '../../browse-quizzes/configs/browse-quizzes.config';
import { OutlineButtonComponent } from '../../../../shared/components/outline-button/outline-button.component';
import {
  globalGetInitials,
  globalGetInitialsColorClass,
} from '../../../../utils/get-profile-initials.utils';

@Component({
  selector: 'app-recent-battles',
  imports: [
    CommonModule,
    TagComponent,
    MatSelect,
    MatOption,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    OutlineButtonComponent,
  ],
  templateUrl: './recent-battles.component.html',
  styleUrl: './recent-battles.component.scss',
})
export class RecentBattlesComponent {
  @ViewChild('list', { static: true }) listRef!: ElementRef<HTMLDivElement>; // Reference to the container of recent battles list

  recentBattlesList: UserRecentBattles[] = []; // Full list of user's recent battles
  visibleWindow: UserRecentBattlesWindow[] = []; // Currently visible portion of the list
  windowSize = 8; // Number of items to show at a time
  currentStart = 0; // Starting index of visible window
  battleFilterType = BattleFilterType;
  battleTimeFilterType = BattleTimeFilterType;
  battleFilterOptions = Object.entries(battleFilterDisplayNames).map(([value, label]) => ({
    value: Number(value),
    label,
  }));

  battleTimeFilterOptions = Object.entries(battleTimeFilterDisplayNames).map(([value, label]) => ({
    value: Number(value),
    label,
  }));
  selectedBattleFilter = 0; // Default filter to show only won battles
  selectedTimeFilter = 0; // Default time filter to current year
  batchNumber = 1; // Current batch number for pagination
  hasMoreData = false; // Flag to indicate if more data can be loaded
  loadMoreButtonConfig = loadMoreButtonConfig; // Configuration for the "Load More" button

  private readonly snackbar = inject(SnackbarService); // Snackbar service for showing messages
  private readonly userBattleService = inject(UserBattlesService); // Service to fetch user battles
  private readonly destroy$ = new Subject<void>(); // Subject to unsubscribe from observables

  private lastWheelTs = 0; // Timestamp of last scroll wheel event to throttle scrolling
  private touchStartY = 0; // Y position when touch starts
  private touchStartIndex = 0; // Index of item at touch start position

  ngOnInit(): void {
    this.getUserRecentBattles(); // Fetch user's recent battles on component initialization
  }

  ngOnChanges(changes: SimpleChanges) {
    // Update visible window when the input list changes
    if (changes['recentBattlesList']) {
      this.updateVisibleWindow();
      setTimeout(() => this.scrollToTop(), 50); // Reset scroll to top
    }
  }

  get subtitle(): string {
    const parts: string[] = [];

    // Battle filter
    switch (this.selectedBattleFilter) {
      case this.battleFilterType.won:
        parts.push('Won battles');
        break;
      case this.battleFilterType.lost:
        parts.push('Lost battles');
        break;
      case this.battleFilterType.draw:
        parts.push('Drawn battles');
        break;
      default:
        parts.push('All battles');
        break;
    }

    // Time filter
    switch (this.selectedTimeFilter) {
      case this.battleTimeFilterType.last_2_Days:
        parts.push('from last 2 days');
        break;
      case this.battleTimeFilterType.last_7_Days:
        parts.push('from last 7 days');
        break;
      case this.battleTimeFilterType.current_month:
        parts.push('from this month');
        break;
      case this.battleTimeFilterType.last_quarter:
        parts.push('from last quarter');
        break;
      case this.battleTimeFilterType.current_year:
        parts.push('from this year');
        break;
      case this.battleTimeFilterType.last_year:
        parts.push('from last year');
        break;
      default:
        parts.push('of all time');
        break;
    }

    return `Showing ${parts.join(' ')}`;
  }

  battleFilterChanged(newFilter: BattleFilterType): void {
    // Reset state and fetch battles when filters change
    this.selectedBattleFilter = newFilter;
    this.batchNumber = 1;
    this.recentBattlesList = [];
    this.getUserRecentBattles();
  }

  timeFilterChanged(newFilter: BattleTimeFilterType): void {
    // Reset state and fetch battles when time filter changes
    this.selectedTimeFilter = newFilter;
    this.batchNumber = 1;
    this.recentBattlesList = [];
    this.getUserRecentBattles();
  }

  loadMore(): void {
    if (!this.hasMoreData) return; // Do nothing if no more data
    this.batchNumber++;
    this.getUserRecentBattles(); // Fetch next batch of battles
  }

  // Fetch recent battles from the service
  getUserRecentBattles() {
    const payLoad: UserRecentBattlesRequestDto = {
      batchNumber: this.batchNumber,
      filterBy: this.selectedBattleFilter !== 0 ? this.selectedBattleFilter : null,
      timefilterBy: this.selectedTimeFilter !== 0 ? this.selectedTimeFilter : null,
    };
    this.userBattleService
      .getUserRecentBattles(payLoad)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.statusCode === 200 && res.result && res.data) {
            this.recentBattlesList.push(...res.data.battles);
            this.hasMoreData = res.data.hasMore;
            this.updateVisibleWindow();
          } else {
            this.snackbar.showError(res.message); // Show error if API fails
          }
        },
        error: (err) => {
          this.snackbar.showError(err.error.message); // Show network or unexpected errors
        },
      });
  }

  // Return tag configuration for a battle result
  getTagConfigForBattleResult(recentBattle: UserRecentBattles): TagInputConfig {
    let backgroundColor: TagColor;
    let textColor: TagColor;

    switch (recentBattle.result) {
      case 'Lost':
        backgroundColor = 'lightRed';
        textColor = 'red';
        break;
      case 'Won':
        backgroundColor = 'lightGreen';
        textColor = 'green';
        break;
      case 'Draw':
        backgroundColor = 'lightOrange';
        textColor = 'orange';
        break;
      default:
        backgroundColor = 'white';
        textColor = 'black';
        break;
    }

    return {
      id: recentBattle.result,
      label: recentBattle.result,
      type: 'static',
      isSelected: false,
      hasBorder: false,
      backgroundColor,
      textColor,
    };
  }

  // Return initials for a given name
  getInitials(name: string): string {
    return globalGetInitials(name);
  }

  // Return color class for user avatar based on name hash
  getInitialsColorClass(name: string): string {
    return globalGetInitialsColorClass(name);
  }

  // Handle mouse wheel scrolling
  onWheel(event: WheelEvent): void {
    event.preventDefault();
    const now = Date.now();
    if (now - this.lastWheelTs < 120) return; // Throttle wheel events
    this.lastWheelTs = now;
    this.moveWindowBy(event.deltaY > 0 ? 1 : -1); // Move visible window up/down
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    event.preventDefault();
    this.touchStartY = event.touches[0].clientY;
    const items = this.getItemElements();
    this.touchStartIndex = this.findClosestIndex(items, this.touchStartY); // Store touched item index
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    event.preventDefault();
    const touchEndY = event.changedTouches[0].clientY;
    const delta = this.touchStartY - touchEndY;
    if (Math.abs(delta) < 30) return; // Ignore small movements

    const items = this.getItemElements();
    const touchEndIndex = this.findClosestIndex(items, touchEndY);
    this.moveWindowBy(this.touchStartIndex - touchEndIndex); // Scroll based on touch swipe
  }

  ngOnDestroy(): void {
    this.destroy$.next(); // Complete all subscriptions
    this.destroy$.complete();
  }

  // Get all recent battle DOM items
  private getItemElements(): HTMLElement[] {
    const container = this.listRef?.nativeElement as HTMLElement;
    if (!container) return [];
    return Array.from(container.querySelectorAll('.recent-battles-item')) as HTMLElement[];
  }

  // Find the index of the item closest to Y coordinate
  private findClosestIndex(items: HTMLElement[], y: number): number {
    if (!items || items.length === 0) return 0;
    let closest = 0;
    let closestDiff = Math.abs(items[0].getBoundingClientRect().top - y);
    for (let i = 1; i < items.length; i++) {
      const diff = Math.abs(items[i].getBoundingClientRect().top - y);
      if (diff < closestDiff) {
        closest = i;
        closestDiff = diff;
      }
    }
    return closest;
  }

  // Update the visible window based on currentStart
  private updateVisibleWindow() {
    const maxStart = Math.max(0, this.recentBattlesList.length - this.windowSize);
    if (this.currentStart > maxStart) this.currentStart = maxStart;

    this.visibleWindow = this.recentBattlesList
      .slice(this.currentStart, this.currentStart + this.windowSize)
      .map((battle, idx) => ({
        ...battle,
        globalIndex: this.currentStart + idx,
      }));
  }

  // Move the visible window up or down by delta items
  private moveWindowBy(delta: number) {
    const maxStart = Math.max(0, this.recentBattlesList.length - this.windowSize);
    this.currentStart = Math.min(Math.max(0, this.currentStart + delta), maxStart);
    this.updateVisibleWindow();
    this.scrollToTop(); // Scroll container to top after moving window
  }

  // Smooth scroll list to top
  private scrollToTop() {
    const el = this.listRef?.nativeElement as HTMLElement;
    if (!el) return;
    el.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
