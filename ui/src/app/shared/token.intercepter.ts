import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { AuthService } from '../services/auth/auth.service';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import 'rxjs/add/operator/do';

/**
 * Inject Jquery plugin
 */
declare var jQuery: any;

/**
 * HTTP interceptor, to catch all the incoming request and add user token to the subsequnt http requests.
 * Also it ensure that whether the token is exist.
 */
@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(public auth: AuthService, private router: Router, public toastrService: ToastrService) {}

  /**
   *
   * @param request {Object} Request
   * @param next {Method}
   */
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    request = request.clone({
      setHeaders: {
        Authorization: this.auth.getToken(),
      },
    });

    /* return next.handle(request); */
    return next.handle(request).do(
      (event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          // do stuff with response if you want
        }
      },
      (err: any) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 499 || err.status === 498) {
            this.auth.clearStorage();
            this.router.navigate(['/login']);
            jQuery('ngb-modal-window').click();
            // redirect to the login route
            // or show a modal
          } else if (err.status === 403) {
            this.toastrService.error('Not Authorised... Please Login again');
            this.router.navigate(['/login']);
            jQuery('ngb-modal-window').click();
          }
        }
      }
    );
  }
}
