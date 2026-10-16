# Evidencia del Gate G7

Estado: documentación y automatización local verificadas; revisión ciega,
restore real y operación por tercero pendientes.

## Verificaciones locales

```bash
bun run docs:check
bun run docs:freshness
bun test scripts/backup-supabase.test.ts
git diff --check
```

Los documentos canónicos tienen owner/fecha de revisión y los scripts validan
enlaces, vigencia, manifiestos y checksums. El protocolo de revisión está en
[`revision-tercero.md`](./revision-tercero.md).

No se marca G7 como aprobado hasta que un tercero ejecute la instalación y el
restore en un proyecto remoto/limpio sin ayuda oral.
