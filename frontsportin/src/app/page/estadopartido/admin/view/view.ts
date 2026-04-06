import { Component, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EstadopartidoAdminDetail } from '../../../../component/estadopartido/admin/detail/detail';

@Component({
  selector: 'app-estadopartido-admin-view-page',
  imports: [EstadopartidoAdminDetail],
  templateUrl: './view.html',
  styleUrl: './view.css',
})
export class EstadopartidoAdminViewPage implements OnInit {
  id_estadopartido = signal<number>(0);

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.id_estadopartido.set(id ? Number(id) : NaN);
  }
}
