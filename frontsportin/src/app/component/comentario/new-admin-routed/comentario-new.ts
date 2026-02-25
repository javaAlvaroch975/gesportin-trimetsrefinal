import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ComentarioFormAdminUnrouted } from '../form-unrouted/comentario-form';

@Component({
  selector: 'app-comentario-new-admin-routed',
  standalone: true,
  imports: [CommonModule, ComentarioFormAdminUnrouted],
  templateUrl: './comentario-new.html',
  styleUrls: ['./comentario-new.css']
})
export class ComentarioNewAdminRouted {
  constructor(private router: Router) {}

  onSuccess() { this.router.navigate(['/comentario']); }
  onCancel() { this.router.navigate(['/comentario']); }
}
