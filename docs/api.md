# API de Semillas

**Owner:** M7 · **Revisión:** 2026-07-13

## Base

- Runtime: Cloudflare Workers
- Framework: Hono
- Contrato: JSON con formato estándar
- Documentacion interactiva: `/docs`
- OpenAPI: `/openapi.json`

## Formato de Respuesta

Exito:

```json
{ "exito": true, "datos": {} }
```

Error:

```json
{ "exito": false, "error": "Mensaje", "codigo": "CODIGO" }
```

## Autenticacion

### Invitado

`X-Guest-User-Id` identifica al usuario invitado.

### Bearer

`Authorization: Bearer <token>` para sesiones autenticadas.

### Reglas

- Rutas publicas no requieren auth.
- Rutas de perfil, progreso, sync, gamificacion, clubes y actividades requieren autenticacion.
- Admin y media deben ir protegidas por rol cuando la seguridad quede reactivada.

## Endpoints Publicos

### Raiz

`GET /`

Devuelve nombre y version de la API.

### Salud

`GET /health`

### OpenAPI

`GET /openapi.json`

### Docs

`GET /docs`

## Autenticacion

### `POST /autenticacion/invitado`

Crea usuario invitado y perfil.

Body:

```json
{
  "apodo": "Aventurero123",
  "grupo_edad_id": "uuid-opcional",
  "url_avatar": "https://..."
}
```

### `POST /autenticacion/configuracion-dev`

Solo en desarrollo. Crea o recupera un admin de pruebas.

## Perfil

### `GET /perfil`

Devuelve usuario y perfil actual.

### `PATCH /perfil/actualizar`

Actualiza apodo, grupo, avatar y preferencias.

### `POST /perfil/vincular-cuenta`

Vincula una cuenta autenticada a un usuario invitado.

## Catalogo

### `GET /catalogo/grupos-etarios`

### `GET /catalogo/tipos-actividad`

### `GET /catalogo/libros-biblicos`

### `GET /catalogo/versiones-biblicas`

### `GET /catalogo/pasos-crecer`

## Sendas

### `GET /sendas`

Lista las sendas activas.

## Temas

### `GET /temas`

Lista temas publicados.

Query opcional:

- `senda_id`

### `GET /temas/:tema_id`

Devuelve detalle del tema.

### `GET /temas/:tema_id/portada`

Devuelve URL firmada de la portada.

### `GET /temas/:tema_id/pasos`

Devuelve pasos CRECER.

Query opcional:

- `grupo_edad_id`

### `GET /temas/:tema_id/actividades`

Devuelve actividades del tema.

Query opcional:

- `grupo_edad_id`

## Actividades

### `GET /actividades`

Lista actividades.

### `GET /actividades/:actividad_id`

Detalle de una actividad.

### `POST /actividades/:actividad_id/responder`

Registra una respuesta y crea evento de progreso.

Body:

```json
{
  "evento_id_cliente": "uuid",
  "opcion_id_seleccionada": "uuid",
  "texto_respuesta": "...",
  "ocurrido_en_cliente": "2026-01-01T00:00:00.000Z",
  "dispositivo_id": "opcional"
}
```

## Progreso

### `GET /progreso/mi`

Devuelve progreso de temas y actividades.

### `POST /progreso/eventos`

Registra un evento de progreso.

Idempotencia:

- si `evento_id_cliente` ya existe, el backend devuelve duplicado

## Sync

### `GET /sync/pull`

Trae progreso y eventos del servidor.

Query opcional:

- `since`

### `POST /sync/push`

Envía eventos pendientes desde el cliente.

## Gamificacion

### `GET /gamificacion/mi`

Devuelve nivel y logros del usuario.

## Clubs

### `GET /clubes`

### `GET /clubes/mios`

### `GET /clubes/:clubId`

### `POST /clubes`

### `POST /clubes/:clubId/unirse`

### `POST /clubes/:clubId/salir`

### `GET /clubes/:clubId/ranking`

El ranking usa apodo y avatar permitidos. El desempate es determinista por XP
semanal descendente, XP total descendente, apodo ascendente y una clave interna
estable que no se expone en el DTO.

### `GET /clubes/:clubId/retos`

### `POST /clubes/:clubId/retos`

### `POST /clubes/:clubId/reportes`

Permite a un miembro reportar a otro miembro con categoría cerrada y detalle
limitado. El cuerpo usa `miembro_token` (token opaco, no un ID de usuario). El
backend aplica rate limiting y no habilita chat libre.

### `GET /administracion/reportes-clubes`

Lista reportes para administradores.

### `PATCH /administracion/reportes-clubes/:reporteId`

Permite pasar un reporte a revisión, resolverlo o descartarlo. Cada cambio se
audita.

## Media

### `POST /media/subir`

Sube un recurso multimedia.

### `GET /media/:id`

Devuelve metadatos del recurso.

### `GET /media/:id/url`

Devuelve URL firmada temporal.

### `DELETE /media/:id`

Elimina un recurso multimedia.

## Administracion

### `GET /administracion/resumen`

### `GET /administracion/usuarios`

### `GET /administracion/usuarios/:usuario_id`

### `PATCH /administracion/usuarios/:usuario_id`

### `GET /administracion/temas`

### `POST /administracion/temas`

### `PATCH /administracion/temas/:tema_id`

### `DELETE /administracion/temas/:tema_id`

### `POST /administracion/temas/:tema_id/pasos`

### `PATCH /administracion/temas/:tema_id/pasos/:paso_id`

### `DELETE /administracion/temas/:tema_id/pasos/:tipo_paso_id`

### `POST /administracion/temas/:tema_id/publicar`

### `POST /administracion/temas/:tema_id/borrador`

### `POST /administracion/temas/:tema_id/archivar`

### `POST /administracion/temas/:tema_id/duplicar`

### `GET /administracion/actividades`

### `POST /administracion/actividades`

### `PATCH /administracion/actividades/:actividad_id`

### `DELETE /administracion/actividades/:actividad_id`

## Notas Importantes

- La API usa respuestas consistentes y validacion con Zod.
- La sincronizacion offline depende de `evento_progreso` y de la idempotencia por `evento_id_cliente`.
- La documentacion historica de `docs/backend-api.md` sigue siendo util, pero esta vista debe tomarse como la referencia canónica.
- La seguridad de admin y media sigue pendiente de reactivacion en el codigo actual.
