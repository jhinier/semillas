Revisando **solo el código del frontend y la carpeta `docs`**, el proyecto está avanzado, pero todavía no está al 100%. La parte más completa es el recorrido de temas/CRECER; lo más incompleto está en administración, offline real, perfil, clubes y algunas pantallas que existen solo como estructura visual.

## Estado general

Aproximadamente:

* Pantallas públicas y autenticación: **80%**
* Onboarding: **85%**
* Inicio y navegación de usuario: **70%**
* Temas y flujo CRECER: **85%**
* Actividades: **80%**
* Gamificación: **65%**
* Clubes: **55%**
* Descargas y offline: **45%**
* Perfil y ajustes: **55%**
* Administración: **60%**
* Estados globales, errores y accesibilidad: **60%**

---

# Pantallas que faltan completamente

## Área de usuario

### 1. Editar perfil

Existe `/app/perfil`, pero es principalmente una pantalla de resumen. No hay una pantalla o formulario real para cambiar:

* Apodo.
* Avatar.
* Franja de edad.
* Preferencia de audio.
* Tamaño de texto.
* Preferencias de accesibilidad.

El requisito RF-05 dice que el usuario debe poder crear y editar su perfil.

Conviene agregar:

```text
/app/perfil/editar
```

O un `sheet`/modal móvil desde la propia pantalla de perfil.

---

### 2. Ajustes del usuario

No existe una ruta de ajustes para el usuario.

Debería existir:

```text
/app/ajustes
```

Con al menos:

* Tamaño de texto.
* Narración o audio automático.
* Notificaciones.
* Descargas solo con Wi-Fi.
* Contraste.
* Controles parentales.
* Métodos de acceso.
* Cerrar sesión.
* Eliminar o desvincular cuenta.

Actualmente solo se muestran preferencias como texto informativo dentro del perfil, pero no pueden editarse.

---

### 3. Centro de sincronización offline

Aunque sí existe código Dexie, outbox y `syncEngine`, no existe una pantalla completa que permita al usuario ver:

* Estado de conexión.
* Última sincronización.
* Eventos pendientes.
* Eventos con error.
* Botón "Sincronizar ahora".
* Reintentar fallidos.
* Limpiar contenido descargado.
* Espacio usado.
* Temas disponibles sin conexión.

El banner offline no reemplaza esta pantalla.

Ruta sugerida:

```text
/app/sincronizacion
```

---

### 4. Detalle de descarga

La pantalla `/app/descargas` muestra tarjetas, pero no existe una pantalla de detalle para revisar:

* Qué incluye el paquete.
* Número de temas.
* Actividades.
* Audios y videos.
* Tamaño real.
* Estado de actualización.
* Fecha de descarga.
* Eliminar o actualizar contenido.

Ruta sugerida:

```text
/app/descargas/$temaId
```

---

### 5. Explorador de clubes

Actualmente `/app/clubes` solo consulta `listarMisClubes()` y utiliza el primer club:

```ts
const club = clubesQuery.data?.[0] ?? null;
```

Falta una pantalla para ver todos los clubes disponibles:

```text
/app/clubes/explorar
```

Con filtros por:

* Iglesia.
* Curso.
* Familia.
* Edad.
* Tema.
* Privado/público.

---

### 6. Listado de "Mis clubes"

El frontend soporta potencialmente varios clubes, pero la interfaz solo presenta el primero.

Falta:

```text
/app/clubes/mios
```

Con:

* Todos los clubes del usuario.
* Rol dentro del club.
* Miembros.
* Retos activos.
* Última actividad.
* Salir del club.

---

### 7. Detalle individual de club

No existe una ruta como:

```text
/app/clubes/$clubId
```

La vista actual mezcla resumen, ranking y retos en una sola pantalla usando el primer club.

El detalle debería tener pestañas:

* Resumen.
* Miembros.
* Ranking.
* Retos.
* Actividad.
* Invitación.
* Configuración, si es líder.

---

### 8. Crear club

La API del frontend tiene:

```ts
crearClub(...)
```

Pero no hay pantalla ni formulario para utilizarla.

Ruta sugerida:

```text
/app/clubes/crear
```

Debe permitir:

* Nombre.
* Descripción.
* Tipo: iglesia, curso o familia.
* Rango de edad.
* Visibilidad.
* Imagen.
* Normas básicas.

---

### 9. Detalle de reto cooperativo

Los retos aparecen como tarjetas de texto, pero no hay una vista completa:

```text
/app/clubes/$clubId/retos/$retoId
```

Debe mostrar:

* Meta.
* Progreso grupal.
* Participantes.
* Tiempo restante.
* XP.
* Historial de aportes.
* Estado completado.

---

### 10. Historial completo de actividades

No existe una pantalla donde el usuario pueda consultar:

* Actividades realizadas.
* Respuestas.
* Puntuación.
* XP ganado.
* Intentos.
* Fecha.
* Actividades pendientes.

Ruta sugerida:

```text
/app/historial
```

---

### 11. Biblioteca o favoritos

El código y las pantallas diseñadas hablan de contenido, versículos y recursos, pero no existe una ruta real para:

* Versículos guardados.
* Temas favoritos.
* Audios.
* Historias.
* Imprimibles.
* Contenido descargado.

Ruta sugerida:

```text
/app/biblioteca
```

---

### 12. Notificaciones

No existe un centro de notificaciones aunque hay iconos y referencias visuales.

Ruta sugerida:

```text
/app/notificaciones
```

Con:

* Nuevo tema.
* Nuevo reto.
* Insignia obtenida.
* Invitación a club.
* Descarga actualizada.
* Error de sincronización.

---

### 13. Recuperación de contraseña

Existe login y registro con correo, pero faltan:

```text
/recuperar-contrasena
/restablecer-contrasena
/verificar-correo
```

También faltan estados claros para:

* Correo ya registrado.
* Contraseña débil.
* Correo no verificado.
* Enlace expirado.

---

### 14. Inicio de sesión con Facebook

La documentación exige Google, Facebook e invitado.

En el código revisado existe:

* Invitado.
* Google.
* Correo.

No encontré flujo de Facebook.

Debe agregarse o actualizarse formalmente el requisito si ya no estará incluido.

---

### 15. Página 404

No existe una pantalla explícita para rutas no encontradas.

Debe agregarse un `notFoundComponent` global y pantallas específicas para:

* Tema no encontrado.
* Actividad no encontrada.
* Club no encontrado.
* Acceso denegado.

---

# Pantallas existentes que deben corregirse

## 1. `/app` está demasiado incompleta

La página importa `PathsGrid`:

```ts
import { PathsGrid } from "../features/home/componentes/paths-grid";
```

Pero no lo renderiza.

Actualmente muestra:

* Banner.
* Versículo.
* Racha.
* Insignias.

Falta incluir:

* Continuar aprendiendo.
* Sendas.
* Actividad reciente.
* Progreso del nivel.
* Retos.
* Club actual.
* Descargas disponibles.
* Estado offline.

Además:

```ts
const diasRacha = 0;
```

La racha siempre se muestra como cero, aunque exista gamificación.

El versículo del día está codificado en un arreglo local, no viene del contenido administrable.

---

## 2. `/app/descargas` es una simulación

La pantalla no utiliza realmente la base Dexie ni `useDescargarTema`.

Usa un catálogo fijo:

```ts
RECURSOS_CATALOGO
```

Y simula la descarga con:

```ts
setInterval(...)
```

También comienza con dos elementos falsamente descargados:

```ts
useState<string[]>(["noe", "laberinto"])
```

El almacenamiento es ficticio:

```ts
const totalStorageMB = 2000;
const baseUsed = 65.4;
```

Y el botón administrar utiliza:

```ts
alert(...)
```

Para quedar al 100%, esta pantalla debe conectarse con:

* `db.temas`.
* `db.pasos`.
* `db.actividades`.
* `useDescargarTema`.
* `navigator.storage.estimate()`.
* Estado real del service worker.
* Actualizaciones de paquetes descargados.
* Eliminación transaccional.

---

## 3. `/app/logros` usa un catálogo fijo

Los logros se definen en frontend:

```ts
const INSIGNIAS_CATALOGO = [...]
```

Esto puede desalinearse del backend.

El catálogo completo debe venir de la API con:

* Código.
* Nombre.
* Descripción.
* Criterio.
* Categoría.
* Imagen.
* Estado obtenido.
* Fecha.
* Progreso parcial.

También el cálculo del nivel asume siempre bloques de 1000 XP:

```ts
const xpEnNivel = xpTotal % 1000;
```

Eso debe venir del backend o del catálogo real de niveles.

---

## 4. Compartir insignias no cumple totalmente RF-26

Actualmente comparte solo texto:

```ts
navigator.share({
  title: "Mi logro en Semillas",
  text: texto
});
```

El requisito solicita una tarjeta de imagen sin exponer datos del menor.

Falta:

* Generar una imagen con Canvas o HTML-to-image.
* No incluir nombre completo, correo, edad o club privado.
* Vista previa.
* Descargar tarjeta.
* Compartir archivo mediante Web Share API.
* Fallback para copiar o descargar.

---

## 5. `/app/clubes` solo trabaja con un club

Problemas:

* Selecciona siempre el primer club.
* No permite cambiar de club.
* No permite crear uno.
* No permite salir.
* No muestra miembros.
* No tiene detalle del reto.
* No muestra progreso cooperativo real.
* No distingue si el usuario es líder o miembro.

La API ya tiene funciones que la interfaz no utiliza:

```ts
listarClubes()
crearClub()
salirDeClub()
crearRetoCooperativo()
```

---

## 6. `/app/perfil` no permite editar

La página muestra información y vinculación de cuenta, pero no llama a:

```ts
actualizarPerfil(...)
```

Faltan botones y formularios para modificar datos.

También muestra el identificador de franja:

```tsx
perfil?.grupo_edad_id
```

Debe mostrar el nombre humano, por ejemplo:

```text
Exploradores · 9–12 años
```

---

## 7. El onboarding guarda una franja, pero la documentación y la interfaz no están perfectamente alineadas

La documentación antigua menciona:

* Semillas: 5–8.
* Exploradores: 9–12.
* Embajadores: 13–17.

En otros componentes aparecen rangos como:

* 3–6.
* 6–10.
* 7–12.

Debe definirse una sola fuente canónica de grupos etarios y eliminar todas las edades locales codificadas.

También falta:

* Reanudar onboarding incompleto.
* Confirmar salida.
* Manejar error al actualizar perfil.
* Evitar acceder a `/app` sin completar onboarding.
* Mostrar estado de carga consistente.

---

## 8. Landing con enlaces falsos

En `Navbar.tsx` existen:

```tsx
<a href="#">
```

Estos enlaces no deben quedar en producción.

Deben navegar a secciones reales mediante IDs o rutas.

---

## 9. Diálogos del onboarding implementados manualmente

El modal de ayuda utiliza un `div` completo con `onClick`.

Le falta:

* `role="dialog"`.
* `aria-modal`.
* Focus trap.
* Escape.
* Restaurar foco.
* Bloqueo de scroll.
* Botón backdrop accesible.

Conviene utilizar Radix Dialog, ya presente en el ecosistema shadcn.

---

# Administración: pantallas que son solo placeholders

Estas rutas existen, pero tienen únicamente icono, título y descripción.

## `/admin/sendas`

No administra nada.

Falta:

* Listado.
* Crear.
* Editar.
* Ordenar.
* Activar/desactivar.
* Color.
* Imagen.
* Contadores de temas.
* Validación antes de eliminar.

---

## `/admin/revision`

No existe flujo de revisión real.

Es especialmente importante porque RF-18 exige:

```text
borrador → revisión → publicación
```

Falta:

* Cola de pendientes.
* Vista previa.
* Comparación de versiones.
* Aprobar.
* Rechazar.
* Solicitar cambios.
* Comentario obligatorio.
* Historial de decisiones.
* Quién revisó.
* Fecha.
* Estado.
* Filtros.

---

## `/admin/reportes`

Es solo un placeholder.

Falta:

* Usuarios activos.
* Nuevos usuarios.
* Temas publicados.
* Actividades completadas.
* XP entregado.
* Retención.
* Uso offline.
* Descargas.
* Errores de sincronización.
* Clubes activos.
* Exportación CSV/PDF.
* Filtros por fecha, senda y edad.

---

## `/admin/clubes`

Es solo un placeholder.

Falta:

* Listado.
* Detalle.
* Miembros.
* Líderes.
* Retos.
* Incidentes.
* Cambiar líder.
* Suspender club.
* Regenerar código.
* Visibilidad.
* Moderación.
* Historial.

---

## `/admin/ajustes`

Es solo un placeholder.

Falta:

* Parámetros generales.
* Límites de carga.
* Configuración de XP.
* Niveles.
* Catálogo de insignias.
* Grupos de edad.
* Versiones bíblicas.
* Tipos de actividad.
* Roles y permisos.
* Notificaciones.
* Retención de datos.
* Feature flags.
* Configuración offline.

---

# Administración: pantallas adicionales que faltan

## 1. Detalle del usuario

La API define:

```text
GET /administracion/usuarios/:usuario_id
PATCH /administracion/usuarios/:usuario_id
```

Pero no existe una ruta:

```text
/admin/usuarios/$usuarioId
```

Falta ver:

* Perfil.
* Cuenta.
* Progreso.
* Logros.
* Clubes.
* Actividad.
* Sesiones.
* Auditoría.
* Estado.
* Permisos.

---

## 2. Crear y editar usuario

Existe tabla de usuarios, pero falta una pantalla formal para:

```text
/admin/usuarios/new
/admin/usuarios/$usuarioId/edit
```

O diálogos equivalentes completos.

---

## 3. Editor independiente de actividades

La ruta `/admin/actividades` lista actividades y permite algunas operaciones, pero faltan rutas claras:

```text
/admin/actividades/new
/admin/actividades/$activityId/edit
/admin/actividades/$activityId/preview
```

El editor actual está acoplado al tema.

Debe soportar configuraciones diferentes para:

* Quiz.
* Flashcards.
* Completar versículo.
* Verdadero/falso.
* Sopa de letras.
* Rompecabezas.
* Relacionar conceptos.
* Relacionar pares.
* Manualidad.

No basta un formulario genérico de opciones múltiples.

---

## 4. Detalle completo de recurso multimedia

El panel lateral muestra datos, pero falta una ruta o diálogo completo con:

* Usos del recurso.
* Reemplazar archivo.
* Versiones.
* Metadatos.
* Texto alternativo.
* Créditos.
* Licencia.
* Etiquetas.
* Recorte.
* Validación.
* Desvincular.
* Eliminación segura.

---

## 5. Historial y auditoría

No encontré una pantalla para:

```text
/admin/auditoria
```

Debe mostrar:

* Publicaciones.
* Eliminaciones.
* Cambios de rol.
* Cambios de contenido.
* Revisión.
* Archivos eliminados.
* Acciones sobre usuarios.
* Actor.
* Fecha.
* IP o dispositivo, si procede.

---

## 6. Gestión de gamificación

No existe una pantalla para administrar:

* Niveles.
* XP requerido.
* Insignias.
* Criterios.
* Recompensas.
* Imágenes.
* Bonos.
* Activación.

Ruta sugerida:

```text
/admin/gamificacion
```

Actualmente parte del catálogo está codificada en frontend.

---

## 7. Catálogos

Falta una sección:

```text
/admin/catalogos
```

Para administrar:

* Grupos etarios.
* Tipos de actividad.
* Pasos CRECER.
* Libros bíblicos.
* Versiones bíblicas.
* Estados.
* Dificultades.

---

# Errores y estados globales que faltan

Para decir que el frontend está al 100%, todas las rutas deben contemplar:

* Loading skeleton.
* Estado vacío.
* Error de red.
* Sin conexión.
* Acceso denegado.
* Sesión expirada.
* Reintentar.
* Datos parciales.
* Recurso eliminado.
* Error inesperado.
* Página no encontrada.

Ahora varias páginas sí tienen loading/error, pero no es consistente en todo el proyecto.

También falta un `ErrorBoundary` por:

* Aplicación.
* Administración.
* Actividades.
* CRECER.

---

# Problemas de arquitectura frontend

## 1. Módulos duplicados en inglés y español

Existen simultáneamente carpetas como:

```text
features/clubes
features/clubs

features/activities
actividades

features/profile
features/perfil
```

Esto dificulta saber cuál es la fuente oficial.

Debería quedar una única convención.

Por ejemplo:

```text
features/
  actividades/
  autenticacion/
  clubes/
  crecer/
  descargas/
  gamificacion/
  inicio/
  perfil/
  sendas/
  temas/
```

---

## 2. Datos de dominio codificados en frontend

Deben salir del backend:

* Versículos del día.
* Catálogo de insignias.
* Rango fijo de 1000 XP.
* Sendas de la landing.
* Edades.
* Recursos de descargas.
* Algunos textos y estados.

La aplicación debe ser dinámica para que el CMS tenga sentido.

---

## 3. Algunas funciones API no tienen interfaz

Funciones existentes que no están aprovechadas completamente:

```ts
listarClubes()
crearClub()
salirDeClub()
crearRetoCooperativo()
actualizarPerfil()
useDescargarTema()
syncFull()
eliminarEventosFallidos()
```

Esto significa que backend y capa cliente existen, pero faltan pantallas o acciones.

---

# Documentación que debe corregirse

La carpeta `docs` también está desactualizada.

Por ejemplo, `estado-por-area.md` afirma que no se encontró Dexie ni outbox, pero el proyecto sí contiene:

```text
frontend/src/lib/offline/db.ts
frontend/src/lib/offline/outbox.ts
frontend/src/lib/offline/syncEngine.ts
frontend/src/lib/offline/useDescargarTema.ts
```

También `tareas.md` marca como faltantes:

```text
docs/arquitectura.md
docs/api.md
```

Pero ambos archivos ya existen.

El documento RF/RNF todavía menciona:

* Flutter.
* NestJS.
* Prisma.
* npm/pnpm.

Mientras el proyecto actual utiliza:

* React PWA.
* Hono.
* Drizzle.
* Bun.

Antes de cerrar el proyecto, la documentación debe reflejar el código actual.

---

# Orden recomendado para llegar al 100%

## Prioridad 1: funcionalidades actualmente simuladas

1. Conectar `/app/descargas` con Dexie y descargas reales.
2. Mostrar racha y progreso reales en Home.
3. Eliminar catálogo fijo de insignias.
4. Implementar edición de perfil.
5. Implementar centro de sincronización.
6. Implementar varios clubes, no solo el primero.
7. Implementar compartir insignia como imagen.

## Prioridad 2: cerrar administración

1. `/admin/revision`.
2. `/admin/sendas`.
3. `/admin/clubes`.
4. `/admin/reportes`.
5. `/admin/ajustes`.
6. Detalle de usuario.
7. Editor completo de actividades.
8. Gamificación y catálogos.
9. Auditoría.

## Prioridad 3: pantallas complementarias

1. Ajustes de usuario.
2. Biblioteca/favoritos.
3. Notificaciones.
4. Historial.
5. Recuperar contraseña.
6. Página 404.
7. Acceso denegado.
8. Detalle de descarga.
9. Detalle de reto.

## Prioridad 4: calidad final

1. Unificar carpetas duplicadas.
2. Eliminar datos hardcodeados.
3. Añadir Error Boundaries.
4. Añadir Playwright.
5. Probar offline end-to-end.
6. Pruebas de accesibilidad.
7. Lazy loading por ruta.
8. Optimización de imágenes.
9. Actualizar documentación.
10. Validar todas las rutas en móvil y escritorio.

## Conclusión

Las partes visualmente más desarrolladas no son necesariamente las más completas funcionalmente.

Los mayores huecos reales son:

* **Cinco rutas administrativas que son solo placeholders.**
* **Descargas todavía simuladas.**
* **Perfil sin edición.**
* **Clubes limitados al primer club.**
* **Sin centro de sincronización.**
* **Gamificación parcialmente codificada en frontend.**
* **Compartir logros solo como texto.**
* **Facebook y recuperación de contraseña ausentes.**
* **Faltan pantallas de detalle, errores y administración avanzada.**

Para que quede realmente al 100%, no hace falta rediseñar todo. Hace falta conectar las pantallas existentes a datos reales, completar las rutas vacías y eliminar todas las simulaciones y valores codificados.
