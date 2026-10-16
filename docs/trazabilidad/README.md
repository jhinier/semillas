# Trazabilidad de requisitos

`requisitos.json` es la fuente canónica del estado de cierre. La matriz Markdown
explica el alcance; este archivo permite validarlo automáticamente en CI.

## Comandos

```bash
bun run test:trazabilidad
bun run trazabilidad:check
```

Un requisito solo puede pasar a `cumple` si incluye al menos una prueba y una
evidencia. Las rutas se interpretan relativas a la raíz del repositorio.

Estado local actual (13 de julio de 2026): 9 requisitos cumplen con evidencia
local, 38 están marcados para revalidación externa, 11 conservan una brecha
concreta y 1 es la desviación acordada de PWA en lugar de APK. Los estados no
se elevan a `cumple` por tener código solamente.
