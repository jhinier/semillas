# Instalación local

**Owner:** M9 · **Revisión:** 2026-07-13

Requisitos: Bun, Supabase CLI y Wrangler. No usar npm, pnpm ni yarn. El
proyecto usa un Supabase remoto; no requiere ni instala Docker.

```bash
git clone <repositorio>
cd semillas
bun install --frozen-lockfile
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
bun run dev
```

Completa los valores de entorno local sin subirlos a Git. Configura las
variables de Supabase con el proyecto remoto de desarrollo antes de iniciar.
Las migraciones se aplican explícitamente al proyecto remoto enlazado con
`bun run db:migrate`; nunca se ejecuta un reset destructivo desde este flujo.
Si se regeneran tipos, define `SUPABASE_PROJECT_REF` y ejecuta `bun run db:types`
contra ese mismo proyecto remoto.
La PWA queda en `http://localhost:5173` y la API en el puerto mostrado por
Wrangler.
