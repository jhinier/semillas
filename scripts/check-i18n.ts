import { readFile } from "node:fs/promises";

const recursos = await readFile("frontend/src/shared/i18n/resources.ts", "utf8");
const configuracion = await readFile("frontend/src/shared/i18n/i18n.ts", "utf8");
const main = await readFile("frontend/src/main.tsx", "utf8");
const namespaces = ["common", "pwa", "auth", "onboarding", "app", "crecer", "admin"];
const faltantes = namespaces.filter((namespace) => !new RegExp(`^\\s*${namespace}:`, "m").test(recursos));
if (faltantes.length > 0 || !/lng:\s*["']es["']/.test(configuracion) || !/fallbackLng:\s*["']es["']/.test(configuracion) || !main.includes("shared/i18n/i18n")) {
  console.error(`i18n inválida. Namespaces faltantes: ${faltantes.join(", ") || "ninguno"}`);
  process.exit(1);
}
console.log(`i18n válida: ${namespaces.length} namespaces, español activo`);
