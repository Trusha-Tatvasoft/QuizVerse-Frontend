import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizResultPageComponent } from './quiz-result-page.component';
import { ActivatedRoute } from '@angular/router';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { platformMessages } from '../../../utils/constants';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('QuizResultPageComponent', () => {
  let component: QuizResultPageComponent;
  let fixture: ComponentFixture<QuizResultPageComponent>;
  let mockSnackbarService: jest.Mocked<SnackbarService>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockSnackbarService = {
      showError: jest.fn(),
      showSuccess: jest.fn(),
      showInfo: jest.fn(),
      showWarning: jest.fn(),
    } as any;

    const mockParamMap = {
      get: jest.fn(),
      getAll: jest.fn().mockReturnValue([]),
      has: jest.fn().mockReturnValue(true),
      keys: [],
    };

    mockActivatedRoute = {
      snapshot: {
        paramMap: mockParamMap,
      },
    };

    await TestBed.configureTestingModule({
      imports: [QuizResultPageComponent, HttpClientTestingModule],
      providers: [
        { provide: SnackbarService, useValue: mockSnackbarService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizResultPageComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call decodeRouteId on initialization', () => {
      const spy = jest.spyOn(component, 'decodeRouteId');
      component.ngOnInit();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('decodeRouteId', () => {
    it('should decode a valid base64 encoded numeric id', () => {
      const validId = btoa('123'); // base64 encode number as string
      (mockActivatedRoute.snapshot.paramMap.get as jest.Mock).mockReturnValue(
        encodeURIComponent(validId),
      );

      component.decodeRouteId();

      expect(component.decodedQuizId).toBe(123);
      expect(mockSnackbarService.showError).not.toHaveBeenCalled();
    });

    it('should show error if encoded id is invalid base64', () => {
      const invalidId = '%'; // invalid encoding
      (mockActivatedRoute.snapshot.paramMap.get as jest.Mock).mockReturnValue(invalidId);

      component.decodeRouteId();

      expect(component.decodedQuizId).toBe(0);
      expect(mockSnackbarService.showError).toHaveBeenCalledWith(
        platformMessages.errorMessage,
        platformMessages.invalidQuizId,
      );
    });

    it('should show error if decoded value is not a number', () => {
      const notANumber = btoa('abc'); // base64 of a non-number
      (mockActivatedRoute.snapshot.paramMap.get as jest.Mock).mockReturnValue(
        encodeURIComponent(notANumber),
      );

      component.decodeRouteId();

      expect(component.decodedQuizId).toBe(0);
      expect(mockSnackbarService.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        platformMessages.invalidQuizId,
      );
    });

    it('should do nothing if route param id is null', () => {
      (mockActivatedRoute.snapshot.paramMap.get as jest.Mock).mockReturnValue(null);

      component.decodeRouteId();

      expect(component.decodedQuizId).toBeUndefined();
      expect(mockSnackbarService.showError).not.toHaveBeenCalled();
    });

    it('should do nothing if route param id is undefined', () => {
      (mockActivatedRoute.snapshot.paramMap.get as jest.Mock).mockReturnValue(undefined);

      component.decodeRouteId();

      expect(component.decodedQuizId).toBeUndefined();
      expect(mockSnackbarService.showError).not.toHaveBeenCalled();
    });

    it('should do nothing if route param id is empty string', () => {
      (mockActivatedRoute.snapshot.paramMap.get as jest.Mock).mockReturnValue('');

      component.decodeRouteId();

      expect(component.decodedQuizId).toBeUndefined();
      expect(mockSnackbarService.showError).not.toHaveBeenCalled();
    });

    describe('fullscreen exit functionality', () => {
      let mockDocument: any;

      beforeEach(() => {
        mockDocument = document as any;
      });

      afterEach(() => {
        // Clean up fullscreen mocks
        delete mockDocument.fullscreenElement;
        delete mockDocument.exitFullscreen;
        delete mockDocument.webkitExitFullscreen;
        delete mockDocument.msExitFullscreen;
      });

      it('should exit fullscreen using standard exitFullscreen when in fullscreen mode', async () => {
        const exitFullscreenMock = jest.fn().mockResolvedValue(undefined);
        mockDocument.fullscreenElement = document.createElement('div');
        mockDocument.exitFullscreen = exitFullscreenMock;

        const validId = btoa('123');
        (mockActivatedRoute.snapshot.paramMap.get as jest.Mock).mockReturnValue(
          encodeURIComponent(validId),
        );

        component.decodeRouteId();

        expect(exitFullscreenMock).toHaveBeenCalled();
        await Promise.resolve(); // Wait for async operation
      });

      it('should handle exitFullscreen error gracefully', async () => {
        const error = new Error('Fullscreen exit failed');
        const exitFullscreenMock = jest.fn().mockRejectedValue(error);
        mockDocument.fullscreenElement = document.createElement('div');
        mockDocument.exitFullscreen = exitFullscreenMock;

        const validId = btoa('123');
        (mockActivatedRoute.snapshot.paramMap.get as jest.Mock).mockReturnValue(
          encodeURIComponent(validId),
        );

        component.decodeRouteId();

        expect(exitFullscreenMock).toHaveBeenCalled();
        await Promise.resolve(); // Wait for async operation

        // Wait for the catch block to execute
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(mockSnackbarService.showError).toHaveBeenCalledWith(
          'Failed to exit fullscreen',
          error,
        );
      });

      it('should exit fullscreen using webkitExitFullscreen when standard method not available', () => {
        const webkitExitFullscreenMock = jest.fn();
        mockDocument.fullscreenElement = document.createElement('div');
        mockDocument.exitFullscreen = undefined;
        mockDocument.webkitExitFullscreen = webkitExitFullscreenMock;

        const validId = btoa('123');
        (mockActivatedRoute.snapshot.paramMap.get as jest.Mock).mockReturnValue(
          encodeURIComponent(validId),
        );

        component.decodeRouteId();

        expect(webkitExitFullscreenMock).toHaveBeenCalled();
      });

      it('should exit fullscreen using msExitFullscreen when other methods not available', () => {
        const msExitFullscreenMock = jest.fn();
        mockDocument.fullscreenElement = document.createElement('div');
        mockDocument.exitFullscreen = undefined;
        mockDocument.webkitExitFullscreen = undefined;
        mockDocument.msExitFullscreen = msExitFullscreenMock;

        const validId = btoa('123');
        (mockActivatedRoute.snapshot.paramMap.get as jest.Mock).mockReturnValue(
          encodeURIComponent(validId),
        );

        component.decodeRouteId();

        expect(msExitFullscreenMock).toHaveBeenCalled();
      });

      it('should not attempt to exit fullscreen when not in fullscreen mode', () => {
        const exitFullscreenMock = jest.fn().mockResolvedValue(undefined);
        mockDocument.fullscreenElement = null;
        mockDocument.exitFullscreen = exitFullscreenMock;

        const validId = btoa('123');
        (mockActivatedRoute.snapshot.paramMap.get as jest.Mock).mockReturnValue(
          encodeURIComponent(validId),
        );

        component.decodeRouteId();

        expect(exitFullscreenMock).not.toHaveBeenCalled();
      });

      it('should handle case when exitFullscreen is not a function', () => {
        mockDocument.fullscreenElement = document.createElement('div');
        mockDocument.exitFullscreen = 'not a function';
        mockDocument.webkitExitFullscreen = undefined;
        mockDocument.msExitFullscreen = undefined;

        const validId = btoa('123');
        (mockActivatedRoute.snapshot.paramMap.get as jest.Mock).mockReturnValue(
          encodeURIComponent(validId),
        );

        // Should not throw error
        expect(() => component.decodeRouteId()).not.toThrow();
      });
    });

    describe('edge cases', () => {
      it('should handle zero as valid quiz id', () => {
        const zeroId = btoa('0');
        (mockActivatedRoute.snapshot.paramMap.get as jest.Mock).mockReturnValue(
          encodeURIComponent(zeroId),
        );

        component.decodeRouteId();

        expect(component.decodedQuizId).toBe(0);
        expect(mockSnackbarService.showError).not.toHaveBeenCalled();
      });

      it('should handle negative numbers as valid quiz id', () => {
        const negativeId = btoa('-456');
        (mockActivatedRoute.snapshot.paramMap.get as jest.Mock).mockReturnValue(
          encodeURIComponent(negativeId),
        );

        component.decodeRouteId();

        expect(component.decodedQuizId).toBe(-456);
        expect(mockSnackbarService.showError).not.toHaveBeenCalled();
      });

      it('should handle decimal numbers', () => {
        const decimalId = btoa('123.45');
        (mockActivatedRoute.snapshot.paramMap.get as jest.Mock).mockReturnValue(
          encodeURIComponent(decimalId),
        );

        component.decodeRouteId();

        expect(component.decodedQuizId).toBe(123.45);
        expect(mockSnackbarService.showError).not.toHaveBeenCalled();
      });

      it('should handle very large numbers', () => {
        const largeId = btoa('999999999999');
        (mockActivatedRoute.snapshot.paramMap.get as jest.Mock).mockReturnValue(
          encodeURIComponent(largeId),
        );

        component.decodeRouteId();

        expect(component.decodedQuizId).toBe(999999999999);
        expect(mockSnackbarService.showError).not.toHaveBeenCalled();
      });

      it('should handle special characters in base64', () => {
        const specialChars = '!@#$%^&*()';
        const encodedSpecial = btoa(specialChars);
        (mockActivatedRoute.snapshot.paramMap.get as jest.Mock).mockReturnValue(
          encodeURIComponent(encodedSpecial),
        );

        component.decodeRouteId();

        expect(component.decodedQuizId).toBe(0);
        expect(mockSnackbarService.showError).toHaveBeenCalledWith(
          platformMessages.errorTitle,
          platformMessages.invalidQuizId,
        );
      });

      it('should handle whitespace in decoded value', () => {
        const whitespaceId = btoa('  123  ');
        (mockActivatedRoute.snapshot.paramMap.get as jest.Mock).mockReturnValue(
          encodeURIComponent(whitespaceId),
        );

        component.decodeRouteId();

        expect(component.decodedQuizId).toBe(123);
        expect(mockSnackbarService.showError).not.toHaveBeenCalled();
      });
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy$ subject', () => {
      const nextSpy = jest.spyOn(component['destroy$'], 'next');
      const completeSpy = jest.spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });

    it('should unsubscribe from all subscriptions', () => {
      const nextSpy = jest.spyOn(component['destroy$'], 'next');

      fixture.detectChanges(); // Initialize component
      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalledTimes(1);
    });
  });
});
