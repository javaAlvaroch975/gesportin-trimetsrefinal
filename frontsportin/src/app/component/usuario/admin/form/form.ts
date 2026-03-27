import { Component, OnInit, Input, Output, EventEmitter, inject, signal, effect } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { UsuarioService } from '../../../../service/usuarioService';
import { ClubService } from '../../../../service/club';
import { TipousuarioService } from '../../../../service/tipousuario';
import { RolusuarioService } from '../../../../service/rolusuario';
import { IUsuario } from '../../../../model/usuario';
import { IClub } from '../../../../model/club';
import { ITipousuario } from '../../../../model/tipousuario';
import { IRolusuario } from '../../../../model/rolusuario';
import { SessionService } from '../../../../service/session';

@Component({
  selector: 'app-usuario-admin-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form.html',
  styleUrl: './form.css',
})
export class UsuarioAdminForm implements OnInit {
  @Input() usuario: IUsuario | null = null;
  @Input() isEditMode: boolean = false;
  @Output() formSuccess = new EventEmitter<void>();
  @Output() formCancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private oUsuarioService = inject(UsuarioService);
  private oClubService = inject(ClubService);
  private oTipousuarioService = inject(TipousuarioService);
  private oRolusuarioService = inject(RolusuarioService);
  private dialog = inject(MatDialog);
  private sessionService = inject(SessionService);

  usuarioForm!: FormGroup;
  error = signal<string | null>(null);
  submitting = signal(false);
  clubs = signal<IClub[]>([]);
  tipousuarios = signal<ITipousuario[]>([]);
  rolusuarios = signal<IRolusuario[]>([]);

  constructor() {
    effect(() => {
      const u = this.usuario;
      if (u && this.usuarioForm) {
        this.loadUsuarioData(u);
      }
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.loadClubs();
    this.loadTipousuarios();
    this.loadRolusuarios();

    if (this.usuario) {
      this.loadUsuarioData(this.usuario);
    }
  }

  private initForm(): void {
    this.usuarioForm = this.fb.group({
      id: [{ value: 0, disabled: true }],
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      apellido1: ['', [Validators.maxLength(100)]],
      apellido2: ['', [Validators.maxLength(100)]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      id_tipousuario: [null, Validators.required],
      id_rolusuario: [null, Validators.required],
      id_club: [null, Validators.required],
    });

    // On edit mode, password is optional
    if (this.isEditMode) {
      this.usuarioForm.patchValue({ password: { value: '', disabled: true } });
      this.usuarioForm.get('password')?.clearValidators();
      this.usuarioForm.get('password')?.updateValueAndValidity();
    }
  }

  private loadUsuarioData(usuario: IUsuario): void {
    this.usuarioForm.patchValue({
      id: usuario.id,
      nombre: usuario.nombre,
      apellido1: usuario.apellido1,
      apellido2: usuario.apellido2,
      username: usuario.username,
      id_tipousuario: usuario.tipousuario?.id,
      id_rolusuario: usuario.rolusuario?.id,
      id_club: usuario.club?.id,
    });
  }

  private loadClubs(): void {
    this.oClubService.getPage(0, 1000, 'nombre', 'asc').subscribe({
      next: (page) => {
        this.clubs.set(page.content);
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
        this.snackBar.open('Error cargando clubs', 'Cerrar', { duration: 3000 });
      },
    });
  }

  private loadTipousuarios(): void {
    this.oTipousuarioService.getAll().subscribe({
      next: (data) => {
        this.tipousuarios.set(data);
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
        this.snackBar.open('Error cargando tipos de usuario', 'Cerrar', { duration: 3000 });
      },
    });
  }

  private loadRolusuarios(): void {
    this.oRolusuarioService.getPage(0, 1000, 'id', 'asc').subscribe({
      next: (page) => {
        this.rolusuarios.set(page.content);
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
        this.snackBar.open('Error cargando roles de usuario', 'Cerrar', { duration: 3000 });
      },
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

  get id_tipousuario() {
    return this.usuarioForm.get('id_tipousuario');
  }

  get id_rolusuario() {
    return this.usuarioForm.get('id_rolusuario');
  }

  get id_club() {
    return this.usuarioForm.get('id_club');
  }

  onSubmit(): void {
    if (this.usuarioForm.invalid) {
      this.snackBar.open('Por favor, complete todos los campos correctamente', 'Cerrar', { duration: 4000 });
      return;
    }

    this.submitting.set(true);

    const usuarioData: any = {
      nombre: this.usuarioForm.value.nombre,
      apellido1: this.usuarioForm.value.apellido1,
      apellido2: this.usuarioForm.value.apellido2,
      username: this.usuarioForm.value.username,
      tipousuario: { id: Number(this.usuarioForm.value.id_tipousuario) },
      rolusuario: { id: Number(this.usuarioForm.value.id_rolusuario) },
      club: { id: Number(this.usuarioForm.value.id_club) },
    };

    if (!this.isEditMode) {
      usuarioData.password = this.usuarioForm.value.password;
    }

    if (this.isEditMode && this.usuario?.id) {
      usuarioData.id = this.usuario.id;
      this.oUsuarioService.update(usuarioData).subscribe({
        next: () => {
          this.snackBar.open('Usuario actualizado exitosamente', 'Cerrar', { duration: 4000 });
          this.submitting.set(false);
          this.formSuccess.emit();
        },
        error: (err: HttpErrorResponse) => {
          this.error.set('Error actualizando el usuario');
          this.snackBar.open('Error actualizando el usuario', 'Cerrar', { duration: 4000 });
          console.error(err);
          this.submitting.set(false);
        },
      });
    } else {
      this.oUsuarioService.create(usuarioData).subscribe({
        next: () => {
          this.snackBar.open('Usuario creado exitosamente', 'Cerrar', { duration: 4000 });
          this.submitting.set(false);
          this.formSuccess.emit();
        },
        error: (err: HttpErrorResponse) => {
          this.error.set('Error creando el usuario');
          this.snackBar.open('Error creando el usuario', 'Cerrar', { duration: 4000 });
          console.error(err);
          this.submitting.set(false);
        },
      });
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }
}
