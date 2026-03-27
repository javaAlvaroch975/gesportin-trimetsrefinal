import { Component, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TipousuarioAdminDetail } from '../../../../component/tipousuario/admin/detail/detail';

@Component({
  selector: 'app-tipousuario-admin-view-page',
  imports: [TipousuarioAdminDetail],
  templateUrl: './view.html',
  styleUrl: './view.css',
})
export class TipousuarioAdminViewPage {
  id_tipousuario = signal<number>(0);

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.id_tipousuario.set(id ? Number(id) : NaN);
  }
}
