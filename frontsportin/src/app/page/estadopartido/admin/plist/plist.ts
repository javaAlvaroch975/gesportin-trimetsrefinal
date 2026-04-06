import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EstadopartidoAdminPlist } from '../../../../component/estadopartido/admin/plist/plist';

@Component({
  selector: 'app-estadopartido-admin-plist-page',
  imports: [EstadopartidoAdminPlist],
  templateUrl: './plist.html',
  styleUrl: './plist.css',
})
export class EstadopartidoAdminPlistPage {
  constructor(private route: ActivatedRoute) {}
}
