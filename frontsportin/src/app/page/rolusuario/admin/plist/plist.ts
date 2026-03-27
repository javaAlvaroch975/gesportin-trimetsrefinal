import { Component, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RolusuarioAdminPlist } from '../../../../component/rolusuario/admin/plist/plist';

@Component({
  selector: 'app-rolusuario-admin-plist-page',
  imports: [RolusuarioAdminPlist],
  templateUrl: './plist.html',
  styleUrl: './plist.css',
})
export class RolusuarioAdminPlistPage {
  constructor(private route: ActivatedRoute) {}
}
