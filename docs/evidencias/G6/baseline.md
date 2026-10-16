# G6 — Baseline automatizada de rendimiento y PWA

## Evidencia reproducible

Comandos ejecutados el 13 de julio de 2026:

```bash
bun test scripts/check-bundle-budget.test.ts
bun run build:frontend
bun run performance:bundle
bun run pwa:check
bun test frontend/src/shared/accessibility/preferences.test.ts frontend/src/shared/utils/pwa.test.ts
```

Resultado observado:

- Tests de budget: 2 passing.
- JavaScript gzip total: 721.8 KiB (informativo; el límite se aplica por chunk para evitar cargar todo el CMS en el shell).
- Chunk JavaScript mayor: 199.8 KiB gzip, debajo de 300 KiB.
- CSS inicial gzip: 58.1 KiB, debajo de 100 KiB; las hojas diferidas suman
  101.1 KiB informativos.
- Manifest, `index.html` y `sw.js`: presentes y válidos.
- Workbox: 216 entradas y aproximadamente 3.35 MiB precacheados; audio, video, imágenes y contenido pesado quedan fuera del precache y se sirven bajo demanda.
- i18n: `i18next` y `react-i18next` instalados, español activo como idioma y fallback, con namespaces base para shell, auth, onboarding, CRECER y admin.
- Accesibilidad automatizada: foco visible global, preferencias de tamaño de texto aplicadas al documento, PWA tipada y axe + Playwright en cuatro rutas públicas sin violaciones critical/serious.

## Pendiente de validación externa

No se declara cerrado el gate G6 todavía. La automatización de Lighthouse ya
se ejecutó, pero las tres corridas más recientes quedaron en Performance
`0.74` y LCP `5.64–5.75 s` (objetivo: `>=0.85` y `<=3 s`);
Accessibility quedó en `0.96`.
También falta axe en las rutas protegidas con sesión, una prueba de
instalación/offline de la React PWA en Android real de 2–3 GB de RAM y medir el app shell en el
artefacto de CI. El auditor de assets (`bun run performance:assets`) valida 52
imágenes; las fuentes Nunito y los iconos se empaquetan localmente. No se
contempla APK, wrapper, Supabase local ni Docker.
