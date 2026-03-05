import { Component, Inject, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginService } from '../../../service/login';
import { LoginType } from '../../../model/login';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { debug as ENV_DEBUG } from '../../../environment/environment';
import { SessionService } from '../../../service/session';
import { IToken } from '../../../model/token';

@Component({
  selector: 'app-login.component',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  standalone: true,
})
export class LoginComponent implements OnInit {
  // obtener si el modo debug esta activo de environment

  readonly debug = ENV_DEBUG; // accesible desde la plantilla
  private fb = inject(FormBuilder);
  private loginService = inject(LoginService);
  private router = inject(Router);

  loginForm!: FormGroup;
  error: string | null = null;
  submitting: boolean = false;

  @Inject(SessionService)
  private oSessionService = inject(SessionService);

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(255)]],
      password: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(1024)]],
    });
  }

  onSubmit(): void {
    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.submitting = true;

    this.loginService.sha256(this.loginForm.value.password).then((hash) => {
      this.debug && console.log('SHA256:', hash);
      const payload: Partial<LoginType> = {
        username: this.loginForm.value.username,
        password: hash,
      };

      this.loginService.create(payload).subscribe({
        next: (data: IToken) => {
          // aqui hay que guardarse el token
          this.oSessionService.setToken(data.token);
          this.submitting = true;
          this.debug && console.log('Login successful, token: ', data);
          this.router.navigate(['']);
        },
        error: (err: HttpErrorResponse) => {
          this.submitting = false;
          this.error = 'Error al login';
          this.debug && console.error(err);
        },
      });
    });
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  fillAdmin(): void {
    this.loginForm.setValue({
      username: 'admin',
      password: 'ausias',
    });
  }

  fillUser(): void {
    this.loginForm.setValue({
      username: 'user',
      password: 'ausias',
    });
  }

  fillAdminClub(): void {
    this.loginForm.setValue({
      username: 'adminclub',
      password: 'ausias',
    });
  }
}
