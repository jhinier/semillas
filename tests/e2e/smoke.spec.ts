import { expect, test } from "@playwright/test";

test("smoke del shell público y deep-link de la PWA", async ({ page, request }) => {
  const landing = await request.get("/");
  expect(landing.ok()).toBe(true);

  const deepLink = await request.get("/app");
  expect(deepLink.ok()).toBe(true);

  const manifest = await request.get("/manifest.webmanifest");
  expect(manifest.ok()).toBe(true);
  expect((await manifest.json()).lang).toBe("es");

  const serviceWorker = await request.get("/sw.js");
  expect(serviceWorker.ok()).toBe(true);

  await page.goto("/app");
  await expect(page.locator("#root")).toBeVisible();
});
