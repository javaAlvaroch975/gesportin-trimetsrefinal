import { Component, OnInit, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { CompraService } from '../../../service/compra';
import { ICompra } from '../../../model/compra';
import { ArticuloService } from '../../../service/articulo';
import { FacturaService } from '../../../service/factura-service';
import { IArticulo } from '../../../model/articulo';
import { IFactura } from '../../../model/factura';
import { ArticuloPlistAdminUnrouted } from '../../articulo/plist-admin-unrouted/articulo-plist-admin-unrouted';
import { FacturaPlistAdminUnrouted } from '../../factura/plist-admin-unrouted/factura-plist';

@Component({
  selector: 'app-compra-form-unrouted',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './compra-form.html',
  styleUrls: ['./compra-form.css'],
})
export class CompraFormUnrouted implements OnInit {
  @Input() compra: ICompra | null = null;
  @Input() isEditMode: boolean = false;
  @Output() formSuccess = new EventEmitter<void>();
  @Output() formCancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private compraService = inject(CompraService);
  private oArticuloService = inject(ArticuloService);
  private oFacturaService = inject(FacturaService);
  private dialog = inject(MatDialog);

  compraForm!: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  submitting = signal(false);
  selectedArticulo = signal<IArticulo | null>(null);
  selectedFactura = signal<IFactura | null>(null);

  ngOnInit(): void {
    this.initForm();
    if (this.compra) {
      this.loadCompraData();
    }
  }

  private initForm(): void {
    this.compraForm = this.fb.group({
      id: [{ value: 0, disabled: true }],
      cantidad: [0, [Validators.required, Validators.min(0)]],
      precio: [0, [Validators.required, Validators.min(0)]],
      id_articulo: [null, Validators.required],
      id_factura: [null, Validators.required],
    });
  }

  private loadCompraData(): void {
    if (!this.compra) return;

    this.compraForm.patchValue({
      id: this.compra.id,
      cantidad: this.compra.cantidad,
      precio: this.compra.precio,
      id_articulo: this.compra.articulo.id,
      id_factura: this.compra.factura.id,
    });
    this.syncArticulo(this.compra.articulo.id);
    this.syncFactura(this.compra.factura.id);
  }

  private syncArticulo(idArticulo: number): void {
    this.oArticuloService.get(idArticulo).subscribe({
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

  private syncFactura(idFactura: number): void {
    this.oFacturaService.get(idFactura).subscribe({
      next: (factura: IFactura) => {
        this.selectedFactura.set(factura);
      },
      error: (err: HttpErrorResponse) => {
        this.selectedFactura.set(null);
        this.snackBar.open('Error al cargar la factura seleccionada', 'Cerrar', { duration: 3000 });
        console.error(err);
      },
    });
  }

  get cantidad() {
    return this.compraForm.get('cantidad');
  }

  get precio() {
    return this.compraForm.get('precio');
  }

  get id_articulo() {
    return this.compraForm.get('id_articulo');
  }

  get id_factura() {
    return this.compraForm.get('id_factura');
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
        this.compraForm.patchValue({
          id_articulo: articulo.id,
        });
        this.syncArticulo(articulo.id);
        this.snackBar.open(`Artículo seleccionado: ${articulo.descripcion}`, 'Cerrar', {
          duration: 3000,
        });
      }
    });
  }

  openFacturaFinderModal(): void {
    const dialogRef = this.dialog.open(FacturaPlistAdminUnrouted, {
      height: '800px',
      width: '1100px',
      maxWidth: '95vw',
      panelClass: 'factura-dialog',
      data: {
        title: 'Aquí elegir factura',
        message: 'Plist finder para encontrar la factura y asignarla a la compra',
      },
    });

    dialogRef.afterClosed().subscribe((factura: IFactura | null) => {
      if (factura) {
        this.compraForm.patchValue({
          id_factura: factura.id,
        });
        this.syncFactura(factura.id);
        this.snackBar.open(`Factura seleccionada: ${factura.id}`, 'Cerrar', {
          duration: 3000,
        });
      }
    });
  }

  limitDecimalPlaces(event: Event, fieldName: string, maxDecimals: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (value.includes('.')) {
      const parts = value.split('.');
      if (parts[1] && parts[1].length > maxDecimals) {
        const truncatedValue = parseFloat(value).toFixed(maxDecimals);
        this.compraForm.get(fieldName)?.setValue(parseFloat(truncatedValue), { emitEvent: false });
        input.value = truncatedValue;
      }
    }
  }

  onSubmit(): void {
    this.error.set(null);

    if (this.compraForm.invalid) {
      this.error.set('Por favor, complete todos los campos correctamente');
      this.snackBar.open('Por favor, complete todos los campos correctamente', 'Cerrar', { duration: 4000 });
      this.compraForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    const formData = {
      id: this.isEditMode ? this.compra?.id : undefined,
      cantidad: this.compraForm.value.cantidad,
      precio: this.compraForm.value.precio,
      articulo: { id: this.compraForm.value.id_articulo },
      factura: { id: this.compraForm.value.id_factura },
    };

    if (this.isEditMode) {
      this.saveUpdate(formData);
    } else {
      this.saveCreate(formData);
    }
  }

  private saveCreate(compraData: any): void {
    this.compraService.create(compraData).subscribe({
      next: (id: number) => {
        this.snackBar.open('Compra creada exitosamente', 'Cerrar', { duration: 4000 });
        this.submitting.set(false);
        this.formSuccess.emit();
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error creando la compra');
        this.snackBar.open('Error creando la compra', 'Cerrar', { duration: 4000 });
        console.error(err);
        this.submitting.set(false);
      },
    });
  }

  private saveUpdate(compraData: any): void {
    this.compraService.update(compraData).subscribe({
      next: (id: number) => {
        this.snackBar.open('Compra actualizada exitosamente', 'Cerrar', { duration: 4000 });
        this.submitting.set(false);
        this.formSuccess.emit();
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error actualizando la compra');
        this.snackBar.open('Error actualizando la compra', 'Cerrar', { duration: 4000 });
        console.error(err);
        this.submitting.set(false);
      },
    });
  }

  onCancel(): void {
    this.formCancel.emit();
  }
}
