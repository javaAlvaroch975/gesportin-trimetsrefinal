# Resumen de Cambios - Adaptación a database.sql

## Fecha: 14 de enero de 2026

Este documento resume todos los cambios realizados para adaptar el código del proyecto a la estructura de la base de datos definida en `database.sql`.

## 1. Entities Creadas

### 1.1 UsuarioEntity
- **Archivo**: `src/main/java/net/ausiasmarch/gesportin/entity/UsuarioEntity.java`
- **Tabla**: `usuario`
- **Campos**:
  - `id` (Long, auto-increment)
  - `nombre` (String, NOT NULL)
  - `apellido1` (String, NOT NULL)
  - `apellido2` (String, NOT NULL)
  - `username` (String, NOT NULL, unique)
  - `password` (String, NOT NULL)
  - `fechaAlta` (LocalDateTime, NOT NULL)
  - `genero` (Integer, NOT NULL)
  - `idTipousuario` (Long, FK, NOT NULL)
  - `idClub` (Long, FK, NOT NULL)

### 1.2 TipoarticuloEntity
- **Archivo**: `src/main/java/net/ausiasmarch/gesportin/entity/TipoarticuloEntity.java`
- **Tabla**: `tipoarticulo`
- **Campos**:
  - `id` (Long, auto-increment)
  - `descripcion` (String, NOT NULL)
  - `idClub` (Long, FK, NOT NULL)

### 1.3 LigaEntity
- **Archivo**: `src/main/java/net/ausiasmarch/gesportin/entity/LigaEntity.java`
- **Tabla**: `liga`
- **Campos**:
  - `id` (Long, auto-increment)
  - `nombre` (String, NOT NULL)
  - `idEquipo` (Long, FK, NOT NULL)

## 2. Entities Modificadas

### 2.1 ComentarioEntity
- **Cambio**: Campo `id_articulo` → `id_noticia`
- **Motivo**: La tabla `comentario` en la base de datos tiene FK a `noticia`, no a `articulo`

### 2.2 PartidoEntity
- **Cambios**:
  - Campo `nombre_rival` → `rival`
  - Campo `id_equipo` → `id_liga`
- **Motivo**: Ajuste a los nombres de campos en la base de datos

### 2.3 JugadorEntity
- **Cambio**: Añadido campo `idEquipo` (Long, FK, NOT NULL)
- **Motivo**: Faltaba el campo `id_equipo` según la estructura de la tabla `jugador`

## 3. Repositories Creados

### 3.1 UsuarioRepository
- **Archivo**: `src/main/java/net/ausiasmarch/gesportin/repository/UsuarioRepository.java`
- **Métodos de búsqueda**:
  - `findByNombreContainingIgnoreCase(String nombre, Pageable)`
  - `findByUsernameContainingIgnoreCase(String username, Pageable)`
  - `findByIdTipousuario(Long idTipousuario, Pageable)`
  - `findByIdClub(Long idClub, Pageable)`

### 3.2 TipoarticuloRepository
- **Archivo**: `src/main/java/net/ausiasmarch/gesportin/repository/TipoarticuloRepository.java`
- **Métodos de búsqueda**:
  - `findByDescripcionContainingIgnoreCase(String descripcion, Pageable)`
  - `findByIdClub(Long idClub, Pageable)`

### 3.3 LigaRepository
- **Archivo**: `src/main/java/net/ausiasmarch/gesportin/repository/LigaRepository.java`
- **Métodos de búsqueda**:
  - `findByNombreContainingIgnoreCase(String nombre, Pageable)`
  - `findByIdEquipo(Long idEquipo, Pageable)`

## 4. Services Creados

### 4.1 UsuarioService
- **Archivo**: `src/main/java/net/ausiasmarch/gesportin/service/UsuarioService.java`
- **Métodos implementados**:
  - `get(Long id)` - Obtener usuario por ID
  - `getPage(...)` - Obtener página de usuarios con filtros
  - `create(UsuarioEntity)` - Crear nuevo usuario
  - `update(UsuarioEntity)` - Actualizar usuario existente
  - `delete(Long id)` - Eliminar usuario
  - `fill(Long cantidad)` - Rellenar con datos aleatorios
  - `empty()` - Vaciar tabla
  - `count()` - Contar registros

### 4.2 TipoarticuloService
- **Archivo**: `src/main/java/net/ausiasmarch/gesportin/service/TipoarticuloService.java`
- **Métodos**: Misma estructura que UsuarioService

### 4.3 LigaService
- **Archivo**: `src/main/java/net/ausiasmarch/gesportin/service/LigaService.java`
- **Métodos**: Misma estructura que UsuarioService

## 5. APIs (Controllers) Creados

### 5.1 UsuarioApi
- **Archivo**: `src/main/java/net/ausiasmarch/gesportin/api/UsuarioApi.java`
- **Endpoint base**: `/usuario`
- **Endpoints**:
  - `GET /{id}` - Obtener por ID
  - `GET /` - Obtener página (con filtros: nombre, username, idTipousuario, idClub)
  - `POST /` - Crear
  - `PUT /` - Actualizar
  - `DELETE /{id}` - Eliminar
  - `GET /fill/{cantidad}` - Rellenar N registros
  - `GET /fill` - Rellenar 50 registros por defecto
  - `DELETE /empty` - Vaciar tabla
  - `GET /count` - Contar registros

### 5.2 TipoarticuloApi
- **Archivo**: `src/main/java/net/ausiasmarch/gesportin/api/TipoarticuloApi.java`
- **Endpoint base**: `/tipoarticulo`
- **Endpoints**: Misma estructura que UsuarioApi

### 5.3 LigaApi
- **Archivo**: `src/main/java/net/ausiasmarch/gesportin/api/LigaApi.java`
- **Endpoint base**: `/liga`
- **Endpoints**: Misma estructura que UsuarioApi

## 6. Services Modificados

### 6.1 ComentarioService
- **Cambios**:
  - `id_articulo` → `id_noticia` en método `rellenaComentarios()`
  - `id_articulo` → `id_noticia` en método `create()`
  - `id_articulo` → `id_noticia` en método `update()`

### 6.2 PartidoService
- **Cambios**:
  - `nombre_rival` → `rival` en método `create()`
  - `nombre_rival` → `rival` en método `update()`
  - `nombre_rival` → `rival` en método `rellenaPartido()`
  - `id_equipo` → `id_liga` en todos los métodos

### 6.3 JugadorService
- **Cambios**:
  - Añadido `setIdEquipo()` en método `crearJugador()`
  - Añadido `setIdEquipo()` en método `update()`

## 7. Estructura de Todas las APIs

Todas las APIs del proyecto siguen el mismo patrón y tienen los siguientes métodos:

1. **GET** `/{id}` - Obtener un registro por ID
2. **GET** `/` - Obtener página de registros con filtros opcionales
3. **POST** `/` - Crear un nuevo registro
4. **PUT** `/` - Actualizar un registro existente
5. **DELETE** `/{id}` - Eliminar un registro
6. **GET** `/fill/{cantidad}` - Rellenar N registros con datos aleatorios
7. **GET** `/fill` - Rellenar 50 registros por defecto
8. **DELETE** `/empty` - Vaciar completamente la tabla
9. **GET** `/count` - Obtener el número total de registros

## 8. Tablas Cubiertas

Todas las tablas del esquema `database.sql` ahora tienen su Entity, Repository, Service y API completos:

- ✅ articulo
- ✅ carrito
- ✅ categoria
- ✅ club
- ✅ comentario
- ✅ compra
- ✅ cuota
- ✅ equipo
- ✅ factura
- ✅ jugador
- ✅ **liga** (NUEVA)
- ✅ noticia
- ✅ pago
- ✅ partido
- ✅ puntuacion
- ✅ temporada
- ✅ **tipoarticulo** (NUEVA)
- ✅ tipousuario
- ✅ **usuario** (NUEVA)

## 9. Verificación

- ✅ No hay errores de compilación
- ✅ Todas las entities coinciden con la estructura de `database.sql`
- ✅ Todas las FK están correctamente mapeadas
- ✅ Todos los servicios implementan los 8 métodos estándar
- ✅ Todas las APIs exponen los 9 endpoints estándar

## 10. Prueba de la API de Artículo

Se ha creado un archivo HTML de prueba:
- **Archivo**: `src/main/resources/static/articulo.html`
- **Funcionalidad**: Interfaz web minimalista y responsiva para probar todos los endpoints de la API de artículo
- **Acceso**: http://localhost:8080/articulo.html (cuando el servidor esté ejecutándose)

---

**Nota**: Todos los cambios están alineados con la estructura de la base de datos definida en `src/main/resources/database.sql` (versión del 14-01-2026).
