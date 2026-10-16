# Media y Supabase Storage

Esta guía documenta el flujo actual para subir, validar, consultar y eliminar imágenes y otros recursos multimedia en Semillas.

## Objetivo

El módulo de media permite que el CMS suba recursos a Supabase Storage sin exponer archivos de forma pública permanente.

Se usa para:

- Portadas de temas.
- Imágenes de contenido CRECER.
- Audios o videos educativos.
- Documentos PDF, solo si son realmente necesarios.

## Diseño Actual

```text
Frontend CMS
   ↓ multipart/form-data
Hono API /media/subir
   ↓ service role controlado por backend
Supabase Storage bucket privado: media
   ↓ metadatos
Postgres: recurso_multimedia
```

El bucket `media` es privado. El frontend no debe asumir que `url_publica` es una URL accesible de forma permanente.

Para mostrar o previsualizar un recurso privado se usa una URL firmada temporal:

```text
GET /media/:id/url → { url, expira_en_segundos }
```

## Archivos Relevantes

| Archivo | Uso |
|---------|-----|
| `backend/src/modules/media/media.routes.ts` | Endpoints backend de upload, metadata, URL firmada y delete. |
| `backend/src/modules/media/media.schemas.ts` | Schema Zod para crear recursos multimedia. |
| `backend/src/modules/media/media.routes.test.ts` | Pruebas de seguridad y Storage. |
| `frontend/src/features/media/media.api.ts` | Cliente frontend para consumir endpoints de media. |
| `frontend/src/shared/api/api.ts` | Rutas API compartidas. |
| `semilla_base.sql` | Tabla `recurso_multimedia`, bucket `media`, RLS y policies. |
| `backend/src/openapi/spec.ts` | Contrato OpenAPI. |

## Modelo de Datos

Tabla: `recurso_multimedia`

Campos importantes:

| Campo | Descripción |
|-------|-------------|
| `id` | UUID del recurso. |
| `tipo` | `imagen`, `audio`, `video`, `documento`. |
| `bucket_almacenamiento` | Bucket de Supabase Storage. Actualmente `media`. |
| `clave_almacenamiento` | Ruta interna del objeto dentro del bucket. |
| `url_publica` | URL de Storage asociada. No debe tratarse como acceso público permanente. |
| `texto_alternativo` | Texto accesible para imágenes. |
| `titulo` | Nombre saneado del archivo. |
| `tipo_mime` | MIME validado. |
| `tamano_bytes` | Tamaño del archivo. |
| `creado_por` | Usuario administrador que subió el recurso. |
| `activo` | `true` si el recurso puede usarse; `false` si fue eliminado lógicamente. |
| `creado_en` | Fecha de creación. |
| `actualizado_en` | Última actualización. |

## Configuración SQL

`semilla_base.sql` configura:

- Columnas idempotentes para bases nuevas y existentes.
- Índices para `tipo`, `activo` y `creado_por`.
- Bucket privado `media`.
- Límite máximo global de Storage de `50 MB`.
- MIME allowlist en `storage.buckets`.
- RLS en `recurso_multimedia`.
- Policies administrativas para `recurso_multimedia` y `storage.objects`.

Punto importante: `usuario_app.id_externo` es `text`, por eso las policies comparan contra `auth.uid()::text`.

### Obtener URL Firmada de Portada de Tema (público)

```http
GET /temas/:id/portada
```

No requiere autenticación. Devuelve una URL firmada de 300 segundos para mostrar la portada del tema aunque el bucket sea privado.

```json
{
  "exito": true,
  "datos": {
    "url": "https://...signed...",
    "expira_en_segundos": 300
  }
}
```

Uso frontend:

```ts
import { obtenerUrlPortadaTema } from "frontend/src/features/themes/themes.api";

const { url } = await obtenerUrlPortadaTema(tema.id);
```

Reglas:

- Cachear la URL en cliente solo durante la sesión actual.
- Si expira, volver a llamar al endpoint.
- La URL apunta al bucket privado; no debe persistirse.

## Endpoints Backend

### Subir Recurso

```http
POST /media/subir
Authorization: Bearer <supabase_access_token>
Content-Type: multipart/form-data
```

También funciona con `X-Guest-User-Id` en desarrollo, pero las rutas de media requieren rol `administrador`.

Campos multipart:

| Campo | Requerido | Descripción |
|-------|-----------|-------------|
| `archivo` | Sí | Binario del archivo. |
| `tipo` | Sí | `imagen`, `audio`, `video` o `documento`. |
| `texto_alternativo` | No | Descripción accesible. Máximo 300 caracteres. |

Ejemplo frontend:

```ts
import { subirArchivo } from "frontend/src/features/media/media.api";

const recurso = await subirArchivo(file, "imagen", "Portada del tema La Creación");
```

Respuesta:

```json
{
  "exito": true,
  "datos": {
    "id": "550e8400-e29b-41d4-a716-446655440099",
    "tipo": "imagen",
    "bucket_almacenamiento": "media",
    "clave_almacenamiento": "imagen/usuario/recurso.png",
    "url_publica": "https://...",
    "texto_alternativo": "Portada del tema La Creación",
    "titulo": "portada.png",
    "tipo_mime": "image/png",
    "tamano_bytes": 102400,
    "activo": true
  }
}
```

### Obtener Metadatos

```http
GET /media/:id
```

Devuelve solo recursos activos.

Uso frontend:

```ts
import { obtenerRecursoMultimedia } from "frontend/src/features/media/media.api";

const recurso = await obtenerRecursoMultimedia(id);
```

### Obtener URL Firmada

```http
GET /media/:id/url
Authorization: Bearer <supabase_access_token>
```

Requiere rol `administrador`.

Devuelve una URL firmada temporal para previsualizar o descargar el recurso desde el bucket privado.

Uso frontend:

```ts
import { obtenerUrlFirmadaRecurso } from "frontend/src/features/media/media.api";

const { url, expira_en_segundos } = await obtenerUrlFirmadaRecurso(recurso.id);
```

Respuesta:

```json
{
  "exito": true,
  "datos": {
    "url": "https://...signed...",
    "expira_en_segundos": 300
  }
}
```

Reglas:

- No guardar esta URL en Postgres.
- No cachearla como si fuera permanente.
- Si expira, solicitar una nueva.

### Eliminar Recurso

```http
DELETE /media/:id
Authorization: Bearer <supabase_access_token>
```

Requiere rol `administrador`.

Efectos:

- Elimina el objeto físico de Supabase Storage cuando existe `clave_almacenamiento`.
- Marca `recurso_multimedia.activo = false`.
- Actualiza `actualizado_en`.

Uso frontend:

```ts
import { eliminarRecursoMultimedia } from "frontend/src/features/media/media.api";

await eliminarRecursoMultimedia(recurso.id);
```

## Validaciones de Seguridad

La API valida antes de subir:

| Tipo | MIME permitido | Extensiones | Tamaño máximo | Firma binaria |
|------|----------------|-------------|---------------|---------------|
| Imagen | `image/jpeg`, `image/png`, `image/webp` | `.jpg`, `.jpeg`, `.png`, `.webp` | 5 MB | Sí |
| Audio | `audio/mpeg`, `audio/mp3`, `audio/aac`, `audio/ogg`, `audio/webm` | `.mp3`, `.aac`, `.ogg`, `.webm` | 20 MB | No todavía |
| Video | `video/mp4`, `video/webm` | `.mp4`, `.webm` | 50 MB | No todavía |
| Documento | `application/pdf` | `.pdf` | 10 MB | Sí |

Errores posibles:

| Código | Causa |
|--------|-------|
| `VALIDATION_ERROR` | Falta archivo, tipo inválido o UUID inválido. |
| `FILE_TOO_LARGE` | Archivo supera el límite por tipo. |
| `INVALID_MIME_TYPE` | MIME no permitido para el tipo declarado. |
| `INVALID_FILE_EXTENSION` | Extensión no permitida. |
| `INVALID_FILE_SIGNATURE` | Firma binaria no coincide con el MIME. |
| `STORAGE_ERROR` | Fallo de Supabase Storage. |
| `DB_ERROR` | Fallo al registrar metadata. |

## Flujo Recomendado en CMS

1. Admin selecciona archivo en formulario.
2. Frontend llama `subirArchivo(...)`.
3. Backend valida y sube a Storage privado.
4. Backend crea `recurso_multimedia`.
5. CMS guarda `recurso.id` en `portada_recurso_id` o en el contenido correspondiente.
6. Para preview, frontend llama `obtenerUrlFirmadaRecurso(recurso.id)`.
7. UI usa `url` temporal para mostrar imagen/audio/video.
8. Si el admin elimina el recurso, frontend llama `eliminarRecursoMultimedia(id)`.

## Ejemplo de Preview de Imagen

```tsx
import { useEffect, useState } from "react";
import { obtenerUrlFirmadaRecurso } from "frontend/src/features/media/media.api";

export function PreviewImagen({ recursoId, alt }: { recursoId: string; alt: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;

    obtenerUrlFirmadaRecurso(recursoId).then((respuesta) => {
      if (activo) setUrl(respuesta.url);
    });

    return () => {
      activo = false;
    };
  }, [recursoId]);

  if (!url) return <span>Cargando imagen...</span>;

  return <img src={url} alt={alt} />;
}
```

## Comandos de Verificación

```bash
bun run --cwd backend test
bun run --cwd backend typecheck
bun run check
```

`bun run check` ejecuta:

- Typecheck backend.
- Tests backend.
- E2E backend si existen specs.
- Build frontend.
- Typecheck backend como build.

## Aplicar Cambios en Supabase

Para una base nueva o existente, ejecutar `semilla_base.sql` actualizado.

Si la tabla `recurso_multimedia` ya existe, el SQL es idempotente y agrega columnas faltantes con `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.

Si Supabase muestra errores al ejecutar SQL:

- Copiar el error exacto.
- Revisar la línea indicada.
- Verificar si la base existente difiere del schema raíz.

## Riesgos Pendientes

Pendientes recomendados antes de producción:

- Remover EXIF y metadatos de imágenes.
- Re-encodear imágenes a un formato seguro.
- Agregar rate limiting a `POST /media/subir` y `GET /media/:id/url`.
- Registrar auditoría administrativa en uploads, URLs firmadas y deletes.
- Definir flujo de publicación: privado en CMS, público o servido con signed URLs para usuarios finales.
- Evitar admins autenticados solo por `X-Guest-User-Id` en producción.

## Decisiones Tomadas

- El bucket `media` es privado por defecto.
- Las URLs firmadas duran 300 segundos.
- `DELETE /media/:id` elimina el objeto físico y marca metadata como inactiva.
- La API backend usa service role, pero la autorización real se aplica con `authMiddleware` y `requireRole("administrador")`.
- Las policies SQL existen como segunda capa para accesos directos desde Supabase.
