import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { expect, test } from "bun:test";
import { validarBudget } from "./check-bundle-budget";

async function fixture(content: string) {
  const root = await mkdtemp(path.join(os.tmpdir(), "semillas-budget-"));
  await mkdir(path.join(root, "assets"));
  await writeFile(path.join(root, "assets", "entry.js"), content);
  return root;
}

async function fixtureWithStyles(entryCss: string, deferredCss: string) {
  const root = await fixture("console.log('semillas');");
  await writeFile(path.join(root, "index.html"), '<link rel="stylesheet" href="/assets/entry.css">');
  await writeFile(path.join(root, "assets", "entry.css"), entryCss);
  await writeFile(path.join(root, "assets", "deferred.css"), deferredCss);
  return root;
}

test("rechaza un chunk JavaScript que supera 300 KiB comprimido", async () => {
  const incompressibleEnough = Array.from({ length: 100_000 }, (_, index) => `${index.toString(36)}-${(index * 7919).toString(36)}`).join("|");
  const root = await fixture("const payload = " + JSON.stringify(incompressibleEnough));
  const result = await validarBudget(root);
  expect(result.valid).toBe(false);
  expect(result.largestJavaScript?.gzip).toBeGreaterThan(300 * 1024);
});

test("acepta un build dentro de los budgets", async () => {
  const root = await fixture("console.log('semillas');");
  const result = await validarBudget(root);
  expect(result.valid).toBe(true);
});

test("valida el CSS inicial y no bloquea por CSS diferido de rutas", async () => {
  const root = await fixtureWithStyles("body{color:#123}", "x{" + "a".repeat(200_000) + "}");
  const result = await validarBudget(root);
  expect(result.initialStylesheetGzip).toBeLessThan(100 * 1024);
  expect(result.stylesheetGzip).toBeGreaterThan(result.initialStylesheetGzip);
  expect(result.valid).toBe(true);
});
