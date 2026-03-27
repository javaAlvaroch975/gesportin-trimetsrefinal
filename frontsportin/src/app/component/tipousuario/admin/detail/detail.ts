import { Component, signal, OnInit, inject, Input, Signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TipousuarioService } from '../../../../service/tipousuario';
import { ITipousuario } from '../../../../model/tipousuario';

@Component({
  standalone: true,
  selector: 'app-tipousuario-admin-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './detail.html',
  styleUrl: './detail.css',
})
export class TipousuarioAdminDetail implements OnInit {
  @Input() id: Signal<number> = signal(0);

  private tipousuarioService = inject(TipousuarioService);

  oTipousuario = signal<ITipousuario | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const idTipousuario = this.id();
    if (!idTipousuario || isNaN(idTipousuario)) {
      this.error.set('ID de tipo de usuario no válido');
      this.loading.set(false);
      return;
    }
    this.load(idTipousuario);
  }

  private load(id: number): void {
    this.tipousuarioService.get(id).subscribe({
      next: (data) => {
        this.oTipousuario.set(data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error cargando el tipo de usuario');
        console.error(err);
        this.loading.set(false);
      },
    });
  }
}
