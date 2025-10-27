import { TestBed } from '@angular/core/testing';
import { DisableQuizShortcutsDirective } from './disable-quiz-shortcuts.directive';
import { SnackbarService } from '../service/snackbar/snackbar.service';

describe('DisableQuizShortcutsDirective', () => {
  let directive: DisableQuizShortcutsDirective;
  let snackbarServiceMock: jest.Mocked<SnackbarService>;

  beforeEach(() => {
    // Mock SnackbarService
    snackbarServiceMock = {
      showWarning: jest.fn(),
    } as unknown as jest.Mocked<SnackbarService>;

    TestBed.configureTestingModule({
      providers: [
        DisableQuizShortcutsDirective,
        { provide: SnackbarService, useValue: snackbarServiceMock },
      ],
    });

    directive = TestBed.inject(DisableQuizShortcutsDirective);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Keyboard events', () => {
    const cases = [
      { key: 'c', ctrl: true, expected: 'CTRL + C' },
      { key: 'v', ctrl: true, expected: 'CTRL + V' },
      { key: 'w', ctrl: true, expected: 'CTRL + W' },
      { key: 'e', ctrl: true, expected: 'CTRL + E' },
      { key: 'r', ctrl: true, expected: 'CTRL + R' },
      { key: 't', ctrl: true, expected: 'CTRL + T' },
      { key: 'n', ctrl: true, expected: 'CTRL + N' },
      { key: 'f', ctrl: true, expected: 'CTRL + F' },
      { key: 'n', ctrl: true, shift: true, expected: 'CTRL + SHIFT + N' },
      { key: 't', ctrl: true, shift: true, expected: 'CTRL + SHIFT + T' },
      { key: 'r', ctrl: true, shift: true, expected: 'CTRL + SHIFT + R' },
      { key: 'f5', expected: 'F5' },
      { key: 'f4', alt: true, expected: 'ALT + F4' },
      { key: 'arrowleft', alt: true, expected: 'ALT + LEFT' },
      { key: 'arrowright', alt: true, expected: 'ALT + RIGHT' },
      { key: 'arrowup', alt: true, expected: 'ALT + UP' },
      { key: 'arrowdown', alt: true, expected: 'ALT + DOWN' },
      { key: 'alt', expected: 'ALT' },
    ];

    cases.forEach(({ key, ctrl = false, shift = false, alt = false, expected }) => {
      it(`should block and warn for ${expected}`, () => {
        const event = new KeyboardEvent('keydown', {
          key,
          ctrlKey: ctrl,
          shiftKey: shift,
          altKey: alt,
        });
        const preventSpy = jest.spyOn(event, 'preventDefault');

        directive.handleKeyboardEvent(event);

        expect(preventSpy).toHaveBeenCalled();
        expect(snackbarServiceMock.showWarning).toHaveBeenCalledWith(
          `The "${expected}" shortcut is disabled during the quiz.`,
        );
      });
    });

    it('should not block normal keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'a' });
      const preventSpy = jest.spyOn(event, 'preventDefault');

      directive.handleKeyboardEvent(event);

      expect(preventSpy).not.toHaveBeenCalled();
      expect(snackbarServiceMock.showWarning).not.toHaveBeenCalled();
    });
  });

  describe('Right-click', () => {
    it('should prevent contextmenu (right-click) and show warning', () => {
      const event = new MouseEvent('contextmenu');
      const preventSpy = jest.spyOn(event, 'preventDefault');

      directive.disableRightClick(event);

      expect(preventSpy).toHaveBeenCalled();
      expect(snackbarServiceMock.showWarning).toHaveBeenCalledWith(
        'The "RIGHT-CLICK" shortcut is disabled during the quiz.',
      );
    });
  });
});
