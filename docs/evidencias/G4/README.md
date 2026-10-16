# Evidencia parcial del Gate G4

Implementado:

- `evaluarMatrizCrecer` exige las seis celdas por franja, sin duplicados y en orden.
- `validarPublicacion` produce errores estructurados para ficha, Biblia, portada/alt,
  CRECER, actividades, respuesta correcta, Markdown inseguro y aprobación humana.
- La completitud administrativa incorpora el resultado del validador antes de revisión/publicación.
- La operación de publicar consulta una revisión con estado `aprobado` y no
  confía en el botón ni en un booleano fijo del panel; publicar un tema ya
  publicado es idempotente y no incrementa su versión.

Verificación:

```bash
bun test backend/src/modules/admin/publicacion/matriz-crecer.test.ts
bun test backend/src/modules/admin/publicacion/validar-publicacion.test.ts
bun run --cwd backend typecheck
```

Pendiente: E2E editorial real, las 13 actividades CRUD/offline y publicación en staging.
