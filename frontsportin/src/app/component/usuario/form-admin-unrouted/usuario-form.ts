import { Component, OnInit, Input, Output, EventEmitter, inject, signal, computed, effect, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ClubService } from '../../../service/club';
import { TipousuarioService } from '../../../service/tipousuario';
import { RolusuarioService } from '../../../service/rolusuario';
import { IUsuario } from '../../../model/usuario';
import { IClub } from '../../../model/club';
import { ITipousuario } from '../../../model/tipousuario';
import { IRolusuario } from '../../../model/rolusuario';
import { ClubPlistAdminUnrouted } from '../../club/plist-admin-unrouted/club-plist-admin-unrouted';
import { TipoUsuarioPlistAdminUnrouted } from '../../tipousario/plist-admin-unrouted/tipousuario-plist';

@Component({
  selector: 'app-usuario-form-unrouted',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuario-form.html',
  styleUrls: ['./usuario-form.css']
})
export class UsuarioFormAdminUnrouted implements OnInit {
  @Input() usuario: IUsuario | null = null;
  @Input() mode: 'create' | 'edit' = 'create';
  @Output() formSubmit = new EventEmitter<IUsuario>();
  @Output() formCancel = new EventEmitter<void>();
  @ViewChild('rolusuarioFinderDialog') rolusuarioFinderDialog!: TemplateRef<any>;

  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private oClubService = inject(ClubService);
  private oTipousuarioService = inject(TipousuarioService);
  private oRolusuarioService = inject(RolusuarioService);
  private dialog = inject(MatDialog);

  usuarioForm!: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  submitting = signal(false);
  clubs = signal<IClub[]>([]);
  tipousuarios = signal<ITipousuario[]>([]);
  rolusuarios = signal<IRolusuario[]>([]);
  selectedClub = signal<IClub | null>(null);
  selectedTipousuario = signal<ITipousuario | null>(null);
  selectedRolusuario = signal<IRolusuario | null>(null);
  displayIdClub = signal<number | null>(null);
  displayIdTipousuario = signal<number | null>(null);
  displayIdRolusuario = signal<number | null>(null);
  rolusuarioFiltro = signal<string>('');
  rolusuariosFiltrados = computed(() => {
    const filtro = this.rolusuarioFiltro().trim().toLowerCase();
    if (!filtro) {
      return this.rolusuarios();
    }
    return this.rolusuarios().filter((rolusuario) =>
      rolusuario.descripcion.toLowerCase().includes(filtro) || String(rolusuario.id).includes(filtro)
    );
  });

  constructor() {
    effect(() => {
      const usuarioData = this.usuario;
      if (usuarioData && this.usuarioForm) {
        this.loadUsuarioData(usuarioData);
      }
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.cargarClubs();
    this.cargarTipousuarios();
    this.cargarRolusuarios();

    if (this.usuario) {
      this.loadUsuarioData(this.usuario);
    }
  }

  private initForm(): void {
    this.usuarioForm = this.fb.group({
      id: [{ value: 0, disabled: true }],
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
      apellido1: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
      apellido2: ['', [Validators.minLength(2), Validators.maxLength(255)]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      password: [
        { value: '', disabled: this.mode === 'edit' },
        [Validators.required, Validators.minLength(6), Validators.maxLength(255)]
      ],
      genero: [0, [Validators.required]],
      fechaAlta: [{ value: '', disabled: true }],
      id_club: [null, Validators.required],
      id_tipousuario: [null, Validators.required],
      id_rolusuario: [null, Validators.required]
    });

    this.usuarioForm.get('id_club')?.valueChanges.subscribe((id) => {
      if (id) {
        const idNumero = typeof id === 'string' ? parseInt(id, 10) : id;
        this.syncClub(idNumero);
      } else {
        this.selectedClub.set(null);
        this.displayIdClub.set(null);
      }
    });

    this.usuarioForm.get('id_tipousuario')?.valueChanges.subscribe((id) => {
      if (id) {
        const idNumero = typeof id === 'string' ? parseInt(id, 10) : id;
        this.syncTipousuario(idNumero);
      } else {
        this.selectedTipousuario.set(null);
        this.displayIdTipousuario.set(null);
      }
    });

    this.usuarioForm.get('id_rolusuario')?.valueChanges.subscribe((id) => {
      if (id) {
        const idNumero = typeof id === 'string' ? parseInt(id, 10) : id;
        this.syncRolusuario(idNumero);
      } else {
        this.selectedRolusuario.set(null);
        this.displayIdRolusuario.set(null);
      }
    });
  }

  private loadUsuarioData(usuario: IUsuario): void {
    const clubId = usuario.club?.id ?? null;
    const tipousuarioId = usuario.tipousuario?.id ?? null;
    const rolusuarioId = usuario.rolusuario?.id ?? null;

    this.usuarioForm.patchValue({
      id: usuario.id ?? 0,
      nombre: usuario.nombre ?? '',
      apellido1: usuario.apellido1 ?? '',
      apellido2: usuario.apellido2 ?? '',
      username: usuario.username ?? '',
      password: usuario.password ?? '',
      genero: usuario.genero ?? 0,
      fechaAlta: usuario.fechaAlta ?? '',
      id_club: clubId,
      id_tipousuario: tipousuarioId,
      id_rolusuario: rolusuarioId
    });

    if (clubId) {
      this.syncClub(clubId);
    }
    if (tipousuarioId) {
      this.syncTipousuario(tipousuarioId);
    }
    if (rolusuarioId) {
      this.syncRolusuario(rolusuarioId);
    }
  }

  private cargarClubs(): void {
    this.oClubService.getPage(0, 1000, 'nombre', 'asc').subscribe({
      next: (page) => {
        this.clubs.set(page.content);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al cargar clubs', err);
        this.snackBar.open('Error al cargar los clubs', 'Cerrar', { duration: 4000 });
      }
    });
  }

  private cargarTipousuarios(): void {
    this.oTipousuarioService.getAll().subscribe({
      next: (tipousuarios) => {
        this.tipousuarios.set(tipousuarios);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al cargar tipos de usuario', err);
        this.snackBar.open('Error al cargar los tipos de usuario', 'Cerrar', { duration: 4000 });
      }
    });
  }

  private cargarRolusuarios(): void {
    this.oRolusuarioService.getPage(0, 100).subscribe({
      next: (page) => {
        this.rolusuarios.set(page.content);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al cargar roles de usuario', err);
        this.snackBar.open('Error al cargar los roles de usuario', 'Cerrar', { duration: 4000 });
      }
    });
  }

  get nombre() {
    return this.usuarioForm.get('nombre');
  }

  get apellido1() {
    return this.usuarioForm.get('apellido1');
  }

  get apellido2() {
    return this.usuarioForm.get('apellido2');
  }

  get username() {
    return this.usuarioForm.get('username');
  }

  get password() {
    return this.usuarioForm.get('password');
  }

  get genero() {
    return this.usuarioForm.get('genero');
  }

  get fechaAlta() {
    return this.usuarioForm.get('fechaAlta');
  }

  get id_club() {
    return this.usuarioForm.get('id_club');
  }

  get id_tipousuario() {
    return this.usuarioForm.get('id_tipousuario');
  }

  get id_rolusuario() {
    return this.usuarioForm.get('id_rolusuario');
  }

  private syncClub(idClub: number): void {
    this.displayIdClub.set(idClub);
    const selected = this.clubs().find((club) => club.id === idClub) || null;
    this.selectedClub.set(selected);
  }

  private syncTipousuario(idTipousuario: number): void {
    this.displayIdTipousuario.set(idTipousuario);
    const selected = this.tipousuarios().find((tipousuario) => tipousuario.id === idTipousuario) || null;
    this.selectedTipousuario.set(selected);
  }

  private syncRolusuario(idRolusuario: number): void {
    this.displayIdRolusuario.set(idRolusuario);
    const selected = this.rolusuarios().find((rolusuario) => rolusuario.id === idRolusuario) || null;
    this.selectedRolusuario.set(selected);
  }

  openClubFinderModal(): void {
    const dialogRef = this.dialog.open(ClubPlistAdminUnrouted, {
      height: '800px',
      width: '1300px',
      maxWidth: '95vw',
      panelClass: 'club-dialog',
      data: {
        title: 'Aquí elegir club',
        message: 'Plist finder para encontrar el club y asignarlo al usuario',
      },
    });

    dialogRef.afterClosed().subscribe((club: IClub | null) => {
      if (club) {
        this.usuarioForm.patchValue({ id_club: club.id });
        this.syncClub(club.id);
        this.snackBar.open(`Club seleccionado: ${club.nombre}`, 'Cerrar', { duration: 3000 });
      }
    });
  }

  openTipousuarioFinderModal(): void {
    const dialogRef = this.dialog.open(TipoUsuarioPlistAdminUnrouted, {
      height: '800px',
      width: '1100px',
      maxWidth: '95vw',
      panelClass: 'tipousuario-dialog',
      data: {
        title: 'Aquí elegir tipo de usuario',
        message: 'Plist finder para encontrar el tipo de usuario y asignarlo al usuario',
      },
    });

    dialogRef.afterClosed().subscribe((tipousuario: ITipousuario | null) => {
      if (tipousuario) {
        this.usuarioForm.patchValue({ id_tipousuario: tipousuario.id });
        this.syncTipousuario(tipousuario.id);
        this.snackBar.open(`Tipo de usuario seleccionado: ${tipousuario.descripcion}`, 'Cerrar', {
          duration: 3000,
        });
      }
    });
  }

  openRolusuarioFinderModal(): void {
    this.rolusuarioFiltro.set('');

    const dialogRef = this.dialog.open(this.rolusuarioFinderDialog, {
      height: '800px',
      width: '1000px',
      maxWidth: '95vw',
      panelClass: 'rolusuario-dialog',
    });

    dialogRef.afterClosed().subscribe((rolusuario: IRolusuario | null) => {
      if (rolusuario) {
        this.usuarioForm.patchValue({ id_rolusuario: rolusuario.id });
        this.syncRolusuario(rolusuario.id);
        this.snackBar.open(`Rol de usuario seleccionado: ${rolusuario.descripcion}`, 'Cerrar', {
          duration: 3000,
        });
      }
    });
  }

  onRolusuarioFilterChange(value: string): void {
    this.rolusuarioFiltro.set(value);
  }

  selectRolusuarioFromDialog(rolusuario: IRolusuario, dialogRef: any): void {
    dialogRef.close(rolusuario);
  }

  onSubmit(): void {
    if (!this.usuarioForm.valid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    const payload: any = {
      id: this.usuarioForm.get('id')?.value || 0,
      nombre: this.usuarioForm.value.nombre,
      apellido1: this.usuarioForm.value.apellido1,
      apellido2: this.usuarioForm.value.apellido2,
      username: this.usuarioForm.value.username,
      password: this.usuarioForm.value.password || this.usuario?.password,
      genero: this.usuarioForm.value.genero,
      fechaAlta: this.usuario?.fechaAlta,
      club: {
        id: this.usuarioForm.value.id_club
      },
      tipousuario: {
        id: this.usuarioForm.value.id_tipousuario
      },
      rolusuario: {
        id: this.usuarioForm.value.id_rolusuario
      }
    };

    this.formSubmit.emit(payload);
  }
}
