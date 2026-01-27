import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IPage } from '../../../model/plist';
import { IUsuario } from '../../../model/usuario';
import { UsuarioService } from '../../../service/usuarioService';
import { UsuarioSharedModule } from './usuario-shared.module';

@Component({
  selector: 'app-usuario-plist',
  imports: [CommonModule, UsuarioSharedModule],
  templateUrl: './usuario-plist.html',
  styleUrl: './usuario-plist.css',
  standalone: true
})
export class UsuarioPlist implements OnInit {
  oPage: IPage<IUsuario> | null = null;
  numPage: number = 0;
  numRpp: number = 10;
  filtro: string = '';
  isLoading: boolean = false;
  isFilling: boolean = false;
  errorMessage: string = '';
  fillErrorMessage: string = '';
  totalElementsCount: number = 0;
  fillAmount: number = 25;

  constructor(
    private oUsuarioService: UsuarioService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.getPage();
  }

  getPage() {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.oUsuarioService.getPage(this.numPage, this.numRpp, 'id', 'asc', this.filtro.trim()).subscribe({
      next: (data: IPage<IUsuario>) => {
        this.oPage = data;
        this.totalElementsCount = data.totalElements ?? 0;
        if (this.numPage > 0 && this.numPage >= data.totalPages) {
          this.numPage = data.totalPages - 1;
          this.getPage();
          return;
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.errorMessage = 'No se pudo cargar la lista de usuarios.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onSearch(value: string) {
    this.filtro = value;
    this.numPage = 0;
    this.getPage();
  }

  setFillAmount(value: string) {
    const parsed = Number(value);
    if (!Number.isNaN(parsed) && parsed > 0) {
      this.fillAmount = parsed;
    }
  }

  fillUsuarios() {
    if (this.isFilling) {
      return;
    }
    this.isFilling = true;
    this.fillErrorMessage = '';
    this.cdr.markForCheck();

    this.oUsuarioService.fill(this.fillAmount).subscribe({
      next: () => {
        this.isFilling = false;
        this.getPage();
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.fillErrorMessage = 'No se pudieron rellenar usuarios.';
        this.isFilling = false;
        this.cdr.markForCheck();
      }
    });
  }

  goToPage(numPage: number) {
    if (numPage < 0) {
      return false;
    }
    this.numPage = numPage;
    this.getPage();
    return false;
  }

  onRppChange(n: number | string) {
    const parsed = typeof n === 'string' ? Number(n) : n;
    if (Number.isNaN(parsed) || parsed <= 0) {
      return;
    }
    this.numRpp = parsed;
    this.numPage = 0;
    this.getPage();
  }

  trackById(index: number, usuario: IUsuario) {
    return usuario.id;
  }

  getGeneroLabel(genero: number) {
    return genero === 0 ? 'H' : 'M';
  }
}
