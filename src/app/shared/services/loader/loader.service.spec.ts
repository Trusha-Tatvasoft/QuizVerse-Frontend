import { LoaderService } from './loader.service';

describe('LoaderService', () => {
  let service: LoaderService;

  beforeEach(() => {
    service = new LoaderService();
  });

  it('should initially emit false', (done) => {
    service.isLoading$.subscribe((value) => {
      expect(value).toBe(false);
      done();
    });
  });

  it('should emit true when show is called', (done) => {
    service.isLoading$.subscribe((value) => {
      if (value) {
        expect(value).toBe(true);
        done();
      }
    });
    service.show();
  });

  it('should emit false when show and hide are called once', (done) => {
    const emitted: boolean[] = [];
    service.isLoading$.subscribe((value) => {
      emitted.push(value);
      if (emitted.length === 2) {
        expect(emitted).toEqual([false, true]);
        service.hide();
        setTimeout(() => {
          expect(emitted).toEqual([false, true, false]);
          done();
        });
      }
    });
    service.show();
  });

  it('should keep loading true until all requests are hidden', (done) => {
    const values: boolean[] = [];
    const sub = service.isLoading$.subscribe((value) => {
      values.push(value);
    });
    service.show();
    service.show();
    service.hide();
    setTimeout(() => {
      expect(values).toContain(true);
      expect(values[values.length - 1]).toBe(true);
      service.hide();
      setTimeout(() => {
        expect(values[values.length - 1]).toBe(false);
        sub.unsubscribe();
        done();
      }, 50);
    }, 50);
  });

  it('should not go below zero requestCount', () => {
    service.hide();
    service.hide();
    expect(() => service.hide()).not.toThrow();
  });
});
