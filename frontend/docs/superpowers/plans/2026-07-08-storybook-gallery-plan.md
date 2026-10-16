# Storybook Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand Storybook with richer visual galleries for pages and core components so layout bugs are easier to spot.

**Architecture:** Keep the existing CSF structure, add focused gallery stories in `src/paginas` for full-screen compositions, and add missing component stories for visual primitives that currently have no dedicated coverage. Use the global Storybook preview to standardize backgrounds, default layout, and viewport-aware debugging.

**Tech Stack:** Storybook 10, React, TypeScript, Vite, Tailwind CSS.

## Global Constraints

- Use Bun as package manager and runtime of scripts.
- Use React, TypeScript, Vite, Tailwind CSS, TanStack Router, TanStack Query, Dexie, React Hook Form, Zod, Zustand, shadcn/ui, Lucide React, and vite-plugin-pwa.
- Do not use npm, pnpm or yarn.
- Keep the frontend mobile-first and responsive.
- Prefer minimal, focused changes over broad refactors.

---

### Task 1: Tighten Storybook preview defaults

**Files:**
- Modify: `/.storybook/preview.ts`

**Interfaces:**
- Consumes: Storybook `Preview` config.
- Produces: Shared backgrounds, viewport guidance, and consistent docs/layout defaults for all stories.

- [ ] **Step 1: Add the failing expectation mentally**

Story pages should no longer depend on per-file background/viewport tweaks for the most common visual checks.

- [ ] **Step 2: Implement the preview defaults**

```ts
import type { Preview } from "@storybook/react-vite";
import "../src/styles.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "Crema",
      values: [
        { name: "Crema", value: "#F7F4EC" },
        { name: "Blanco", value: "#ffffff" },
        { name: "Oscuro", value: "#123B2C" },
      ],
    },
    viewport: {
      defaultViewport: "mobile1",
    },
    layout: "padded",
  },
};

export default preview;
```

- [ ] **Step 3: Verify the file stays type-safe**

Run: `bun run typecheck`

Expected: no Storybook preview type errors.

### Task 2: Add missing core component stories

**Files:**
- Create: `src/componentes/ui/alerta.stories.tsx`
- Create: `src/componentes/ui/bottom-nav.stories.tsx`
- Create: `src/componentes/ui/empty-state.stories.tsx`
- Create: `src/componentes/ui/loader-estado.stories.tsx`
- Create: `src/componentes/ui/progreso-circular.stories.tsx`
- Create: `src/componentes/ui/version-info.stories.tsx`

**Interfaces:**
- Consumes: `Alerta`, `BottomNav`, `EmptyState`, `LoaderEstado`, `ProgresoCircular`, `VersionInfo`.
- Produces: Story variants that show default, error, offline, compact, and dense states.

- [ ] **Step 1: Write the stories for each component**

Use CSF with `Meta`, `StoryObj`, `tags: ["autodocs"]`, and multiple named variants per file. For example:

```tsx
export const Offline: Story = {
  args: { variante: "offline", children: "Sin conexión. El progreso se sincronizará después." },
};
```

- [ ] **Step 2: Make the variants visually distinct**

Show at least one compact and one dense variant for `BottomNav`, one short and one long message for `EmptyState`, and multiple colors/sizes for `ProgresoCircular`.

- [ ] **Step 3: Verify Storybook indexing**

Run: `bun run storybook`

Expected: stories appear under `Componentes` with no missing import errors.

### Task 3: Expand page stories in `src/paginas`

**Files:**
- Modify: `src/paginas/pagina-botones.stories.tsx`
- Modify: `src/paginas/pagina-cards.stories.tsx`
- Modify: `src/paginas/pagina-logros.stories.tsx`
- Create: `src/paginas/pagina-galeria-ui.stories.tsx`
- Create: `src/paginas/pagina-galeria-formularios.stories.tsx`
- Create: `src/paginas/pagina-galeria-aprendizaje.stories.tsx`

**Interfaces:**
- Consumes: existing page components and the core UI primitives already used across the app.
- Produces: gallery-style stories that show desktop, mobile, dense, and alternate-state compositions.

- [ ] **Step 1: Turn the three existing page stories into multi-variant pages**

Add at least these variants to each existing page story file:

```tsx
export const Desktop: Story = { parameters: { viewport: { defaultViewport: "desktop" } }, render: () => <PaginaCards /> };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: "mobile1" } }, render: () => <div className="mx-auto w-[390px]"><PaginaCards /></div> };
```

- [ ] **Step 2: Add the new gallery pages**

Build focused gallery stories that combine components by job-to-be-done:

```tsx
// UI gallery: buttons, badges, alerts, loaders, nav, progress, empty states
// Formularios gallery: inputs, textarea, select, checkbox, radio, switch, search/password fields
// Aprendizaje gallery: cards, lessons, XP, badges, streaks, downloads
```

- [ ] **Step 3: Keep the copy and spacing mobile-safe**

Use real app language, avoid huge desktop-only grids, and keep the gallery legible on a 390px viewport.

### Task 4: Verify and polish

**Files:**
- Modify only if the verification reveals visual or type issues.

**Interfaces:**
- Consumes: all updated stories.
- Produces: verified Storybook build and typecheck.

- [ ] **Step 1: Typecheck**

Run: `bun run typecheck`

- [ ] **Step 2: Build Storybook**

Run: `bun run build-storybook`

- [ ] **Step 3: Fix anything discovered**

Only touch the stories or preview config needed to resolve the reported issue.
