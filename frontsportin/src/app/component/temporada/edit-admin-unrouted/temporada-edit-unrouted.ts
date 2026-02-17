import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TemporadaService } from '../../../service/temporada';
import { ITemporada } from '../../../model/temporada';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IClub } from '../../../model/club';
import { MatDialog } from '@angular/material/dialog';
import { UsuarioPlistAdminUnrouted } from '../../usuario/plist-admin-unrouted/usuario-plist-admin-unrouted';
import { ClubPlistAdminUnrouted } from '../../club/plist-admin-unrouted/club-plist-admin-unrouted';
import { ClubService } from '../../../service/club';

@Component({
    selector: 'app-temporada-edit-unrouted',
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './temporada-edit-unrouted.html',
    styleUrl: './temporada-edit-unrouted.css',
})
export class TemporadaEditAdminRouted implements OnInit {
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private oTemporadaService = inject(TemporadaService);
    private oClubService = inject(ClubService);
    private snackBar = inject(MatSnackBar);
    private dialog = inject(MatDialog);

    temporadaForm!: FormGroup;
    temporadaId = signal<number | null>(null);
    loading = signal<boolean>(true);
    error = signal<string | null>(null);
    submitting = signal<boolean>(false);
    temporada = signal<ITemporada | null>(null);
    selectedClub = signal<IClub | null>(null);
    displayIdClub = signal<number | null>(null);

    ngOnInit(): void {
        this.initForm();
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.temporadaId.set(+id);
            this.getTemporada(+id);
        } else {
            this.error.set('ID de temporada no válido');
            this.loading.set(false);
        }
    }

    initForm(): void {
        this.temporadaForm = this.fb.group({
            descripcion: ['', [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(255)
            ]],
            id_club: [null, [
                Validators.required
            ]],
        });
    }

    getTemporada(id: number): void {
        this.oTemporadaService.get(id).subscribe({
            next: (data: ITemporada) => {
                this.temporada.set(data);
                this.syncClub(data.club.id);
                this.temporadaForm.patchValue({
                    descripcion: data.descripcion,
                    id_club: data.club.id,
                });
                this.loading.set(false);
            },
            error: (err: HttpErrorResponse) => {
                this.error.set('Error al cargar el registro');
                this.loading.set(false);
                console.error(err);
            },
        });
    }

    onSubmit(): void {
        if (!this.temporadaForm.valid || !this.temporadaId()) {
            this.temporadaForm.markAllAsTouched();
            return;
        }

        this.submitting.set(true);
        const payload = {
            id: this.temporadaId()!,
            descripcion: this.temporadaForm.value.descripcion,
            club: {
                id: Number(this.temporadaForm.value.id_club),
            },
        } as unknown as Partial<ITemporada> & { club?: Partial<IClub> };

        this.oTemporadaService.update(payload).subscribe({
            next: () => {
                this.submitting.set(false);
                // mark form as pristine so canDeactivate guard won't ask confirmation
                if (this.temporadaForm) {
                    this.temporadaForm.markAsPristine();
                }
                // inform the user
                this.snackBar.open('Se ha guardado correctamente', 'Cerrar', { duration: 3000 });
                this.router.navigate(['/temporada']);
            },
            error: (err: HttpErrorResponse) => {
                this.submitting.set(false);
                this.error.set('Error al guardar el registro');
                this.snackBar.open('Error al guardar el registro', 'Cerrar', { duration: 4000 });
                console.error(err);
            },
        });
    }

    private syncClub(idClub: number): void {
        this.oClubService.get(idClub).subscribe({
            next: (club: IClub) => {
                this.selectedClub.set(club);
            },
            error: (err: HttpErrorResponse) => {
                console.error('Error al sincronizar club:', err);
                this.snackBar.open('Error al cargar el club seleccionado', 'Cerrar', { duration: 3000 });
            },
        });
    }

    openClubFinderModal(): void {
        const dialogRef = this.dialog.open(ClubPlistAdminUnrouted, {
            height: '800px',
            width: '1100px',
            maxWidth: '95vw',
            panelClass: 'club-dialog',
            data: {
            title: 'Aquí elegir club',
            message: 'Plist finder para encontrar el club y asignarlo a la temporada',
            },
        });

        dialogRef.afterClosed().subscribe((club: IClub | null) => {
            if (club) {
            this.temporadaForm.patchValue({
                id_club: club.id,
            });
            // Sincronizar explícitamente después de seleccionar desde el modal
            this.syncClub(club.id);
            this.snackBar.open(`Club seleccionado: ${club.nombre}`, 'Cerrar', {
                duration: 3000,
            });
            }
        });
    }

    get descripcion() {
        return this.temporadaForm.get('descripcion');
    }

    get id_club() {
        return this.temporadaForm.get('id_club');
    }
}
