import { Component, signal, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RolusuarioService } from '../../../../service/rolusuario';
import { RolusuarioAdminForm } from '../../../../component/rolusuario/admin/form/form';
import { IRolusuario } from '../../../../model/rolusuario';

@Component({
  selector: 'app-rolusuario-admin-edit-page',
  imports: [CommonModule, RolusuarioAdminForm],
  templateUrl: './edit.html',
  styleUrl: './edit.css',
})
export class RolusuarioAdminEditPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private rolusuarioService = inject(RolusuarioService);

  rolusuario = signal<IRolusuario | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadRolusuario(Number(id));
    } else {
      this.error.set('ID no válido');
      this.loading.set(false);
    }
  }

  private loadRolusuario(id: number): void {
    this.rolusuarioService.get(id).subscribe({
      next: (data) => {
        this.rolusuario.set(data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error cargando el rol de usuario');
        console.error(err);
        this.loading.set(false);
      },
    });
  }

  onFormSuccess(): void {
    this.snackBar.open('Rol de usuario actualizado exitosamente', 'Cerrar', { duration: 2000 });
    this.router.navigate(['/rolusuario']);
  }

  onFormCancel(): void {
    this.router.navigate(['/rolusuario']);
  }
}
