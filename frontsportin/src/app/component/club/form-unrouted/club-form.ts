import { Component, OnInit, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClubService } from '../../../service/club';
import { IClub } from '../../../model/club';

@Component({
  selector: 'app-club-form-unrouted',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './club-form.html',
  styleUrls: ['./club-form.css'],
})
export class ClubFormUnrouted implements OnInit {
  @Input() club: IClub | null = null;
  @Input() isEditMode: boolean = false;
  @Output() formSuccess = new EventEmitter<void>();
  @Output() formCancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private clubService = inject(ClubService);

  clubForm!: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  submitting = signal(false);

  ngOnInit(): void {
    this.initForm();
    if (this.club) {
      this.loadClubData();
    }
  }

  private initForm(): void {
    this.clubForm = this.fb.group({
      id: [{ value: 0, disabled: true }],
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      direccion: [''],
      telefono: [''],
      fechaAlta: [new Date().toISOString().split('T')[0], Validators.required],
      imagen: [null],
    });
  }

  private loadClubData(): void {
    if (!this.club) return;
    const fechaAltaInput = this.toDateInputValue(this.club.fechaAlta);

    this.clubForm.patchValue({
      id: this.club.id,
      nombre: this.club.nombre,
      direccion: this.club.direccion,
      telefono: this.club.telefono,
      fechaAlta: fechaAltaInput,
      imagen: this.club.imagen || null,
    });
  }

  get nombre() {
    return this.clubForm.get('nombre');
  }

  get fechaAlta() {
    return this.clubForm.get('fechaAlta');
  }

  onSubmit(): void {
    this.error.set(null);

    if (this.clubForm.invalid) {
      this.error.set('Por favor, complete todos los campos correctamente');
      this.snackBar.open('Por favor, complete todos los campos correctamente', 'Cerrar', { duration: 4000 });
      this.clubForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    const fechaValue = this.clubForm.value.fechaAlta;
    const fechaConHora = this.toLocalDateTime(fechaValue);

    const formData = {
      id: this.isEditMode ? this.club?.id : undefined,
      nombre: this.clubForm.value.nombre,
      direccion: this.clubForm.value.direccion,
      telefono: this.clubForm.value.telefono,
      fechaAlta: fechaConHora,
      imagen: this.clubForm.value.imagen || null,
      ...(this.isEditMode
        ? {}
        : {
            temporadas: [],
            noticias: [],
            tipoarticulos: [],
            usuarios: [],
          }),
    };

    if (this.isEditMode) {
      this.saveUpdate(formData);
    } else {
      this.saveCreate(formData);
    }
  }

  private saveCreate(clubData: any): void {
    this.clubService.create(clubData).subscribe({
      next: (id: number) => {
        this.snackBar.open('Club creado exitosamente', 'Cerrar', { duration: 4000 });
        this.submitting.set(false);
        this.formSuccess.emit();
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error creando el club');
        this.snackBar.open('Error creando el club', 'Cerrar', { duration: 4000 });
        console.error(err);
        this.submitting.set(false);
      },
    });
  }

  private saveUpdate(clubData: any): void {
    this.clubService.update(clubData).subscribe({
      next: (id: number) => {
        this.snackBar.open('Club actualizado exitosamente', 'Cerrar', { duration: 4000 });
        this.submitting.set(false);
        this.formSuccess.emit();
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error actualizando el club');
        this.snackBar.open('Error actualizando el club', 'Cerrar', { duration: 4000 });
        console.error(err);
        this.submitting.set(false);
      },
    });
  }

  private toLocalDateTime(value: string): string {
    if (!value) {
      return '';
    }
    if (value.includes('T')) {
      const [datePart, timePart] = value.split('T');
      return `${datePart}T${(timePart || '00:00:00').slice(0, 8)}`;
    }
    if (value.includes(' ')) {
      const [datePart, timePart] = value.split(' ');
      return `${datePart}T${(timePart || '00:00:00').slice(0, 8)}`;
    }
    return `${value}T00:00:00`;
  }

  private toDateInputValue(value: Date | string): string {
    if (!value) {
      return new Date().toISOString().split('T')[0];
    }
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    const text = String(value);
    return text.includes('T') ? text.split('T')[0] : text.split(' ')[0];
  }

  onCancel(): void {
    this.formCancel.emit();
  }
}
