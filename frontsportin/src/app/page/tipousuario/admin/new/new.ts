import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TipousuarioAdminForm } from '../../../../component/tipousuario/admin/form/form';

@Component({
  selector: 'app-tipousuario-admin-new-page',
  imports: [CommonModule, TipousuarioAdminForm],
  templateUrl: './new.html',
  styleUrl: './new.css',
})
export class TipousuarioAdminNewPage {
  private router = inject(Router);

  onFormSuccess(): void {
    this.router.navigate(['/tipousuario']);
  }

  onFormCancel(): void {
    this.router.navigate(['/tipousuario']);
  }
}
