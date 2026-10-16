# Semillas - Instrucciones para OpenCode

## Contexto Del Proyecto

Semillas es una plataforma web y móvil para enseñar el evangelio de forma lúdica a niños, preadolescentes y adolescentes. Debe permitir aprender mediante sendas, temas bíblicos, metodología CRECER, actividades, progreso, gamificación, clubes, retos cooperativos y un CMS para administradores.

El sistema debe ser sencillo, seguro para menores, rápido, usable desde celular, instalable como PWA, funcionar sin internet y sincronizar progreso cuando vuelva la conexión.

## Stack Obligatorio

Usar:

- Bun como package manager y runtime de scripts.
- React.
- TypeScript.
- Vite.
- Tailwind CSS.
- TanStack Router.
- TanStack Query para estado servidor.
- Dexie para IndexedDB.
- React Hook Form.
- Zod.
- Zustand solo para estado global liviano.
- shadcn/ui para componentes base.
- Lucide React para iconos.
- vite-plugin-pwa para PWA.

Backend:

- Hono con TypeScript.
- Cloudflare Workers como runtime de API.
- Zod para validación de entradas y DTOs compartidos.
- Supabase JS para Auth, Postgres y Storage.
- Drizzle opcional si se conecta directo a Postgres.
- Jose opcional para validar JWT manualmente si hace falta.

Infraestructura:

- Cloudflare Pages o Workers Assets para servir la React PWA.
- Cloudflare Workers para ejecutar la Hono API.
- Wrangler para deploy, preview y variables.
- Supabase para Postgres, Auth y Storage.
- Cloudflare KV, R2, Queues, Durable Objects y Turnstile solo si aportan valor concreto.

No usar npm, pnpm ni yarn.

Comandos correctos:

```bash
bun install
bun add <paquete>
bun run dev
bun run build
bun run check
```

## Arquitectura General

La arquitectura base del sistema debe ser:

```text
React PWA web + React PWA móvil
        ↓
IndexedDB offline (Dexie)
        ↓
Hono API en Cloudflare Workers
        ↓
Supabase: Postgres + Auth + Storage
```

La idea principal: Cloudflare sirve y ejecuta, Hono controla la lógica de negocio, Supabase guarda datos, usuarios y archivos, y la PWA funciona offline con IndexedDB.

Cloudflare debe encargarse del frontend y de la API. No usar NestJS para el backend salvo que el usuario lo pida explícitamente en el futuro.

## Arquitectura Recomendada Para Cloudflare

```text
┌─────────────────────────────────────────────┐
│                Cloudflare                   │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ Cloudflare Pages / Workers Assets      │  │
│  │ React + Vite + PWA                     │  │
│  │ - Web pública                          │  │
│  │ - Juego web                            │  │
│  │ - Panel CMS                            │  │
│  │ - Instalación móvil como PWA           │  │
│  └───────────────────────────────────────┘  │
│                     ↓                       │
│  ┌───────────────────────────────────────┐  │
│  │ Cloudflare Worker                     │  │
│  │ Hono API                              │  │
│  │ - Auth middleware                     │  │
│  │ - Roles                               │  │
│  │ - Contenido                           │  │
│  │ - Progreso                            │  │
│  │ - Gamificación                        │  │
│  │ - Sync offline                        │  │
│  │ - CMS                                 │  │
│  └───────────────────────────────────────┘  │
│                     ↓                       │
└─────────────────────↓───────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│                 Supabase                    │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ PostgreSQL                            │  │
│  │ - usuarios_perfil                     │  │
│  │ - temas                               │  │
│  │ - pasos_crecer                        │  │
│  │ - actividades                         │  │
│  │ - progreso                            │  │
│  │ - eventos_sync                        │  │
│  │ - insignias                           │  │
│  │ - clubes                              │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ Supabase Auth                         │  │
│  │ - Google                              │  │
│  │ - Facebook                            │  │
│  │ - invitado local                      │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ Supabase Storage                      │  │
│  │ - imágenes                            │  │
│  │ - audios                              │  │
│  │ - videos                              │  │
│  │ - tarjetas de logros                  │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

## Monorepo Recomendado

```text
semillas/
├─ apps/
│  ├─ web/                  # React PWA: fanpage + juego + CMS
│  └─ api/                  # Hono API para Cloudflare Workers
│
├─ packages/
│  ├─ db/                   # tipos, queries, esquemas
│  ├─ shared/               # zod schemas, DTOs, tipos comunes
│  ├─ ui/                   # componentes compartidos
│  ├─ offline/              # lógica IndexedDB, sync, outbox
│  └─ content-engine/       # motor CRECER, actividades, gamificación
│
├─ docs/
│  ├─ arquitectura.md
│  ├─ api.md
│  ├─ cms.md
│  ├─ offline-sync.md
│  ├─ manual-admin.md
│  └─ manual-usuario.md
│
├─ supabase/
│  ├─ migrations/
│  ├─ seed.sql
│  └─ policies.sql
│
├─ .github/
│  └─ workflows/
│     ├─ ci.yml
│     └─ deploy.yml
│
├─ package.json
├─ bun.lock
├─ turbo.json
├─ biome.json
└─ README.md
```

## Decisión De Producto

Debe ser una sola React PWA responsive, no dos aplicaciones separadas.

```text
/                  # fanpage pública
/app               # juego
/admin             # CMS
/login             # autenticación
/offline           # pantalla sin conexión
/clubes            # social ligero
/perfil            # perfil
```

La misma PWA se instala en Android, iOS y escritorio. El CMS se oculta por rol, no por aplicación separada.

## Arquitectura Frontend

El frontend debe organizarse por módulos de negocio, no por carpetas genéricas gigantes.

```text
apps/web/src/
├── app/
├── shared/
├── db/
├── sync/
├── modules/
│   ├── landing/
│   ├── auth/
│   ├── perfil/
│   ├── sendas/
│   ├── temas/
│   ├── crecer/
│   ├── actividades/
│   ├── progreso/
│   ├── gamificacion/
│   ├── cms/
│   ├── media/
│   ├── clubes/
│   └── admin/
├── pwa/
├── styles/
└── main.tsx
```

Cada módulo debe tener, cuando aplique:

```text
pages/
components/
<modulo>.schema.ts
<modulo>.types.ts
<modulo>.repository.ts
```

## Backend Con Hono

El backend no debe ser solo una pasarela a Supabase. Debe controlar reglas de negocio, autorización, validación, publicación, progreso, gamificación, sincronización y auditoría.

Responsabilidades principales:

```text
- Autenticación.
- Autorización por rol.
- Validación con Zod.
- Publicación de contenido.
- Flujo borrador/revisión/publicado.
- Progreso.
- XP, niveles, insignias y rachas.
- Sincronización offline.
- Protección de menores.
- Auditoría.
- Integración con Supabase Postgres/Auth/Storage.
```

Estructura sugerida:

```text
apps/api/src/
├─ index.ts
├─ env.ts
├─ middleware/
│  ├─ auth.middleware.ts
│  ├─ autorizacion.middleware.ts
│  ├─ error.middleware.ts
│  └─ rate-limit.middleware.ts
│
├─ modules/
│  ├─ auth/
│  ├─ profiles/
│  ├─ content/
│  ├─ crecer/
│  ├─ activities/
│  ├─ progress/
│  ├─ gamification/
│  ├─ sync/
│  ├─ cms/
│  ├─ media/
│  ├─ clubs/
│  └─ admin/
│
├─ shared/
│  ├─ result.ts
│  ├─ errors.ts
│  ├─ pagination.ts
│  └─ dates.ts
│
└─ clients/
   ├─ supabase-admin.client.ts
   └─ storage.client.ts
```

Las rutas Hono deben ser delgadas: validar con Zod, llamar caso de uso o servicio, responder con formato consistente.

Respuesta estándar:

```ts
{ exito: true, datos: unknown, meta?: unknown }
{ exito: false, error: string, codigo?: string, detalle?: unknown }
```

Rutas principales:

```text
GET    /health

POST   /autenticacion/invitado
GET    /perfil
PATCH  /perfil/actualizar

GET    /catalogo/grupos-etarios
GET    /sendas
GET    /temas
GET    /temas?senda_id=SENDA_ID
GET    /temas/:tema_id
GET    /temas/:tema_id/pasos
GET    /temas/:tema_id/pasos?grupo_edad_id=GRUPO_EDAD_ID
GET    /temas/:tema_id/actividades
GET    /temas/:tema_id/actividades?grupo_edad_id=GRUPO_EDAD_ID
GET    /actividades/:actividad_id
POST   /actividades/:actividad_id/responder

POST   /progreso/eventos
GET    /progreso/mi

POST   /sync/push
GET    /sync/pull?since=...

POST   /administracion/temas
PATCH  /administracion/temas/:tema_id
POST   /administracion/temas/:tema_id/pasos
PATCH  /administracion/temas/:tema_id/pasos/:paso_id
POST   /administracion/temas/:tema_id/publicar
POST   /administracion/actividades

GET    /administracion/resumen
GET    /administracion/usuarios
GET    /administracion/reportes/contenido
GET    /administracion/reportes/progreso

POST   /clubes
POST   /clubes/unirse
GET    /clubes/:id/clasificacion
POST   /clubes/:id/retos
```

## Supabase

Supabase debe usarse como infraestructura, no como reemplazo de las reglas de negocio del backend.

Servicios a usar:

```text
- Postgres como base principal.
- Auth para Google, Facebook y usuario registrado.
- Storage para imágenes, audios, videos y tarjetas de logros.
- RLS como segunda capa de seguridad, no como única autorización.
```

Tablas principales sugeridas:

```text
usuarios_perfil
sendas
temas
momentos_crecer
actividades
progreso_usuario
eventos_progreso
media_assets
insignias
usuario_insignias
rachas_usuario
clubes
club_miembros
retos_cooperativos
reto_aportes
auditoria_admin
```

La tabla más importante para sincronización es `eventos_progreso`. Cada evento enviado desde el cliente debe poder procesarse de forma segura e idempotente.

Ejemplo de evento idempotente:

```json
{
  "evento_id_cliente": "uuid-local",
  "tipo_evento": "activity_completed",
  "tema_id": "...",
  "actividad_id": "...",
  "puntaje": 80,
  "xp_otorgada": 15,
  "creado_en_cliente": "2026-07-04T00:00:00.000Z"
}
```

El backend debe revisar si `eventId` ya existe. Si ya existe, no duplica XP, progreso, rachas ni insignias.

## Metodología CRECER

Cada tema se estructura en seis momentos:

```text
C - Conectar
R - Relatar
E - Enseñar
C - Comprobar
E - Experimentar
R - Recompensar
```

Franjas:

```text
Semillas      5-8
Exploradores  9-12
Embajadores   13-17
```

Sendas:

```text
Padre
Hijo
Espíritu Santo
```

No guardar edad exacta. Guardar solo franja.

## Reglas De Código

- Usar TypeScript estricto.
- Evitar `any`.
- Preferir tipos explícitos para entidades de negocio.
- Validar formularios y endpoints con Zod.
- Manejar formularios con React Hook Form.
- Guardar datos locales con Dexie.
- No acceder a IndexedDB directamente desde componentes grandes.
- Usar repositories para operaciones de datos.
- No mezclar lógica de negocio compleja dentro del JSX.
- Crear componentes reutilizables en `packages/ui` o `shared/components`.
- Mantener pantallas simples y mobile-first.
- No crear abstracciones innecesarias.
- No crear carpetas vacías sin propósito.
- Priorizar librerías compatibles con Web Standards para Cloudflare Workers.

## Offline-First

La app debe funcionar sin internet.

Regla principal: la interfaz siempre debe leer y escribir primero en IndexedDB usando Dexie.

Base local IndexedDB:

```text
semillas_local_db
├─ downloaded_topics
├─ topic_assets
├─ local_progress
├─ pending_events
├─ sync_state
├─ profile_cache
└─ app_settings
```

Flujo obligatorio:

```text
1. Usuario descarga un tema.
2. Se guarda contenido en IndexedDB.
3. Se cachean imágenes/audio/video si aplica.
4. Usuario juega sin internet.
5. Cada acción crea un evento local.
6. El evento entra a pending_events.
7. Cuando vuelve internet, se llama POST /sync/push.
8. Hono API procesa eventos idempotentes.
9. Frontend llama GET /sync/pull.
10. Se actualiza el estado local.
```

Estados visuales requeridos:

```text
Sincronizado
Pendiente
Falló
Reintentando
Requiere revisión
```

Toda entidad sincronizable debe tener:

```ts
localId: string;
serverId?: string;
createdAt: string;
updatedAt: string;
deletedAt?: string | null;
syncStatus: "synced" | "pending" | "error";
```

No depender de `serverId` para relaciones internas del frontend. Usar siempre `localId`.

## CMS

El CMS no debe ser una tabla gigante. Debe guiar al administrador paso a paso usando CRECER.

Rutas del CMS:

```text
/admin
/admin/temas
/admin/temas/nuevo
/admin/temas/:id/editar
/admin/temas/:id/preview
/admin/temas/:id/revision
/admin/media
/admin/usuarios
/admin/reportes
/admin/configuracion
```

Formulario guiado:

```text
Paso 1: Información general
- Título
- Senda: Padre, Hijo, Espíritu Santo
- Cita bíblica
- Versión bíblica
- Estado inicial: borrador

Paso 2: Segmentos por edad
- Semillas 5-8
- Exploradores 9-12
- Embajadores 13-17

Paso 3: CRECER por cada franja
- Conectar
- Relatar
- Enseñar
- Comprobar
- Experimentar
- Recompensar

Paso 4: Actividades
- Quiz
- Flashcards
- Completar versículo

Paso 5: Media
- Imagen
- Audio
- Video

Paso 6: Vista previa
- Ver como niño 5-8
- Ver como preadolescente 9-12
- Ver como adolescente 13-17

Paso 7: Enviar a revisión
```

Estados del contenido:

```text
borrador → revisión → publicado → archivado
```

Nadie publica directamente mientras edita. Publicar debe ser una acción humana, registrada en auditoría.

Antes de publicar, validar:

- Tiene título.
- Tiene senda.
- Tiene cita bíblica.
- Tiene al menos una franja marcada como disponible.
- Cada franja publicada tiene los seis momentos CRECER.
- Tiene al menos una actividad.
- El versículo clave existe.
- Las respuestas correctas están configuradas.
- Las imágenes/audio/video no exceden tamaño permitido.
- No hay HTML peligroso.

Para simplificar, preferir Markdown antes que editor rico complejo. Menos errores, más fácil de sanitizar.

## Seguridad

Como es para menores, la seguridad es parte del núcleo.

Reglas mínimas:

- No guardar edad exacta.
- Guardar solo franja.
- No chat libre.
- No publicidad.
- No tracking comercial.
- No exponer nombres reales.
- Usar apodo.
- Moderar clubes.
- Compartir logros sin datos personales.
- Validar todo en backend.
- Usar HTTPS.
- Variables de entorno, nunca secretos en GitHub.

Auth:

```text
Google
Facebook
Email opcional futuro
Invitado local
```

Roles:

```text
admin
usuario
invitado
moderador opcional
```

En backend usar middleware como `requireAuth()`, `requireRole("admin")` y `requireContentOwner()`. No confiar en ocultar botones en React.

## IA

La IA puede acelerar contenido y desarrollo, pero no debe publicar sola.

Usos permitidos:

- Adaptar lecciones a 5-8, 9-12 y 13-17.
- Crear preguntas de quiz.
- Crear flashcards.
- Crear preguntas de reflexión.
- Crear resúmenes.
- Revisar tono infantil.
- Convertir una lección a formato CRECER.
- Generar schemas Zod, tests, mocks y documentación.

Flujo recomendado:

```text
1. Administrador escribe o sube idea base del tema.
2. IA propone estructura CRECER.
3. IA adapta por franja.
4. IA genera actividades.
5. Humano revisa doctrina, lenguaje y edad.
6. Humano aprueba.
7. Se publica.
```

IA dentro del sistema solo como CMS asistido por IA para administradores. La IA genera borrador, no contenido publicado.

## Diseño Visual

La app debe ser mobile-first.

Paleta base:

```text
Verde Brote: #2E9E5B
Dorado Semilla: #F4B740
Coral Alegría: #EE6C4D
Verde Profundo: #123B2C
Crema Fondo: #F7F4EC
```

Sendas:

```text
Padre: Azul Cielo #3D8BD4
Hijo: Ámbar Luz #E9A23B
Espíritu: Verde Vida #17A398
```

Usar tarjetas claras, bordes redondeados, botones grandes, texto legible, estados de sync visibles y animaciones moderadas.

Barra inferior móvil sugerida:

```text
Inicio | Sendas | Progreso | Clubes | Perfil
```

## Componentes Compartidos

Crear componentes reutilizables:

```text
Button
Input
Select
Textarea
Card
PageHeader
StatusBadge
SyncStatusBadge
OfflineBanner
BottomNav
Sidebar
ConfirmDialog
EmptyState
XPBadge
LevelProgress
StreakBadge
InsigniaCard
```

No duplicar estilos de botones o inputs en cada pantalla.

## Módulos Del Proyecto

```text
Módulo 1: Diseño, marca y sistema UI
Módulo 2: Auth y perfiles
Módulo 3: Contenido y motor CRECER
Módulo 4: Actividades
Módulo 5: Gamificación
Módulo 6: Offline y sincronización
Módulo 7: CMS
Módulo 8: Backend API Hono
Módulo 9: Clubes y social ligero
Módulo 10: QA, DevOps y despliegue
```

El offline y el backend deben empezar desde la primera semana porque desbloquean al resto.

## Funcionalidades Mínimas

Núcleo obligatorio:

- Fanpage pública.
- Login Google/Facebook.
- Modo invitado.
- Onboarding por franja.
- Ver sendas.
- Ver temas.
- Recorrer CRECER.
- Resolver quiz.
- Ganar XP.
- Ver perfil/progreso.
- CMS crea tema.
- CMS publica tema.
- Tema publicado aparece en juego.
- Descargar tema offline.
- Jugar tema offline.
- Sincronizar progreso al volver internet.
- Roles admin/usuario/invitado.

Extra deseable:

- Flashcards.
- Completar versículo.
- Rachas.
- Insignias.
- Clubes.
- Ranking.
- Retos cooperativos.
- Compartir logro como imagen.
- IA para generar borradores.

No intentar en primera versión:

- Multijugador tiempo real.
- Chat libre.
- IA automática para niños.
- Kichwa.
- Editor visual demasiado complejo.
- App nativa separada.

## Deploy

Opción recomendada para equipos:

```text
semillas.pages.dev          → React PWA
api.semillas.workers.dev    → Hono API
Supabase                    → Postgres + Auth + Storage
```

Opción full-stack:

```text
semillas.org
├─ /          → React SPA
└─ /api/*     → Hono API
```

Para un proyecto universitario con muchos estudiantes, preferir frontend separado + API separada porque divide responsabilidades.

## Flujo De Desarrollo

Ramas:

```text
main
develop
feature/auth
feature/cms
feature/offline-sync
feature/gamificacion
fix/...
```

Todo entra por Pull Request.

Cada PR debe cumplir:

- Typecheck pasa.
- Lint pasa.
- Tests pasan.
- No rompe build.
- Tiene captura o video si cambia UI.
- Tiene descripción clara.

CI básico:

```text
bun install
bun run lint
bun run typecheck
bun run test
bun run build
```

Deploy:

```text
main → producción
pull request → preview automático
```

## PWA

Configurar `vite-plugin-pwa`.

La PWA debe:

- Abrir sin internet.
- Cachear archivos estáticos.
- Mostrar aviso cuando esté lista offline.
- Actualizarse automáticamente cuando haya nueva versión.
- Instalarse en Android, iOS y escritorio.

El service worker no reemplaza IndexedDB. El service worker sirve para abrir la app sin internet. IndexedDB guarda datos reales.

## Calidad Antes De Terminar

Antes de considerar una tarea terminada:

1. Ejecutar `bun run check`.
2. Ejecutar `bun run build`.
3. Revisar que no se haya usado npm, pnpm ni yarn.
4. Revisar que no se haya roto la estructura modular.
5. Revisar que la funcionalidad siga funcionando offline si toca contenido, progreso, actividades o sync.
6. Revisar que no haya secretos en Git.

## Documentación Requerida

```text
README principal
Manual de instalación
Manual de usuario
Manual de administrador
Documento de arquitectura
Documento de API
Documento de base de datos
Documento de sincronización offline
Documento de seguridad
Documento de pruebas
Documento de despliegue
Backups SQL
.env.example
```

## Forma De Trabajar

Antes de modificar muchos archivos:

1. Leer la estructura del proyecto.
2. Explicar brevemente el plan.
3. Hacer cambios pequeños y coherentes.
4. No reescribir todo si no es necesario.
5. Mantener compatibilidad con la arquitectura existente.
6. Priorizar simplicidad sobre complejidad.

## Decisión Final De Stack

```text
Cloudflare:
- Workers para API Hono
- Pages o Workers Assets para React PWA
- Turnstile opcional
- KV opcional para config pública

Supabase:
- Postgres
- Auth
- Storage
- RLS como segunda capa

Frontend:
- React
- Vite
- TypeScript
- TanStack Router
- TanStack Query
- Dexie
- Zustand
- React Hook Form
- Zod
- shadcn/ui
- Tailwind
- vite-plugin-pwa

Backend:
- Hono
- Zod
- Supabase JS
- Middleware de autenticación y autorización
- Sync service
- Gamification service

IA:
- Solo en CMS para generar borradores
- Nunca publicación automática
- Revisión humana obligatoria
```
