import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IPage } from '../model/plist';
import { serverURL } from '../environment/environment';
import { IFactura } from '../model/factura';

@Injectable({
  providedIn: 'root',
})

export class FacturaService {


  constructor(private oHttp: HttpClient) {}

getPage(
  page: number,
  rpp: number, 
  order: string = '', 
  direction: string = '', 
  usuario: number = 0, 
): Observable<IPage<IFactura>> {
    if (order === '') {
      order = 'id';
    }
    if (direction === '') {
      direction = 'asc';
    }
    if (usuario > 0) {
      return this.oHttp.get<IPage<IFactura>>(
        serverURL + 
        `/factura?page=${page}&size=${rpp}&sort=${order},${direction}&usuario=${usuario}`,
      );
    }
    return this.oHttp.get<IPage<IFactura>>(
      serverURL + `/factura?page=${page}&size=${rpp}&sort=${order},${direction}`
    );
  }
}