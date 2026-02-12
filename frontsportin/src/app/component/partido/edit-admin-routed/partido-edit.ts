import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PartidoService } from '../../../service/partido';
import { LigaService } from '../../../service/liga';
import { IPartido } from '../../../model/partido';
import { ILiga } from '../../../model/liga';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
// import { LigaPlistAdminUnrouted } from '../../liga/plist-admin-unrouted/liga-plist';

@Component({
  selector: 'app-partido-edit',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './partido-edit.html',
  styleUrl: './partido-edit.css',
})
export class PartidoEditAdminRouted implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private oPartidoService = inject(PartidoService);
  private oLigaService = inject(LigaService);
  private snackBar = inject(MatSnackBar);
  
  partidoForm!: FormGroup;
  id_partido = signal<number>(0);
  loading = signal(true);
  error = signal<string | null>(null);
  submitting = signal(false);
  liga = signal<ILiga[]>([]);
  selectedLiga = signal<ILiga | null>(null);
  displayIdLiga = signal<number | null>(null);
  
  constructor(private dialog: MatDialog) {

  }
  
  ngOnInit(): void {
    this.initForm();
    this.loadLigas();
  
    const idParam = this.route.snapshot.paramMap.get('id');
  
    if (!idParam || idParam === '0') {
      this.error.set('ID de partido no válido');
      this.loading.set(false);
      return;
    }
  
    this.id_partido.set(Number(idParam));
  
    if (isNaN(this.id_partido())) {
      this.error.set('ID no válido');
      this.loading.set(false);
      return;
    }
  
    this.loadPartido();
  }
  
  private loadLiga(): void {
    const idLiga = this.partidoForm.get('id_liga')?.value;
    if (idLiga) {
      this.oLigaService.get(idLiga).subscribe({
        next: (liga) => {
          this.selectedLiga.set(liga);
          this.displayIdLiga.set(liga.id);
        },
        error: (err: HttpErrorResponse) => {
          this.snackBar.open('Error cargando la liga', 'Cerrar', { duration: 4000 });
          console.error(err);
        },
      });
    } else {
      this.selectedLiga.set(null);
      this.displayIdLiga.set(null);
    }
  }
  
  private initForm(): void {
    this.partidoForm = this.fb.group({
      id: [{ value: 0, disabled: true }],
      rival: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      id_liga: [null, Validators.required],
      local: [null, [Validators.required, Validators.min(0), Validators.max(1)]],
      resultado: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
    });
  
    // Cargar la liga cuando cambia el desplegable
    this.partidoForm.get('id_liga')?.valueChanges.subscribe((id) => {
      if (id) {
        this.loadLiga();
      }
    });
  }
  
  private loadPartido(): void {
    this.oPartidoService.get(this.id_partido()).subscribe({
      next: (partido: IPartido) => {
        this.partidoForm.patchValue({
          id: partido.id,
          rival: partido.rival,
          id_liga: partido.liga?.id,
          local: partido.local,
          resultado: partido.resultado,
        });
        if (partido.liga) {
            
          // Sincronizar explícitamente después de patchValue
          this.syncLiga(partido.liga.id);
        }
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error cargando el partido');
        this.snackBar.open('Error cargando el partido', 'Cerrar', { duration: 4000 });
        console.error(err);
        this.loading.set(false);
      },
    });
  }
  
  private loadLigas(): void {
    this.oLigaService.getPage(0, 1000, 'nombre', 'asc').subscribe({
      next: (page) => {

        // Mostrar todas las ligas
        this.liga.set(page.content);
          
        // Sincronizar con el tipo actual si está cargado
        const idActual = this.partidoForm.get('id_liga')?.value;
        if (idActual) {
          this.syncLiga(idActual);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.snackBar.open('Error cargando ligas', 'Cerrar', { duration: 4000 });
        console.error(err);
      },
    });
  }
  
  private syncLiga(idLiga: number): void {
    this.displayIdLiga.set(idLiga);
    const ligaSeleccionada = this.liga().find((l) => l.id === idLiga);
    if (ligaSeleccionada) {
      this.selectedLiga.set(ligaSeleccionada);
    } else {
      this.selectedLiga.set(null);
    }
  }
  
  get rival() {
    return this.partidoForm.get('rival');
  }

  get id_liga() {
    return this.partidoForm.get('id_liga');
  }
  
  get local() {
    return this.partidoForm.get('local');
  }
  
  get resultado() {
    return this.partidoForm.get('resultado');
  }
  
  onSubmit(): void {
    if (this.partidoForm.invalid) {
      this.snackBar.open('Por favor, complete todos los campos correctamente', 'Cerrar', {
        duration: 4000,
      });
      return;
    }
  
    this.submitting.set(true);
  
    const partidoData: any = {
      id: this.id_partido(),
      rival: this.partidoForm.value.rival,
      liga: { id: this.partidoForm.value.id_liga },
      local: this.partidoForm.value.local,
      resultado: this.partidoForm.value.resultado,
    };
  
    this.oPartidoService.update(partidoData).subscribe({
      next: (id: number) => {
        this.snackBar.open('Partido actualizado exitosamente', 'Cerrar', { duration: 4000 });
        this.submitting.set(false);
        this.router.navigate(['/partido']);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error actualizando el partido');
        this.snackBar.open('Error actualizando el partido', 'Cerrar', { duration: 4000 });
        console.error(err);
        this.submitting.set(false);
      },
    });
  }
  
  // openLigaFinderModal(): void {
  //   const dialogRef = this.dialog.open(LigaPlistAdminUnrouted, {
  //     height: '800px',
  //     width: '1100px',
  //     maxWidth: '95vw',
  //     panelClass: 'liga-dialog',
  //     data: {
  //       title: 'Elegir aquí la liga',
  //       message: 'Utilizamos el plist finder para encontrar la liga y asignarla al partido',
  //     },
  //   });
  
  //   dialogRef.afterClosed().subscribe((liga: ILiga | null) => {
  //     if (liga) {
  //       this.partidoForm.patchValue({
  //         id_liga: liga.id,
  //       });

  //       // Sincronizar explícitamente después de seleccionar desde el modal
  //       this.syncLiga(liga.id);
  //       this.snackBar.open(`Liga seleccionada: ${liga.nombre}`, 'Cerrar', {
  //         duration: 3000,
  //       });
  //     }
  //   });
  // }
}
