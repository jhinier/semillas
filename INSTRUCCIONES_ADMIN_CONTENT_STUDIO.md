# Implementación: Administración y estudio editorial de temas

## Objetivo

Convertir `/admin` y `/admin/temas` en herramientas operativas conectadas al backend, eliminando métricas y contenido simulado. El cambio incluye un flujo editorial completo para crear, estructurar, revisar y publicar temas, editar las seis fases CRECER por franja etaria, asignar actividades especializadas y administrar recursos multimedia.

La administración continúa siendo exclusiva para escritorio. El layout establece un ancho mínimo de trabajo y no incorpora una variante móvil.

---

## Aplicación del parche

Desde la raíz del repositorio:

```bash
patch -p1 < semillas-admin-content-studio.patch
```

Como alternativa con Git:

```bash
git apply semillas-admin-content-studio.patch
```

Después:

```bash
bun install
bun run db:types
bun run --cwd backend typecheck
bun run --cwd backend test
bun run --cwd frontend typecheck
bun run --cwd frontend test
bun run --cwd frontend build
bun run --cwd frontend build-storybook
```

No se requiere migración SQL: la implementación usa las tablas y columnas que ya existen en el esquema entregado.

---

# Cambios funcionales

## 1. Shell administrativo

Archivos principales:

- `frontend/src/routes/admin.tsx`
- `frontend/src/routes/admin-content-studio.css`

Cambios:

- Administración web-only con ancho mínimo de 1180 px.
- Un único scroll de documento; se eliminan contenedores internos con scroll en la biblioteca de temas.
- Sidebar de escritorio conservado.
- Topbar no sticky para evitar que tape formularios y tarjetas al desplazarse.
- Nuevos tokens y estilos compartidos para dashboard, biblioteca, estudio, editor CRECER, actividades y revisión.

## 2. Dashboard `/admin`

Archivo:

- `frontend/src/components/admin/PanelAdministracion.tsx`

Fuente de datos:

```http
GET /administracion/resumen/detallado
```

Incluye datos reales de:

- total de temas;
- temas publicados;
- usuarios activos;
- actividades creadas;
- clubes activos;
- temas pendientes de revisión;
- estados editoriales;
- publicaciones de los últimos siete días;
- temas recientes;
- revisiones pendientes;
- actividad de auditoría.

No se conservan cifras, nombres o eventos simulados.

## 3. Biblioteca `/admin/temas`

Archivo:

- `frontend/src/routes/admin.temas.tsx`

Fuente de datos:

```http
GET /administracion/temas-listado
```

Parámetros admitidos:

```text
q
estado
senda_id
grupo_edad_id
limit
offset
```

Cambios:

- Se reemplaza la tabla ancha con scroll horizontal por filas editoriales responsive para escritorio.
- Búsqueda y filtros ejecutados en el servidor.
- Paginación real de 12 elementos.
- Completitud por tema.
- Estado, senda, franjas, actividades y cobertura CRECER visibles.
- Accesos directos a información, CRECER, actividades y vista previa.
- Acciones reales: duplicar completo, enviar a borrador, publicar y archivar.
- Publicar queda deshabilitado hasta que el tema esté aprobado y completo.

## 4. Creación `/admin/temas/new`

Archivo:

- `frontend/src/routes/admin.temas.new.tsx`

Campos persistidos:

- título;
- slug;
- senda;
- resumen;
- objetivo pedagógico;
- versión bíblica;
- duración;
- XP;
- franjas etarias;
- portada multimedia opcional.

Se eliminaron del flujo nuevo los controles visuales que no tenían persistencia real, como etiquetas locales y visibilidad de clubes simulada.

Acciones:

- `Guardar borrador`: crea y abre el estudio del tema.
- `Crear y editar CRECER`: crea y abre directamente el editor pedagógico.

La portada se sube mediante el módulo de medios y su identificador se envía en `portada_recurso_id`.

## 5. Estudio del tema

Ruta:

```text
/admin/temas/:themeId/detalle
```

Archivo:

- `frontend/src/routes/admin.temas.$themeId.detalle.tsx`

Fuente de datos:

```http
GET /administracion/temas/:tema_id/estudio
```

El estudio reúne:

- información general;
- porcentaje y criterios de completitud;
- matriz CRECER por franja y fase;
- actividades agrupadas;
- estado de revisión;
- portada, versión y publicación;
- accesos a todos los editores.

## 6. Editor de información

Ruta:

```text
/admin/temas/:themeId/edit
```

Archivo:

- `frontend/src/routes/admin.temas.$themeId.edit.tsx`

Pestañas:

1. Información general.
2. Portada.
3. Publicación.

Funciones:

- editar senda, título y slug;
- editar objetivo y resumen;
- seleccionar franjas;
- modificar versión bíblica, duración y XP;
- cargar, reemplazar o retirar portada;
- consultar criterios de completitud;
- enviar a revisión;
- publicar solamente después de aprobar;
- duplicar el tema completo;
- archivar.

## 7. Editor CRECER completo

Ruta:

```text
/admin/temas/:themeId/crecer
```

Archivos:

- `frontend/src/routes/admin.temas.$themeId.crecer.tsx`
- `frontend/src/features/admin/hooks/use-theme-crecer-page.ts`
- `frontend/src/features/admin/componentes/crecer-content-editor.tsx`

Permite editar cada combinación de:

```text
franja etaria × Conectar, Relatar, Enseñar, Comprobar, Experimentar, Recompensar
```

Campos persistidos:

- título;
- instrucción corta;
- cuerpo del contenido;
- recurso visual;
- recurso de audio;
- datos extra;
- preguntas de reflexión ordenadas.

Funciones:

- barra de formato Markdown;
- biblioteca y carga de imágenes, audio o video;
- vista previa de la fase;
- cobertura por fase y franja;
- creación o actualización mediante upsert;
- selector de franja activa;
- navegación por los seis momentos.

## 8. Editor de actividades

Ruta:

```text
/admin/temas/:themeId/activities
```

Archivo:

- `frontend/src/routes/admin.temas.$themeId.activities.tsx`

Funciones generales:

- crear;
- editar;
- eliminar;
- duplicar;
- ordenar persistentemente;
- asignar paso CRECER;
- asignar franja;
- configurar dificultad, obligatoriedad, XP y tiempo;
- gestionar opciones de respuesta;
- cargar multimedia mediante el módulo Medios.

Configuradores especializados incluidos:

- quiz y opción múltiple;
- verdadero/falso;
- completar versículo;
- audio;
- canción;
- video;
- relacionar pares;
- arrastrar y ordenar;
- secuencia;
- sopa de letras;
- rompecabezas;
- aventura por decisiones;
- JSON avanzado para nuevos tipos compatibles con el renderizador.

El JSON se valida antes de guardar y deja de mostrarse como sustituto de un editor visual.

## 9. Revisión editorial

Ruta:

```text
/admin/revision
```

Archivo:

- `frontend/src/routes/admin.revision.tsx`

Funciones:

- listar revisiones pendientes reales;
- abrir estudio o vista previa;
- aprobar;
- solicitar cambios;
- rechazar;
- registrar notas y revisor;
- actualizar automáticamente el estado del tema.

Flujo esperado:

```text
borrador → revision → aprobado → publicado
```

Si se solicitan cambios o se rechaza, el tema vuelve a borrador.

---

# Backend

## Nuevos endpoints

```http
GET  /administracion/resumen/detallado
GET  /administracion/temas-listado
GET  /administracion/temas/:tema_id/estudio

POST /administracion/actividades/:actividad_id/duplicar
POST /administracion/temas/:tema_id/actividades/reordenar
POST /administracion/temas/:tema_id/enviar-revision
POST /administracion/temas/:tema_id/resolver-revision
```

## DTO ampliados

### Crear tema

Acepta adicionalmente:

```json
{
  "portada_recurso_id": "uuid-o-null"
}
```

### Actualizar tema

Acepta:

```json
{
  "senda_id": "uuid",
  "slug": "slug-del-tema"
}
```

### Contenido CRECER

Acepta:

```json
{
  "recurso_id": "uuid-o-null",
  "recurso_audio_id": "uuid-o-null",
  "datos_extra": {},
  "preguntas": [
    { "pregunta": "Texto", "orden": 1 }
  ]
}
```

### Reordenar actividades

```json
{
  "actividad_ids": ["uuid-1", "uuid-2"]
}
```

### Resolver revisión

```json
{
  "estado": "aprobado | cambios_solicitados | rechazado",
  "notas": "Comentario opcional"
}
```

## Reglas del backend

- La completitud se calcula en servidor.
- Un tema necesita información, portada, franjas, cobertura CRECER completa, configuración y actividades para enviarse a revisión.
- No se puede publicar un tema incompleto.
- No se puede publicar un tema que no esté aprobado.
- La versión de contenido aumenta al publicar.
- Duplicar copia tema, franjas, pasos, contenidos, preguntas, actividades y opciones.
- Reordenar verifica que todas las actividades pertenezcan al tema.
- Las operaciones editoriales principales registran auditoría cuando corresponde.

---

# QA requerido

## Dashboard

- [ ] Todas las cifras cambian según la base.
- [ ] Sin registros, se muestran estados vacíos útiles.
- [ ] Error de API permite reintentar.
- [ ] Acciones rápidas navegan a rutas válidas.
- [ ] La gráfica usa publicaciones reales de siete días.

## Biblioteca

- [ ] No aparece scrollbar interno ni horizontal.
- [ ] La página usa el scroll principal del navegador.
- [ ] Buscar por título, resumen y slug funciona.
- [ ] Filtros por senda, franja y estado funcionan juntos.
- [ ] Paginación conserva filtros.
- [ ] Acciones invalidan React Query y actualizan la fila.
- [ ] Publicar no aparece habilitado antes de aprobar.

## Creación y edición

- [ ] No se puede crear sin los campos obligatorios.
- [ ] El slug se genera y puede editarse.
- [ ] La portada queda registrada en `recurso_multimedia`.
- [ ] Las franjas se guardan en `tema_grupo_edad`.
- [ ] Editar senda y slug persiste tras recargar.
- [ ] Archivar y duplicar solicitan/indican claramente el resultado.

## CRECER

- [ ] Se pueden guardar seis fases para cada franja.
- [ ] Cambiar de franja carga su contenido correspondiente.
- [ ] Imagen/video y audio persisten.
- [ ] Las preguntas de reflexión conservan orden.
- [ ] La cobertura aumenta al guardar contenido válido.
- [ ] La vista previa muestra borradores usando endpoints administrativos.

## Actividades

- [ ] Crear cada tipo genera configuración válida.
- [ ] Editar conserva opciones y configuración.
- [ ] Reordenar persiste tras recargar.
- [ ] Duplicar copia opciones.
- [ ] Eliminar actualiza la lista.
- [ ] Archivos multimedia se registran en Medios.
- [ ] JSON inválido bloquea el guardado y muestra error.

## Revisión y publicación

- [ ] Tema incompleto no se puede enviar.
- [ ] Tema completo pasa a `revision`.
- [ ] Aprobar cambia el tema a `aprobado`.
- [ ] Solicitar cambios/rechazar vuelve el tema a `borrador`.
- [ ] Solo un tema aprobado puede publicarse.
- [ ] Publicar incrementa `version_contenido`.

## Resoluciones mínimas

Validar al menos:

```text
1920 × 1080
1600 × 900
1440 × 900
1366 × 768
1280 × 800
```

Debajo del ancho mínimo, el administrador puede mostrar desplazamiento del viewport; no debe convertirse en interfaz móvil.

---

# Validación realizada en el entorno de revisión

- Se validó sintácticamente cada archivo TypeScript/TSX modificado mediante el compilador TypeScript.
- Se verificó el balance sintáctico del CSS.
- El parche se comprobó con `patch --dry-run -p1`.

No se ejecutó el pipeline completo porque Bun y las dependencias del monorepo no estaban instalados en el entorno. El agente que integre el cambio debe ejecutar todos los comandos de build, pruebas y Storybook indicados al inicio.
