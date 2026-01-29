import { Component, signal, computed } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { IPage } from '../../../model/plist';
import { ITipoarticulo } from '../../../model/tipoarticulo';
import { Paginacion } from '../../shared/paginacion/paginacion';
import { BotoneraRpp } from '../../shared/botonera-rpp/botonera-rpp';
import { TipoarticuloService } from '../../../service/tipoarticulo';
import { TrimPipe } from '../../../pipe/trim-pipe';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-tipoarticulo-plist',
  imports: [Paginacion, BotoneraRpp, TrimPipe, RouterLink],
  templateUrl: './tipoarticulo-plist.html',
  styleUrl: './tipoarticulo-plist.css',
})
export class TipoarticuloPlistAdminRouted {
  oPage = signal<IPage<ITipoarticulo> | null>(null);
  numPage = signal<number>(0);
  numRpp = signal<number>(5);

  // For fill functionality
  rellenaCantidad = signal<number>(10);
  rellenando = signal<boolean>(false);
  rellenaOk = signal<string>('');
  rellenaError = signal<string>('');
  totalElementsCount = computed(() => this.oPage()?.totalElements ?? 0);

  constructor(private oTipoarticuloService: TipoarticuloService) {}

  ngOnInit(): void {
    this.getPage();
  }

  getPage() {
    this.oTipoarticuloService.getPage(this.numPage(), this.numRpp()).subscribe({
      next: (data: IPage<ITipoarticulo>) => {
        this.oPage.set(data);
        if (this.numPage() > 0 && this.numPage() >= data.totalPages) {
          this.numPage.set(data.totalPages - 1);
          this.getPage();
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }

  doRppChange(rpp: number): void {
    this.numRpp.set(rpp);
    this.numPage.set(0);
    this.getPage();
  }

  doPageChange(page: number): void {
    this.numPage.set(page);
    this.getPage();
  }
}
