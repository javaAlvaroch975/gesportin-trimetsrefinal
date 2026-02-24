import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, TemplateRef, ViewChild, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IFactura } from '../../../model/factura';
import { IUsuario } from '../../../model/usuario';
import { FacturaService } from '../../../service/factura-service';
import { UsuarioService } from '../../../service/usuarioService';
import { Paginacion } from '../../shared/paginacion/paginacion';
import { BotoneraRpp } from '../../shared/botonera-rpp/botonera-rpp';

@Component({
  selector: 'app-factura-edit-routed',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Paginacion, BotoneraRpp],
  templateUrl: './factura-edit.html',
  styleUrl: './factura-edit.css',
})
export class FacturaEditAdminRouted implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private oFacturaService = inject(FacturaService);
  private oUsuarioService = inject(UsuarioService);
  private snackBar = inject(MatSnackBar);

  facturaForm!: FormGroup;
  id_factura = signal<number>(0);
  loading = signal(true);
  error = signal<string | null>(null);
  submitting = signal(false);
  usuarios = signal<IUsuario[]>([]);
  selectedUsuario = signal<IUsuario | null>(null);
  displayIdUsuario = signal<number | null>(null);

  usuarioSearch = signal<string>('');
  usuarioSortDirection = signal<'asc' | 'desc'>('asc');
  usuarioPage = signal<number>(0);
  usuarioRpp = signal<number>(10);

  filteredUsuarios = computed(() => {
    const term = this.usuarioSearch().toLowerCase().trim();
    const items = this.usuarios();
    if (!term) {
      return items;
    }
    return items.filter((usuario) => {
      const nombre = `${usuario.nombre ?? ''} ${usuario.apellido1 ?? ''} ${usuario.apellido2 ?? ''}`
        .toLowerCase()
        .trim();
      const username = (usuario.username || '').toLowerCase();
      const idMatch = String(usuario.id).includes(term);
      return nombre.includes(term) || username.includes(term) || idMatch;
    });
  });

  sortedUsuarios = computed(() => {
    const direction = this.usuarioSortDirection();
    return [...this.filteredUsuarios()].sort((a, b) => {
      if (direction === 'asc') {
        return a.id - b.id;
      }
      return b.id - a.id;
    });
  });

  usuarioTotalPages = computed(() => {
    const total = this.filteredUsuarios().length;
    const rpp = this.usuarioRpp();
    return Math.max(1, Math.ceil(total / rpp));
  });

  pagedUsuarios = computed(() => {
    const page = this.usuarioPage();
    const rpp = this.usuarioRpp();
    const start = page * rpp;
    return this.sortedUsuarios().slice(start, start + rpp);
  });

  @ViewChild('usuarioDialog') usuarioDialog?: TemplateRef<any>;

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.initForm();
    this.loadUsuarios();

    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam || idParam === '0') {
      this.error.set('ID de factura no válido');
      this.loading.set(false);
      return;
    }

    this.id_factura.set(Number(idParam));

    if (isNaN(this.id_factura())) {
      this.error.set('ID no válido');
      this.loading.set(false);
      return;
    }

    this.loadFactura();
  }

  private initForm(): void {
    this.facturaForm = this.fb.group({
      id: [{ value: 0, disabled: true }],
      fecha: ['', [Validators.required]],
      id_usuario: [null, Validators.required],
    });

    this.facturaForm.get('id_usuario')?.valueChanges.subscribe((id) => {
      if (id) {
        this.syncUsuario(Number(id));
      } else {
        this.selectedUsuario.set(null);
        this.displayIdUsuario.set(null);
      }
    });
  }

  private loadFactura(): void {
    this.oFacturaService.get(this.id_factura()).subscribe({
      next: (factura: IFactura) => {
        this.facturaForm.patchValue({
          id: factura.id,
          fecha: factura.fecha,
          id_usuario: factura.usuario?.id,
        });
        if (factura.usuario) {
          this.syncUsuario(factura.usuario.id);
        }
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error cargando la factura');
        this.snackBar.open('Error cargando la factura', 'Cerrar', { duration: 4000 });
        console.error(err);
        this.loading.set(false);
      },
    });
  }

  private loadUsuarios(): void {
    this.oUsuarioService.getPage(0, 1000, 'nombre', 'asc').subscribe({
      next: (page) => {
        this.usuarios.set(page.content);
        const idActual = this.facturaForm.get('id_usuario')?.value;
        if (idActual) {
          this.syncUsuario(Number(idActual));
        }
      },
      error: (err: HttpErrorResponse) => {
        this.snackBar.open('Error cargando usuarios', 'Cerrar', { duration: 4000 });
        console.error(err);
      },
    });
  }

  private syncUsuario(idUsuario: number): void {
    this.displayIdUsuario.set(idUsuario);
    const usuario = this.usuarios().find((item) => item.id === idUsuario) ?? null;
    this.selectedUsuario.set(usuario);
  }

  get fecha() {
    return this.facturaForm.get('fecha');
  }

  get id_usuario() {
    return this.facturaForm.get('id_usuario');
  }

  onSubmit(): void {
    if (this.facturaForm.invalid) {
      this.snackBar.open('Por favor, complete todos los campos correctamente', 'Cerrar', {
        duration: 4000,
      });
      return;
    }

    this.submitting.set(true);

    const idUsuario = Number(this.facturaForm.value.id_usuario);

    const facturaData: any = {
      id: this.id_factura(),
      fecha: this.facturaForm.value.fecha,
      usuario: { id: idUsuario },
    };

    this.oFacturaService.update(facturaData).subscribe({
      next: () => {
        this.snackBar.open('Factura actualizada exitosamente', 'Cerrar', { duration: 4000 });
        this.submitting.set(false);
        this.router.navigate(['/factura']);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error actualizando la factura');
        this.snackBar.open('Error actualizando la factura', 'Cerrar', { duration: 4000 });
        console.error(err);
        this.submitting.set(false);
      },
    });
  }

  openUsuarioFinderModal(): void {
    if (!this.usuarioDialog) {
      return;
    }

    this.dialog.open(this.usuarioDialog, {
      height: '800px',
      width: '1100px',
      maxWidth: '95vw',
      panelClass: 'usuario-dialog',
    });
  }

  onUsuarioSearch(value: string): void {
    this.usuarioSearch.set(value);
    this.usuarioPage.set(0);
  }

  toggleUsuarioSort(): void {
    this.usuarioSortDirection.set(this.usuarioSortDirection() === 'asc' ? 'desc' : 'asc');
  }

  onUsuarioPageChange(page: number): void {
    this.usuarioPage.set(page);
  }

  onUsuarioRppChange(rpp: number): void {
    this.usuarioRpp.set(rpp);
    this.usuarioPage.set(0);
  }

  selectUsuario(usuario: IUsuario, dialogRef: any): void {
    this.facturaForm.patchValue({
      id_usuario: usuario.id,
    });
    this.syncUsuario(usuario.id);
    dialogRef?.close();
    this.snackBar.open(
      `Usuario seleccionado: ${usuario.nombre} ${usuario.apellido1 ?? ''} ${usuario.apellido2 ?? ''}`,
      'Cerrar',
      { duration: 3000 },
    );
  }

  doCancel(): void {
    this.router.navigate(['/factura']);
  }
}
