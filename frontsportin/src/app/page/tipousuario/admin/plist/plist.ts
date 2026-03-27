import { Component, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TipousuarioAdminPlist } from '../../../../component/tipousuario/admin/plist/plist';

@Component({
  selector: 'app-tipousuario-admin-plist-page',
  imports: [TipousuarioAdminPlist],
  templateUrl: './plist.html',
  styleUrl: './plist.css',
})
export class TipousuarioAdminPlistPage {
  constructor(private route: ActivatedRoute) {}
}
