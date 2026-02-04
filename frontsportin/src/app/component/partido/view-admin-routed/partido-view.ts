import { Component, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PartidoService } from '../../../service/partido';
import { IPartido } from '../../../model/partido';


@Component({
  selector: 'app-partido-view',
  imports: [CommonModule, RouterLink],
  templateUrl: './partido-view.html',
  styleUrl: './partido-view.css',
})
export class PartidoViewAdminRouted implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private oPartidoService = inject(PartidoService);
  private destroy$ = new Subject<void>();

  oPartido = signal<IPartido | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;
    if (isNaN(id)) {
      this.error.set('ID de partido no válido');
      this.loading.set(false);
      return;
    }
    this.load(id);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(id: number): void {
    this.oPartidoService.get(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: IPartido) => {
          this.oPartido.set(data);
          this.loading.set(false);
        },
        error: (err: HttpErrorResponse) => {
          const statusCode = err.status;
          let errorMessage = 'Error al cargar el partido';
          
          if (statusCode === 404) {
            errorMessage = 'Partido no encontrado';
          } else if (statusCode === 401 || statusCode === 403) {
            errorMessage = 'No tienes permisos para ver este partido';
          } else if (statusCode === 500) {
            errorMessage = 'Error del servidor. Intenta más tarde';
          }
          
          this.error.set(errorMessage);
          this.loading.set(false);
          console.error('Error cargando partido:', err);
        },
      });
  }
}
