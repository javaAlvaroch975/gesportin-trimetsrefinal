import { Component, signal, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IComentario } from '../../../model/comentario';
import { ComentarioDetailAdminUnrouted } from '../detail-admin-unrouted/comentario-detail';

@Component({
  selector: 'app-comentario-view',
  imports: [CommonModule, ComentarioDetailAdminUnrouted],
  templateUrl: './comentario-view.html',
  styleUrl: './comentario-view.css',
})
export class ComentarioViewRouted implements OnInit {

  private route = inject(ActivatedRoute);  

  oComentario = signal<IComentario | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  id_comentario = signal<number>(0);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id_comentario.set(idParam ? Number(idParam) : NaN);
    if (isNaN(this.id_comentario())) {
      this.error.set('ID no válido');
      this.loading.set(false);
      return;
    }    
  }
}
