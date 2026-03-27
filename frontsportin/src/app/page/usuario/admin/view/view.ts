import { Component, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UsuarioAdminDetail } from '../../../../component/usuario/admin/detail/detail';

@Component({
  selector: 'app-usuario-admin-view-page',
  imports: [UsuarioAdminDetail],
  templateUrl: './view.html',
  styleUrl: './view.css',
})
export class UsuarioAdminViewPage {
  id_usuario = signal<number>(0);

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.id_usuario.set(id ? Number(id) : NaN);
  }
}
