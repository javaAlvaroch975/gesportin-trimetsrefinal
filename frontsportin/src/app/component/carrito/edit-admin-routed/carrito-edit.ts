import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CarritoService } from '../../../service/carrito';
import { ArticuloService } from '../../../service/articulo';
import { UsuarioService } from '../../../service/usuarioService';
import { ICarrito } from '../../../model/carrito';
import { IArticulo } from '../../../model/articulo';
import { IUsuario } from '../../../model/usuario';
import { MatDialog } from '@angular/material/dialog';
import { ArticuloPlistAdminUnrouted } from '../../articulo/plist-admin-unrouted/articulo-plist-admin-unrouted';
import { UsuarioPlistAdminUnrouted } from '../../usuario/plist-admin-unrouted/usuario-plist-admin-unrouted';

@Component({
  selector: 'app-carrito-edit-admin-routed',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './carrito-edit.html',
  styleUrl: './carrito-edit.css',
})
export class CarritoEditAdminRouted implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private oCarritoService = inject(CarritoService);
  private oArticuloService = inject(ArticuloService);
  private oUsuarioService = inject(UsuarioService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  carritoForm!: FormGroup;
  id_carrito = signal<number>(0);
  loading = signal(true);
  error = signal<string | null>(null);
  submitting = signal(false);
  selectedArticulo = signal<IArticulo | null>(null);
  selectedUsuario = signal<IUsuario | null>(null);

  ngOnInit(): void {
    this.initForm();
    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam || idParam === '0') {
      this.error.set('ID de carrito no válido');
      this.loading.set(false);
      return;
    }

    this.id_carrito.set(Number(idParam));

    if (isNaN(this.id_carrito())) {
      this.error.set('ID no válido');
      this.loading.set(false);
      return;
    }

    this.loadCarrito();
  }

  private initForm(): void {
    this.carritoForm = this.fb.group({
      id: [{ value: 0, disabled: true }],
      cantidad: [0, [Validators.required, Validators.min(1)]],
      id_articulo: [null, Validators.required],
      id_usuario: [null, Validators.required],
    });
  }

  private loadCarrito(): void {
    this.oCarritoService.get(this.id_carrito()).subscribe({
      next: (carrito: ICarrito) => {
        this.carritoForm.patchValue({
          id: carrito.id,
          cantidad: carrito.cantidad,
          id_articulo: carrito.articulo?.id,
          id_usuario: carrito.usuario?.id,
        });
        this.syncArticulo(carrito.articulo.id);
        this.syncUsuario(carrito.usuario.id)
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error cargando el carrito');
        this.snackBar.open('Error cargando el carrito', 'Cerrar', { duration: 4000 });
        console.error(err);
        this.loading.set(false);
      },
    });
  }

   private syncArticulo(id_articulo: number): void {
    this.oArticuloService.get(id_articulo).subscribe({
      next: (articulo: IArticulo) => {
        this.selectedArticulo.set(articulo);
      },
      error: (err: HttpErrorResponse) => {
        this.selectedArticulo.set(null);
        this.snackBar.open('Error al cargar el artículo seleccionado', 'Cerrar', {
          duration: 3000,
        });
        console.error(err);
      },
    });
  }

   private syncUsuario(id_usuario: number): void {
    this.oUsuarioService.get(id_usuario).subscribe({
      next: (usuario: IUsuario) => {
        this.selectedUsuario.set(usuario);
      },
      error: (err: HttpErrorResponse) => {
        this.selectedUsuario.set(null);
        this.snackBar.open('Error al cargar el usuario seleccionado', 'Cerrar', {
          duration: 3000,
        });
        console.error(err);
      },
    });
  }

  get cantidad() {
    return this.carritoForm.get('cantidad');
  }

  get id_articulo() {
    return this.carritoForm.get('id_articulo');
  }

  get id_usuario() {
    return this.carritoForm.get('id_usuario');
  }

  openArticuloFinderModal(): void {
      const dialogRef = this.dialog.open(ArticuloPlistAdminUnrouted, {
        height: '800px',
        width: '1100px',
        maxWidth: '95vw',
        panelClass: 'articulo-dialog',
        data: {
          title: 'Aquí elegir artículo',
          message: 'Plist finder para encontrar el artículo y asignarlo a la compra',
        },
      });
  
      dialogRef.afterClosed().subscribe((articulo: IArticulo | null) => {
        if (articulo) {
          this.carritoForm.patchValue({
            id_articulo: articulo.id,
          });
          this.syncArticulo(articulo.id);
          this.snackBar.open(`Artículo seleccionado: ${articulo.descripcion}`, 'Cerrar', {
            duration: 3000,
          });
        }
      });
    }

    openUsuarioFinderModal(): void {
    const dialogRef = this.dialog.open(UsuarioPlistAdminUnrouted, {
      height: '800px',
      width: '1100px',
      maxWidth: '95vw',
      panelClass: 'usuario-dialog',
      data: {
        title: 'Aquí elegir usuario',
        message: 'Plist finder para encontrar el usuario y asignarlo a la compra',
      },
    });

    dialogRef.afterClosed().subscribe((usuario: IUsuario | null) => {
      if (usuario) {
        this.carritoForm.patchValue({
          id_usuario: usuario.id,
        });
        this.syncUsuario(usuario.id);
        this.snackBar.open(`Usuario seleccionado: ${usuario.nombre}`, 'Cerrar', {
          duration: 3000,
        });
      }
    });
  }

  onSubmit(): void {
    if (this.carritoForm.invalid) {
      this.snackBar.open('Por favor, complete todos los campos correctamente', 'Cerrar', {
        duration: 4000,
      });
      return;
    }

    this.submitting.set(true);

    const carritoData: any = {
      id: this.id_carrito(),
      cantidad: this.carritoForm.value.cantidad,
      articulo: { id: this.carritoForm.value.id_articulo },
      usuario: { id: this.carritoForm.value.id_usuario },
    };

    this.oCarritoService.update(carritoData).subscribe({
      next: (id: number) => {
        this.snackBar.open('Carrito actualizado exitosamente', 'Cerrar', { duration: 4000 });
        this.submitting.set(false);
        this.router.navigate(['/carrito']);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error actualizando el carrito');
        this.snackBar.open('Error actualizando el carrito', 'Cerrar', { duration: 4000 });
        console.error(err);
        this.submitting.set(false);
      },
    });
  }
}
