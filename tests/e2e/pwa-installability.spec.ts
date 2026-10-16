import { expect, test } from "@playwright/test";

test("publica un manifest instalable para la PWA", async ({ page, request }) => {
  await page.goto("/");
  const manifestHref = await page.locator('link[rel="manifest"]').getAttribute("href");
  expect(manifestHref).toBeTruthy();

  const response = await request.get(manifestHref ?? "/manifest.webmanifest");
  expect(response.ok()).toBe(true);
  const manifest = await response.json();

  expect(manifest.lang).toBe("es");
  expect(manifest.id).toBe("/");
  expect(manifest.scope).toBe("/");
  expect(manifest.display).toBe("standalone");
  expect(manifest.icons).toEqual(expect.arrayContaining([
    expect.objectContaining({ sizes: "192x192" }),
    expect.objectContaining({ sizes: "512x512" }),
  ]));
});

test("registra el service worker del shell", async ({ page }) => {
  await page.goto("/");
  const registration = await page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) return null;
    const ready = await navigator.serviceWorker.ready;
    return { scope: ready.scope, scriptURL: ready.active?.scriptURL ?? null };
  });

  expect(registration?.scope).toContain("/");
  expect(registration?.scriptURL).toContain("/sw.js");
});
