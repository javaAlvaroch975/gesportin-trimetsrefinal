import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IArticulo } from '../../../../model/articulo';
import { ITipoarticulo } from '../../../../model/tipoarticulo';
import { ICarrito } from '../../../../model/carrito';
import { ArticuloService } from '../../../../service/articulo';
import { TipoarticuloService } from '../../../../service/tipoarticulo';
import { CarritoService } from '../../../../service/carrito';
import { SessionService } from '../../../../service/session';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

interface TiendaGroup {
  tipoarticulo: ITipoarticulo;
  articulos: IArticulo[];
}

@Component({
  selector: 'app-carrito-usuario-tienda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tienda.html',
  styleUrl: './tienda.css',
})
export class CarritoUsuarioTienda implements OnInit {
  private articuloService = inject(ArticuloService);
  private tipoarticuloService = inject(TipoarticuloService);
  private carritoService = inject(CarritoService);
  private session = inject(SessionService);

  grupos = signal<TiendaGroup[]>([]);
  carrito = signal<ICarrito[]>([]);
  loadingTienda = signal(true);
  loadingCarrito = signal(false);
  comprando = signal(false);
  message = signal<string | null>(null);
  messageType = signal<'success' | 'danger' | 'info'>('info');
  cantidades = signal<Record<number, number>>({});

  ngOnInit(): void {
    const clubId = this.session.getClubId() ?? 0;
    this.tipoarticuloService
      .getPage(0, 1000, 'id', 'asc', '', clubId)
      .pipe(
        switchMap((tipoPage) => {
          const tipos = tipoPage.content;
          if (tipos.length === 0) return of([] as TiendaGroup[]);
          return forkJoin(
            tipos.map((t) =>
              this.articuloService
                .getPage(0, 1000, 'id', 'asc', '', t.id)
                .pipe(
                  switchMap((ap) => of({ tipoarticulo: t, articulos: ap.content } as TiendaGroup)),
                ),
            ),
          );
        }),
      )
      .subscribe({
        next: (grupos) => {
          this.grupos.set(grupos.filter((g) => g.articulos.length > 0));
          this.loadingTienda.set(false);
        },
        error: () => this.loadingTienda.set(false),
      });

    this.loadCarrito();
  }

  loadCarrito(): void {
    const uid = this.session.getUserId();
    if (!uid) return;
    this.loadingCarrito.set(true);
    this.carritoService.getPage(0, 1000, 'id', 'asc', '', 0, uid).subscribe({
      next: (page) => {
        this.carrito.set(page.content);
        this.loadingCarrito.set(false);
      },
      error: () => this.loadingCarrito.set(false),
    });
  }

  getCantidad(articuloId: number): number {
    return this.cantidades()[articuloId] ?? 1;
  }

  setCantidad(articuloId: number, val: number): void {
    this.cantidades.set({ ...this.cantidades(), [articuloId]: Math.max(1, val) });
  }

  precioFinal(a: IArticulo): number {
    return a.precio * (1 - (a.descuento ?? 0) / 100);
  }

  addToCart(articulo: IArticulo): void {
    const uid = this.session.getUserId();
    if (!uid) return;
    const cantidad = this.getCantidad(articulo.id);
    const existing = this.carrito().find((c) => c.articulo?.id === articulo.id);
    if (existing) {
      this.carritoService
        .update({ id: existing.id, cantidad: existing.cantidad + cantidad, articulo: { id: articulo.id } as any, usuario: { id: uid } as any })
        .subscribe({
          next: () => { this.showMessage('Cantidad actualizada en el carrito', 'success'); this.loadCarrito(); },
          error: () => this.showMessage('Error al actualizar carrito', 'danger'),
        });
    } else {
      this.carritoService
        .create({ cantidad, articulo: { id: articulo.id } as any, usuario: { id: uid } as any })
        .subscribe({
          next: () => { this.showMessage('Añadido al carrito', 'success'); this.loadCarrito(); },
          error: () => this.showMessage('Error al añadir al carrito', 'danger'),
        });
    }
  }

  removeFromCart(id: number): void {
    this.carritoService.delete(id).subscribe({
      next: () => { this.showMessage('Artículo eliminado del carrito', 'info'); this.loadCarrito(); },
      error: () => this.showMessage('Error al eliminar', 'danger'),
    });
  }

  updateCartCantidad(item: ICarrito, delta: number): void {
    const uid = this.session.getUserId();
    if (!uid) return;
    const newCantidad = item.cantidad + delta;
    if (newCantidad <= 0) {
      this.removeFromCart(item.id);
      return;
    }
    this.carritoService
      .update({ id: item.id, cantidad: newCantidad, articulo: { id: item.articulo?.id } as any, usuario: { id: uid } as any })
      .subscribe({
        next: () => this.loadCarrito(),
        error: () => this.showMessage('Error al actualizar', 'danger'),
      });
  }

  comprar(): void {
    if (this.carrito().length === 0) {
      this.showMessage('El carrito está vacío', 'danger');
      return;
    }
    this.comprando.set(true);
    this.carritoService.comprar().subscribe({
      next: () => {
        this.comprando.set(false);
        this.showMessage('¡Compra realizada con éxito! Puedes ver tu factura en Mis Facturas.', 'success');
        this.loadCarrito();
      },
      error: () => {
        this.comprando.set(false);
        this.showMessage('Error al procesar la compra', 'danger');
      },
    });
  }

  totalCarrito(): number {
    return this.carrito().reduce(
      (acc, c) => acc + (c.articulo?.precio ?? 0) * (1 - (c.articulo?.descuento ?? 0) / 100) * c.cantidad,
      0,
    );
  }

  carritoItemCount(): number {
    return this.carrito().reduce((acc, c) => acc + c.cantidad, 0);
  }

  private showMessage(msg: string, type: 'success' | 'danger' | 'info' = 'info'): void {
    this.message.set(msg);
    this.messageType.set(type);
    setTimeout(() => this.message.set(null), 5000);
  }
}
