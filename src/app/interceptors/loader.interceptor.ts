import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { LoaderService } from '../shared/service/loader/loader.service';

export const loaderInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const loaderService = inject(LoaderService);
  const skipLoader = req.headers.get('X-Skip-Loader') === 'true';

  if (!skipLoader) {
    loaderService.show();
  }

  const modifiedReq = req.clone({
    headers: req.headers.delete('X-Skip-Loader'),
  });

  return next(modifiedReq).pipe(
    finalize(() => {
      if (!skipLoader) {
        loaderService.hide();
      }
    }),
  );
};
