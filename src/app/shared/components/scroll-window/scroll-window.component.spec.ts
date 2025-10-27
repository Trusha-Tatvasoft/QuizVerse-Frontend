import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { ScrollWindowComponent } from './scroll-window.component';

interface TestItem {
  id?: number;
  userName?: string;
  rank: number;
  is_loggedin_user?: boolean;
  isLoggedInUser?: boolean;
  is_logged_in_user?: boolean;
  isLoggedIn?: boolean;
}

@Component({
  template: `
    <app-scroll-window
      [items]="items"
      [windowSize]="windowSize"
      [itemTemplate]="tpl"
    ></app-scroll-window>

    <ng-template #tpl let-item>
      <div class="scroll-item">{{ item.userName || item.id }}</div>
    </ng-template>
  `,
  imports: [CommonModule, ScrollWindowComponent],
  standalone: true,
})
class HostComponent {
  @ViewChild(ScrollWindowComponent) scrollWin!: ScrollWindowComponent<TestItem>;
  @ViewChild('tpl', { static: true }) tpl!: TemplateRef<any>;
  items: TestItem[] = [];
  windowSize = 3;
}

describe('ScrollWindowComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      configurable: true,
      writable: true,
      value: jest.fn(),
    });

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(host.scrollWin).toBeTruthy();
  });

  it('should render first window slice', () => {
    host.items = [
      { id: 1, rank: 1 },
      { id: 2, rank: 2 },
      { id: 3, rank: 3 },
      { id: 4, rank: 4 },
    ];
    fixture.detectChanges();

    expect(host.scrollWin.visibleWindow.length).toBe(3);
    expect(host.scrollWin.visibleWindow[0].id).toBe(1);
  });

  it('should adjust currentStart when items shrink', () => {
    host.items = Array.from({ length: 10 }, (_, i) => ({ id: i, rank: i }));
    fixture.detectChanges();
    host.scrollWin.currentStart = 8;
    host.items = [{ id: 1, rank: 1 }];
    fixture.detectChanges();
    expect(host.scrollWin.currentStart).toBe(0);
  });

  it('should include logged-in user if outside slice (top)', () => {
    host.items = [
      { id: 1, rank: 1, isLoggedInUser: true },
      { id: 2, rank: 2 },
      { id: 3, rank: 3 },
      { id: 4, rank: 4 },
    ];
    host.scrollWin.currentStart = 2;
    fixture.detectChanges();
    expect(host.scrollWin.visibleWindow.some((i) => i.isLoggedInUser)).toBe(true);
  });

  it('should include logged-in user if outside slice (bottom)', () => {
    host.items = [
      { id: 1, rank: 1 },
      { id: 2, rank: 2 },
      { id: 3, rank: 3 },
      { id: 4, rank: 4, isLoggedInUser: true },
    ];
    host.scrollWin.currentStart = 0;
    fixture.detectChanges();
    expect(host.scrollWin.visibleWindow.some((i) => i.isLoggedInUser)).toBe(true);
  });

  it('should include rank 0 if not visible', () => {
    host.items = [
      { id: 1, rank: 1 },
      { id: 2, rank: 2 },
      { id: 3, rank: 0 },
    ];
    host.scrollWin.windowSize = 2;
    fixture.detectChanges();
    expect(host.scrollWin.visibleWindow.some((i) => i.rank === 0)).toBe(true);
  });

  it('should include rank 0 if slice shorter than windowSize', () => {
    host.items = [
      { id: 1, rank: 1 },
      { id: 2, rank: 0 },
    ];
    host.scrollWin.windowSize = 5;
    fixture.detectChanges();
    expect(host.scrollWin.visibleWindow.some((i) => i.rank === 0)).toBe(true);
  });

  it('should not duplicate rank 0 if already in slice', () => {
    host.items = [
      { id: 1, rank: 0 },
      { id: 2, rank: 2 },
      { id: 3, rank: 3 },
    ];
    fixture.detectChanges();
    const countRankZero = host.scrollWin.visibleWindow.filter((i) => i.rank === 0).length;
    expect(countRankZero).toBe(1);
  });

  it('should handle logged-in user and rank 0 together', () => {
    host.items = [
      { id: 1, rank: 1, isLoggedInUser: true },
      { id: 2, rank: 5 },
      { id: 3, rank: 0 },
      { id: 4, rank: 6 },
    ];
    host.scrollWin.windowSize = 2;
    host.scrollWin.currentStart = 2;
    fixture.detectChanges();

    expect(host.scrollWin.visibleWindow.some((i) => i.isLoggedInUser)).toBe(true);
    expect(host.scrollWin.visibleWindow.some((i) => i.rank === 0)).toBe(true);
  });

  it('should handle onWheel scrolling down and up', () => {
    host.items = Array.from({ length: 6 }, (_, i) => ({ id: i, rank: i }));
    fixture.detectChanges();

    const container = host.scrollWin.listRef.nativeElement;
    container.scrollTo = jest.fn();

    const eventDown = new WheelEvent('wheel', { deltaY: 100 });
    host.scrollWin.onWheel(eventDown);
    expect(host.scrollWin.currentStart).toBeGreaterThanOrEqual(0);

    const eventUp = new WheelEvent('wheel', { deltaY: -100 });
    host.scrollWin.onWheel(eventUp);
    expect(host.scrollWin.currentStart).toBeGreaterThanOrEqual(0);

    expect(container.scrollTo).toHaveBeenCalled();
  });

  it('should handle touchstart and touchend with big delta', () => {
    host.items = Array.from({ length: 6 }, (_, i) => ({ id: i, rank: i }));
    fixture.detectChanges();

    const container = host.scrollWin.listRef.nativeElement;
    container.innerHTML = `
      <div class="scroll-item" style="position:absolute;top:0px;height:50px"></div>
      <div class="scroll-item" style="position:absolute;top:100px;height:50px"></div>
    `;

    const touchStartEvent = {
      preventDefault: jest.fn(),
      touches: [{ clientY: 100 }],
    } as unknown as TouchEvent;

    host.scrollWin.onTouchStart(touchStartEvent);

    const touchEndEvent = {
      preventDefault: jest.fn(),
      changedTouches: [{ clientY: 300 }],
    } as unknown as TouchEvent;

    host.scrollWin.onTouchEnd(touchEndEvent);

    expect(host.scrollWin.currentStart).toBeGreaterThanOrEqual(0);
  });

  it('should debounce wheel events', () => {
    const e = new WheelEvent('wheel', { deltaY: 100 });
    host.scrollWin['lastWheelTs'] = Date.now();
    host.scrollWin.onWheel(e);
    expect(host.scrollWin.currentStart).toBe(0);
  });

  it('should skip touchend if delta < 30', () => {
    const touchStart = { preventDefault: jest.fn(), touches: [{ clientY: 100 }] } as any;
    host.scrollWin.onTouchStart(touchStart);

    const touchEnd = { preventDefault: jest.fn(), changedTouches: [{ clientY: 95 }] } as any;
    host.scrollWin.onTouchEnd(touchEnd);

    expect(host.scrollWin.currentStart).toBe(0);
  });

  it('getItemElements should handle no listRef', () => {
    (host.scrollWin as any).listRef = null!;
    expect((host.scrollWin as any).getItemElements()).toEqual([]);
  });

  it('findClosestIndex should return 0 if no items', () => {
    expect((host.scrollWin as any).findClosestIndex([], 50)).toBe(0);
  });

  it('isLoggedInFlag should detect all variants', () => {
    expect((host.scrollWin as any).isLoggedInFlag({ isLoggedInUser: true })).toBe(true);
    expect((host.scrollWin as any).isLoggedInFlag({})).toBe(false);
  });

  it('scrollToTop should safely no-op if no element', () => {
    (host.scrollWin as any).listRef = null!;
    expect(() => (host.scrollWin as any).scrollToTop()).not.toThrow();
  });

  it('trackByFn should use id, userName, or fallback', () => {
    const fn = host.scrollWin.trackByFn;
    expect(fn(0, { id: 1, rank: 1 })).toBe(1);
    expect(fn(0, { userName: 'abc', rank: 1 })).toBe('abc');
    expect(fn(1, { rank: 5 })).toBe('5-1');
  });

  it('should return closer index when second item is nearer to y', () => {
    const el1 = document.createElement('div');
    jest.spyOn(el1, 'getBoundingClientRect').mockReturnValue({ top: 0 } as DOMRect);

    const el2 = document.createElement('div');
    jest.spyOn(el2, 'getBoundingClientRect').mockReturnValue({ top: 50 } as DOMRect);

    const index = (host.scrollWin as any).findClosestIndex([el1, el2], 45);
    expect(index).toBe(1);
  });

  it('should call moveWindowBy with +1 when scrolling down', () => {
    const spy = jest.spyOn(host.scrollWin as any, 'moveWindowBy');
    const event = new WheelEvent('wheel', { deltaY: 200 });
    host.scrollWin.onWheel(event);
    expect(spy).toHaveBeenCalledWith(1);
  });

  it('should call moveWindowBy with -1 when scrolling up', () => {
    const spy = jest.spyOn(host.scrollWin as any, 'moveWindowBy');
    (host.scrollWin as any).lastWheelTs = Date.now() - 200;
    const event = new WheelEvent('wheel', { deltaY: -200 });
    host.scrollWin.onWheel(event);
    expect(spy).toHaveBeenCalledWith(-1);
  });

  it('should clamp currentStart when greater than maxStart', () => {
    host.items = Array.from({ length: 3 }, (_, i) => ({ id: i, rank: i }));
    host.scrollWin.windowSize = 2;
    host.scrollWin.currentStart = 10;
    (host.scrollWin as any).updateVisibleWindow();
    expect(host.scrollWin.currentStart).toBeLessThanOrEqual(1);
  });

  it('should handle empty items gracefully', () => {
    host.items = [];
    fixture.detectChanges();
    expect(host.scrollWin.visibleWindow).toEqual([]);
  });

  it('should insert logged-in user at top and drop last when above currentStart', () => {
    host.items = [
      { id: 1, rank: 1, isLoggedInUser: true },
      { id: 2, rank: 2 },
      { id: 3, rank: 3 },
      { id: 4, rank: 4 },
      { id: 5, rank: 5 },
    ];
    host.scrollWin.windowSize = 3;
    host.scrollWin.currentStart = 2;
    fixture.detectChanges();

    const visible = host.scrollWin.visibleWindow;
    expect(visible[0].isLoggedInUser).toBe(true);
    expect(visible.length).toBe(3);
  });

  it('should append rankZero when slice shorter than windowSize', () => {
    host.items = [
      { id: 1, rank: 1 },
      { id: 2, rank: 0 }, // rankZero
    ];
    host.scrollWin.windowSize = 5; // ensures slice shorter
    fixture.detectChanges();

    const visible = host.scrollWin.visibleWindow;
    expect(visible.some((i) => i.rank === 0)).toBe(true);
  });
});
