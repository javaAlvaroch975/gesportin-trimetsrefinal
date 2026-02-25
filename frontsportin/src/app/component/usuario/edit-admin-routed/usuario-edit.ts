import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UsuarioService } from '../../../service/usuarioService';
import { IUsuario } from '../../../model/usuario';
import { UsuarioFormAdminUnrouted } from '../form-admin-unrouted/usuario-form';

@Component({
  selector: 'app-usuario-edit-routed',
  standalone: true,
  imports: [CommonModule, UsuarioFormAdminUnrouted],
  templateUrl: './usuario-edit.html',
  styleUrl: './usuario-edit.css',
})
export class UsuarioEditAdminRouted implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private oUsuarioService = inject(UsuarioService);
  private snackBar = inject(MatSnackBar);

  usuario = signal<IUsuario | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  submitting = signal(false);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam || idParam === '0') {
      this.error.set('ID de usuario no válido');
      this.loading.set(false);
      return;
    }

    const id = Number(idParam);

    if (isNaN(id)) {
      this.error.set('ID no válido');
      this.loading.set(false);
      return;
    }

    this.loadUsuario(id);
  }

  private loadUsuario(id: number): void {
    this.oUsuarioService.get(id).subscribe({
      next: (usuario: IUsuario) => {
        this.usuario.set(usuario);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error cargando el usuario');
        this.snackBar.open('Error cargando el usuario', 'Cerrar', { duration: 4000 });
        console.error(err);
        this.loading.set(false);
      },
    });
  }

  onFormSubmit(usuarioData: IUsuario): void {
    this.submitting.set(true);

    this.oUsuarioService.update(usuarioData).subscribe({
      next: () => {
        this.snackBar.open('Usuario actualizado exitosamente', 'Cerrar', { duration: 4000 });
        this.submitting.set(false);
        this.router.navigate(['/usuario']);
      },
      error: (err: HttpErrorResponse) => {
        this.snackBar.open('Error actualizando el usuario', 'Cerrar', { duration: 4000 });
        console.error(err);
        this.submitting.set(false);
      },
    });
  }

  onFormCancel(): void {
    this.router.navigate(['/usuario']);
  }
}



