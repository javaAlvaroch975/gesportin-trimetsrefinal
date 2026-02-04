import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IJWT } from '../../../model/token';

@Component({
  selector: 'app-menu',
  imports: [RouterModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {
  isSessionActive: boolean = false;
  oTokenJWT: IJWT | null = null;

  ngOnInit(): void {
  }
}
