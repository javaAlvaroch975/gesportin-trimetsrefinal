import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { serverURL } from '../environment/environment';
import { ITipousuario } from '../model/tipousuario';
import { Observable } from 'rxjs';
import { PayloadSanitizerService } from './payload-sanitizer';

@Injectable({providedIn: 'root'})
export class TipousuarioService {
    constructor(
      private httpClient: HttpClient,
      private sanitizer: PayloadSanitizerService
    ) { }
 
    getAll(): Observable<ITipousuario[]> {
        return this.httpClient.get<ITipousuario[]>(`${serverURL}/tipousuario`);
    }

    count(): Observable<number> {
        return this.httpClient.get<number>(`${serverURL}/tipousuario/count`);
    }

    get(id: number): Observable<ITipousuario> {
        return this.httpClient.get<ITipousuario>(`${serverURL}/tipousuario/${id}`);
    }

    create(tipousuario: Partial<ITipousuario>): Observable<number> {
      const body = this.sanitizer.sanitize(tipousuario);
      return this.httpClient.post<number>(`${serverURL}/tipousuario`, body);
    }

    update(tipousuario: Partial<ITipousuario>): Observable<ITipousuario> {
      const body = this.sanitizer.sanitize(tipousuario);
      return this.httpClient.put<ITipousuario>(`${serverURL}/tipousuario`, body);
    }

}
