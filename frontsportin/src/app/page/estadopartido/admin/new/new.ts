import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EstadopartidoAdminForm } from '../../../../component/estadopartido/admin/form/form';

@Component({
  selector: 'app-estadopartido-admin-new-page',
  imports: [CommonModule, EstadopartidoAdminForm],
  templateUrl: './new.html',
  styleUrl: './new.css',
})
export class EstadopartidoAdminNewPage {
  private router = inject(Router);

  onFormSuccess(): void {
    this.router.navigate(['/estadopartido']);
  }

  onFormCancel(): void {
    this.router.navigate(['/estadopartido']);
  }
}
