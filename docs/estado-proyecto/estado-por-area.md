# Estado por Area

## 1. Frontend

### Hecho
- PWA React con Vite, TanStack Router, TanStack Query y shadcn/ui.
- Landing pública, login, onboarding, temas, actividades, logros, clubes y admin.
- Librería amplia de componentes reutilizables y muchas pruebas UI.

### Parcial
- Flujo offline expuesto en API cliente, pero sin evidencia de una capa Dexie completa para persistencia local.
- La UX general está avanzada, pero todavía hay páginas y documentación que no reflejan el stack final.

### Falta
- Confirmar e implementar el almacenamiento local completo para temas, progreso y outbox.
- Alinear documentación frontend con el estado real del proyecto.

## 2. Backend

### Hecho
- API Hono para Cloudflare Workers con módulos por dominio.
- Auth invitado, catálogo, sendas, temas, actividades, progreso, sync, clubs, gamificación, media y admin.
- Tests existentes en módulos clave y OpenAPI presente.

### Parcial
- `adminRoutes` y `mediaRoutes` tienen la seguridad deshabilitada temporalmente en código.
- Hay desalineaciones entre docs y código en roles, rutas y contratos.

### Falta
- Reactivar autorización real en admin y media.
- Unificar el contrato público de API con la implementación.

## 3. Offline y Sincronizacion

### Hecho
- Endpoint de `sync/pull` y `sync/push` existe.
- El backend procesa eventos con lógica idempotente básica.

### Parcial
- El frontend tiene cliente de sync, pero no se encontró una base Dexie completa ni una outbox visible.

### Falta
- Base local oficial, repositorios offline y sincronización end-to-end.

## 4. Documentacion

### Hecho
- README principal completo.
- `docs/backend-api.md`, `docs/media-storage.md` y el documento RF/RNF existen.
- Hay specs y planes en `docs/superpowers/`.

### Parcial
- Parte de la documentación está desactualizada respecto del stack actual.

### Falta
- Documentos canónicos de arquitectura, API, base de datos, seguridad, pruebas, despliegue, instalación y manuales.

## 5. Seguridad

### Hecho
- Validaciones, schemas y middleware existen.
- Se usan roles y respuesta consistente en backend.

### Parcial
- Administración y media tienen seguridad comentada temporalmente.

### Falta
- Reforzar autorización real, revisar almacenamiento sensible y documentar la postura de seguridad.
