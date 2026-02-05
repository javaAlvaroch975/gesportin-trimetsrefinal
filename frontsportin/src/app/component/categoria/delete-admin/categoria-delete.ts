import { Component, signal, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CategoriaService } from '../../../service/categoria';
import { ICategoria } from '../../../model/categoria';


@Component({
  selector: 'app-categoria-delete',
  imports: [CommonModule, RouterLink],
  templateUrl: './categoria-delete.html',
  styleUrl: './categoria-delete.css',
})
export class CategoriaDeleteAdmin implements OnInit {
  private route = inject(ActivatedRoute);
  private oCategoriaService = inject(CategoriaService);
  private router = inject(Router);

  oCategoria = signal<ICategoria | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    // Suscribirse a los cambios en los parámetros de la ruta
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      const id = idParam ? Number(idParam) : NaN;
      
      if (isNaN(id)) {
        this.error.set('ID no válido');
        this.loading.set(false);
        return;
      }
      
      // Resetear el estado antes de cargar     
      this.getCategoria(id);
    });
  }


  getCategoria(id: number) {
    this.oCategoriaService.get(id).subscribe({
      next: (data) => {
        this.oCategoria.set(data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error cargando la categoría');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  deleteCategoria(id: number) {
    this.oCategoriaService.delete(id).subscribe({
      next: () => {
       this.router.navigate(['/categoria/plist']);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error eliminando la categoría');
        this.loading.set(false);
        console.error(err);
      },
      complete: () => {
        this.loading.set(false);
      }
    });
  }
}
