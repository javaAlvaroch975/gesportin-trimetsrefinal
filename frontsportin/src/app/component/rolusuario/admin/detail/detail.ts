import { Component, signal, OnInit, inject, Input, Signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RolusuarioService } from '../../../../service/rolusuario';
import { IRolusuario } from '../../../../model/rolusuario';

@Component({
  standalone: true,
  selector: 'app-rolusuario-admin-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './detail.html',
  styleUrl: './detail.css',
})
export class RolusuarioAdminDetail implements OnInit {
  @Input() id: Signal<number> = signal(0);

  private rolusuarioService = inject(RolusuarioService);

  oRolusuario = signal<IRolusuario | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const idRolusuario = this.id();
    if (!idRolusuario || isNaN(idRolusuario)) {
      this.error.set('ID de rol de usuario no válido');
      this.loading.set(false);
      return;
    }
    this.load(idRolusuario);
  }

  private load(id: number): void {
    this.rolusuarioService.get(id).subscribe({
      next: (data) => {
        this.oRolusuario.set(data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error cargando el rol de usuario');
        console.error(err);
        this.loading.set(false);
      },
    });
  }
}
