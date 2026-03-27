import { Component, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RolusuarioAdminDetail } from '../../../../component/rolusuario/admin/detail/detail';

@Component({
  selector: 'app-rolusuario-admin-view-page',
  imports: [RolusuarioAdminDetail],
  templateUrl: './view.html',
  styleUrl: './view.css',
})
export class RolusuarioAdminViewPage {
  id_rolusuario = signal<number>(0);

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.id_rolusuario.set(id ? Number(id) : NaN);
  }
}
