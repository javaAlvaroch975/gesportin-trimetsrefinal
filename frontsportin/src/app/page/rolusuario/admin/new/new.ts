import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RolusuarioAdminForm } from '../../../../component/rolusuario/admin/form/form';

@Component({
  selector: 'app-rolusuario-admin-new-page',
  imports: [CommonModule, RolusuarioAdminForm],
  templateUrl: './new.html',
  styleUrl: './new.css',
})
export class RolusuarioAdminNewPage {
  private router = inject(Router);

  onFormSuccess(): void {
    this.router.navigate(['/rolusuario']);
  }

  onFormCancel(): void {
    this.router.navigate(['/rolusuario']);
  }
}
