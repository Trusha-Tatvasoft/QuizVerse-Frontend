import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { platformMessages } from '../../../utils/constants';

@Injectable({ providedIn: 'root' })
export class CheatPreventionService implements OnDestroy {
  private readonly destroy$ = new Subject<void>();

  // Emits reasons why quiz should be auto-submitted
  private readonly violationSubject = new Subject<string>();
  violations$ = this.violationSubject.asObservable();

  private devToolsCheck?: number;

  /** Start monitoring for cheat attempts */
  startMonitoring(): void {
    document.addEventListener('fullscreenchange', this.fullScreenHandler);
    document.addEventListener('visibilitychange', this.visibilityHandler);
    window.addEventListener('blur', this.blurHandler);

    this.detectDevTools();
  }

  stopMonitoring(): void {
    document.removeEventListener('fullscreenchange', this.fullScreenHandler);
    document.removeEventListener('visibilitychange', this.visibilityHandler);
    window.removeEventListener('blur', this.blurHandler);

    if (this.devToolsCheck) clearInterval(this.devToolsCheck);
  }

  /** Handlers */
  private readonly fullScreenHandler = () => {
    const isFullScreen = !!document.fullscreenElement;
    if (!isFullScreen) {
      this.violationSubject.next(platformMessages.fullScreenExit);
    }
  };

  private readonly visibilityHandler = () => {
    if (document.hidden) {
      this.violationSubject.next(platformMessages.switchTab);
    }
  };

  private readonly blurHandler = () => {
    this.violationSubject.next(platformMessages.windowsLostFocus);
  };

  /** DevTools detection */
  private detectDevTools(): void {
    const threshold = 160;
    this.devToolsCheck = window.setInterval(() => {
      if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
      ) {
        this.violationSubject.next(platformMessages.openedDeveloperTools);
        if (this.devToolsCheck) clearInterval(this.devToolsCheck);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    this.stopMonitoring();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
