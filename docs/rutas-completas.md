# Rutas del Proyecto Semillas

Listado completo de todas las pantallas/rutas, tanto existentes como faltantes.

---

## Rutas Públicas

| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/` | ✅ Existe | Landing page pública |
| `/login` | ✅ Existe | Login con Google, correo, invitado |
| `/onboarding` | ✅ Existe | Parent del onboarding |
| `/onboarding/` | ✅ Existe | Selección de franja etaria |
| `/onboarding/customize` | ✅ Existe | Personalización de avatar |
| `/recuperar-contrasena` | ❌ Falta | Recuperación de contraseña |
| `/restablecer-contrasena` | ❌ Falta | Restablecer con token |
| `/verificar-correo` | ❌ Falta | Verificación de email |
| `/404` | ❌ Falta | Página no encontrada |
| `/acceso-denegado` | ❌ Falta | Acceso denegado |

---

## Rutas de Usuario (`/app`)

### Home y Navegación

| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/app/` | ⚠️ Incompleto | Home del usuario (falta racha real, XP real, continue learning) |
| `/app/perfil` | ⚠️ Parcial | Muestra perfil pero no permite editar |
| `/app/ajustes` | ❌ Falta | Tamaño texto, audio, notificaciones, contraste, cerrar sesión |

### Temas y CRECER

| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/app/temas/` | ✅ Existe | Listado de temas disponibles |
| `/app/temas/$themeId` | ✅ Existe | Detalle/overview del tema |
| `/app/C_conectar/$themeId` | ✅ Existe | Paso CRECER: Conectar |
| `/app/R_relatar/$themeId` | ✅ Existe | Paso CRECER: Relatar |
| `/app/E_ensenar/$themeId` | ✅ Existe | Paso CRECER: Enseñar |
| `/app/C_comprobar/$themeId` | ✅ Existe | Paso CRECER: Comprobar (quiz) |
| `/app/E_experimentar/$themeId` | ✅ Existe | Paso CRECER: Experimentar |
| `/app/R_recompensar/$themeId` | ✅ Existe | Paso CRECER: Recompensar |

### Actividades

| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/app/actividades/$activityId` | ✅ Existe | Actividad individual (quiz, flashcards, etc.) |

### Descargas y Offline

| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/app/descargas` | ❌ Simulado | Usa catálogo fijo, no Dexie real |
| `/app/descargas/$temaId` | ❌ Falta | Detalle de paquete descargado |
| `/app/sincronizacion` | ❌ Falta | Centro de sincronización offline |

### Gamificación

| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/app/logros` | ⚠️ Parcial | Catálogo fijo en frontend, no viene de API |

### Clubes

| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/app/clubes` | ⚠️ Parcial | Solo muestra el primer club, no permite cambiar |
| `/app/clubes/explorar` | ❌ Falta | Ver todos los clubes disponibles |
| `/app/clubes/mios` | ❌ Falta | Listado de mis clubes |
| `/app/clubes/crear` | ❌ Falta | Formulario para crear club |
| `/app/clubes/$clubId` | ❌ Falta | Detalle de club con pestañas |
| `/app/clubes/$clubId/retos/$retoId` | ❌ Falta | Detalle de reto cooperativo |

### Contenido Complementario

| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/app/biblioteca` | ❌ Falta | Versículos guardados, favoritos, recursos |
| `/app/historial` | ❌ Falta | Historial de actividades realizadas |
| `/app/notificaciones` | ❌ Falta | Centro de notificaciones |

---

## Rutas de Administración (`/admin`)

### Dashboard y Navegación

| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/admin/` | ✅ Existe | Dashboard admin |
| `/admin-required` | ✅ Existe | Pantalla de acceso denegado |

### Usuarios

| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/admin/usuarios` | ✅ Existe | Tabla de usuarios |
| `/admin/usuarios/$usuarioId` | ❌ Falta | Detalle de usuario |
| `/admin/usuarios/new` | ❌ Falta | Crear usuario |
| `/admin/usuarios/$usuarioId/edit` | ❌ Falta | Editar usuario |

### Temas (CMS)

| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/admin/temas` | ✅ Existe | Listado de temas |
| `/admin/temas/new` | ✅ Existe | Nuevo tema |
| `/admin/temas/$themeId/detalle` | ✅ Existe | Detalle del tema |
| `/admin/temas/$themeId/edit` | ✅ Existe | Editar información general |
| `/admin/temas/$themeId/crecer` | ✅ Existe | Editar pasos CRECER |
| `/admin/temas/$themeId/activities` | ✅ Existe | Editar actividades |
| `/admin/temas/$themeId/preview` | ✅ Existe | Vista previa del tema |

### Sendas

| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/admin/sendas` | ❌ Placeholder | Solo icono y título, sin gestión real |

### Revisión

| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/admin/revision` | ❌ Placeholder | Sin flujo de revisión (borrador→revisión→publicado) |

### Reportes

| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/admin/reportes` | ❌ Placeholder | Sin datos ni gráficos |

### Medios

| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/admin/medios` | ✅ Existe | Gestión de recursos multimedia |

### Clubes (Admin)

| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/admin/clubes` | ❌ Placeholder | Sin gestión real de clubes |

### Actividades

| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/admin/actividades` | ✅ Existe | Listado de actividades |
| `/admin/actividades/new` | ❌ Falta | Crear actividad independiente |
| `/admin/actividades/$activityId/edit` | ❌ Falta | Editar actividad |
| `/admin/actividades/$activityId/preview` | ❌ Falta | Preview de actividad |

### Ajustes (Admin)

| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/admin/ajustes` | ❌ Placeholder | Sin configuración real |

### Gamificación (Admin)

| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/admin/gamificacion` | ❌ Falta | Administrar niveles, XP, insignias |

### Catálogos (Admin)

| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/admin/catalogos` | ❌ Falta | Grupos etarios, tipos actividad, pasos CRECER, versiones bíblicas |

### Auditoría (Admin)

| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/admin/auditoria` | ❌ Falta | Log de acciones de administración |

---

## Resumen

| Categoría | Existentes | Incompletas | Placeholder | Faltan | Total |
|-----------|-----------|-------------|-------------|--------|-------|
| Públicas | 5 | 0 | 0 | 5 | 10 |
| Usuario | 10 | 4 | 0 | 9 | 23 |
| Admin | 10 | 0 | 5 | 9 | 24 |
| **Total** | **25** | **4** | **5** | **23** | **57** |

---

## Pantallas Globales Faltantes (todas las áreas)

- `/404` — Página no encontrada
- `/acceso-denegado` — Error 403 genérico
- Error boundaries por sección (app, admin, actividades, CRECER)
- Loading skeletons consistentes en todas las pantallas
- Estados vacíos para todas las listas
- Estados de error de red consistentes

---

## Notas

- Las rutas CRECER usan el formato `/app/C_conectar/$themeId` con letras mayúsculas
- Los temas y actividades usan `$themeId` y `$activityId` con camelCase
- El admin de temas tiene sub-rutas anidadas bajo `/admin/temas/`
