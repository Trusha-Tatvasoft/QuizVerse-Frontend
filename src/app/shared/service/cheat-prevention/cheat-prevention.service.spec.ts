import { TestBed } from '@angular/core/testing';
import { CheatPreventionService } from './cheat-prevention.service';
import { platformMessages } from '../../../utils/constants';

describe('CheatPreventionService', () => {
  let service: CheatPreventionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CheatPreventionService],
    });
    service = TestBed.inject(CheatPreventionService);
  });

  afterEach(() => {
    jest.useRealTimers();
    service.stopMonitoring();
  });

  it('should emit when fullscreen is exited', (done) => {
    service.startMonitoring();

    service.violations$.subscribe((msg) => {
      expect(msg).toBe(platformMessages.fullScreenExit);
      done();
    });

    // Mock fullscreen exit
    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      configurable: true,
    });
    document.dispatchEvent(new Event('fullscreenchange'));
  });

  it('should emit when visibility is hidden', (done) => {
    service.startMonitoring();

    service.violations$.subscribe((msg) => {
      expect(msg).toBe(platformMessages.switchTab);
      done();
    });

    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });

  it('should emit when window loses focus (blur)', (done) => {
    service.startMonitoring();

    service.violations$.subscribe((msg) => {
      expect(msg).toBe(platformMessages.windowsLostFocus);
      done();
    });

    window.dispatchEvent(new Event('blur'));
  });

  it('should emit when DevTools are detected', (done) => {
    jest.useFakeTimers();
    service.startMonitoring();

    service.violations$.subscribe((msg) => {
      expect(msg).toBe(platformMessages.openedDeveloperTools);
      done();
    });

    // Simulate DevTools dimensions
    Object.defineProperty(window, 'outerWidth', { value: 1000, configurable: true });
    Object.defineProperty(window, 'innerWidth', { value: 800, configurable: true });

    jest.advanceTimersByTime(1000);
  });

  it('should stop monitoring and clear interval on stopMonitoring', () => {
    const clearSpy = jest.fn();
    const setSpy = jest.fn(() => 123); // return fake interval ID

    // Mock window.setInterval and window.clearInterval
    (window as any).setInterval = setSpy;
    (window as any).clearInterval = clearSpy;

    service.startMonitoring();
    service.stopMonitoring();

    expect(clearSpy).toHaveBeenCalledWith(123);
  });

  it('should cleanup properly on ngOnDestroy', () => {
    const stopSpy = jest.spyOn(service, 'stopMonitoring');
    service.ngOnDestroy();
    expect(stopSpy).toHaveBeenCalled();
  });
});
