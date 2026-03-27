import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UsuarioAdminForm } from '../../../../component/usuario/admin/form/form';

@Component({
  selector: 'app-usuario-admin-new-page',
  imports: [CommonModule, UsuarioAdminForm],
  templateUrl: './new.html',
  styleUrl: './new.css',
})
export class UsuarioAdminNewPage {
  private router = inject(Router);

  onFormSuccess(): void {
    this.router.navigate(['/usuario']);
  }

  onFormCancel(): void {
    this.router.navigate(['/usuario']);
  }
}
