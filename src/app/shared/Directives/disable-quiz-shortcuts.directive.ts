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
      (event.ctrlKey && ['c', 'v', 'w', 'e', 'r', 't', 'n', 'f'].includes(key)) ||
      (event.ctrlKey && event.shiftKey && ['n', 't', 'r'].includes(key)) ||
      ['alt'].includes(key) ||
      key === 'f5' ||
      (event.altKey && key === 'f4') ||
      ['tab'].includes(key) ||
      (event.altKey && ['arrowleft', 'arrowright', 'arrowup', 'arrowdown'].includes(key));

    if (isBlocked) {
      event.preventDefault();

      let shortcut = key.toUpperCase();

      // Format Ctrl shortcuts
      if (event.ctrlKey && event.shiftKey) {
        shortcut = `Ctrl + Shift + ${key.toUpperCase()}`;
      } else if (event.ctrlKey) {
        shortcut = `Ctrl + ${key.toUpperCase()}`;
      }

      // Format Alt shortcuts
      if (event.altKey && key === 'f4') {
        shortcut = 'Alt + F4';
      } else if (event.altKey && key.startsWith('arrow')) {
        shortcut = `Alt + ${key.replace('arrow', '').toUpperCase()}`;
      }

      this.showBlockedShortcutWarning(shortcut);
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
