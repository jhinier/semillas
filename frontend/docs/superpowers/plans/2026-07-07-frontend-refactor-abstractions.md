# Frontend Refactor Abstractions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reducir duplicación en el frontend unificando botones, cards, tabs, tablas y patrones visuales repetidos sin romper la UI existente.

**Architecture:** Mantener la API pública actual durante la migración, pero mover la lógica repetida hacia primitivas compartidas pequeñas y composables. Empezar por componentes base de alto impacto y bajo riesgo, luego reemplazar wrappers de feature con esos primitivos.

**Tech Stack:** React, TypeScript, Vite, Tailwind CSS, class-variance-authority, lucide-react.

## Global Constraints

- Usar TypeScript estricto.
- Evitar `any`.
- Preferir cambios pequeños y coherentes.
- No usar npm, pnpm ni yarn.
- Mantener compatibilidad visual con la UI actual.
- No introducir abstracciones innecesarias.
- Cada componente compartido debe tener una única responsabilidad clara.

---

### Task 1: Unificar la base de botones

**Files:**
- Modify: `src/componentes/ui/boton.tsx`
- Modify: `src/componentes/ui/button.tsx`
- Modify: `src/features/auth/componentes/social-login-button.tsx`
- Modify: `src/shared/layout/app-topbar.tsx`
- Modify: `src/shared/layout/admin-sidebar.tsx`
- Modify: `src/shared/layout/app-account-menu.tsx`

**Interfaces:**
- Consumes: `Boton`, `Button`, `SocialLoginButton`.
- Produces: Un solo primitivo de botón preferido para nuevos usos y wrappers mínimos para variantes especiales.

- [ ] **Step 1: Escribir tests o snapshots mínimos para las variantes críticas**

```tsx
// Verificar que el botón primitivo renderiza iconos, loading y tamaños.
// Verificar que el wrapper de compatibilidad mantiene la variante visual actual.
```

- [ ] **Step 2: Ejecutar la verificación inicial**

Run: `bun run test`

- [ ] **Step 3: Extraer la implementación compartida**

```tsx
// Mantener una sola fuente de verdad para estilos, loading y estados.
```

- [ ] **Step 4: Migrar usos directos al primitivo elegido**

```tsx
// Reemplazar llamadas redundantes en topbar, sidebar y menús.
```

- [ ] **Step 5: Verificar compilación y UI básica**

Run: `bun run check`

### Task 2: Separar la card base de los templates de negocio

**Files:**
- Modify: `src/componentes/ui/card-base.tsx`
- Modify: `src/componentes/ui/card.tsx`
- Modify: `src/componentes/ui/card-perfil.tsx`
- Modify: `src/componentes/ui/card-insignia.tsx`
- Modify: `src/componentes/ui/card-metrica.tsx`
- Modify: `src/componentes/ui/card-leccion.tsx`
- Modify: `src/features/home/componentes/senda-card.tsx`
- Modify: `src/features/themes/componentes/continuar-aprendiendo-card.tsx`
- Modify: `src/features/gamification/componentes/insignia-card-item.tsx`
- Modify: `src/features/clubes/componentes/club-retos-card.tsx`
- Modify: `src/features/clubes/componentes/club-logros-card.tsx`

**Interfaces:**
- Consumes: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.
- Produces: Un `card-base` claro y templates de dominio que ya no cargan estilos duplicados.

- [ ] **Step 1: Escribir pruebas visuales mínimas para `Card` y una card de ejemplo**

```tsx
// Probar sombra, hoverEffect y composición de subcomponentes.
```

- [ ] **Step 2: Ejecutar pruebas y confirmar el estado actual**

Run: `bun run test`

- [ ] **Step 3: Simplificar `card.tsx` o dividirlo en módulos de negocio**

```tsx
// Eliminar mezcla de templates de dominio dentro del primitivo base.
```

- [ ] **Step 4: Reducir `className` repetidos en cards de feature**

```tsx
// Centralizar márgenes, bordes, sombras y encabezados en `Card`.
```

- [ ] **Step 5: Verificar typecheck y build**

Run: `bun run check`

### Task 3: Centralizar barras, porcentajes y estados de progreso

**Files:**
- Modify: `src/componentes/ui/indicadores-progreso.tsx`
- Modify: `src/features/gamification/componentes/progreso-xp-widget.tsx`
- Modify: `src/features/clubes/componentes/club-retos-card.tsx`
- Modify: `src/features/clubes/componentes/club-reto-semanal-widget.tsx`
- Modify: `src/features/descargas/componentes/storage-widget.tsx`
- Modify: `src/componentes/ui/card-perfil.tsx`
- Modify: `src/componentes/ui/card-insignia.tsx`

**Interfaces:**
- Consumes: `BarraProgreso`, `ProgresoCircular`, `StepperCRECER`.
- Produces: Un hub de progreso más consistente con un API pequeño y colores compartidos.

- [ ] **Step 1: Escribir prueba de cálculo de porcentaje y render de etiquetas**

```tsx
// Verificar maximo, porcentaje y color sin duplicar lógica en widgets.
```

- [ ] **Step 2: Ejecutar la prueba y confirmar el fallo esperado si aplica**

Run: `bun run test`

- [ ] **Step 3: Extraer helpers de progreso compartidos si aparecen cálculos repetidos**

```tsx
// Unificar el cálculo de porcentaje y el mapeo de color.
```

- [ ] **Step 4: Reemplazar lógica local en widgets y cards**

```tsx
// Mantener solo layout en cada feature, no cálculo de progreso.
```

- [ ] **Step 5: Verificar `bun run check`**

Run: `bun run check`

### Task 4: Unificar tabs, filtros y búsquedas

**Files:**
- Modify: `src/componentes/ui/navegacion-tabs.tsx`
- Modify: `src/features/themes/componentes/temas-tabs-filter.tsx`
- Modify: `src/features/descargas/componentes/descargas-tabs-filter.tsx`
- Modify: `src/features/admin/componentes/admin-themes-tabs.tsx`
- Modify: `src/features/gamification/componentes/logros-tabs-filter.tsx`
- Modify: `src/features/themes/componentes/temas-search-bar.tsx`
- Modify: `src/features/admin/componentes/admin-themes-filters.tsx`

**Interfaces:**
- Consumes: un tab item genérico con `id`, `label`, `count?`, `active` y `onChange`.
- Produces: Un patrón común para tabs y filtros, con variantes para badges y búsquedas.

- [ ] **Step 1: Escribir prueba de render del tab genérico con conteos opcionales**

```tsx
// Validar estados activo/inactivo y badges de conteo.
```

- [ ] **Step 2: Ejecutar la prueba**

Run: `bun run test`

- [ ] **Step 3: Crear el componente compartido y adaptar los wrappers existentes**

```tsx
// Mantener la semántica visual actual mientras se reduce duplicación.
```

- [ ] **Step 4: Revisar accesibilidad básica de teclado y foco**

```tsx
// Asegurar navegación con botón/tab sin romper la UX móvil.
```

- [ ] **Step 5: Verificar typecheck**

Run: `bun run check`

### Task 5: Extraer una tabla base y filas reutilizables

**Files:**
- Modify: `src/features/admin/componentes/admin-themes-table.tsx`
- Modify: `src/features/admin/componentes/recent-themes-table.tsx`
- Modify: `src/features/clubes/componentes/tabla-ranking.tsx`
- Modify: `src/features/clubes/componentes/tarjeta-miembro.tsx`

**Interfaces:**
- Consumes: una tabla base para header, body, row click y scroll interno.
- Produces: tablas de admin y ranking más simples, con celdas compartidas.

- [ ] **Step 1: Escribir prueba para una fila seleccionable y un header reutilizable**

```tsx
// Verificar click de fila, encabezados y estados vacíos.
```

- [ ] **Step 2: Ejecutar la prueba**

Run: `bun run test`

- [ ] **Step 3: Crear helpers compartidos para badge de estado y avatar+texto**

```tsx
// Evitar repetir el mismo bloque en cada tabla.
```

- [ ] **Step 4: Migrar tablas concretas al nuevo primitivo**

```tsx
// Mantener la estructura visual mientras se limpia la implementación.
```

- [ ] **Step 5: Verificar build**

Run: `bun run build`

### Task 6: Normalizar métricas, cards resumen y bloques de acciones

**Files:**
- Modify: `src/features/admin/componentes/admin-stats-grid.tsx`
- Modify: `src/features/admin/componentes/content-status-grid.tsx`
- Modify: `src/features/admin/componentes/admin-themes-summary.tsx`
- Modify: `src/features/admin/componentes/quick-actions-grid.tsx`
- Modify: `src/features/admin/componentes/recent-activity-sidebar.tsx`
- Modify: `src/features/admin/componentes/upcoming-reviews-list.tsx`
- Modify: `src/features/themes/componentes/resumen-temas-card.tsx`
- Modify: `src/componentes/ui/card-metrica.tsx`

**Interfaces:**
- Consumes: tarjetas compactas de métrica y bloques listados con icono + texto.
- Produces: una API simple para stats, summary rows y quick actions.

- [ ] **Step 1: Escribir prueba de mapeo de items a cards visuales**

```tsx
// Verificar que cada item renderiza icono, texto y valor correcto.
```

- [ ] **Step 2: Ejecutar la prueba**

Run: `bun run test`

- [ ] **Step 3: Crear un componente compartido para métricas y listas compactas**

```tsx
// Evitar repetir icon-box + label + value + subtitle.
```

- [ ] **Step 4: Reducir los grids específicos a solo datos y callbacks**

```tsx
// Mantener cada feature como consumidor del primitivo.
```

- [ ] **Step 5: Ejecutar `bun run check` y `bun run build`**

Run: `bun run check`

Run: `bun run build`

### Task 7: Limpiar componentes híbridos y decidir qué conservar

**Files:**
- Modify: `src/componentes/ui/card.tsx`
- Modify: `src/componentes/ui/chip.tsx`
- Modify: `src/componentes/ui/version-info.tsx`
- Modify: `src/componentes/ui/ilustraciones-card.tsx`

**Interfaces:**
- Consumes: los primitvos ya estabilizados de las tareas anteriores.
- Produces: archivos más pequeños y con una sola responsabilidad por archivo.

- [ ] **Step 1: Definir qué queda en cada archivo híbrido y qué se mueve fuera**

```tsx
// `card.tsx` no debe seguir mezclando base UI con templates de dominio.
```

- [ ] **Step 2: Ejecutar pruebas y build antes de mover código**

Run: `bun run test`

- [ ] **Step 3: Separar el código que más cambia y dejar compat wrappers si son necesarios**

```tsx
// Mantener compatibilidad temporal solo donde haya uso real.
```

- [ ] **Step 4: Verificar que no haya imports circulares nuevos**

```tsx
// Revisar dependencias entre `ui/` y `features/`.
```

- [ ] **Step 5: Verificación final**

Run: `bun run check`

Run: `bun run build`
