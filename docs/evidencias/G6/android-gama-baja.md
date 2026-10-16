# Evidencia Android de gama baja

Estado: pendiente de ejecución en un dispositivo físico.

Esta validación usa la misma React PWA de producción; no se instala APK, no se
usa wrapper nativo y no se levanta Supabase local ni Docker.

## Datos que debe registrar el revisor

| Campo | Valor |
|---|---|
| Modelo | pendiente |
| RAM | pendiente (objetivo: 2–3 GB) |
| Versión Android | pendiente (mínimo 10) |
| Chrome | pendiente |
| URL/commit de la PWA | pendiente |
| Fecha/hora UTC | pendiente |
| Red usada para instalación | pendiente |

## Protocolo reproducible

1. Limpiar datos del sitio y reiniciar el dispositivo.
2. Abrir la URL HTTPS de staging en Chrome y registrar el tiempo de cold start.
3. Instalar la PWA desde el menú del navegador y confirmar que abre en modo
   standalone.
4. Completar onboarding, abrir un tema y descargar su paquete con narración.
5. Activar modo avión, cerrar Chrome y la PWA completamente, reabrirla y jugar
   una actividad descargada.
6. Confirmar que el evento queda pendiente en el outbox sin perder progreso.
7. Desactivar modo avión, esperar la sincronización y verificar que el mismo
   evento se procesa una sola vez.
8. Aplicar una actualización del service worker y verificar que IndexedDB y el
   outbox permanecen intactos.
9. Adjuntar video continuo, capturas y el SHA del artefacto probado.

## Resultado

- [ ] Instalación PWA exitosa.
- [ ] Cold start dentro del umbral acordado.
- [ ] Tema y narración disponibles offline.
- [ ] Cierre/reapertura conserva datos locales.
- [ ] Reconexión sincroniza sin duplicación.
- [ ] Actualización no pierde IndexedDB/outbox.
- [ ] Evidencia multimedia adjunta y revisada.
