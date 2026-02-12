import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Paginacion } from '../../shared/paginacion/paginacion';
import { BotoneraRpp } from '../../shared/botonera-rpp/botonera-rpp';
import { JugadorService } from '../../../service/jugador-service';
import { IJugador } from '../../../model/jugador';
import { IPage } from '../../../model/plist';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TrimPipe } from '../../../pipe/trim-pipe';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { debounceTimeSearch, serverURL } from '../../../environment/environment';
import { BotoneraActionsPlist } from "../../shared/botonera-actions-plist/botonera-actions-plist";
import { JugadorPlistAdminUnrouted } from '../plist-admin-unrouted/jugador-plist-admin-unrouted';

@Component({
  standalone: true,
  selector: 'app-jugador-plist',
  templateUrl: './jugador-plist.html',
  styleUrls: ['./jugador-plist.css'],
  imports: [
    CommonModule,JugadorPlistAdminUnrouted
]
})
export class JugadorPlist {
  usuario = signal<number>(0);
  equipo = signal<number>(0);
  constructor(private route: ActivatedRoute) {}
  ngOnInit(): void {
    const id_usuario = this.route.snapshot.paramMap.get('id_usuario');
    if (id_usuario) {
      this.usuario.set(+id_usuario);
    }
    const id_equipo = this.route.snapshot.paramMap.get('id_equipo');
    if (id_equipo) {
      this.equipo.set(+id_equipo);
    }
  }
}
