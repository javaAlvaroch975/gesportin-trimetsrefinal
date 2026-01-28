import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Noticia {
  id: number;
  titulo: string;
  contenido: string;
  fecha: string;
  imagen: string;
  id_club: number;
}

@Injectable({
  providedIn: 'root'
})
export class NoticiaService {

  private apiUrl = 'http://localhost:8089/noticia';

  constructor(private http: HttpClient) {

  }

  getNoticiaById(id: number): Observable<Noticia> {
    return this.http.get<Noticia>(`${this.apiUrl}/${id}`);
  }

  getNoticias(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}