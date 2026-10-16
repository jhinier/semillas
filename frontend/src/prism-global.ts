/**
 * Expone PrismJS como global en `window.Prism`.
 * DEBE ser el primer import del entry point (main.tsx) para que MDXEditor
 * lo encuentre antes de que su propio código de módulo se evalúe.
 */
import Prism from "prismjs";
import "prismjs/components/prism-markdown";

// MDXEditor busca `Prism` como variable global en tiempo de ejecución del módulo.
// Asignarlo aquí garantiza que esté disponible antes que cualquier otro módulo.
(window as unknown as Record<string, unknown>).Prism = Prism;
