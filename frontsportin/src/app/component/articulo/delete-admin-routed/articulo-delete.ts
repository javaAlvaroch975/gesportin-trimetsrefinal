import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ArticuloDetail } from '../articulo-detail/articulo-detail';
import { HttpClient } from '@angular/common/http';
import { serverURL } from '../../../environment/environment';

@Component({
  selector: 'app-articulo-delete',
  imports: [CommonModule, RouterLink, ArticuloDetail],
  templateUrl: './articulo-delete.html',
  styleUrl: './articulo-delete.css',
})
export class ArticuloDeleteAdminRouted implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  id = signal<number>(0);
  deleting = signal<boolean>(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const idValue = idParam ? Number(idParam) : NaN;
    if (!isNaN(idValue)) {
      this.id.set(idValue);
    }
  }

  delete(): void {
    if (this.id() <= 0) {
      this.error.set('ID de artículo inválido');
      return;
    }
    this.deleting.set(true);
    this.error.set(null);
    this.http.delete<number>(`${serverURL}/articulo/${this.id()}`).subscribe({
      next: () => {
        this.deleting.set(false);
        this.router.navigate(['/articulo']);
      },
      error: (err) => {
        this.deleting.set(false);
        this.error.set(err?.message ?? 'Error desconocido al eliminar');
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/articulo']);
  }
}
