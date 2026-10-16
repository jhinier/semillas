# Arquitectura de Semillas

**Owner:** M9 · **Revisión:** 2026-07-13

## Vision General

Semillas es una sola PWA React para web y móvil, respaldada por una API Hono en Cloudflare Workers y Supabase como infraestructura de datos y autenticación.

La idea central es:

```text
React PWA
  -> IndexedDB/Dexie para lectura y escritura local
  -> Hono API en Cloudflare Workers
  -> Supabase Postgres + Auth + Storage
```

## Objetivos Arquitectonicos

- Una sola experiencia para fanpage, juego, CMS y perfil.
- Funcionar offline y sincronizar después.
- Centralizar reglas de negocio en backend.
- Mantener seguridad fuerte por rol.
- Usar contratos claros entre frontend y API.

## Capas

### 1. Presentacion

Frontend en `frontend/`.

Responsabilidades:

- rutas publicas, app y admin
- componentes UI reutilizables
- formularios y validacion
- lectura/escritura local con Dexie
- sincronizacion cliente-servidor

### 2. Aplicacion

Backend en `backend/`.

Responsabilidades:

- autenticar y autorizar
- validar entradas con Zod
- servir catalogos, temas, actividades y progreso
- procesar sincronizacion idempotente
- administrar contenido y media
- exponer OpenAPI

### 3. Infraestructura

Supabase y Cloudflare.

Responsabilidades:

- almacenamiento de datos
- auth
- storage de media
- deploy de frontend y API

Nota de despliegue:

- el frontend vive en `https://semillas.pages.dev`
- la API vive en `https://api-semillas.andresalexander14.workers.dev`
- la CSP del frontend permite ese Worker solo en `connect-src`

## Flujo Principal

### Navegacion normal

1. El usuario abre la PWA.
2. El frontend consulta datos al backend.
3. La API responde con formato `exito/datos`.
4. El frontend renderiza temas, actividades y progreso.

### Flujo offline

1. El usuario descarga contenido.
2. El frontend guarda datos en IndexedDB.
3. Las acciones generan eventos locales.
4. Los eventos se acumulan para sincronizar.
5. Al volver la conexion, se hace `POST /sync/push`.
6. Luego se hace `GET /sync/pull`.
7. El frontend actualiza el estado local.

### CMS y publicacion

1. Un administrador crea o edita un tema.
2. El backend valida contenido, pasos y actividades.
3. El administrador publica manualmente.
4. El contenido pasa a estar disponible para el juego.

## Modulos Frontend

- `routes/`: rutas principales de la app.
- `features/`: dominios de negocio como auth, temas, progreso, clubes y admin.
- `componentes/`: biblioteca UI y actividades reutilizables.
- `shared/`: auth, api, layout y utilidades compartidas.

## Modulos Backend

- `auth`: invitado y vinculacion de cuenta.
- `catalogo`: grupos etarios, tipos de actividad, libros biblicos, pasos CRECER.
- `sendas`: sendas espirituales.
- `temas`: listado, detalle, portada, pasos y actividades.
- `activities`: respuesta de actividades.
- `progress`: eventos y progreso personal.
- `sync`: push/pull offline.
- `gamification`: nivel y logros.
- `clubs`: clubes, membresias, ranking y retos.
- `media`: subida, consulta, URL firmada y borrado.
- `admin`: gestion de contenido y usuarios.

## Datos y Seguridad

### Supabase

Se usa para:

- `usuario_app`
- `perfil`
- `tema`
- `actividad`
- `evento_progreso`
- `progreso_tema_usuario`
- `progreso_actividad_usuario`
- `recurso_multimedia`
- `club`
- `miembro_club`
- `reto_club`

### Roles

Roles reales en backend:

- `administrador`
- `usuario`
- `invitado`
- `padre`

## Evolucion Futura De Permisos

Por ahora no existe un rol `publicador` ni un rol editorial separado en backend.

Si en el futuro el CMS necesita dividir responsabilidades, la evolucion recomendada es:

- mantener `administrador` como rol de control total,
- agregar un rol mas acotado solo si hay una necesidad operativa real,
- preferir un perfil tipo `revisor` o un sistema de permisos antes que un `publicador` generico,
- no mover esta separacion hasta que haya un flujo claro entre edicion, revision y publicacion.

Nota: la UI frontend hoy muestra `moderador` en algunos componentes, pero ese rol no forma parte del modelo real del backend.

## Desarrollo Local Con Drizzle

Para que `wrangler dev` use Drizzle de forma correcta en local:

1. Crear o reutilizar un Hyperdrive en Cloudflare.
2. Declarar el binding `HYPERDRIVE` en `backend/wrangler.toml`.
3. Definir `CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE` en `backend/.dev.vars` con una conexión Postgres accesible desde tu máquina.
4. Reiniciar `bun run dev` para que `scripts/dev.ts` cargue las variables locales y se las pase a `wrangler dev`.
5. Verificar que el arranque muestre el binding `env.HYPERDRIVE` y luego probar `PATCH /perfil/actualizar` o `GET /catalogo/grupos-etarios`.

Notas:

- `SUPABASE_DATABASE_URL` puede servir como referencia de conexión, pero el runtime local de Drizzle debe entrar por Hyperdrive.
- Si la conexión falla con `EHOSTUNREACH`, usa la cadena de conexión del pooler de Supabase o una URL Postgres alcanzable desde tu red local.

## Estado Actual

La arquitectura base ya está bien definida, pero hay tres brechas importantes:

1. La seguridad de admin y media está deshabilitada temporalmente en código.
2. El offline-first aún no está cerrado con Dexie/outbox visible.
3. Parte de la documentación histórica no coincide con el stack actual.

## Criterios de Calidad

- TypeScript estricto.
- Zod para entradas y DTOs.
- Respuestas consistentes.
- Rutas delgadas.
- Datos locales primero en el frontend.
- Seguridad por rol en backend, no solo en UI.
