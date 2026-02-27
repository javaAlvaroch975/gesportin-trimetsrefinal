import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CompraFormUnrouted } from '../form-unrouted/compra-form';

@Component({
  selector: 'app-compra-new-admin-routed',
  imports: [CommonModule, CompraFormUnrouted],
  templateUrl: './compra-new.html',
  styleUrl: './compra-new.css',
})
export class CompraNewAdminRouted {
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  error = signal<string | null>(null);

  onFormSuccess(): void {
    this.router.navigate(['/compra']);
  }

  onFormCancel(): void {
    this.router.navigate(['/compra']);
  }
}
