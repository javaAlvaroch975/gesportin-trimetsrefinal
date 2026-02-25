import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClubFormUnrouted } from '../form-unrouted/club-form';

@Component({
  selector: 'app-club-new-admin-routed',
  imports: [CommonModule, ClubFormUnrouted],
  templateUrl: './club-new.html',
  styleUrl: './club-new.css',
})
export class ClubNewAdminRouted {
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  error = signal<string | null>(null);

  onFormSuccess(): void {
    this.router.navigate(['/club']);
  }

  onFormCancel(): void {
    this.router.navigate(['/club']);
  }
}
