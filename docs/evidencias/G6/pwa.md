# Evidencia G6 — React PWA instalable

Fecha de ejecución: 2026-07-13.

## Alcance

Semillas se entrega como una sola React PWA responsive. No se construye APK ni
wrapper nativo. La validación móvil/Android queda definida sobre la instalación
y el funcionamiento offline de esta misma PWA.

## Evidencia reproducible

```bash
bun run build:frontend
bun run pwa:check
bun run performance:bundle
bun run performance:assets
bun run test:pwa:e2e
```

Resultados observados:

- Manifest en español, `id` y `scope` raíz, iconos `192x192` y `512x512`.
- Service Worker registrado y shell visible después de volver offline.
- Playwright PWA: 4 pruebas exitosas (incluye smoke de deep-link).
- App shell generado: 3.35 MiB de precache.
- Build estático: 8.5 MiB.
- CSS inicial gzip: 58.1 KiB / 100 KiB; CSS total diferido: 101.1 KiB
  (informativo).
- Chunk JavaScript mayor: 199.8 KiB gzip / 300 KiB.
- 52 imágenes auditadas y convertidas a WebP; iconos de instalación PNG se
  mantienen por compatibilidad del manifest.
- Hero público optimizado a WebP responsive (20 KiB móvil / 60 KiB escritorio)
  y precargado desde el HTML de arranque.
- Fuentes Nunito y subconjunto de iconos Font Awesome empaquetados localmente;
  no hay hojas de estilo externas en el HTML de arranque.
- axe + Playwright: 4 rutas públicas sin violaciones `critical`/`serious`.

## Baseline Lighthouse

La ejecución de `bun run performance:lighthouse` quedó configurada y generó
reportes en `docs/evidencias/G6/lighthouse/`, pero no pasa aún el gate: las
tres corridas más recientes obtuvieron Performance `0.74`, LCP `5.64–5.75 s`
y Accessibility `0.96`. El CSS inicial medido quedó en unos 58 KiB
gzip; G6 permanece abierto hasta alcanzar el umbral LCP.

## Pendiente de aceptación externa

Esta evidencia no sustituye una medición en un dispositivo Android físico de
2–3 GB de RAM ni la firma formal de Dirección para DESV-01.

El protocolo y la plantilla para esa medición están en
[`android-gama-baja.md`](./android-gama-baja.md).
