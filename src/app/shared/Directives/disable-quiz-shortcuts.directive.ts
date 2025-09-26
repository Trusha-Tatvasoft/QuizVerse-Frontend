import { Directive, HostListener, inject } from '@angular/core';
import { SnackbarService } from '../service/snackbar/snackbar.service';

@Directive({
  selector: '[appDisableQuizShortcuts]',
})
export class DisableQuizShortcutsDirective {
  private readonly snackbar = inject(SnackbarService);

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    const key = event.key.toLowerCase();

    const isBlocked =
      (event.ctrlKey && ['c', 'v', 'w', 'e', 'r', 't', 'n'].includes(key)) ||
      (event.ctrlKey && event.shiftKey && ['n', 't'].includes(key)) ||
      ['shift', 'alt'].includes(key) ||
      key === 'f5' ||
      (event.altKey && key === 'f4');

    if (isBlocked) {
      event.preventDefault();
      this.showBlockedShortcutWarning(key);
    }
  }

  @HostListener('document:contextmenu', ['$event'])
  disableRightClick(event: MouseEvent) {
    event.preventDefault();
    this.showBlockedShortcutWarning('right-click');
  }

  private showBlockedShortcutWarning(key: string) {
    const message = `The "${key.toUpperCase()}" shortcut is disabled during the quiz.`;
    this.snackbar.showWarning(message);
  }
}
