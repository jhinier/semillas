# Evidencia parcial del Gate G2

Implementado y verificado:

- Redirecciones OAuth por entorno documentadas en `docs/auth/oauth-entornos.md`.
- Banderas públicas de Google/Facebook y allowlist de orígenes.
- Orquestador `migrarInvitadoSiCorresponde`: solo limpia guest después de un
  vínculo exitoso; un error conserva la sesión.
- El vínculo backend limpia `token_invitado_hash` y evita actualizar una cuenta
  que ya no tenga proveedor invitado.
- `resolver-sesion` centraliza el provisioning OAuth, rechaza usuarios
  inactivos y revierte la cuenta si falla la creación del perfil.
- Las pruebas del caso de uso cubren cuenta existente, cuenta nueva, cuenta
  inactiva y rollback de perfil.
- La vinculación conserva el UUID del invitado en reintentos/concurrencia
  simulada; callback, sign-out y limpieza de token tienen pruebas específicas.
- El schema de actualización de perfil es estricto, valida URLs y no acepta
  `edad` ni `fecha_nacimiento`.

Pendiente para cerrar G2: pruebas de proveedores reales por entorno, transacción
concurrente contra PostgreSQL, E2E completo y verificación de conservación de
XP/eventos/logros/clubes.
