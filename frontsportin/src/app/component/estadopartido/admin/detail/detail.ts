import { Component, signal, OnInit, inject, Input, Signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { EstadopartidoService } from '../../../../service/estadopartido';
import { IEstadopartido } from '../../../../model/estadopartido';

@Component({
  standalone: true,
  selector: 'app-estadopartido-admin-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './detail.html',
  styleUrl: './detail.css',
})
export class EstadopartidoAdminDetail implements OnInit {
  @Input() id: Signal<number> = signal(0);

  private estadopartidoService = inject(EstadopartidoService);

  oEstadopartido = signal<IEstadopartido | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const idEstado = this.id();
    if (!idEstado || isNaN(idEstado)) {
      this.error.set('ID de estado de partido no válido');
      this.loading.set(false);
      return;
    }
    this.load(idEstado);
  }

  private load(id: number): void {
    this.estadopartidoService.get(id).subscribe({
      next: (data) => {
        this.oEstadopartido.set(data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error cargando el estado de partido');
        console.error(err);
        this.loading.set(false);
      },
    });
  }
}
