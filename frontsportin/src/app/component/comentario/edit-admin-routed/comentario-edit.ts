import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ComentarioService } from '../../../service/comentario';
import { IComentario } from '../../../model/comentario';
import { ComentarioFormAdminUnrouted } from '../form-unrouted/comentario-form';

@Component({
  selector: 'app-comentario-edit-admin-routed',
  standalone: true,
  imports: [CommonModule, ComentarioFormAdminUnrouted],
  templateUrl: './comentario-edit.html',
  styleUrls: ['./comentario-edit.css']
})
export class ComentarioEditAdminRouted implements OnInit {
  oComentario = signal<IComentario | null>(null);
  oLoading = signal<boolean>(true);
  oError = signal<string | null>(null);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private oComentarioService = inject(ComentarioService);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || isNaN(id)) {
      this.oError.set('ID inválido');
      this.oLoading.set(false);
      return;
    }

    this.oComentarioService.get(id).subscribe({
      next: (data) => { this.oComentario.set(data); this.oLoading.set(false); },
      error: (err) => { this.oError.set('Error cargando comentario'); this.oLoading.set(false); }
    });
  }

  onSuccess() { this.router.navigate(['/comentario']); }
  onCancel() { this.router.navigate(['/comentario']); }
}