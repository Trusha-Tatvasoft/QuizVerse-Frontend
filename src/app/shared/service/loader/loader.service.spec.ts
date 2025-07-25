import { TestBed } from '@angular/core/testing';
import { LoaderService } from './loader.service';
import { skip } from 'rxjs';

describe('LoaderService', () => {
  let service: LoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit false when hide() is called using skip operator', (done) => {
    service.isLoading$.pipe(skip(1)).subscribe((value) => {
      expect(value).toBe(false);
      done();
    });
    service.hide();
  });

  it('should emit false when hide() is called using manual skip logic', (done) => {
    let isFirst = true;
    const subscription = service.isLoading$.subscribe((value) => {
      if (isFirst) {
        isFirst = false;
        return;
      }
      expect(value).toBe(false);
      subscription.unsubscribe();
      done();
    });
    service.hide();
  });

  it('should emit values in correct order: false (initial) -> true -> false', (done) => {
    const emittedValues: boolean[] = [];
    const subscription = service.isLoading$.subscribe((value) => {
      emittedValues.push(value);
      if (emittedValues.length === 3) {
        expect(emittedValues).toEqual([false, true, false]);
        subscription.unsubscribe();
        done();
      }
    });
    service.show();
    service.hide();
  });
});
