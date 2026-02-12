import { I } from '@angular/cdk/keycodes';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-botonera-actions-plist',
  imports: [RouterLink],
  templateUrl: './botonera-actions-plist.html',
  styleUrl: './botonera-actions-plist.css',
})
export class BotoneraActionsPlist {

  @Input() id: number = 0;
  @Input() strEntity: string = '';


}
