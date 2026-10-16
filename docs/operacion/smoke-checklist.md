# Smoke checklist

- `GET /health` responde 200 y envelope válido.
- `/openapi.json` responde y contiene schemas de autenticación.
- Landing, manifest y service worker cargan.
- Endpoint admin sin credenciales devuelve 401.
- Usuario sin rol admin devuelve 403.
- Bucket media no es público.
- Deep links de la PWA cargan tras recarga.
- Offline shell abre y el outbox conserva eventos.

