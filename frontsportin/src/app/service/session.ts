import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { IJWT } from '../model/token';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  public subjectLogin: Subject<void> = new Subject<void>();
  public subjectLogout: Subject<void> = new Subject<void>();

  private token: string | null = null;

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('persutiltoken', token);
    this.subjectLogin.next();
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('persutiltoken');
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('persutiltoken');
    this.subjectLogout.next();
  }

  isSessionActive(): boolean {
    if (this.getToken() !== null || localStorage.getItem('persutiltoken') !== null) {
      const oJWT: IJWT = this.parseJWT(this.getToken()!);
      const currentTime = Math.floor(Date.now() / 1000);
      if (oJWT.iss == 'ausiasmarch.net') {
        if (oJWT.exp && oJWT.exp > currentTime) {
          return true;
        } else {
          this.clearToken();
          return false;
        }
      } else {
        this.clearToken();
        return false;
      }
    } else {
      return false;
    }
  }

  isAdmin(): boolean {
    if (this.isSessionActive()) {
      const oJWT: IJWT = this.parseJWT(this.getToken()!);
      return oJWT.usertype === 1;
    }
    return false;
  }

  isClubAdmin(): boolean {
    if (this.isSessionActive()) {
      const oJWT: IJWT = this.parseJWT(this.getToken()!);
      return oJWT.usertype === 2;
    }
    return false;
  }

  isUser(): boolean {
    if (this.isSessionActive()) {
      const oJWT: IJWT = this.parseJWT(this.getToken()!);
      return oJWT.usertype === 3;
    }
    return false;
  }

  getClubId(): number | null {
    if (this.isSessionActive()) {
      const oJWT: IJWT = this.parseJWT(this.getToken()!);
      return oJWT.club;
    }
    return null;
  }

  parseJWT(token: string): IJWT {
    if (!token) {
      //throw new Error('Token vacío o indefinido.');
      return {} as IJWT;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      //throw new Error('JWT inválido. Debe contener header, payload y signature.');
      return {} as IJWT;
    }

    try {
      const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/'); // normalizar base64url
      const decodedPayload = atob(payloadBase64);
      const payload: unknown = JSON.parse(decodedPayload);
      const jwt = payload as Partial<IJWT>;

      if (
        typeof jwt.iss !== 'string' ||
        typeof jwt.sub !== 'string' ||
        typeof jwt.username !== 'string' ||
        typeof jwt.iat !== 'number' ||
        typeof jwt.exp !== 'number'
      ) {
        //throw new Error('El payload no coincide con el formato IJWT.');
        return {} as IJWT;
      }

      return jwt as IJWT;
    } catch (error) {
      //throw new Error('Error al parsear el JWT: ' + (error as Error).message);
      return {} as IJWT;
    }
  }
}
