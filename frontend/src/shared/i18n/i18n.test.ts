import { expect, test } from "bun:test";
import i18n, { instanciaI18n } from "./i18n";

test("mantiene español activo y fallback español", async () => {
  await instanciaI18n;
  expect(i18n.language).toBe("es");
  expect(i18n.options.fallbackLng).toEqual(["es"]);
  expect(i18n.t("loading")).toBe("Cargando…");
  expect(String(i18n.t("completed", { count: 2 }))).toBe("2 actividades completadas");
});

test("expone namespaces de aplicación", async () => {
  await instanciaI18n;
  expect(i18n.t("pwa:readyOffline")).toContain("conexión");
  expect(i18n.t("crecer:ensenar")).toBe("Enseñar");
});
