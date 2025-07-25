import { inject, Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, tap, finalize } from 'rxjs';
import { LoaderService } from '../shared/services/loader/loader.service';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
  loader = inject(LoaderService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.loader.show();

    return next.handle(req).pipe(
      finalize(() => {
        this.loader.hide();
      }),
    );
  }
}
