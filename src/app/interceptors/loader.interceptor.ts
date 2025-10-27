import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { LoaderService } from '../shared/service/loader/loader.service';
import { skipLoader } from '../utils/constants';

export const loaderInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const loaderService = inject(LoaderService);
  const skipLoaderReq = req.headers.get(skipLoader) === 'true';

  if (!skipLoaderReq) {
    loaderService.show();
  }

  const modifiedReq = req.clone({
    headers: req.headers.delete(skipLoader),
  });

  return next(modifiedReq).pipe(
    finalize(() => {
      if (!skipLoaderReq) {
        loaderService.hide();
      }
    }),
  );
};
