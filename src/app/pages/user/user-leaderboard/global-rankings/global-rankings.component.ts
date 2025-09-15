import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LeaderboardEntry } from '../interfaces/user-leaderboard.interface';
import { LeaderboardService } from '../../../../services/user/leaderboard/leaderboard.service';
import { MatIcon } from '@angular/material/icon';
import { environment } from '../../../../../environments/environment.dev';
import { Subject, takeUntil } from 'rxjs';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { platformMessages } from '../../../../utils/constants';

@Component({
  selector: 'app-global-rankings',
  imports: [CommonModule, MatProgressSpinnerModule, MatIcon],
  templateUrl: './global-rankings.component.html',
  styleUrl: './global-rankings.component.scss',
})
export class GlobalRankingsComponent {
  // Template references
  @ViewChild('list', { static: true }) listRef!: ElementRef<HTMLDivElement>;

  // Configs & state
  leaderboard: LeaderboardEntry[] = [];
  visibleWindow: LeaderboardEntry[] = [];
  windowSize = 6;
  currentStart = 0;
  loading = true;

  // Injected services
  leaderboardService = inject(LeaderboardService);
  snackbar = inject(SnackbarService);

  // Private helpers
  private readonly destroy$ = new Subject<void>();
  private touchStartY = 0;
  private touchStartIndex = 0;
  private lastWheelTs = 0;

  ngOnInit(): void {
    this.fetchLeaderboard();
  }

  /**
   * Handles mouse wheel scrolling.
   * - Prevents super-fast multiple triggers by limiting to once every 120ms.
   * - Scrolls down when wheel goes down, up when wheel goes up.
   */
  onWheel(event: WheelEvent): void {
    event.preventDefault(); // stop page from scrolling
    const now = Date.now();
    if (now - this.lastWheelTs < 120) return; // throttle scrolling
    this.lastWheelTs = now;

    this.moveWindowBy(event.deltaY > 0 ? 1 : -1); // scroll leaderboard items
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    event.preventDefault(); // stop page scroll

    // Store the Y position where the user first touched
    this.touchStartY = event.touches[0].clientY;

    const container = this.listRef.nativeElement as HTMLElement;
    const items = Array.from(container.querySelectorAll('.leaderboard-item')) as HTMLElement[];

    // Figure out which leaderboard item was closest to the touch start point
    this.touchStartIndex = items.reduce((closestIndex, el, i) => {
      const rect = el.getBoundingClientRect();
      const diff = Math.abs(rect.top - this.touchStartY);
      return diff < Math.abs(items[closestIndex].getBoundingClientRect().top - this.touchStartY)
        ? i
        : closestIndex;
    }, 0);
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    event.preventDefault(); // stop page scroll

    // Get Y position where user released their finger
    const touchEndY = event.changedTouches[0].clientY;
    const delta = this.touchStartY - touchEndY;

    if (Math.abs(delta) < 30) return; // Ignore small swipes (less than 30px movement)

    const container = this.listRef.nativeElement as HTMLElement;
    const items = Array.from(container.querySelectorAll('.leaderboard-item')) as HTMLElement[];

    // Figure out which leaderboard item is closest to touch end point
    const touchEndIndex = items.reduce((closestIndex, el, i) => {
      const diff = Math.abs(el.getBoundingClientRect().top - touchEndY);
      return diff < Math.abs(items[closestIndex].getBoundingClientRect().top - touchEndY)
        ? i
        : closestIndex;
    }, 0);

    // Calculate how many items to move (swipe up/down = move window)
    const moveBy = this.touchStartIndex - touchEndIndex;
    this.moveWindowBy(moveBy);
  }

  /** Helps Angular optimize rendering by using rank as unique identifier */
  trackByRank = (_: number, item: LeaderboardEntry) => item.rank;

  /** Extract initials (first 2 letters) from a user's full name */
  getInitials(name: string): string {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  }

  /** Replace broken/missing profile pictures with an empty string (fallback) */
  onImageError(entry: LeaderboardEntry) {
    entry.profilePic = '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Fetch leaderboard data from API
   * - Maps profile pictures to full URLs
   * - Updates visible items
   * - Auto-scrolls to top after loading
   */
  private fetchLeaderboard(): void {
    this.loading = true;
    this.leaderboardService
      .getGlobalLeaderboard()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const raw = res?.data ?? [];
          this.leaderboard = raw.map((u) => ({
            ...u,
            profilePic: u.profilePic ? `${environment.imageBaseUrl}/${u.profilePic}` : '',
          }));

          this.updateVisibleWindow();
          this.loading = false;

          // Delay to allow rendering, then scroll to top smoothly
          setTimeout(() => this.scrollToTop(), 50);
        },
        error: (err) => {
          this.loading = false;
          this.leaderboard = [];

          this.snackbar.showError(
            platformMessages.errorTitle,
            err.error?.message || platformMessages.errorMessage,
          );
        },
      });
  }

  /**
   * Updates the "visible leaderboard window" (the currently shown slice)
   * - Ensures logged-in user is always visible even if they’re outside the current window
   */
  private updateVisibleWindow(): void {
    let slice = this.leaderboard.slice(this.currentStart, this.currentStart + this.windowSize);
    const user = this.loggedInUserEntry;

    if (!user) {
      this.visibleWindow = slice;
      return;
    }

    const userIndex = this.leaderboard.indexOf(user);

    // If the logged-in user is outside the current window, insert them
    if (!slice.some((u) => u.is_loggedin_user)) {
      if (userIndex < this.currentStart) {
        // User is above the window → add them at the top
        slice = [user, ...slice.slice(0, this.windowSize - 1)];
      } else if (userIndex >= this.currentStart + this.windowSize) {
        // User is below the window → add them at the bottom
        slice = [...slice.slice(0, this.windowSize - 1), user];
      }
    }

    this.visibleWindow = slice;
  }

  /** Smoothly scroll the leaderboard list back to the top */
  private scrollToTop(): void {
    const container = this.listRef.nativeElement as HTMLElement;
    if (!container) return;
    container.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Shifts the window of visible leaderboard items
   * - `delta` = how many items to move up or down
   * - Keeps within bounds (0 to max available items)
   */
  private moveWindowBy(delta: number) {
    const maxStart = this.leaderboard.length - this.windowSize;
    this.currentStart = Math.min(Math.max(0, this.currentStart + delta), maxStart);
    this.updateVisibleWindow();
    this.scrollToTop();
  }

  private get loggedInUserEntry(): LeaderboardEntry | undefined {
    return this.leaderboard.find((u) => u.is_loggedin_user);
  }
}
