import { loaderInterceptor } from './loader.interceptor';
import { HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { finalize, of } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { LoaderService } from '../shared/service/loader/loader.service';
import { EnvironmentInjector, runInInjectionContext } from '@angular/core';

describe('loaderInterceptor', () => {
  let loaderService: LoaderService;
  let showSpy: jest.SpyInstance;
  let hideSpy: jest.SpyInstance;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: LoaderService,
          useValue: {
            show: jest.fn(),
            hide: jest.fn(),
          },
        },
      ],
    });

    injector = TestBed.inject(EnvironmentInjector);
    loaderService = TestBed.inject(LoaderService);
    showSpy = jest.spyOn(loaderService, 'show');
    hideSpy = jest.spyOn(loaderService, 'hide');
  });

  it('should call show and hide if X-Skip-Loader is not true', (done) => {
    const req = new HttpRequest('GET', '/api/test');

    const handler: HttpHandlerFn = (request) => {
      expect(request.headers.has('X-Skip-Loader')).toBe(false); // header should be removed
      return of(new HttpResponse({ status: 200 }));
    };

    runInInjectionContext(injector, () => {
      loaderInterceptor(req, handler)
        .pipe(
          finalize(() => {
            expect(showSpy).toHaveBeenCalled();
            expect(hideSpy).toHaveBeenCalled();
            done();
          }),
        )
        .subscribe();
    });
  });

  it('should NOT call show or hide if X-Skip-Loader is true', (done) => {
    const headers = new HttpRequest('GET', '/api/test').headers.set('X-Skip-Loader', 'true');
    const req = new HttpRequest('GET', '/api/test', { headers });

    const handler: HttpHandlerFn = () => of(new HttpResponse({ status: 200 }));

    runInInjectionContext(injector, () => {
      loaderInterceptor(req, handler)
        .pipe(
          finalize(() => {
            expect(showSpy).not.toHaveBeenCalled();
            expect(hideSpy).not.toHaveBeenCalled();
            done();
          }),
        )
        .subscribe();
    });
  });
});
