import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClubService } from '../../../service/club';
import { NoticiaService } from '../../../service/noticia';
import { ComentarioService } from '../../../service/comentario';
import { PuntuacionService } from '../../../service/puntuacion';
import { TemporadaService } from '../../../service/temporada';
import { CategoriaService } from '../../../service/categoria';
import { EquipoService } from '../../../service/equipo';
import { LigaService } from '../../../service/liga';
import { PartidoService } from '../../../service/partido';
import { JugadorService } from '../../../service/jugador-service';
import { CuotaService } from '../../../service/cuota';
import { PagoService } from '../../../service/pago';
import { ArticuloService } from '../../../service/articulo';
import { TipoarticuloService } from '../../../service/tipoarticulo';
import { CompraService } from '../../../service/compra';
import { FacturaService } from '../../../service/factura-service';
import { CarritoService } from '../../../service/carrito';
import { ComentarioartService } from '../../../service/comentarioart';
import { UsuarioService } from '../../../service/usuarioService';
import { TipousuarioService } from '../../../service/tipousuario';
import { RolusuarioService } from '../../../service/rolusuario';
import { EstadopartidoService } from '../../../service/estadopartido';
import { SecurityService } from '../../../service/security.service';
import { IPage } from '../../../model/plist';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface DashboardCard {
  title: string;
  icon: string;
  count: number;
  color: string;
  route: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  
  loading = signal(true);
  
  constructor(
    private cdr: ChangeDetectorRef,
    private clubService: ClubService,
    private noticiaService: NoticiaService,
    private comentarioService: ComentarioService,
    private puntuacionService: PuntuacionService,
    private temporadaService: TemporadaService,
    private categoriaService: CategoriaService,
    private equipoService: EquipoService,
    private ligaService: LigaService,
    private partidoService: PartidoService,
    private jugadorService: JugadorService,
    private cuotaService: CuotaService,
    private pagoService: PagoService,
    private articuloService: ArticuloService,
    private tipoarticuloService: TipoarticuloService,
    private compraService: CompraService,
    private facturaService: FacturaService,
    private carritoService: CarritoService,
    private comentarioartService: ComentarioartService,
    private usuarioService: UsuarioService,
    private tipousuarioService: TipousuarioService,
    private rolusuarioService: RolusuarioService,
    private estadopartidoService: EstadopartidoService,
    private security: SecurityService
  ) {}
  cards: DashboardCard[] = [];

  private buildCards(): DashboardCard[] {
    const r = this.security.isClubAdmin() ? '/teamadmin' : '';
    const allCards: DashboardCard[] = [
      { title: 'Clubes', icon: 'building', count: 0, color: 'primary', route: r ? '/club/teamadmin' : '/club' },
      { title: 'Noticias', icon: 'newspaper', count: 0, color: 'warning', route: '/noticia' + r },
      { title: 'Comentarios', icon: 'chat-left-text', count: 0, color: 'info', route: '/comentario' + r },
      { title: 'Puntuaciones', icon: 'star-fill', count: 0, color: 'secondary', route: '/puntuacion' + r },
      { title: 'Temporadas', icon: 'calendar', count: 0, color: 'danger', route: '/temporada' + r },
      { title: 'Categorías', icon: 'tags', count: 0, color: 'success', route: '/categoria' + r },
      { title: 'Equipos', icon: 'people-fill', count: 0, color: 'primary', route: '/equipo' + r },
      { title: 'Ligas', icon: 'trophy', count: 0, color: 'warning', route: '/liga' + r },
      { title: 'Partidos', icon: 'play-fill', count: 0, color: 'info', route: '/partido' + r },
      { title: 'Jugadores', icon: 'person-fill', count: 0, color: 'secondary', route: '/jugador' + r },
      { title: 'Cuotas', icon: 'credit-card', count: 0, color: 'danger', route: '/cuota' + r },
      { title: 'Pagos', icon: 'cash-coin', count: 0, color: 'success', route: '/pago' + r },
      { title: 'Artículos', icon: 'bag-fill', count: 0, color: 'primary', route: '/articulo' + r },
      { title: 'Tipos de Artículo', icon: 'bookmark-fill', count: 0, color: 'warning', route: '/tipoarticulo' + r },
      { title: 'Compras', icon: 'cart-fill', count: 0, color: 'info', route: '/compra' + r },
      { title: 'Facturas', icon: 'receipt', count: 0, color: 'secondary', route: '/factura' + r },
      { title: 'Carritos', icon: 'bag-check', count: 0, color: 'danger', route: '/carrito' + r },
      { title: 'Comentarios Artículos', icon: 'chat-dots', count: 0, color: 'success', route: '/comentarioart' + r },
      { title: 'Usuarios', icon: 'people', count: 0, color: 'primary', route: '/usuario' + r },
    ];

    if (!this.security.isClubAdmin()) {
      allCards.push(
        { title: 'Tipos de Usuario', icon: 'tags-fill', count: 0, color: 'warning', route: '/tipousuario' },
        { title: 'Estados de Partido', icon: 'flag-fill', count: 0, color: 'info', route: '/estadopartido' },
        { title: 'Roles', icon: 'shield-check', count: 0, color: 'secondary', route: '/rolusuario' },
      );
    }

    return allCards;
  }

  ngOnInit() {
    this.cards = this.buildCards();
    this.loadCounts();
  }

  private countFromPage<T>(request$: Observable<IPage<T>>): Observable<number> {
    return request$.pipe(
      map((page) => page?.totalElements ?? page?.content?.length ?? 0),
      catchError(() => of(0))
    );
  }

  private buildCountRequests() {
    if (!this.security.isClubAdmin()) {
      return {
        clubes: this.clubService.count(),
        noticias: this.noticiaService.count(),
        comentarios: this.comentarioService.count(),
        puntuaciones: this.puntuacionService.count(),
        temporadas: this.temporadaService.count(),
        categorias: this.categoriaService.count(),
        equipos: this.equipoService.count(),
        ligas: this.ligaService.count(),
        partidos: this.partidoService.count(),
        jugadores: this.jugadorService.count(),
        cuotas: this.cuotaService.count(),
        pagos: this.pagoService.count(),
        articulos: this.articuloService.count(),
        tiposArticulo: this.tipoarticuloService.count(),
        compras: this.compraService.count(),
        facturas: this.facturaService.count(),
        carritos: this.carritoService.count(),
        comentariosArt: this.comentarioartService.count(),
        usuarios: this.usuarioService.count(),
        tiposUsuario: this.tipousuarioService.count(),
        estadosPartido: this.estadopartidoService.count(),
        roles: this.rolusuarioService.count()
      };
    }

    // For club admins (tipo 2), use paged endpoints that already enforce club scope.
    return {
      clubes: this.countFromPage(this.clubService.getPage(0, 1)),
      noticias: this.countFromPage(this.noticiaService.getPage(0, 1)),
      comentarios: this.countFromPage(this.comentarioService.getPage(0, 1)),
      puntuaciones: this.countFromPage(this.puntuacionService.getPage(0, 1)),
      temporadas: this.countFromPage(this.temporadaService.getPage(0, 1)),
      categorias: this.countFromPage(this.categoriaService.getPage(0, 1)),
      equipos: this.countFromPage(this.equipoService.getPage(0, 1)),
      ligas: this.countFromPage(this.ligaService.getPage(0, 1)),
      partidos: this.countFromPage(this.partidoService.getPage(0, 1)),
      jugadores: this.countFromPage(this.jugadorService.getPage(0, 1)),
      cuotas: this.countFromPage(this.cuotaService.getPage(0, 1)),
      pagos: this.countFromPage(this.pagoService.getPage(0, 1)),
      articulos: this.countFromPage(this.articuloService.getPage(0, 1)),
      tiposArticulo: this.countFromPage(this.tipoarticuloService.getPage(0, 1)),
      compras: this.countFromPage(this.compraService.getPage(0, 1)),
      facturas: this.countFromPage(this.facturaService.getPage(0, 1)),
      carritos: this.countFromPage(this.carritoService.getPage(0, 1)),
      comentariosArt: this.countFromPage(this.comentarioartService.getPage(0, 1)),
      usuarios: this.countFromPage(this.usuarioService.getPage(0, 1)),
      tiposUsuario: this.tipousuarioService.getAll().pipe(
        map((items) => items.length),
        catchError(() => of(0))
      ),
      estadosPartido: this.estadopartidoService.count(),
      roles: this.countFromPage(this.rolusuarioService.getPage(0, 1))
    };
  }

  loadCounts() {
    forkJoin(this.buildCountRequests()).subscribe({
      next: (counts: Record<string, number>) => {
        const countMap: Record<string, number> = {
          'Clubes': counts['clubes'],
          'Noticias': counts['noticias'],
          'Comentarios': counts['comentarios'],
          'Puntuaciones': counts['puntuaciones'],
          'Temporadas': counts['temporadas'],
          'Categorías': counts['categorias'],
          'Equipos': counts['equipos'],
          'Ligas': counts['ligas'],
          'Partidos': counts['partidos'],
          'Jugadores': counts['jugadores'],
          'Cuotas': counts['cuotas'],
          'Pagos': counts['pagos'],
          'Artículos': counts['articulos'],
          'Tipos de Artículo': counts['tiposArticulo'],
          'Compras': counts['compras'],
          'Facturas': counts['facturas'],
          'Carritos': counts['carritos'],
          'Comentarios Artículos': counts['comentariosArt'],
          'Usuarios': counts['usuarios'],
          'Tipos de Usuario': counts['tiposUsuario'],
          'Estados de Partido': counts['estadosPartido'],
          'Roles': counts['roles'],
        };
        this.cards = this.cards.map(card => ({
          ...card,
          count: countMap[card.title] ?? 0
        }));
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading counts:', error);
        this.loading.set(false);
      }
    });
  }
}
