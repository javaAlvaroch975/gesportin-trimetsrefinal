import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { NotificacionService } from "../service/notificacion";
import { SessionService } from "../service/session";

@Injectable()
export class JWTInterceptor implements HttpInterceptor {

    /** Prevents showing the "session expired" notification more than once
     *  when multiple concurrent requests all return 401. */
    private sessionExpiredHandled = false;

    constructor(
        private oSessionService: SessionService,
        private oNotificacionService: NotificacionService,
        private oRouter: Router,
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        if (this.oSessionService.isSessionActive()) {
            const token = this.oSessionService.getToken();
            if (token) {
                req = req.clone({
                    setHeaders: { Authorization: `Bearer ${token}` }
                });
            }
        }

        return next.handle(req).pipe(
            catchError(err => {
                // 401 while a token was present → the token has expired server-side
                if (err.status === 401 && this.oSessionService.getToken() !== null) {
                    this.oSessionService.clearToken();
                    if (!this.sessionExpiredHandled) {
                        this.sessionExpiredHandled = true;
                        this.oNotificacionService.warning(
                            'Lo siento, la sesión ha expirado.',
                            'Sesión expirada',
                            { autoCierre: 4000 }
                        );
                        this.oRouter.navigate(['/login']).then(() => {
                            // reset the flag so a future login + expiry cycle works again
                            this.sessionExpiredHandled = false;
                        });
                    }
                }
                return throwError(() => err);
            })
        );
    }
}