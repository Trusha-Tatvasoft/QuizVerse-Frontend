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

    // Configure TestBed for injection context
    TestBed.configureTestingModule({
      providers: [
        DisableQuizShortcutsDirective,
        { provide: SnackbarService, useValue: snackbarServiceMock },
      ],
    });

    // Inject directive from Angular context
    directive = TestBed.inject(DisableQuizShortcutsDirective);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Keyboard events', () => {
    const blockedKeys = [
      { key: 'c', ctrl: true },
      { key: 'v', ctrl: true },
      { key: 'w', ctrl: true },
      { key: 'e', ctrl: true },
      { key: 'r', ctrl: true },
      { key: 't', ctrl: true },
      { key: 'n', ctrl: true },
      { key: 'n', ctrl: true, shift: true },
      { key: 't', ctrl: true, shift: true },
      { key: 'Shift' },
      { key: 'Alt' },
      { key: 'F5', keyCode: 116 },
      { key: 'F4', alt: true },
    ];

    blockedKeys.forEach(({ key, ctrl = false, shift = false, alt = false, keyCode }) => {
      it(`should prevent ${ctrl ? 'Ctrl+' : ''}${shift ? 'Shift+' : ''}${alt ? 'Alt+' : ''}${key}`, () => {
        const event = new KeyboardEvent('keydown', {
          key,
          ctrlKey: ctrl,
          shiftKey: shift,
          altKey: alt, // <-- added here
          keyCode,
        });
        const preventSpy = jest.spyOn(event, 'preventDefault');

        directive.handleKeyboardEvent(event);

        expect(preventSpy).toHaveBeenCalled();
        expect(snackbarServiceMock.showWarning).toHaveBeenCalledWith(
          expect.stringContaining(key.toUpperCase()),
        );
      });
    });

    it('should not prevent other keys', () => {
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
        expect.stringContaining('RIGHT-CLICK'),
      );
    });
  });
});
