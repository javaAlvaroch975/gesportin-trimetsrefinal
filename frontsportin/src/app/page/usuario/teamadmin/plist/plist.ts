import { Component, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UsuarioTeamadminPlist } from '../../../../component/usuario/teamadmin/plist/plist';

@Component({
  selector: 'app-usuario-teamadmin-plist-page',
  imports: [UsuarioTeamadminPlist],
  templateUrl: './plist.html',
  styleUrl: './plist.css',
})
export class UsuarioTeamadminPlistPage {
  constructor(private route: ActivatedRoute) {}
}
