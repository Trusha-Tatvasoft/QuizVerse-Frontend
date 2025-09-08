import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  Input,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-scroll-window',
  imports: [CommonModule],
  templateUrl: './scroll-window.component.html',
  styleUrl: './scroll-window.component.scss',
})
export class ScrollWindowComponent<T extends { rank: number }> {
  @ViewChild('list', { static: true }) listRef!: ElementRef<HTMLDivElement>;

  /** Full dataset */
  @Input() items: T[] = [];

  /** How many items visible at once */
  @Input() windowSize = 5;

  /** Template reference from parent (how to render each item) */
  @Input() itemTemplate!: TemplateRef<any>;

  /** Optional trackBy function for better rendering */
  @Input() trackByFn: (index: number, item: T) => any = (index, item) =>
    (item as any).id ?? (item as any).userName ?? `${item.rank}-${index}`;

  visibleWindow: T[] = [];
  currentStart = 0;

  private lastWheelTs = 0;
  private touchStartY = 0;
  private touchStartIndex = 0;

  ngOnChanges(changes: SimpleChanges) {
    // When items change, clamp start and recalc. Wait a bit so projected templates render before any DOM reads.
    if (changes['items']) {
      const maxStart = Math.max(0, this.items.length - this.windowSize);
      if (this.currentStart > maxStart) this.currentStart = maxStart;

      this.updateVisibleWindow();

      // allow projected templates to render so getItemElements/findClosestIndex works
      setTimeout(() => {
        // optional: scroll to top on new data load
        this.scrollToTop();
      }, 50);
    } else {
      this.updateVisibleWindow();
    }
  }

  /** ---------------- Scroll & Touch ---------------- */
  onWheel(event: WheelEvent): void {
    event.preventDefault();
    const now = Date.now();
    if (now - this.lastWheelTs < 120) return;
    this.lastWheelTs = now;

    this.moveWindowBy(event.deltaY > 0 ? 1 : -1);
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    event.preventDefault();
    this.touchStartY = event.touches[0].clientY;

    const items = this.getItemElements();
    this.touchStartIndex = this.findClosestIndex(items, this.touchStartY);
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    event.preventDefault();
    const touchEndY = event.changedTouches[0].clientY;
    const delta = this.touchStartY - touchEndY;

    if (Math.abs(delta) < 30) return;

    const items = this.getItemElements();
    const touchEndIndex = this.findClosestIndex(items, touchEndY);
    this.moveWindowBy(this.touchStartIndex - touchEndIndex);
  }

  /** ---------------- Helpers ---------------- */

  // robust selector: supports multiple item class conventions
  private getItemElements(): HTMLElement[] {
    const container = this.listRef?.nativeElement as HTMLElement;
    if (!container) return [];
    const nodes = container.querySelectorAll('.scroll-item, .leaderboard-item, [data-scroll-item]');
    return Array.from(nodes) as HTMLElement[];
  }

  // safer index finder (handles empty arrays)
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

  // helper to detect logged-in user when parent uses different property names
  private isLoggedInFlag(item: any): boolean {
    return Boolean(
      item?.is_loggedin_user ??
        item?.isLoggedInUser ??
        item?.is_logged_in_user ??
        item?.isLoggedIn ??
        false,
    );
  }

  private updateVisibleWindow() {
    const maxStart = Math.max(0, this.items.length - this.windowSize);
    if (this.currentStart > maxStart) this.currentStart = maxStart;

    let slice = this.items.slice(this.currentStart, this.currentStart + this.windowSize);

    const loggedInUser = this.items.find((u: any) => this.isLoggedInFlag(u));
    const rankZero = this.items.find((u: any) => u.rank === 0);

    if (loggedInUser) {
      const userIndex = this.items.indexOf(loggedInUser);

      if (!slice.some((u: any) => this.isLoggedInFlag(u))) {
        if (userIndex < this.currentStart) {
          if (this.currentStart + this.windowSize >= this.items.length) {
            // at end: preserve tail by dropping the first element of the slice
            slice = [loggedInUser, ...slice.slice(1, this.windowSize)];
          } else {
            // normal: insert at top, drop last
            slice = [loggedInUser, ...slice.slice(0, this.windowSize - 1)];
          }
        } else if (userIndex >= this.currentStart + this.windowSize) {
          slice = [...slice.slice(0, this.windowSize - 1), loggedInUser];
        }
      }
    }

    if (rankZero && !slice.includes(rankZero)) {
      if (slice.length >= this.windowSize) {
        slice = [...slice.slice(0, this.windowSize - 1), rankZero];
      } else {
        slice = [...slice, rankZero];
      }
    }

    this.visibleWindow = slice;
  }

  private moveWindowBy(delta: number) {
    const maxStart = Math.max(0, this.items.length - this.windowSize);
    this.currentStart = Math.min(Math.max(0, this.currentStart + delta), maxStart);
    this.updateVisibleWindow();
    this.scrollToTop();
  }

  private scrollToTop() {
    const el = this.listRef?.nativeElement as HTMLElement;
    if (!el) return;
    el.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
