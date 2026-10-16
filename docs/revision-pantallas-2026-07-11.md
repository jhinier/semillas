# Revisión Completa de Pantallas — Semillas

Fecha de revisión: 2026-07-11
Total de rutas en router: 41 rutas (44 archivos de ruta)
Rutas existentes: 41 | Rutas faltantes: ~23+

---

## PÚBLICAS

### `/` — Landing Page ✅
**Archivo:** `frontend/src/routes/index.tsx`
**Descripción:** Landing pública con Navbar, HeroSection, PathsSection, FeaturesSection, ClubesSection, MethodologySection, Footer.
**Estado:** Implementada. Navegación con enlaces `href="#"` que deben corregirse a rutas reales.

---

### `/login` — Login ✅
**Archivo:** `frontend/src/routes/login.tsx`
**Descripción:** Login con Google, invitado y correo electrónico. LoginFormCard + LoginHeroPanel. Tabs para cambiar entre métodos.
**Estado:** Implementada. Soporta Google, Guest (invitado), y email. No tiene Facebook. No tiene recuperación de contraseña.

---

### `/onboarding` — Layout del Onboarding ✅
**Archivo:** `frontend/src/routes/onboarding.tsx`
**Descripción:** Solo un Outlet layout sin contenido propio.

---

### `/onboarding/` — Selección de Franja ✅
**Archivo:** `frontend/src/routes/onboarding.index.tsx`
**Descripción:** Paso 1: elegir franja etaria (Semillas, Exploradores, Embajadores). GrupoEdadGrid con ayuda modal.
**Estado:** Implementada. Modal de ayuda con `div` manual en vez de Radix Dialog (accesibilidad incompleta).

---

### `/onboarding/customize` — Personalizar Perfil ✅
**Archivo:** `frontend/src/routes/onboarding.customize.tsx`
**Descripción:** Paso 2: nick, avatar, preview. NicknameField + AvatarSelector + ProfilePreview.
**Estado:** Implementada. Guarda perfil via `actualizarPerfilMutation`.

---

### `/recuperar-contrasena` ❌ FALTA
**Descripción:** Solicitar recuperación por email.
**Estado:** No existe.

---

### `/restablecer-contrasena` ❌ FALTA
**Descripción:** Restablecer con token de un solo uso.
**Estado:** No existe.

---

### `/verificar-correo` ❌ FALTA
**Descripción:** Verificar email después de registro.
**Estado:** No existe.

---

### `/404` ❌ FALTA
**Descripción:** Página para rutas no encontradas.
**Estado:** No existe `notFoundComponent` global.

---

### `/acceso-denegado` — Admin Required ✅
**Archivo:** `frontend/src/routes/admin-required.tsx`
**Descripción:** Pantalla "Solo disponible en computadora" para administración móvil.
**Estado:** Implementada.

---

## APP — USUARIO

### `/app` — Layout ✅
**Archivo:** `frontend/src/routes/app.tsx`
**Descripción:** Layout con AppSidebar, AppTopbar, BottomNav, Outlet. Auth guard con redirect a login.
**Estado:** Implementada. Navegación entre tabs.

---

### `/app/` — Home ✅ INCOMPLETA
**Archivo:** `frontend/src/routes/app.index.tsx`
**Descripción:** Dashboard con banner, versículo del día, PathsGrid, RachaWidget, InsigniasWidget.
**Estado:** ⚠️ INCOMPLETA — Problemas:
- `diasRacha = 0` hardcodeado, no viene de la API
- `VERSICULOS_DEL_DIA` array local hardcodeado, no viene del CMS
- `PathsGrid` se importa pero no se renderiza (comentario en código)
- Racha real no se muestra
- XP/progreso real no se muestra
- No hay "Continuar aprendiendo" real

---

### `/app/perfil` — Perfil ⚠️ PARCIAL
**Archivo:** `frontend/src/routes/app.perfil.tsx`
**Descripción:** Muestra perfil, gamificación, progreso, vinculación de cuentas Google/correo.
**Estado:** ⚠️ Muestra datos pero NO permite editar. No llama a `actualizarPerfil()`. Botones de vincular existen pero edicion de apodo/avatar/franja no.
- `perfil?.grupo_edad_id` muestra ID en vez de nombre ("Exploradores · 9–12 años")
- No hay botón "Editar perfil"

---

### `/app/ajustes` ❌ FALTA
**Descripción:** Tamaño texto, audio, notificaciones, contraste, descargas Wi-Fi, controles parentales, cerrar sesión, desvincular cuenta.
**Estado:** No existe.

---

### `/app/logros` — Logros ⚠️ PARCIAL
**Archivo:** `frontend/src/routes/app.logros.tsx`
**Descripción:** Insignias con tabs (todas, obtenidas, bloqueo), ProgresoXpWidget, CompartirInsigniaWidget.
**Estado:** ⚠️ PARCIAL — Problemas:
- `INSIGNIAS_CATALOGO` hardcodeado en frontend (no viene de API)
- Compartir solo texto (`navigator.share` con `{title, text}`), no genera imagen de tarjeta
- No hay criterios reales ni progreso hacia insignia
- Nivel asume bloques de 1000 XP hardcodeados

---

### `/app/descargas` ❌ SIMULADO
**Archivo:** `frontend/src/routes/app.descargas.tsx`
**Descripción:** Tarjetas de recursos, filtros, StorageWidget.
**Estado:** ❌ SIMULADO — Problemas:
- `RECURSOS_CATALOGO` fijo, no usa Dexie
- `useState<string[]>(["noe", "laberinto"])` hardcodeado
- `setInterval` simula descarga
- `alert("...")` en vez de acción real
- `navigator.storage.estimate()` no se usa
- No hay detalle de paquete (`/app/descargas/$temaId`)

---

### `/app/sincronizacion` ❌ FALTA
**Descripción:** Centro de sincronización: estado conexión, última sync, eventos pendientes, fallidos, botón sincronizar, espacio.
**Estado:** No existe.

---

### `/app/temas/` — Listado de Temas ✅
**Archivo:** `frontend/src/routes/app.temas.index.tsx`
**Descripción:** Filtros por sendas, tabs (todos, en progreso, completados), búsqueda, tarjetas CardLeccion, ResumenTemasCard, ContinuarAprendiendoCard.
**Estado:** Implementada. Conexión a API real.

---

### `/app/temas/$themeId` — Detalle de Tema ✅
**Archivo:** `frontend/src/routes/app.temas.$themeId.tsx`
**Descripción:** Overview con título, resumen, stats (XP, duración), progreso, portada, botón Iniciar/Reanudar.
**Estado:** Implementada.

---

### `/app/C_conectar/$themeId` — CRECER: Conectar ✅
**Archivo:** `frontend/src/routes/app.C_conectar.$themeId.tsx`
**Descripción:** Fase 1 del CRECER. CrecerLayout con contenido del paso, actividades, navegación.
**Estado:** Implementada.

---

### `/app/R_relatar/$themeId` — CRECER: Relatar ✅
**Archivo:** `frontend/src/routes/app.R_relatar.$themeId.tsx`
**Descripción:** Fase 2 del CRECER. Imagen, contenido, actividades tipo cuestionario, botones siguiente/anterior.
**Estado:** Implementada. Diferente implementación que Conectar (no usa CrecerLayout).

---

### `/app/E_ensenar/$themeId` — CRECER: Enseñar ✅
**Archivo:** `frontend/src/routes/app.E_ensenar.$themeId.tsx`
**Descripción:** Fase 3 del CRECER. Similar a Relatar.
**Estado:** Implementada.

---

### `/app/C_comprobar/$themeId` — CRECER: Comprobar ✅
**Archivo:** `frontend/src/routes/app.C_comprobar.$themeId.tsx`
**Descripción:** Fase 4 del CRECER. Usa ActividadWrapper para mostrar actividades con interactividad.
**Estado:** Implementada.

---

### `/app/E_experimentar/$themeId` — CRECER: Experimentar ✅
**Archivo:** `frontend/src/routes/app.E_experimentar.$themeId.tsx`
**Descripción:** Fase 5 del CRECER. Preguntas de reflexión y actividades.
**Estado:** Implementada.

---

### `/app/R_recompensar/$themeId` — CRECER: Recompensar ✅
**Archivo:** `frontend/src/routes/app.R_recompensar.$themeId.tsx`
**Descripción:** Fase 6 del CRECER. Confetti, insignia, mensaje de felicidades.
**Estado:** Implementada. Muestra confetti y mensaje pero NO otorga insignia real (no hay lógica de logro en backend).

---

### `/app/actividades/$activityId` — Actividad ✅
**Archivo:** `frontend/src/routes/app.actividades.$activityId.tsx`
**Descripción:** Actividad individual (quiz). Muestra opciones, feedback, correcta/incorrecta, XP.
**Estado:** Implementada. Solo soporta tipo cuestionario (single choice visible en el código).

---

### `/app/clubes` — Clubes ⚠️ PARCIAL
**Archivo:** `frontend/src/routes/app.clubes.tsx`
**Descripción:** TarjetaClub, TablaRanking, Retos, UnirseClubForm, ProgresoXpWidget, ClubComparteWidget.
**Estado:** ⚠️ PARCIAL — Problemas:
- Solo muestra el primer club: `clubesQuery.data?.[0] ?? null`
- No permite cambiar de club
- No permite crear club
- No permite salir de club
- No hay detalle de club (`/app/clubes/$clubId`)
- No hay listado de todos los clubes (`/app/clubes/explorar`)
- API tiene `crearClub()`, `salirDeClub()`, `listarClubes()` pero no se usan

---

### `/app/clubes/explorar` ❌ FALTA
**Descripción:** Ver todos los clubes disponibles con filtros.
**Estado:** No existe.

---

### `/app/clubes/mios` ❌ FALTA
**Descripción:** Todos los clubes del usuario con rol, miembros, retos.
**Estado:** No existe.

---

### `/app/clubes/crear` ❌ FALTA
**Descripción:** Formulario para crear club (nombre, descripción, tipo, visibilidad, imagen).
**Estado:** No existe.

---

### `/app/clubes/$clubId` ❌ FALTA
**Descripción:** Detalle de club con pestañas: resumen, miembros, ranking, retos, actividad, invitación, configuración.
**Estado:** No existe.

---

### `/app/clubes/$clubId/retos/$retoId` ❌ FALTA
**Descripción:** Detalle de reto cooperativo: meta, progreso grupal, participantes, tiempo, XP.
**Estado:** No existe.

---

### `/app/biblioteca` ❌ FALTA
**Descripción:** Versículos guardados, temas favoritos, audios, historias, imprimibles.
**Estado:** No existe.

---

### `/app/historial` ❌ FALTA
**Descripción:** Actividades realizadas, respuestas, puntuación, XP, intentos, fecha.
**Estado:** No existe.

---

### `/app/notificaciones` ❌ FALTA
**Descripción:** Centro de notificaciones: nuevo tema, reto, insignia, invitación, descarga, error sync.
**Estado:** No existe.

---

## ADMIN

### `/admin` — Layout ✅
**Archivo:** `frontend/src/routes/admin.tsx`
**Descripción:** Layout con sidebar, topbar, auth guard que verifica rol admin.
**Estado:** Implementada.

---

### `/admin/` — Dashboard ✅
**Archivo:** `frontend/src/routes/admin.index.tsx`
**Descripción:** PanelAdministracion con estadísticas generales.
**Estado:** Implementada.

---

### `/admin/usuarios` — Usuarios ✅
**Archivo:** `frontend/src/routes/admin.usuarios.tsx`
**Descripción:** Tabla de usuarios con filtros (búsqueda, rol, franja, estado, club), resumen, paginación.
**Estado:** Implementada. Funcional con filtros.
- No tiene botón "Nuevo usuario" funcional (`onAccionPrincipal={() => {}}`)
- No tiene detalle de usuario (`/admin/usuarios/$usuarioId`)

---

### `/admin/usuarios/$usuarioId` ❌ FALTA
**Descripción:** Detalle de usuario: perfil, cuenta, progreso, logros, clubes, actividad, auditoría.
**Estado:** No existe.

---

### `/admin/temas` — Temas Listado ✅
**Archivo:** `frontend/src/routes/admin.temas.tsx`
**Descripción:** Listado con filtros, tabs por estado (todos, borrador, revisión, publicado), tabla AdminThemesTable.
**Estado:** Implementada.

---

### `/admin/temas/new` — Nuevo Tema ✅
**Archivo:** `frontend/src/routes/admin.temas.new.tsx`
**Descripción:** Formulario de creación PasoInformacionGeneral + preview + navegación.
**Estado:** Implementada.

---

### `/admin/temas/$themeId/detalle` — Detalle de Tema ✅
**Archivo:** `frontend/src/routes/admin.temas.$themeId.detalle.tsx`
**Descripción:** Stats del tema, objetivo, pasos CRECER, actividades, metadata, acciones.
**Estado:** Implementada.

---

### `/admin/temas/$themeId/edit` — Editar Tema ✅
**Archivo:** `frontend/src/routes/admin.temas.$themeId.edit.tsx`
**Descripción:** Tabs: General, Portada, Config, Publicación. Edición completa.
**Estado:** Implementada.

---

### `/admin/temas/$themeId/crecer` — Editor CRECER ✅
**Archivo:** `frontend/src/routes/admin.temas.$themeId.crecer.tsx`
**Descripción:** Selector de franja etaria, selector de paso CRECER, editor de contenido (título, cuerpo, instrucción).
**Estado:** Implementada.

---

### `/admin/temas/$themeId/activities` — Actividades del Tema ✅
**Archivo:** `frontend/src/routes/admin.temas.$themeId.activities.tsx`
**Descripción:** Listado de actividades, formulario para crear/editar con opciones.
**Estado:** Implementada. Formulario soporta tipo cuestionario con opciones.
- No tiene preview de actividad individual (`/admin/actividades/$activityId/preview`)

---

### `/admin/temas/$themeId/preview` — Preview del Tema ✅
**Archivo:** `frontend/src/routes/admin.temas.$themeId.preview.tsx`
**Descripción:** Vista previa del tema tal como lo verá el usuario.
**Estado:** Implementada.

---

### `/admin/sendas` ❌ PLACEHOLDER
**Archivo:** `frontend/src/routes/admin.sendas.tsx`
**Descripción:** Solo icono y texto "Gestión de Sendas".
**Estado:** ❌ PLACEHOLDER. Sin gestión real.

---

### `/admin/revision` ❌ PLACEHOLDER
**Archivo:** `frontend/src/routes/admin.revision.tsx`
**Descripción:** Solo icono y texto "Revisión de Contenido".
**Estado:** ❌ PLACEHOLDER. Sin flujo de revisión (borrador → revisión → publicado).

---

### `/admin/reportes` ❌ PLACEHOLDER
**Archivo:** `frontend/src/routes/admin.reportes.tsx`
**Descripción:** Solo icono y texto "Reportes".
**Estado:** ❌ PLACEHOLDER. Sin datos ni gráficos.

---

### `/admin/medios` — Gestión de Medios ✅
**Archivo:** `frontend/src/routes/admin.medios.tsx`
**Descripción:** Grid de recursos, filtros, upload, panel de detalle, eliminación.
**Estado:** Implementada. Upload funcional, panel de detalle lateral.
- No hay diálogo completo de edición de metadatos

---

### `/admin/clubes` ❌ PLACEHOLDER
**Archivo:** `frontend/src/routes/admin.clubes.tsx`
**Descripción:** Solo icono y texto "Gestión de Clubes".
**Estado:** ❌ PLACEHOLDER. Sin gestión real.

---

### `/admin/ajustes` ❌ PLACEHOLDER
**Archivo:** `frontend/src/routes/admin.ajustes.tsx`
**Descripción:** Solo icono y texto "Ajustes".
**Estado:** ❌ PLACEHOLDER. Sin configuración real.

---

### `/admin/actividades` — Actividades Global ✅
**Archivo:** `frontend/src/routes/admin.actividades.tsx`
**Descripción:** Listado global de actividades con filtros, tabs por tipo, tabla, resumen, XP widget, tips.
**Estado:** Implementada.
- No tiene pantalla de crear/editar actividad independiente (`/admin/actividades/new`, `/admin/actividades/$activityId/edit`)

---

### `/admin/gamificacion` ❌ FALTA
**Descripción:** Administrar niveles, XP, insignias, criterios, recompensas.
**Estado:** No existe. El catálogo de niveles e insignias está hardcodeado en seed.sql.

---

### `/admin/catalogos` ❌ FALTA
**Descripción:** Grupos etarios, tipos actividad, pasos CRECER, versiones bíblicas, estados, dificultades.
**Estado:** No existe.

---

### `/admin/auditoria` ❌ FALTA
**Descripción:** Log de acciones: publicaciones, eliminaciones, cambios de rol, contenido, revisión.
**Estado:** No existe. Tabla `registro_auditoria` existe en schema.

---

## RESUMEN DE ESTADO

| Ruta | Archivo | Estado |
|------|---------|--------|
| `/` | `index.tsx` |  Perfecto |
| `/login` | `login.tsx` |  Perfecto |
| `/onboarding` | `onboarding.tsx` |  Layout |
| `/onboarding/` | `onboarding.index.tsx` |  Bien |
| `/onboarding/customize` | `onboarding.customize.tsx` |  Implementada |
| `/recuperar-contrasena` | — | ❌ Falta |
| `/restablecer-contrasena` | — | ❌ Falta |
| `/verificar-correo` | — | ❌ Falta |
| `/404` | — | ❌ Falta |
| `/admin-required` | `admin-required.tsx` | ✅ Implementada |
| `/app` | `app.tsx` | ✅ Layout |
| `/app/` | `app.index.tsx` | ⚠️ Incompleta |
| `/app/perfil` | `app.perfil.tsx` | ⚠️ Parcial |
| `/app/ajustes` | — | ❌ Falta |
| `/app/logros` | `app.logros.tsx` | ⚠️ Parcial |
| `/app/descargas` | `app.descargas.tsx` | ❌ Simulado |
| `/app/sincronizacion` | — | ❌ Falta |
| `/app/temas/` | `app.temas.index.tsx` | ✅ Implementada |
| `/app/temas/$themeId` | `app.temas.$themeId.tsx` | ✅ Implementada |
| `/app/C_conectar/$themeId` | `app.C_conectar.$themeId.tsx` | ✅ Implementada |
| `/app/R_relatar/$themeId` | `app.R_relatar.$themeId.tsx` | ✅ Implementada |
| `/app/E_ensenar/$themeId` | `app.E_ensenar.$themeId.tsx` | ✅ Implementada |
| `/app/C_comprobar/$themeId` | `app.C_comprobar.$themeId.tsx` | ✅ Implementada |
| `/app/E_experimentar/$themeId` | `app.E_experimentar.$themeId.tsx` | ✅ Implementada |
| `/app/R_recompensar/$themeId` | `app.R_recompensar.$themeId.tsx` | ✅ Implementada |
| `/app/actividades/$activityId` | `app.actividades.$activityId.tsx` | ✅ Implementada |
| `/app/clubes` | `app.clubes.tsx` | ⚠️ Parcial |
| `/app/clubes/explorar` | — | ❌ Falta |
| `/app/clubes/mios` | — | ❌ Falta |
| `/app/clubes/crear` | — | ❌ Falta |
| `/app/clubes/$clubId` | — | ❌ Falta |
| `/app/clubes/$clubId/retos/$retoId` | — | ❌ Falta |
| `/app/biblioteca` | — | ❌ Falta |
| `/app/historial` | — | ❌ Falta |
| `/app/notificaciones` | — | ❌ Falta |
| `/admin` | `admin.tsx` | ✅ Layout |
| `/admin/` | `admin.index.tsx` | ✅ Dashboard |
| `/admin/usuarios` | `admin.usuarios.tsx` | ✅ Implementada |
| `/admin/usuarios/$usuarioId` | — | ❌ Falta |
| `/admin/temas` | `admin.temas.tsx` | ✅ Implementada |
| `/admin/temas/new` | `admin.temas.new.tsx` | ✅ Implementada |
| `/admin/temas/$themeId/detalle` | `admin.temas.$themeId.detalle.tsx` | ✅ Implementada |
| `/admin/temas/$themeId/edit` | `admin.temas.$themeId.edit.tsx` | ✅ Implementada |
| `/admin/temas/$themeId/crecer` | `admin.temas.$themeId.crecer.tsx` | ✅ Implementada |
| `/admin/temas/$themeId/activities` | `admin.temas.$themeId.activities.tsx` | ✅ Implementada |
| `/admin/temas/$themeId/preview` | `admin.temas.$themeId.preview.tsx` | ✅ Implementada |
| `/admin/sendas` | `admin.sendas.tsx` | ❌ Placeholder |
| `/admin/revision` | `admin.revision.tsx` | ❌ Placeholder |
| `/admin/reportes` | `admin.reportes.tsx` | ❌ Placeholder |
| `/admin/medios` | `admin.medios.tsx` | ✅ Implementada |
| `/admin/clubes` | `admin.clubes.tsx` | ❌ Placeholder |
| `/admin/ajustes` | `admin.ajustes.tsx` | ❌ Placeholder |
| `/admin/actividades` | `admin.actividades.tsx` | ✅ Implementada |
| `/admin/gamificacion` | — | ❌ Falta |
| `/admin/catalogos` | — | ❌ Falta |
| `/admin/auditoria` | — | ❌ Falta |

---

## CONTADORES

| Categoría | Total | ✅ | ⚠️ | ❌ | 🔲 |
|-----------|-------|----|----|----|-----|
| Públicas | 9 | 5 | 0 | 4 | 0 |
| App usuario | 23 | 11 | 4 | 8 | 0 |
| Admin | 18 | 10 | 0 | 5 | 3 |
| **Total** | **50** | **26** | **4** | **17** | **3** |

✅ = Implementada | ⚠️ = Parcial/Incompleta | ❌ = Falta/Simulado | 🔲 = Placeholder

---

## PROBLEMAS TRANSVERSALES

1. **Ruta 404 global** no existe
2. **ErrorBoundary** no existe por sección
3. **Loading skeletons** no son consistentes en todas las pantallas
4. **Estados vacío/error** no existen en todas las listas
5. **Carpeta duplicada**: `features/clubes` y `features/clubs` coexisten
6. **Datos hardcodeados**: versículos, insignias, días de racha, XP fijo de 1000
7. **Onboarding modal** sin Radix Dialog (accesibilidad)
8. **Navbar landing** tiene `href="#"` en producción
9. **Compartir insignia** solo texto, no imagen
10. **No hay Facebook login** aunque la docs lo menciona
