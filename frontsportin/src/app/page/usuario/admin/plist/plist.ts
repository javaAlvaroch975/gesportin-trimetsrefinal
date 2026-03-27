import { Component, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UsuarioAdminPlist } from '../../../../component/usuario/admin/plist/plist';

@Component({
  selector: 'app-usuario-admin-plist-page',
  imports: [UsuarioAdminPlist],
  templateUrl: './plist.html',
  styleUrl: './plist.css',
})
export class UsuarioAdminPlistPage {
  constructor(private route: ActivatedRoute) {}
}
