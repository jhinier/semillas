import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const rutasPublicas = ["/", "/login", "/recuperar-contrasena", "/verificar-correo"];

for (const ruta of rutasPublicas) {
  test(`axe no detecta problemas críticos en ${ruta}`, async ({ page }) => {
    await page.goto(ruta);
    await page.waitForLoadState("networkidle");

    const resultado = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();

    const graves = resultado.violations.filter((item) => ["critical", "serious"].includes(item.impact ?? ""));
    expect(graves).toEqual([]);
  });
}
