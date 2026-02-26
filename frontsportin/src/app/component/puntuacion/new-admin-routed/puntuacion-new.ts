import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PuntuacionFormAdminUnrouted } from '../form-unrouted/puntuacion-form';

@Component({
  selector: 'app-puntuacion-new-routed',
  standalone: true,
  imports: [CommonModule, PuntuacionFormAdminUnrouted],
  templateUrl: './puntuacion-new.html',
  styleUrl: './puntuacion-new.css',
})
export class PuntuacionNewAdminRouted {
  private router = inject(Router);

  onFormSuccess(): void {
    this.router.navigate(['/puntuacion']);
  }

  onFormCancel(): void {
    this.router.navigate(['/puntuacion']);
  }
}
