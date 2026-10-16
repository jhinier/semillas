# Semillas PWA

Frontend web de Semillas: una sola PWA responsive para fanpage, juego, CMS y experiencia offline.

## Proposito

Esta app permite:

- navegar la landing publica
- iniciar sesion o usar modo invitado
- hacer onboarding por franja de edad
- recorrer sendas, temas y actividades
- ver progreso, logros y clubes
- usar contenido descargado sin internet
- administrar contenido desde el CMS

## Stack

- React
- TypeScript
- Vite
- TanStack Router
- TanStack Query
- Dexie
- React Hook Form
- Zod
- shadcn/ui
- Tailwind CSS
- vite-plugin-pwa

## Comandos

```bash
bun install
bun run dev
bun run build
bun run preview
bun run typecheck
bun run storybook
bun run build-storybook
```

## Desarrollo local

El frontend corre por defecto en `http://localhost:5173`.

Variables principales:

- `VITE_API_URL` debe apuntar a `https://api-semillas.andresalexander14.workers.dev`

### CSP

La politica CSP del frontend se define en `public/_headers`.
Alli se permitio explicitamente `https://api-semillas.andresalexander14.workers.dev` en `connect-src` para que la PWA pueda llamar a la API en Cloudflare Workers.

## Estructura

```text
frontend/src/
├─ app/
├─ components/
├─ features/
├─ routes/
├─ shared/
└─ paginas/
```

## Areas importantes

- `src/routes/` - rutas publicas, app y admin
- `src/features/` - modulos de negocio
- `src/componentes/` - componentes reutilizables
- `src/shared/` - api, auth, layout y utilidades comunes

## Estado actual

El frontend ya cubre buena parte de la experiencia principal, pero falta cerrar con firmeza:

- persistencia offline completa con Dexie
- outbox y sincronizacion cliente-servidor real
- ajustes finales de documentacion y consistencia de contratos

Revisa tambien:

- `../README.md`
- `../docs/estado-proyecto/README.md`
