# Referencia de frontend — frontsportin

Guía exhaustiva para agentes de IA que desarrollen nuevas funcionalidades o modifiquen el proyecto frontend de gesportin. Leer **completamente** antes de generar o editar cualquier fichero TypeScript, HTML o CSS.

---

## 1. Stack y configuración

| Elemento | Valor |
|---|---|
| Framework | Angular **20** (`@angular/core ^20.3.0`) |
| Lenguaje | TypeScript 5.9 |
| UI | Angular Material 20 + Bootstrap 5.3 + Bootstrap Icons 1.13 |
| Estilos globales | `src/styles.css` + tema Material en `src/custom-theme.scss` |
| Gestión de cambios | **Zoneless** (`provideZonelessChangeDetection()`) — no se usa Zone.js |
| HTTP | `HttpClient` + interceptor JWT inyectado vía `withInterceptorsFromDi()` |
| Formularios | Reactivos (`ReactiveFormsModule`, `FormBuilder`) |
| Formateo de código | Prettier (singleQuote, printWidth 100) |
| Puerto de desarrollo | 4200 (Angular CLI) |
| URL del backend | `http://localhost:8089` (en `environment.ts`) |

El proyecto **no usa** módulos NgModule de feature; todos los componentes son **standalone**.

---

## 2. Estructura de directorios

```
src/app/
├── app.config.ts          # Configuración principal: providers, interceptores, router
├── app.routes.ts          # Definición completa de rutas
├── app.ts                 # Componente raíz
├── component/             # Componentes reutilizables (lógica + vista)
│   ├── <entidad>/         # Carpeta por entidad
│   │   ├── admin/         # Componentes para rol administrador
│   │   │   ├── plist/     # Listado paginado
│   │   │   ├── form/      # Formulario de creación/edición
│   │   │   └── detail/    # Detalle de un registro
│   │   └── teamadmin/     # Componentes para rol administrador de equipo
│   │       └── plist/
│   └── shared/            # Componentes compartidos entre entidades
│       ├── botonera-actions-plist/
│       ├── botonera-rpp/
│       ├── confirm-dialog/
│       ├── dashboard/
│       ├── home/
│       ├── login/
│       ├── logout/
│       ├── menu/
│       ├── paginacion/
│       ├── sidebar/
│       └── user-dashboard/
├── environment/
│   └── environment.ts     # serverURL, rpp, debounceTimeSearch, neighborhood, debug
├── guards/                # Route guards
│   ├── admin.guard.ts
│   ├── club-admin.guard.ts
│   ├── pending-changes.guard.ts
│   └── usuario.guard.ts
├── interceptor/
│   └── jwt.interceptor.ts # Adjunta el token JWT a todas las peticiones HTTP
├── model/                 # Interfaces TypeScript de las entidades
├── page/                  # Páginas (wrappers de ruta, montan componentes)
│   └── <entidad>/
│       ├── admin/
│       │   ├── plist/     # Página de listado
│       │   ├── view/      # Página de detalle/solo lectura
│       │   ├── new/       # Página de creación
│       │   ├── edit/      # Página de edición
│       │   └── delete/    # Página de confirmación de borrado
│       ├── teamadmin/
│       │   └── plist/
│       └── usuario/       # Solo para entidades visibles por el perfil usuario
│           └── ...
├── pipe/                  # Pipes reutilizables
│   ├── datetime-pipe.ts
│   └── trim-pipe.ts
├── service/               # Servicios HTTP y de negocio
└── utils/
    └── date-utils.ts      # Función toIsoDateTime()
```

---

## 3. Modelos (`model/`)

### 3.1 Convenciones de nomenclatura

- Fichero: `<nombre_entidad>.ts` en minúsculas (sin sufijos).  
  Ejemplos: `usuario.ts`, `club.ts`, `jugador.ts`.
- Interfaz: **`I<NombreEntidad>`** (prefijo `I`, PascalCase).  
  Ejemplos: `IUsuario`, `IClub`, `IJugador`.

### 3.2 Estructura de una interfaz de entidad

```typescript
import { IClub } from "./club"
import { ITipousuario } from "./tipousuario"

export interface IEntidad {
  id: number
  campo1: string
  campo2: number
  fechaAlta: string          // Las fechas llegan del backend como string ISO
  relacionManyToOne: IRelacion  // Objetos anidados completos (NO solo su id)
  coleccion: number          // Las colecciones OneToMany se serializan como COUNT (int)
}
```

**Reglas clave:**
- Las relaciones ManyToOne se modelan como el objeto completo (`IClub`, no `number`).
- Las colecciones OneToMany (listas) se modelan como `number` (el backend devuelve el count).
- Las fechas son `string` (formato `yyyy-MM-dd'T'HH:mm:ss`).
- No usar `?` (opcional) en campos que siempre presente el backend; sí usarlo en campos nullable.

### 3.3 Interfaz de paginación (`model/plist.ts`)

```typescript
export interface IPage<T> {
  content: T[]
  pageable: IPageable
  totalPages: number
  totalElements: number
  last: boolean
  size: number
  number: number        // página actual (0-based)
  sort: ISort
  first: boolean
  numberOfElements: number
  empty: boolean
}
```

Siempre usar `IPage<IEntidad>` para respuestas paginadas del backend.

---

## 4. Servicios (`service/`)

### 4.1 Convenciones de nomenclatura

- Fichero: `<nombre_entidad>.ts` o `<nombre_entidad>-service.ts` (algunos difieren por histórico).  
  Nuevos servicios: usar el patrón `<nombre_entidad>.ts`.
- Clase: **`<NombreEntidad>Service`** (PascalCase).  
  Ejemplos: `ClubService`, `UsuarioService`, `JugadorService`.

### 4.2 Estructura base de un servicio de entidad

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { serverURL } from '../environment/environment';
import { IPage } from '../model/plist';
import { IEntidad } from '../model/entidad';
import { PayloadSanitizerService } from './payload-sanitizer';

@Injectable({
  providedIn: 'root'
})
export class EntidadService {
  private http = inject(HttpClient);
  private sanitizer = inject(PayloadSanitizerService);
  private url = `${serverURL}/entidad`;

  get(id: number): Observable<IEntidad> {
    return this.http.get<IEntidad>(`${this.url}/${id}`);
  }

  getPage(page: number, rpp: number, order = 'id', direction = 'asc', filtro = ''): Observable<IPage<IEntidad>> {
    let strUrl = `${this.url}?page=${page}&size=${rpp}&sort=${order},${direction}`;
    if (filtro) strUrl += `&filtro=${encodeURIComponent(filtro)}`;
    return this.http.get<IPage<IEntidad>>(strUrl);
  }

  create(entidad: Partial<IEntidad>): Observable<number> {
    const body = this.sanitizer.sanitize(entidad, {
      nestedIdFields: ['relacion1', 'relacion2'],
      removeFields: ['coleccion1', 'coleccion2'],
    });
    return this.http.post<number>(this.url, body);
  }

  update(entidad: Partial<IEntidad>): Observable<IEntidad> {
    const body = this.sanitizer.sanitize(entidad, {
      nestedIdFields: ['relacion1', 'relacion2'],
      removeFields: ['coleccion1', 'coleccion2'],
    });
    return this.http.put<IEntidad>(this.url, body);
  }

  delete(id: number): Observable<number> {
    return this.http.delete<number>(`${this.url}/${id}`);
  }

  count(): Observable<number> {
    return this.http.get<number>(`${this.url}/count`);
  }
}
```

### 4.3 `PayloadSanitizerService` — uso obligatorio en create/update

Antes de enviar al backend, **siempre** sanitizar el payload con `PayloadSanitizerService.sanitize()`:

```typescript
const body = this.sanitizer.sanitize(entidad, {
  nestedIdFields: ['club', 'tipousuario', 'rolusuario'],  // convierte objetos a {id: N}
  removeFields: ['comentarios', 'puntuaciones'],           // elimina campos derivados (counts)
  booleanFields: ['capitan'],                              // convierte 0/1 a boolean
});
```

- `nestedIdFields`: lista de campos relacionales que el backend espera como `{ id: N }`.
- `removeFields`: lista de campos que NO se deben enviar al backend (colecciones, counts).
- `booleanFields`: campos que deben convertirse a `boolean` real.

### 4.4 Filtro de seguridad por club en servicios

Cuando el servicio soporta filtrado por club, usar `SecurityService.clubFilter()` para forzar el club propio en admins de equipo:

```typescript
import { SecurityService } from './security.service';

// En el constructor o mediante inject()
private security = inject(SecurityService);

getPage(page: number, rpp: number, id_club: number = 0): Observable<IPage<IEntidad>> {
  const clubId = this.security.clubFilter(id_club);  // ← fuerza el club si es admin de equipo
  let url = `...`;
  if (clubId > 0) url += `&id_club=${clubId}`;
  return this.http.get<IPage<IEntidad>>(url);
}
```

### 4.5 Construcción de URLs de paginación

Patrón estándar para construir la URL de `getPage`:

```typescript
let strUrl = `${serverURL}/entidad?page=${page}&size=${rpp}&sort=${order},${direction}`;
if (filtroTexto && filtroTexto.length > 0) strUrl += `&campo=${encodeURIComponent(filtroTexto)}`;
if (id_relacion > 0) strUrl += `&id_relacion=${id_relacion}`;
```

**Siempre** usar `encodeURIComponent` para valores de texto libre.  
Los filtros por FK siguen el patrón `id_<nombre_entidad>` (igual que el backend).

---

## 5. Servicios especiales

### 5.1 `SessionService` (`service/session.ts`)

Gestiona el token JWT en `localStorage` bajo la clave `persutiltoken`.

| Método | Descripción |
|---|---|
| `setToken(token)` | Guarda el token y emite `subjectLogin` |
| `getToken()` | Lee el token de memoria o localStorage |
| `clearToken()` | Elimina el token y emite `subjectLogout` |
| `isSessionActive()` | Verifica token activo y no expirado (comprueba `iss` y `exp`) |
| `isAdmin()` | `usertype === 1` |
| `isClubAdmin()` | `usertype === 2` (también llamado "equipo admin") |
| `isTeamAdmin()` | Alias de `isClubAdmin()` |
| `isUser()` | `usertype === 3` |
| `getClubId()` | `number \| null` — id de club del JWT |
| `getUserId()` | `number \| null` — id de usuario del JWT |
| `parseJWT(token)` | Decodifica el JWT y devuelve `IJWT` |
| `subjectLogin` | `Subject<void>` — emite al hacer login |
| `subjectLogout` | `Subject<void>` — emite al hacer logout |

### 5.2 `SecurityService` (`service/security.service.ts`)

Capa de seguridad de negocio sobre `SessionService`.

| Método | Descripción |
|---|---|
| `clubFilter(id_club)` | Si es club admin, devuelve su club; si no, devuelve el parámetro |
| `isClubAdmin()` | Delegado a `SessionService` |
| `getClubId()` | Delegado a `SessionService` |
| `forbidClubAdminActions()` | Lanza `Error` si el usuario es club admin |
| `ensureClubOwnership(entityClubId)` | Lanza `Error` si el club de la entidad no es el del usuario |

### 5.3 `IJWT` — estructura del token decodificado

```typescript
interface IJWT {
  iss: string       // "ausiasmarch.net"
  sub: string
  userid: number    // id del usuario
  username: string
  usertype: number  // 1=admin, 2=equipoAdmin, 3=usuario
  club: number      // id del club del usuario
  iat: number
  exp: number
}
```

---

## 6. Componentes (`component/`)

### 6.1 Arquitectura: componente vs página

El proyecto separa **componente** (lógica + plantilla reutilizable) de **página** (wrapper de ruta):

- **Componente** (`component/<entidad>/<rol>/<tipo>/`): contiene todos los `signal`, la lógica de paginación/filtrado/formulario, y comunica hacia fuera con `@Output`. Puede usarse como diálogo (`MatDialog`) o incrustado en una página.
- **Página** (`page/<entidad>/<rol>/<tipo>/`): componente mínimo que solo monta el componente correspondiente. No tiene lógica propia salvo leer parámetros de ruta y comunicar `@Output` con `Router`/`MatSnackBar`.

### 6.2 Todos los componentes son standalone

```typescript
@Component({
  standalone: true,
  selector: 'app-<entidad>-<rol>-<tipo>',
  imports: [/* dependencias */],
  templateUrl: './<tipo>.html',
  styleUrl: './<tipo>.css',
})
export class <NombreEntidad><Rol><Tipo> { … }
```

**Nunca** declarar componentes en un `NgModule`.

### 6.3 Nomenclatura de componentes

| Tipo | Selector | Clase | Fichero |
|---|---|---|---|
| Listado de admin | `app-<entidad>-admin-plist` | `<Entidad>AdminPlist` | `component/<entidad>/admin/plist/plist.ts` |
| Formulario de admin | `app-<entidad>-admin-form` | `<Entidad>AdminForm` | `component/<entidad>/admin/form/form.ts` |
| Detalle de admin | `app-<entidad>-admin-detail` | `<Entidad>AdminDetail` | `component/<entidad>/admin/detail/detail.ts` |
| Listado de teamadmin | `app-<entidad>-teamadmin-plist` | `<Entidad>TeamadminPlist` | `component/<entidad>/teamadmin/plist/plist.ts` |

### 6.4 Inyección de dependencias

Usar siempre `inject()` (no inyección en constructor) para los servicios:

```typescript
private entidadService = inject(EntidadService);
private session = inject(SessionService);
private route = inject(ActivatedRoute);
private router = inject(Router);
private snackBar = inject(MatSnackBar);
private dialog = inject(MatDialog);
```

Para inyección opcional (p.ej. `MatDialogRef`):
```typescript
private dialogRef = inject(MatDialogRef<ComponentClass>, { optional: true });
```

### 6.5 Estado con Signals (Angular Signals API)

El proyecto usa **exclusivamente Signals** para el estado del componente. No usar `BehaviorSubject` ni propiedades mutables directas:

```typescript
oPage = signal<IPage<IEntidad> | null>(null);
numPage = signal<number>(0);
numRpp = signal<number>(10);
searchTerm = signal<string>('');
loading = signal(false);
error = signal<string | null>(null);
submitting = signal(false);

// Signals computadas (derivadas):
totalRecords = computed(() => this.oPage()?.totalElements ?? 0);
```

Para leer un signal en la plantilla: `{{ oPage()?.totalElements }}`.  
Para leer un signal en código TypeScript: `this.oPage()`.  
Para escribir: `this.oPage.set(data)` o `this.numPage.update(n => n + 1)`.

### 6.6 Patrón de componente plist (listado paginado)

```typescript
export class EntidadAdminPlist {
  oPage = signal<IPage<IEntidad> | null>(null);
  numPage = signal<number>(0);
  numRpp = signal<number>(10);
  searchTerm = signal<string>('');
  orderField = signal<string>('id');
  orderDirection = signal<'asc' | 'desc'>('asc');
  totalRecords = computed(() => this.oPage()?.totalElements ?? 0);

  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  private entidadService = inject(EntidadService);
  private dialogRef = inject(MatDialogRef<EntidadAdminPlist>, { optional: true });
  session = inject(SessionService);

  ngOnInit() {
    this.searchSubscription = this.searchSubject
      .pipe(debounceTime(debounceTimeSearch), distinctUntilChanged())
      .subscribe((term) => {
        this.searchTerm.set(term);
        this.numPage.set(0);
        this.getPage();
      });
    this.getPage();
  }

  ngOnDestroy() {
    this.searchSubscription?.unsubscribe();
  }

  getPage() {
    this.entidadService
      .getPage(this.numPage(), this.numRpp(), this.orderField(), this.orderDirection(), this.searchTerm())
      .subscribe({
        next: (data) => {
          this.oPage.set(data);
          if (this.numPage() > 0 && this.numPage() >= data.totalPages) {
            this.numPage.set(data.totalPages - 1);
            this.getPage();
          }
        },
        error: (err: HttpErrorResponse) => console.error(err),
      });
  }

  onRppChange(n: number) { this.numRpp.set(n); this.numPage.set(0); this.getPage(); }
  goToPage(n: number)    { this.numPage.set(n); this.getPage(); }
  onSearch(value: string) { this.searchSubject.next(value); }

  onOrder(field: string) {
    if (this.orderField() === field) {
      this.orderDirection.set(this.orderDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.orderField.set(field);
      this.orderDirection.set('asc');
    }
    this.numPage.set(0);
    this.getPage();
  }

  // Soporte modo diálogo (selector de entidad)
  isDialogMode(): boolean { return !!this.dialogRef; }
  onSelect(entidad: IEntidad): void { this.dialogRef?.close(entidad); }
}
```

### 6.7 Patrón de componente form (formulario)

```typescript
@Component({ … })
export class EntidadAdminForm implements OnInit {
  @Input() entidad: IEntidad | null = null;
  @Input() isEditMode: boolean = false;
  @Output() formSuccess = new EventEmitter<void>();
  @Output() formCancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private oEntidadService = inject(EntidadService);
  private oRelacionService = inject(RelacionService);

  entidadForm!: FormGroup;
  error = signal<string | null>(null);
  submitting = signal(false);
  relaciones = signal<IRelacion[]>([]);

  constructor() {
    effect(() => {
      const e = this.entidad;
      if (e && this.entidadForm) this.loadData(e);
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.loadRelaciones();
    if (this.entidad) this.loadData(this.entidad);
  }

  private initForm(): void {
    this.entidadForm = this.fb.group({
      id: [{ value: 0, disabled: true }],
      campo1: ['', [Validators.required, Validators.minLength(3)]],
      id_relacion: [null, Validators.required],
    });
  }

  private loadData(e: IEntidad): void {
    this.entidadForm.patchValue({
      id: e.id,
      campo1: e.campo1,
      id_relacion: e.relacion?.id,
    });
  }

  onSubmit(): void {
    if (this.entidadForm.invalid) return;
    this.submitting.set(true);
    const raw = this.entidadForm.getRawValue();
    const payload: Partial<IEntidad> = { /* mapear raw a IEntidad */ };
    const op$ = this.isEditMode
      ? this.oEntidadService.update(payload)
      : this.oEntidadService.create(payload);
    op$.subscribe({
      next: () => { this.submitting.set(false); this.formSuccess.emit(); },
      error: (err) => { this.submitting.set(false); this.error.set(err.message); },
    });
  }
}
```

**Convención de campos FK en formulario:** el campo del `FormGroup` usa el prefijo `id_`:  
`id_club`, `id_tipousuario`, `id_rolusuario`, `id_equipo`, etc.

### 6.8 Patrón de componente detail (solo lectura)

```typescript
export class EntidadAdminDetail implements OnInit {
  @Input() id: Signal<number> = signal(0);

  private entidadService = inject(EntidadService);
  oEntidad = signal<IEntidad | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const idVal = this.id();
    if (!idVal || isNaN(idVal)) { this.error.set('ID no válido'); this.loading.set(false); return; }
    this.entidadService.get(idVal).subscribe({
      next: (data) => { this.oEntidad.set(data); this.loading.set(false); },
      error: () => { this.error.set('Error cargando'); this.loading.set(false); },
    });
  }
}
```

### 6.9 Componentes shared — cuándo y cómo usarlos

| Componente | Selector | `@Input` | `@Output` | Cuándo usarlo |
|---|---|---|---|---|
| `BotoneraRpp` | `app-botonera-rpp` | `numRpp`, `options` | `rppChange` | En todo listado paginado para seleccionar registros por página |
| `Paginacion` | `app-paginacion` | `numPage`, `numPages` | `pageChange` | En todo listado paginado para navegar entre páginas |
| `BotoneraActionsPlist` | `app-botonera-actions-plist` | `id`, `strEntity` | — | En cada fila de un listado para los botones ver/editar/borrar |

`BotoneraActionsPlist` gestiona automáticamente la visibilidad de editar/borrar según el rol. Pasar el nombre de la entidad en minúsculas: `strEntity="usuario"`, `strEntity="club"`, etc.

---

## 7. Páginas (`page/`)

### 7.1 Tipos de páginas por entidad

| Carpeta | Clase | Responsabilidad |
|---|---|---|
| `plist/` | `<Entidad><Rol>PlistPage` | Monta `<Entidad><Rol>Plist` y lleva los parámetros de ruta al componente |
| `view/` | `<Entidad><Rol>ViewPage` | Lee el `id` de la ruta, carga la entidad, monta `<Entidad><Rol>Detail` |
| `new/` | `<Entidad><Rol>NewPage` | Monta `<Entidad><Rol>Form` con `isEditMode=false`; en `formSuccess` navega de vuelta |
| `edit/` | `<Entidad><Rol>EditPage` | Carga la entidad por `id`, monta `<Entidad><Rol>Form` con `isEditMode=true` |
| `delete/` | `<Entidad><Rol>DeletePage` | Carga la entidad por `id`, muestra confirmación y ejecuta `delete()` |

### 7.2 Patrón de página `edit`

```typescript
@Component({
  selector: 'app-entidad-admin-edit-page',
  imports: [CommonModule, EntidadAdminForm],
  templateUrl: './edit.html',
  styleUrl: './edit.css',
})
export class EntidadAdminEditPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private entidadService = inject(EntidadService);

  entidad = signal<IEntidad | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.load(Number(id));
    else { this.error.set('ID no válido'); this.loading.set(false); }
  }

  private load(id: number): void {
    this.entidadService.get(id).subscribe({
      next: (data) => { this.entidad.set(data); this.loading.set(false); },
      error: () => { this.error.set('Error cargando'); this.loading.set(false); },
    });
  }

  onFormSuccess(): void {
    this.snackBar.open('Actualizado correctamente', 'Cerrar', { duration: 2000 });
    this.router.navigate(['/entidad']);
  }

  onFormCancel(): void { this.router.navigate(['/entidad']); }
}
```

### 7.3 Patrón de página `plist` (mínimo)

```typescript
@Component({
  selector: 'app-entidad-admin-plist-page',
  imports: [EntidadAdminPlist],
  templateUrl: './plist.html',
  styleUrl: './plist.css',
})
export class EntidadAdminPlistPage {
  constructor(private route: ActivatedRoute) {}
}
```

La plantilla HTML de la página simplemente monta el componente: `<app-entidad-admin-plist />`.

---

## 8. Rutas (`app.routes.ts`)

### 8.1 Estructura del fichero de rutas

Las rutas se dividen en tres bloques:

1. **`publicRoutes`**: rutas sin autenticación (`/login`, `/logout`).
2. **`protectedRoutes`**: rutas que AdminGuard protege (con opción `allowClubAdmin: true` para algunas).
3. **`routes`** (exportado): combinación de todas, incluyendo rutas exclusivas de `ClubAdminGuard` (`/teamadmin`) y rutas de perfil `usuario` con `UsuarioGuard`.

### 8.2 Patrón de rutas por entidad

```typescript
// Listado principal
{ path: 'entidad', component: EntidadAdminPlistPage },

// Filtros por FK
{ path: 'entidad/relacion/:id_relacion', component: EntidadAdminPlistPage, data: { allowClubAdmin: true } },

// CRUD
{ path: 'entidad/view/:id',   component: EntidadAdminViewPage,   data: { allowClubAdmin: true } },
{ path: 'entidad/new',        component: EntidadAdminNewPage,    data: { allowClubAdmin: true } },
{ path: 'entidad/edit/:id',   component: EntidadAdminEditPage,   data: { allowClubAdmin: true } },
{ path: 'entidad/delete/:id', component: EntidadAdminDeletePage, data: { allowClubAdmin: true } },

// Ruta exclusiva para admins de equipo (usa ClubAdminGuard)
{ path: 'entidad/teamadmin', component: EntidadTeamadminPlistPage, canActivate: [ClubAdminGuard] },
```

### 8.3 Rutas de usuario (perfil 3)

Las rutas que pertenecen al perfil usuario van con prefijo `/mi/` y usan `UsuarioGuard`:

```typescript
{ path: 'mi/entidades', component: EntidadUsuarioPlistPage, canActivate: [UsuarioGuard] },
{ path: 'mi/entidades/:id', component: EntidadUsuarioViewPage, canActivate: [UsuarioGuard] },
```

### 8.4 Guards disponibles

| Guard | Clase | Cuándo usarlo |
|---|---|---|
| `AdminGuard` | `AdminGuard` | Todas las rutas de `protectedRoutes` (se aplica en masa con `.map`) |
| `ClubAdminGuard` | `ClubAdminGuard` | Rutas `/teamadmin` exclusivas del perfil equipo-admin |
| `UsuarioGuard` | `UsuarioGuard` | Rutas `/mi/...` del perfil usuario |
| `PendingChangesGuard` | `PendingChangesGuard` | Componentes con formularios sucios (canDeactivate) |

`AdminGuard` permite también a club-admins si la ruta lleva `data: { allowClubAdmin: true }`.

---

## 9. Interceptor JWT

`JWTInterceptor` adjunta automáticamente el header `Authorization: Bearer <token>` a todas las peticiones HTTP cuando hay sesión activa. No hay que añadirlo manualmente a ninguna petición.

Está registrado en `app.config.ts`:
```typescript
{ provide: HTTP_INTERCEPTORS, useClass: JWTInterceptor, multi: true }
```

---

## 10. Entorno (`environment/environment.ts`)

```typescript
export const serverURL = 'http://localhost:8089';
export const neighborhood = 2;          // vecinos en la paginación
export const rpp = [5, 10, 20, 50, 100]; // opciones de registros por página
export const debug = true;
export const debounceTimeSearch = 800;   // ms de espera en búsquedas
```

Siempre importar desde aquí; nunca hardcodear la URL del backend.

---

## 11. Pipes

| Pipe | Selector | Descripción |
|---|---|---|
| `TrimPipe` | `trim` | `{{ str \| trim:20 }}` — recorta a N caracteres y añade "..." |
| `DatetimePipe` | `datetime` | `{{ fecha \| datetime }}` — formatos: completo, `'solofecha'`, `'solohora'`, etc. |

Ambos son `standalone: true` — importarlos directamente en el componente que los use.

---

## 12. Utilidades

### `toIsoDateTime(value)` (`utils/date-utils.ts`)

Convierte cualquier representación de fecha (string ISO, `Date`, formato español `dd/MM/yyyy`) al formato que acepta el backend: `yyyy-MM-ddTHH:mm:ss`.

```typescript
import { toIsoDateTime } from '../../utils/date-utils';
const fechaBackend = toIsoDateTime(this.form.get('fechaAlta')?.value);
```

---

## 13. Angular Material en el proyecto

Componentes Material usados habitualmente (siempre como standalone):

- `MatSnackBar` — notificaciones de éxito/error.
- `MatDialog` — diálogos modales (p.ej. selector de entidad desde un plist).
- `MatDialogRef<T>` — referencia al diálogo (inyectar como `optional: true` en plist que puede ser ventana flotante).
- `FormBuilder`, `FormGroup`, `Validators` — formularios reactivos.

---

## 14. Procedimiento para añadir una nueva entidad

Seguir este orden estricto para evitar referencias rotas:

### Paso 1 — Modelo (`model/entidad.ts`)
- Crear la interfaz `IEntidad`.
- Relaciones ManyToOne: tipo objeto (`IRelacion`).
- Colecciones: tipo `number`.
- Fechas: tipo `string`.

### Paso 2 — Servicio (`service/entidad.ts`)
- Clase `EntidadService` con `@Injectable({ providedIn: 'root' })`.
- Implementar: `get`, `getPage`, `create`, `update`, `delete`, `count`.
- En `create` y `update`: pasar siempre por `PayloadSanitizerService.sanitize()` con `nestedIdFields` y `removeFields`.
- Si filtra por club: usar `SecurityService.clubFilter()`.

### Paso 3 — Componente plist para admin (`component/entidad/admin/plist/`)
- Ficheros: `plist.ts`, `plist.html`, `plist.css`.
- Clase: `EntidadAdminPlist`.
- Incluir: signals de paginación, debounce de búsqueda, `BotoneraRpp`, `Paginacion`, `BotoneraActionsPlist`.

### Paso 4 — Componente form para admin (`component/entidad/admin/form/`)
- Ficheros: `form.ts`, `form.html`, `form.css`.
- Clase: `EntidadAdminForm`.
- `@Input() entidad`, `@Input() isEditMode`, `@Output() formSuccess`, `@Output() formCancel`.
- Usar `FormBuilder` + `ReactiveFormsModule`.

### Paso 5 — Componente detail para admin (`component/entidad/admin/detail/`)
- Ficheros: `detail.ts`, `detail.html`, `detail.css`.
- Clase: `EntidadAdminDetail`.
- `@Input() id: Signal<number>`.

### Paso 6 — Páginas admin (`page/entidad/admin/`)
- Crear carpetas y ficheros para: `plist/`, `view/`, `new/`, `edit/`, `delete/`.
- Seguir los patrones de la sección 7.

### Paso 7 — Componente plist para teamadmin (si aplica) (`component/entidad/teamadmin/plist/`)
- Solo si el rol equipo-admin tiene acceso a la entidad.
- Idéntico al de admin pero con filtro de club forzado.

### Paso 8 — Página teamadmin (`page/entidad/teamadmin/plist/`)

### Paso 9 — Rutas (`app.routes.ts`)
- Importar todas las páginas nuevas.
- Añadir las rutas en `protectedRoutes` (con `data: { allowClubAdmin: true }` donde corresponda).
- Añadir la ruta `/entidad/teamadmin` fuera de `protectedRoutes`, con `canActivate: [ClubAdminGuard]`.

---

## 15. Convenciones de nomenclatura — resumen rápido

| Artefacto | Patrón | Ejemplo |
|---|---|---|
| Interfaz de modelo | `I<Nombre>` | `IUsuario` |
| Fichero de modelo | `<nombre>.ts` | `usuario.ts` |
| Clase de servicio | `<Nombre>Service` | `UsuarioService` |
| Fichero de servicio | `<nombre>.ts` | `usuarioService.ts` (histórico) / `usuario.ts` (nuevo) |
| Componente plist admin | `<Nombre>AdminPlist` | `UsuarioAdminPlist` |
| Componente form admin | `<Nombre>AdminForm` | `UsuarioAdminForm` |
| Componente detail admin | `<Nombre>AdminDetail` | `UsuarioAdminDetail` |
| Componente teamadmin | `<Nombre>TeamadminPlist` | `UsuarioTeamadminPlist` |
| Página plist admin | `<Nombre>AdminPlistPage` | `UsuarioAdminPlistPage` |
| Página edit admin | `<Nombre>AdminEditPage` | `UsuarioAdminEditPage` |
| Selector de componente | `app-<entidad>-<rol>-<tipo>` | `app-usuario-admin-plist` |
| Campo FK en FormGroup | `id_<relacion>` | `id_club`, `id_tipousuario` |
| Parámetro query FK | `id_<entidad>` | `id_club=3` |
| Ruta principal | `/<entidad>` | `/usuario` |
| Ruta teamadmin | `/<entidad>/teamadmin` | `/usuario/teamadmin` |
| Ruta usuario | `/mi/<entidades>` | `/mi/equipos` |

---

## 16. Reglas de seguridad en el frontend

1. **Nunca confiar en el frontend para la seguridad definitiva** — el backend realiza todas las comprobaciones. En el frontend se añade UX (ocultar botones, redirigir) pero no reemplaza la validación del servidor.
2. **Rutas privadas**: toda ruta que no sea `/login` o `/logout` debe estar protegida con al menos un guard.
3. **URLs de filtro por club**: en servicios, aplicar siempre `SecurityService.clubFilter()` antes de construir la URL cuando el parámetro `id_club` es relevante.
4. **Operaciones de mutación**: usar `SecurityService.ensureClubOwnership()` o `forbidClubAdminActions()` antes de llamar a `create`/`update`/`delete` en servicios que lo requieran.
5. **Token en localStorage**: la clave es `persutiltoken`. No hardcodear esta cadena fuera de `SessionService`.
6. **`encodeURIComponent`**: usar siempre en todos los valores de texto libre que se incluyan en parámetros de query.
