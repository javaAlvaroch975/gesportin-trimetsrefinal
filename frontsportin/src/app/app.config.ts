import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { JWTInterceptor } from './interceptor/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(), // <-- Agregado para usar HttpClient en los servicios para acceder a APIs REST
    provideHttpClient(
      withInterceptorsFromDi()
    ) ,
        { provide: HTTP_INTERCEPTORS, useClass: JWTInterceptor, multi: true }
  ]
};
