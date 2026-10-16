# Evidencias del Gate G0

Este directorio contiene evidencia verificable del Gate G0 de cierre.

## Baseline actual

- Documento: [`../../trazabilidad/baseline-dev2.md`](../../trazabilidad/baseline-dev2.md)
- Rama: `dev2`
- SHA: `5061a96db998792087c6b6392769fd9b1dafb722`
- Fecha: 2026-07-13

## Estado

La captura canónica local está verde: los siete comandos de baseline finalizaron en PASS.

- `bun run --cwd backend typecheck`
- `bun run --cwd frontend typecheck`
- `bun run test:backend`
- `bun run test:frontend`
- `bun run test:contrato`
- `bun run test:e2e`
- `bun run build`

Vite informó como advertencia no bloqueante que existen chunks mayores de 500 kB tras la minificación. El build finalizó correctamente y la PWA actual se genera con un app shell de aproximadamente 3.35 MiB precacheados; los assets pesados quedan bajo demanda.

No se incluyen secretos, variables de entorno ni credenciales en las evidencias.
