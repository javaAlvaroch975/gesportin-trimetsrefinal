import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { serverURL } from '../environment/environment';
import { IEstadopartido } from '../model/estadopartido';
import { PayloadSanitizerService } from './payload-sanitizer';

@Injectable({ providedIn: 'root' })
export class EstadopartidoService {

  constructor(
    private oHttp: HttpClient,
    private sanitizer: PayloadSanitizerService,
  ) { }

  getAll(): Observable<IEstadopartido[]> {
    return this.oHttp.get<IEstadopartido[]>(`${serverURL}/estadopartido`);
  }

  get(id: number): Observable<IEstadopartido> {
    return this.oHttp.get<IEstadopartido>(`${serverURL}/estadopartido/${id}`);
  }

  count(): Observable<number> {
    return this.oHttp.get<number>(`${serverURL}/estadopartido/count`);
  }

  create(estadopartido: Partial<IEstadopartido>): Observable<IEstadopartido> {
    const body = this.sanitizer.sanitize(estadopartido);
    return this.oHttp.post<IEstadopartido>(`${serverURL}/estadopartido`, body);
  }

  update(estadopartido: Partial<IEstadopartido>): Observable<IEstadopartido> {
    const body = this.sanitizer.sanitize(estadopartido);
    return this.oHttp.put<IEstadopartido>(`${serverURL}/estadopartido`, body);
  }

  delete(id: number): Observable<number> {
    return this.oHttp.delete<number>(`${serverURL}/estadopartido/${id}`);
  }
}

