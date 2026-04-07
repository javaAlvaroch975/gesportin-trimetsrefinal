import { Component, computed, inject, Input, OnInit, OnDestroy, OnChanges, signal, SimpleChanges } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { MODAL_REF } from '../../../shared/modal/modal.tokens';
import { debounceTimeSearch } from '../../../../environment/environment';
import { ILiga } from '../../../../model/liga';
import { IPage } from '../../../../model/plist';
import { LigaService } from '../../../../service/liga';
import { BotoneraRpp } from '../../../shared/botonera-rpp/botonera-rpp';
import { Paginacion } from '../../../shared/paginacion/paginacion';
import { BotoneraActionsPlist } from '../../../shared/botonera-actions-plist/botonera-actions-plist';

@Component({
  standalone: true,
  selector: 'app-liga-teamadmin-plist',
  imports: [BotoneraRpp, Paginacion, RouterLink, BotoneraActionsPlist],
  templateUrl: './plist.html',
  styleUrl: './plist.css',
})
export class LigaTeamadminPlist implements OnInit, OnChanges, OnDestroy {
  @Input() id_equipo?: number;

  equipo = signal<number>(0);
  oPage = signal<IPage<ILiga> | null>(null);
  numPage = signal<number>(0);
  numRpp = signal<number>(5);
  message = signal<string | null>(null);
  totalRecords = computed(() => this.oPage()?.totalElements ?? 0);
  private messageTimeout: any = null;

  orderField = signal<string>('id');
  orderDirection = signal<'asc' | 'desc'>('asc');
  nombre = signal<string>('');

  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  private oLigaService = inject(LigaService);
  private route = inject(ActivatedRoute);
  private modalRef = inject(MODAL_REF, { optional: true });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id_equipo'] && this.id_equipo != null) {
      this.equipo.set(this.id_equipo);
      this.getPage();
    }
  }

  ngOnInit(): void {
    const msg = this.route.snapshot.queryParamMap.get('msg');
    if (msg) {
      this.showMessage(msg);
    }
    this.searchSubscription = this.searchSubject
      .pipe(debounceTime(debounceTimeSearch), distinctUntilChanged())
      .subscribe((searchTerm) => {
        this.nombre.set(searchTerm);
        this.numPage.set(0);
        this.getPage();
      });
    this.getPage();
  }

  private showMessage(msg: string, duration: number = 4000) {
    this.message.set(msg);
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }
    this.messageTimeout = setTimeout(() => {
      this.message.set(null);
      this.messageTimeout = null;
    }, duration);
  }

  getPage(): void {
    this.oLigaService
      .getPage(
        this.numPage(),
        this.numRpp(),
        this.orderField(),
        this.orderDirection(),
        this.nombre(),
        this.equipo(),
      )
      .subscribe({
        next: (data: IPage<ILiga>) => {
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

  onRppChange(n: number) {
    this.numRpp.set(n);
    this.numPage.set(0);
    this.getPage();
  }

  goToPage(numPage: number) {
    this.numPage.set(numPage);
    this.getPage();
  }

  onSearchNombre(value: string) {
    this.searchSubject.next(value);
  }

  onOrder(order: string) {
    if (this.orderField() === order) {
      this.orderDirection.set(this.orderDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.orderField.set(order);
      this.orderDirection.set('asc');
    }
    this.numPage.set(0);
    this.getPage();
  }

  isDialogMode(): boolean {
    return !!this.modalRef;
  }

  onSelect(liga: ILiga): void {
    this.modalRef?.close(liga);
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }
}
