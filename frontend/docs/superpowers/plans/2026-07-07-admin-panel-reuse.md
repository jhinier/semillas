# Admin Panel Reuse Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reutilizar una cáscara común en el panel `/admin` sin cambiar el render visual.

**Architecture:** Mantener las primitivas ya existentes (`Card`, `TablaBase`, `FilaListaCompacta`, `AvatarTexto`, `BadgeEstado`, `BloqueIconoTexto`, `CardMetrica`) y extraer solo el contenedor de sección repetido en un componente compartido. Luego, migrar los widgets admin para componer ese contenedor en lugar de repetir encabezado, padding, borde y footer de acción.

**Tech Stack:** React, TypeScript, Tailwind CSS, componentes UI locales en `src/componentes/ui`.

## Global Constraints

- React + TypeScript estrictos.
- Mantener el mismo diseño visual.
- Reutilizar componentes existentes antes de crear nuevos.
- Cambios mínimos, sin reestructurar rutas ni datos.
- No introducir dependencias nuevas.

---

### Task 1: Crear la cáscara compartida para secciones admin

**Files:**
- Create: `src/componentes/ui/panel-seccion-admin.tsx`

**Interfaces:**
- Consumes: `Card` from `src/componentes/ui/card-base.tsx`
- Produces: `PanelSeccionAdmin` with props `titulo`, `descripcion?`, `accion?`, `footer?`, `children`, `className?`, `contenidoClassName?`

- [ ] **Step 1: Write the failing test**

No hay test dedicado hoy; validar manualmente que el componente renderice título, descripción, acción, contenido y footer sin alterar clases base.

- [ ] **Step 2: Implement minimal component**

```tsx
import * as React from "react";

import { unirClases } from "@/lib/utilidades";
import { Card } from "./card-base";

type PanelSeccionAdminProps = {
  titulo: React.ReactNode;
  descripcion?: React.ReactNode;
  accion?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contenidoClassName?: string;
};

export function PanelSeccionAdmin({
  titulo,
  descripcion,
  accion,
  footer,
  children,
  className,
  contenidoClassName,
}: PanelSeccionAdminProps) {
  return (
    <Card clase={unirClases("rounded-3xl p-6 text-left", className)}>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[17px] font-black text-neutro-oscuro-max">{titulo}</h3>
          {descripcion ? <p className="mt-0.5 text-xs text-neutro">{descripcion}</p> : null}
        </div>
        {accion ? <div className="shrink-0">{accion}</div> : null}
      </div>

      <div className={unirClases("min-w-0", contenidoClassName)}>{children}</div>

      {footer ? <div className="mt-4">{footer}</div> : null}
    </Card>
  );
}
```

- [ ] **Step 3: Verify the component visually**

Open the admin page and confirm spacing, border, title size, and footer placement remain identical.

### Task 2: Migrar widgets admin a la cáscara compartida

**Files:**
- Modify: `src/features/admin/componentes/content-status-grid.tsx`
- Modify: `src/features/admin/componentes/quick-actions-grid.tsx`
- Modify: `src/features/admin/componentes/recent-themes-table.tsx`
- Modify: `src/features/admin/componentes/recent-activity-sidebar.tsx`
- Modify: `src/features/admin/componentes/upcoming-reviews-list.tsx`
- Modify: `src/features/admin/componentes/weekly-progress-chart.tsx`

**Interfaces:**
- Consumes: `PanelSeccionAdmin`
- Produces: Same exported component names with identical props and same visible layout

- [ ] **Step 1: Replace repeated outer card markup**

Wrap each widget body with `PanelSeccionAdmin`, moving title/description/button/footer into its props.

- [ ] **Step 2: Preserve existing inner primitives**

Keep `TarjetaMetricaCompacta`, `BloqueIconoTexto`, `TablaBase`, `FilaTabla`, `FilaListaCompacta`, `BadgeEstado`, and `AvatarTexto` unchanged so the content layout does not drift.

- [ ] **Step 3: Keep behavior unchanged**

Do not alter callback signatures, labels, empty states, or chart logic.

- [ ] **Step 4: Run the admin page and compare**

Confirm `/admin` renders the same sections and actions, with the same visual density.

### Task 3: Verify and document the reuse

**Files:**
- Modify: `docs/superpowers/plans/2026-07-07-admin-panel-reuse.md` if the implementation exposes a better boundary

**Interfaces:**
- Consumes: built admin UI
- Produces: verified refactor with no visual regressions

- [ ] **Step 1: Run typecheck / build / relevant UI validation**

Run the project checks used in this repo and confirm no TypeScript errors were introduced.

- [ ] **Step 2: Review for unnecessary abstraction**

Ensure the new shared component is only carrying the duplicated shell and nothing more.

- [ ] **Step 3: Commit the refactor**

Use a small conventional commit once verification is green.
