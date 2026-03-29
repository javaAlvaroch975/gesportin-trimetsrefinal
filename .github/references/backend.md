# Referencia de backend — gesportin

Guía exhaustiva para agentes de IA que desarrollen nuevas funcionalidades o modifiquen el proyecto backend de gesportin. Leer **completamente** antes de generar o editar cualquier fichero Java.

---

## 1. Stack y configuración

| Elemento | Valor |
|---|---|
| Lenguaje | Java 17 |
| Framework | Spring Boot 4.0.1 (`spring-boot-starter-webmvc`) |
| Persistencia | Spring Data JPA + Hibernate + MySQL |
| Driver MySQL | `com.mysql.cj.jdbc.Driver` |
| Pool de conexiones | HikariCP |
| Autenticación | JWT — librería `jjwt` 0.11.5 |
| Lombok | Sí (`@Data`, `@NoArgsConstructor`, `@AllArgsConstructor`) |
| AOP | `aspectjweaver` (para el guard de `fill`/`empty`) |
| Build | Maven (`pom.xml`) |
| Puerto | 8089 |
| Base de datos | `gesportin` en `localhost:3306` |
| Paquete raíz | `net.ausiasmarch.gesportin` |

Las propiedades de configuración se encuentran en `src/main/resources/application.properties`. Las claves JWT se configuran con las propiedades `jwt.secret`, `jwt.issuer` y `jwt.subject`.

---

## 2. Estructura de paquetes

```
net.ausiasmarch.gesportin/
├── GesportinApplication.java       # Clase principal Spring Boot
├── api/                            # Controllers REST (@RestController)
├── bean/                           # DTOs simples (request/response bodies)
├── entity/                         # Entidades JPA (@Entity)
├── exception/                      # Excepciones personalizadas + handler global
├── filter/                         # Filtro JWT + Aspect AOP
├── repository/                     # Interfaces JpaRepository
├── service/                        # Lógica de negocio (@Service)
└── util/                           # (vacío, reservado para utilidades)
```

---

## 3. Capa de entidades (`entity/`)

### 3.1 Convenciones de nomenclatura

- El nombre de las clases sigue el patrón: **`<NombreEntidad>Entity`** (PascalCase).  
  Ejemplos: `UsuarioEntity`, `ClubEntity`, `JugadorEntity`, `CuotaEntity`.
- La anotación `@Table(name = "<nombre_tabla_mysql>")` nombra la tabla en minúsculas y singular.  
  Ejemplos: `@Table(name = "usuario")`, `@Table(name = "club")`, `@Table(name = "jugador")`.
- Cuando el nombre de la columna en la BD usa tilde o carácter especial, se anota con `@Column(name = "…")`.  
  Ejemplo: `@Column(name = "dirección")` para el campo Java `direccion`.

### 3.2 Anotaciones obligatorias en toda entidad

```java
@Entity
@Table(name = "nombre_tabla")
@Data               // Lombok: genera getters, setters, equals, hashCode, toString
@NoArgsConstructor  // Lombok: constructor sin argumentos (requerido por JPA)
@AllArgsConstructor // Lombok: constructor con todos los campos
public class NombreEntidadEntity { … }
```

### 3.3 Clave primaria

Siempre `Long`, siempre auto-generada por la BD:

```java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
```

### 3.4 Relaciones

#### ManyToOne (relaciones "hacia arriba")
- `fetch = FetchType.EAGER` **siempre** en ManyToOne.
- La columna FK sigue el patrón `id_<nombre_entidad_referenciada>`.

```java
@NotNull
@ManyToOne(fetch = FetchType.EAGER)
@JoinColumn(name = "id_club")
private ClubEntity club;
```

#### OneToMany (colecciones "hacia abajo")
- `fetch = FetchType.LAZY` **siempre** en OneToMany.
- La lista **nunca** se serializa directamente: se oculta el getter con `@Getter(AccessLevel.NONE)` y se reemplaza por un método que devuelve el **count** como `int`.

```java
@Getter(AccessLevel.NONE)
@OneToMany(mappedBy = "equipo", fetch = FetchType.LAZY)
private List<JugadorEntity> jugadores;

public int getJugadores() {
    return jugadores != null ? jugadores.size() : 0;
}
```

### 3.5 Validaciones

- Campos de texto obligatorios: `@NotBlank` + `@Column(nullable = false)`.
- Campos de objeto/primitivo obligatorio: `@NotNull` + `@Column(nullable = false)`.
- Longitudes: `@Size(min = 3, max = 255)` (o el máximo que corresponda).

### 3.6 Fechas

- Tipo Java: `LocalDateTime`.
- Anotación de serialización: `@JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss", shape = JsonFormat.Shape.STRING)`.
- Columna en BD: `fecha_alta` → `@Column(name = "fecha_alta", nullable = false)`.

### 3.7 Imágenes / blobs

Usar `@Lob` junto con `byte[]`:

```java
@Lob
@Column(nullable = false)
private byte[] imagen;
```

---

## 4. Capa de repositorios (`repository/`)

### 4.1 Nomenclatura

- Patrón: **`<NombreEntidad>Repository`**.
- Ejemplo: `UsuarioRepository`, `ClubRepository`.

### 4.2 Estructura base

```java
public interface NombreEntidadRepository extends JpaRepository<NombreEntidadEntity, Long> {
    // métodos de consulta derivados (query methods)
}
```

### 4.3 Convenciones de métodos

Los métodos de consulta siguen la nomenclatura de Spring Data JPA:

- Paginados: devuelven `Page<EntidadEntity>` y reciben `Pageable` como último argumento.
- Búsqueda por campo con "like": `findBy<Campo>ContainingIgnoreCase(String valor, Pageable pageable)`.
- Búsqueda por FK: `findBy<Entidad>Id(Long id, Pageable pageable)`.
- Búsqueda por FK encadenada: `findBy<Entidad1><Entidad2>…Id(Long id, Pageable pageable)`.  
  Ejemplo: `findByEquipoCategoriaTemporadaClubId(Long clubId, Pageable pageable)`.
- Búsqueda exacta: devuelve `Optional<EntidadEntity>`.

---

## 5. Capa de servicios (`service/`)

### 5.1 Nomenclatura

- Patrón: **`<NombreEntidad>Service`**.
- La instancia del repositorio se llama **`o<NombreEntidad>Repository`** (prefijo `o`).
- Las instancias de otros servicios inyectados siguen el mismo patrón: **`o<NombreServicio>`**.

```java
@Autowired
private UsuarioRepository oUsuarioRepository;

@Autowired
private ClubService oClubService;

@Autowired
private SessionService oSessionService;
```

### 5.2 Operaciones estándar que DEBE implementar todo servicio

Cada servicio expone obligatoriamente las siguientes operaciones:

| Método | Firma | Descripción |
|---|---|---|
| `get` | `EntidadEntity get(Long id)` | Devuelve una entidad por id. Lanza `ResourceNotFoundException` si no existe. |
| `getPage` | `Page<EntidadEntity> getPage(Pageable pageable, …filtros…)` | Devuelve página. Acepta filtros opcionales como parámetros. |
| `create` | `EntidadEntity create(EntidadEntity o…)` | Crea un nuevo registro. Siempre fuerza `setId(null)` antes de guardar. |
| `update` | `EntidadEntity update(EntidadEntity o…)` | Actualiza un registro existente. Carga el existente de BD y copia campo a campo. |
| `delete` | `Long delete(Long id)` | Borra por id. Devuelve el `id` eliminado. |
| `count` | `Long count()` | Devuelve el número total de registros. |
| `fill` | `Long fill(Long cantidad)` | Rellena con datos aleatorios. Solo permitido a `ADMIN`. |
| `empty` | `Long empty()` | Vacía la tabla. Solo permitido a `ADMIN`. |
| `getOneRandom` | `EntidadEntity getOneRandom()` | Devuelve un registro aleatorio (útil para `fill` de otras entidades). |

### 5.3 Patrón de `create` (imprescindible)

```java
public EntidadEntity create(EntidadEntity oEntidad) {
    // 1. Comprobar permisos (denyUsuario, denyEquipoAdmin, checkSameClub…)
    oSessionService.denyUsuario();

    // 2. Forzar id a null para evitar actualizaciones accidentales
    oEntidad.setId(null);

    // 3. Establecer campos gestionados por el servidor (fechas, etc.)
    oEntidad.setFechaAlta(LocalDateTime.now());

    // 4. Resolver relaciones FK cargando las entidades relacionadas desde BD
    oEntidad.setClub(oClubService.get(oEntidad.getClub().getId()));

    // 5. Guardar y devolver
    return oEntidadRepository.save(oEntidad);
}
```

### 5.4 Patrón de `update` (imprescindible)

Nunca se guarda directamente el objeto entrante. Se carga el existente de BD y se copian los campos uno a uno:

```java
public EntidadEntity update(EntidadEntity oEntidad) {
    // 1. Permisos
    oSessionService.denyUsuario();

    // 2. Cargar existente
    EntidadEntity oExistente = oEntidadRepository.findById(oEntidad.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Entidad no encontrada con id: " + oEntidad.getId()));

    // 3. Copiar campo a campo
    oExistente.setNombre(oEntidad.getNombre());
    oExistente.setXxx(oEntidad.getXxx());
    // Resolver FKs de nuevo
    oExistente.setRelacion(oRelacionService.get(oEntidad.getRelacion().getId()));

    // 4. Guardar y devolver
    return oEntidadRepository.save(oExistente);
}
```

### 5.5 Patrón de `delete`

```java
public Long delete(Long id) {
    // 1. Permisos
    oSessionService.denyUsuario();

    // 2. Verificar existencia antes de borrar
    oEntidadRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Entidad no encontrada con id: " + id));

    // 3. Borrar
    oEntidadRepository.deleteById(id);
    return id;
}
```

### 5.6 Patrón de `fill` y `empty`

Los métodos tienen el acceso a `fill`/`empty` automáticamente bloqueado para no-admins por el aspecto `AdminCrudGuardAspect`. El servicio **no necesita** repetir la comprobación de permisos internamente.

```java
public Long fill(Long cantidad) {
    // No hace falta denyUsuario/denyEquipoAdmin: lo hace el aspecto AOP
    for (int i = 0; i < cantidad; i++) {
        EntidadEntity o = new EntidadEntity();
        o.setCampo(oAleatorioService.generarAlgo());
        o.setRelacion(oRelacionService.getOneRandom());
        oEntidadRepository.save(o);
    }
    return cantidad;
}

public Long empty() {
    oEntidadRepository.deleteAll();
    return oEntidadRepository.count();
}
```

### 5.7 Patrón de `getOneRandom`

```java
public EntidadEntity getOneRandom() {
    Long count = oEntidadRepository.count();
    if (count == 0) {
        return null;
    }
    int index = (int) (Math.random() * count);
    return oEntidadRepository.findAll(Pageable.ofSize(1).withPage(index)).getContent().get(0);
}
```

---

## 6. Capa de controladores REST (`api/`)

### 6.1 Nomenclatura

- Patrón: **`<NombreEntidad>Api`**.
- Ejemplo: `UsuarioApi`, `ClubApi`.

### 6.2 Anotaciones de clase obligatorias

```java
@CrossOrigin(origins = "*", allowedHeaders = "*", maxAge = 3600)
@RestController
@RequestMapping("/<nombre_entidad_en_minusculas>")
public class NombreEntidadApi { … }
```

El path del `@RequestMapping` es el nombre de la entidad en **minúsculas** y sin la palabra "Entity".  
Ejemplos: `/usuario`, `/club`, `/jugador`, `/cuota`.

### 6.3 Inyección del servicio

```java
@Autowired
private NombreEntidadService oNombreEntidadService;
```

### 6.4 Endpoints estándar

```java
@GetMapping("/{id}")
public ResponseEntity<EntidadEntity> get(@PathVariable Long id) {
    return ResponseEntity.ok(oService.get(id));
}

@GetMapping
public ResponseEntity<Page<EntidadEntity>> getPage(
        @PageableDefault(size = 1000) Pageable pageable,
        @RequestParam(required = false) String campo,
        @RequestParam(required = false) Long id_relacion) {
    return ResponseEntity.ok(oService.getPage(pageable, campo, id_relacion));
}

@PostMapping
public ResponseEntity<EntidadEntity> create(@RequestBody EntidadEntity entidad) {
    return ResponseEntity.ok(oService.create(entidad));
}

@PutMapping
public ResponseEntity<EntidadEntity> update(@RequestBody EntidadEntity entidad) {
    return ResponseEntity.ok(oService.update(entidad));
}

@DeleteMapping("/{id}")
public ResponseEntity<Long> delete(@PathVariable Long id) {
    return ResponseEntity.ok(oService.delete(id));
}

@PostMapping("/fill/{cantidad}")
public ResponseEntity<Long> fill(@PathVariable Long cantidad) {
    return ResponseEntity.ok(oService.fill(cantidad));
}

@DeleteMapping("/empty")
public ResponseEntity<Long> empty() {
    return ResponseEntity.ok(oService.empty());
}

@GetMapping("/count")
public ResponseEntity<Long> count() {
    return ResponseEntity.ok(oService.count());
}
```

### 6.5 Parámetros de query en `getPage`

Los `@RequestParam` de filtro llevan siempre `required = false`. Los que filtran por FK siguen el patrón `id_<nombre_entidad>` en minúsculas:  
Ejemplo: `id_tipousuario`, `id_club`, `id_equipo`.

---

## 7. Sistema de autenticación y autorización

### 7.1 Flujo JWT

1. El cliente llama a `POST /session/login` con `{ username, password }`.
2. `SessionService.login()` verifica credenciales en BD y genera un JWT con `JWTService.generateJWT(username, userid, usertype, id_club)`.
3. El JWT se devuelve en un `TokenBean`.
4. En cada petición posterior, el cliente envía `Authorization: Bearer <token>`.
5. `JwtFilter` (implementa `Filter`) valida el JWT en cada petición y escribe el atributo `username` en el `HttpServletRequest`. Si el token es inválido o ausente, sigue la cadena sin atributo (no bloquea directamente en el filtro).
6. `SessionService` lee el atributo `username` del contexto de la petición (`RequestContextHolder`) para derivar el perfil del usuario en cada operación de servicio.

### 7.2 Roles (`tipousuario`)

| `tipousuario.id` | Rol | Método de comprobación |
|---|---|---|
| 1 | **Administrador** | `oSessionService.isAdmin()` |
| 2 | **Administrador de equipo** | `oSessionService.isEquipoAdmin()` |
| 3 | **Usuario** | `oSessionService.isUsuario()` |
| (sin sesión) | **Anónimo / sin autenticar** | `!oSessionService.isSessionActive()` |

### 7.3 Métodos de control de acceso en `SessionService`

| Método | Efecto |
|---|---|
| `isAdmin()` | Devuelve `true` si el usuario logado tiene `tipousuario.id == 1` |
| `isEquipoAdmin()` | Devuelve `true` si tiene `tipousuario.id == 2` |
| `isUsuario()` | Devuelve `true` si tiene `tipousuario.id == 3` |
| `isSessionActive()` | Devuelve `true` si hay `username` en el request |
| `getIdUsuario()` | Devuelve el `id` del usuario logado |
| `getIdClub()` | Devuelve el `id` del club del usuario logado |
| `checkSameClub(Long clubId)` | Lanza `UnauthorizedException` si `isEquipoAdmin()` o `isUsuario()` y el club no coincide con el suyo |
| `denyEquipoAdmin()` | Lanza `UnauthorizedException` si el usuario es administrador de equipo |
| `denyUsuario()` | Lanza `UnauthorizedException` si el usuario es de tipo usuario |
| `requireAdmin()` | Lanza `UnauthorizedException` si el usuario NO es administrador |

### 7.4 Regla general de uso en servicios

En cada método de servicio que modifica datos, seguir este orden de comprobaciones:

1. `oSessionService.denyUsuario()` (si los usuarios no tienen permiso).
2. `oSessionService.denyEquipoAdmin()` (si los admins de equipo tampoco tienen permiso).
3. Si el admin de equipo tiene permiso **parcial** (solo su club), usar `oSessionService.checkSameClub(clubId)` con el id del club de la entidad afectada.
4. Lógica de negocio.

### 7.5 Guard AOP para `fill` y `empty`

`AdminCrudGuardAspect` intercepta automáticamente cualquier método `fill(..)` o `empty(..)` en el paquete `service` y lanza `UnauthorizedException` si el usuario no es administrador. Los servicios no necesitan repetir esta comprobación.

---

## 8. Gestión de excepciones

### 8.1 Excepciones del proyecto

| Clase | HTTP | Cuándo lanzarla |
|---|---|---|
| `ResourceNotFoundException` | 404 | Entidad no encontrada en BD (usar en `findById().orElseThrow(…)`) |
| `UnauthorizedException` | 401 | Acceso denegado por permisos |
| `ResourceNotModifiedException` | 304 | Recurso sin cambios |
| `GeneralException` | 500 | Error de negocio genérico |

Todas extienden `RuntimeException`. El handler global `ApplicationExceptionHandler` (`@ControllerAdvice`) las captura y devuelve un `ExceptionBean` con `{ status, message, timestamp }`.

### 8.2 Patrón de uso

```java
// ResourceNotFoundException
.orElseThrow(() -> new ResourceNotFoundException("Entidad no encontrada con id: " + id))

// UnauthorizedException
throw new UnauthorizedException("Acceso denegado: mensaje descriptivo");
```

Los mensajes de error van en **español** y son descriptivos del motivo.

---

## 9. Beans (`bean/`)

Los beans son clases simples de transferencia de datos. Usan exclusivamente anotaciones Lombok:

```java
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MiBean { … }
```

No se usa `@Data` en beans (solo en entidades). Beans existentes:

- `SessionBean` — campos `username`, `password` para el login.
- `TokenBean` — campo `token` (el JWT generado).
- `ExceptionBean` — campos `status`, `message`, `timestamp` para las respuestas de error.

---

## 10. Servicio `AleatorioService`

Servicio de utilidad para generar datos aleatorios en los métodos `fill`. Métodos disponibles:

| Método | Descripción |
|---|---|
| `generarNombreEquipoAleatorio()` | Genera un nombre de equipo aleatorio |
| `generarNumeroAleatorioEnteroEnRango(int min, int max)` | Entero aleatorio en rango cerrado |
| `generarNumeroAleatorioDecimalEnRango(double min, double max)` | Decimal aleatorio redondeado a 2 decimales |
| `primeraMayuscuString(String str)` | Primera letra mayúscula, resto minúsculas |
| `eliminarAcentos(String input)` | Reemplaza vocales acentuadas (útil para generar usernames) |

---

## 11. CORS

La configuración CORS se gestiona en dos niveles que deben mantenerse sincronizados:

1. **`JwtFilter`**: aplica cabeceras `Access-Control-Allow-*` a todas las peticiones, incluyendo preflight OPTIONS.
2. **`@CrossOrigin(origins = "*", allowedHeaders = "*", maxAge = 3600)`**: anotación en cada controlador `@RestController`.

Al crear un nuevo controlador, añadir **siempre** la anotación `@CrossOrigin`.

---

## 12. Procedimiento para añadir una nueva entidad

Seguir este orden estricto al añadir cualquier nueva entidad al sistema:

### Paso 1 — Entidad (`entity/NombreEntidadEntity.java`)
- Anotar con `@Entity`, `@Table`, `@Data`, `@NoArgsConstructor`, `@AllArgsConstructor`.
- Definir `@Id` con `GenerationType.IDENTITY` y tipo `Long`.
- Para relaciones ManyToOne: `FetchType.EAGER`.
- Para relaciones OneToMany: `FetchType.LAZY` + `@Getter(AccessLevel.NONE)` + método getter que devuelve `int`.
- Campos de fecha: `LocalDateTime` + `@JsonFormat`.

### Paso 2 — Repositorio (`repository/NombreEntidadRepository.java`)
- Extender `JpaRepository<NombreEntidadEntity, Long>`.
- Añadir los métodos de búsqueda paginada que necesite el servicio.

### Paso 3 — Servicio (`service/NombreEntidadService.java`)
- Anotar con `@Service`.
- Inyectar repositorio y servicios relacionados con `@Autowired`.
- Implementar: `get`, `getPage`, `create`, `update`, `delete`, `count`, `fill`, `empty`, `getOneRandom`.
- En `create`: siempre `setId(null)`, siempre resolver FKs cargando desde BD.
- En `update`: siempre cargar el existente y copiar campos.
- Aplicar comprobaciones de permisos según las reglas de la sección 7.

### Paso 4 — Controlador (`api/NombreEntidadApi.java`)
- Anotar con `@CrossOrigin`, `@RestController`, `@RequestMapping("/<nombre_en_minusculas>")`.
- Inyectar el servicio con `@Autowired`.
- Implementar los 8 endpoints estándar (get, getPage, create, update, delete, fill, empty, count).

### Paso 5 — Tests (`src/test/java/…/service/NombreEntidadServiceTest.java`)
- Usar Mockito (`@Mock`, `@InjectMocks`, `MockitoAnnotations.openMocks(this)`).
- Mockear el repositorio y `SessionService`.
- Probar al menos: obtención correcta, denegación por rol incorrecto, paginación por club.

---

## 13. Convenciones de nomenclatura — resumen rápido

| Artefacto | Patrón | Ejemplo |
|---|---|---|
| Entidad JPA | `<Nombre>Entity` | `CuotaEntity` |
| Repositorio | `<Nombre>Repository` | `CuotaRepository` |
| Servicio | `<Nombre>Service` | `CuotaService` |
| Controlador | `<Nombre>Api` | `CuotaApi` |
| Variable de repositorio | `o<Nombre>Repository` | `oCuotaRepository` |
| Variable de servicio inyectado | `o<Nombre>Service` | `oEquipoService` |
| Tabla BD | minúsculas, singular | `cuota` |
| FK en columna BD | `id_<nombre_entidad>` | `id_equipo` |
| Parámetro de filtro en API | `id_<nombre_entidad>` | `id_equipo` |
| Path del endpoint | `/<nombre_entidad_minusc>` | `/cuota` |
| Endpoint de paginación filtrada | `@RequestParam(required = false)` | — |

---

## 14. Entidades existentes y sus paths de API

| Entidad | Path API | Relaciones principales |
|---|---|---|
| `TipousuarioEntity` | `/tipousuario` | — |
| `RolusuarioEntity` | `/rolusuario` | — |
| `ClubEntity` | `/club` | — |
| `TemporadaEntity` | `/temporada` | `→ Club` |
| `CategoriaEntity` | `/categoria` | `→ Temporada → Club` |
| `EquipoEntity` | `/equipo` | `→ Categoria → Temporada → Club`, `→ Entrenador (Usuario)` |
| `UsuarioEntity` | `/usuario` | `→ Tipousuario`, `→ Rolusuario`, `→ Club` |
| `JugadorEntity` | `/jugador` | `→ Usuario → Club`, `→ Equipo → Categoria → Temporada → Club` |
| `LigaEntity` | `/liga` | `→ Equipo` |
| `PartidoEntity` | `/partido` | `→ Liga` |
| `CuotaEntity` | `/cuota` | `→ Equipo → Categoria → Temporada → Club` |
| `PagoEntity` | `/pago` | `→ Jugador`, `→ Cuota` |
| `NoticiaEntity` | `/noticia` | `→ Club` |
| `ComentarioEntity` | `/comentario` | `→ Noticia`, `→ Usuario` |
| `PuntuacionEntity` | `/puntuacion` | `→ Noticia`, `→ Usuario` |
| `TipoarticuloEntity` | `/tipoarticulo` | `→ Club` |
| `ArticuloEntity` | `/articulo` | `→ Tipoarticulo → Club` |
| `ComentarioartEntity` | `/comentarioart` | `→ Articulo`, `→ Usuario` |
| `CarritoEntity` | `/carrito` | `→ Articulo`, `→ Usuario` |
| `FacturaEntity` | `/factura` | `→ Usuario` |
| `CompraEntity` | `/compra` | `→ Factura`, `→ Articulo` |

La cadena de relaciones es importante para la lógica de control de acceso por club (ver sección 7).

---

## 15. Sesión especial `/session`

| Endpoint | Descripción |
|---|---|
| `POST /session/login` | Recibe `SessionBean { username, password }`, devuelve `TokenBean { token }` |
| `GET /session/check` | Devuelve `true` si hay sesión activa, `false` en caso contrario |

---

## 16. Notas de seguridad importantes

1. **Nunca guardar el objeto entrante directamente** en `update`. Siempre cargar el existente de BD.
2. **Siempre forzar `setId(null)` en `create`** para evitar actualizaciones accidentales.
3. **Siempre resolver las FK** en `create` y `update` llamando al servicio relacionado (`o<Entidad>Service.get(id)`) en lugar de confiar en el objeto enviado por el cliente.
4. Los campos gestionados por el servidor (como `fechaAlta`) deben sobreescribirse siempre en `create`, no confiar en el valor del cliente.
5. Para el acceso multi-club, usar **siempre** `oSessionService.checkSameClub(clubId)` con el club de la entidad afectada, no con el club que viene en el body de la petición.
