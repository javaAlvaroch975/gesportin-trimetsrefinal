import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PuntuacionService } from '../../../service/puntuacion';
import { IPuntuacion } from '../../../model/puntuacion';
import { PuntuacionFormAdminUnrouted } from '../form-unrouted/puntuacion-form';

@Component({
  selector: 'app-puntuacion-edit',
  standalone: true,
  imports: [CommonModule, PuntuacionFormAdminUnrouted],
  templateUrl: './puntuacion-edit.html',
  styleUrl: './puntuacion-edit.css',
})
export class PuntuacionEditAdminRouted implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private oPuntuacionService = inject(PuntuacionService);
  private snackBar = inject(MatSnackBar);

  puntuacion = signal<IPuntuacion | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam || idParam === '0') {
      this.error.set('ID de puntuación no válido');
      this.loading.set(false);
      return;
    }

    const id = Number(idParam);

    if (isNaN(id)) {
      this.error.set('ID no válido');
      this.loading.set(false);
      return;
    }

    this.loadPuntuacion(id);
  }

  private loadPuntuacion(id: number): void {
    this.oPuntuacionService.get(id).subscribe({
      next: (puntuacion: IPuntuacion) => {
        this.puntuacion.set(puntuacion);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error cargando la puntuación');
        this.snackBar.open('Error cargando la puntuación', 'Cerrar', { duration: 4000 });
        console.error(err);
        this.loading.set(false);
      },
    });
  }

  onFormSuccess(): void {
    this.router.navigate(['/puntuacion']);
  }

  onFormCancel(): void {
    this.router.navigate(['/puntuacion']);
  }
}
