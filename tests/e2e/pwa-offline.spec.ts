import { expect, test } from "@playwright/test";

test("mantiene el shell visible al reabrir sin conexión", async ({ page, context }) => {
  await page.goto("/");
  await page.evaluate(async () => {
    if ("serviceWorker" in navigator) await navigator.serviceWorker.ready;
  });
  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });

  await expect(page.locator("#root")).toBeVisible();
  await expect(page.locator("body")).not.toContainText("ERR_INTERNET_DISCONNECTED");
});
