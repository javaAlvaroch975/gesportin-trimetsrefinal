import { Component, signal, computed, inject, Input } from '@angular/core';
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
import { MatDialogRef } from '@angular/material/dialog';
import { BotoneraActionsPlist } from '../../shared/botonera-actions-plist/botonera-actions-plist';

@Component({
  standalone: true,
  selector: 'app-jugador-plist-admin-unrouted',
  templateUrl: './jugador-plist-admin-unrouted.html',
  styleUrls: ['./jugador-plist-admin-unrouted.css'],
  imports: [
    CommonModule,
    Paginacion,
    BotoneraRpp,
    RouterLink,
    TrimPipe,
    BotoneraActionsPlist
  ]
})
export class JugadorPlistAdminUnrouted {

 @Input() usuario = signal<number>(0);
 @Input() equipo = signal<number>(0);

  oPage = signal<IPage<IJugador> | null>(null);
  numPage = signal<number>(0);
  numRpp = signal<number>(5);

  // For fill functionality
  rellenaCantidad = signal<number>(10);
  rellenando = signal<boolean>(false);
  rellenaOk = signal<string>('');
  rellenaError = signal<string>('');
  totalElementsCount = computed(() => this.oPage()?.totalElements ?? 0);

  // Mensajes y total
  totalRecords = computed(() => this.oPage()?.totalElements ?? 0);

  // Variables de ordenamiento
  orderField = signal<string>('id');
  orderDirection = signal<'asc' | 'desc'>('asc');

  // variables de búsqueda
  private searchSubject = new Subject<string>();
  posicion = signal<string>('');
  private searchSubscription?: Subscription;

  oJugadorService = inject(JugadorService);
  private dialogRef = inject(MatDialogRef<JugadorPlistAdminUnrouted>, { optional: true });

  ngOnInit(): void {
    // Configurar el debounce para la búsqueda
    this.searchSubscription = this.searchSubject
      .pipe(debounceTime(debounceTimeSearch), distinctUntilChanged())
      .subscribe((searchTerm) => {
        this.posicion.set(searchTerm);
        this.numPage.set(0);
        this.getPage();
      });
    this.getPage();
  }

  getPage() {
    this.oJugadorService
      .getPage(
        this.numPage(),
        this.numRpp(),
        this.orderField(),
        this.orderDirection(),
        this.posicion(),
        this.usuario(),
        this.equipo(),
      )
      .subscribe({
        next: (data: IPage<IJugador>) => {
          this.oPage.set(data);
          if (this.numPage() > 0 && this.numPage() >= data.totalPages) {
            this.numPage.set(data.totalPages - 1);
            this.getPage();
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
        },
      });
  }

  onRppChange(rpp: number): void {
    this.numRpp.set(rpp);
    this.numPage.set(0);
    this.getPage();
  }

  goToPage(page: number): void {
    this.numPage.set(page);
    this.getPage();
  }

  onSearchPosicion(value: string) {
    // Emitir el valor al Subject para que sea procesado con debounce
    this.searchSubject.next(value);
  }

  onOrder(order: string) {
    if (this.orderField() === order) {
      this.orderDirection.set(this.orderDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.orderField.set(order);
      this.orderDirection.set('asc');
    }
    this.numPage.set(0);
    this.getPage();
  }

  isDialogMode(): boolean {
    return !!this.dialogRef;
  }

  onSelect(jugador: IJugador): void {
    this.dialogRef?.close(jugador);
  }

  ngOnDestroy(): void {
    // Cancelar la suscripción al destruir el componente
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  getImagenUrl(imagen: string | null): string {
    if (!imagen) {
      return '';
    }
    // Si la imagen ya tiene http:// o https://, devolverla tal cual
    if (imagen.startsWith('http://') || imagen.startsWith('https://')) {
      return imagen;
    }
    // Si no, construir la URL completa con el serverURL
    return `${serverURL}/${imagen}`;
  }




  }



