import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UsuarioService } from '../../../service/usuarioService';
import { IUsuario } from '../../../model/usuario';
import { UsuarioFormAdminUnrouted } from '../form-admin-unrouted/usuario-form';

@Component({
  selector: 'app-usuario-new-routed',
  standalone: true,
  imports: [CommonModule, UsuarioFormAdminUnrouted],
  templateUrl: './usuario-new.html',
  styleUrl: './usuario-new.css',
})
export class UsuarioNewAdminRouted {
  private router = inject(Router);
  private oUsuarioService = inject(UsuarioService);
  private snackBar = inject(MatSnackBar);

  submitting = signal(false);

  onFormSubmit(usuarioData: IUsuario): void {
    this.submitting.set(true);

    this.oUsuarioService.create(usuarioData).subscribe({
      next: () => {
        this.snackBar.open('Usuario creado exitosamente', 'Cerrar', { duration: 4000 });
        this.submitting.set(false);
        this.router.navigate(['/usuario']);
      },
      error: (err: HttpErrorResponse) => {
        this.snackBar.open('Error creando el usuario', 'Cerrar', { duration: 4000 });
        console.error(err);
        this.submitting.set(false);
      },
    });
  }

  onFormCancel(): void {
    this.router.navigate(['/usuario']);
  }
}
