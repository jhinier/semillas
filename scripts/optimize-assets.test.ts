import { expect, test } from "bun:test";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { validarAssetVisual } from "./optimize-assets";

test("rechaza un asset que supera dimensiones o peso permitido", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "semillas-assets-"));
  const filePath = path.join(directory, "grande.png");
  await sharp({ create: { width: 32, height: 32, channels: 4, background: "#2e9e5b" } }).png().toFile(filePath);

  await expect(validarAssetVisual(filePath, { maxBytes: 1, maxWidth: 64, maxHeight: 64 })).rejects.toThrow("ASSET_SIZE_EXCEEDED");
  await expect(validarAssetVisual(filePath, { maxBytes: 100_000, maxWidth: 16, maxHeight: 16 })).rejects.toThrow("ASSET_DIMENSIONS_EXCEEDED");
  await rm(directory, { recursive: true, force: true });
});

test("acepta un asset dentro de los límites", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "semillas-assets-"));
  const filePath = path.join(directory, "pequeno.webp");
  await mkdir(directory, { recursive: true });
  await sharp({ create: { width: 8, height: 8, channels: 4, background: "#f7f4ec" } }).webp().toFile(filePath);

  await expect(validarAssetVisual(filePath)).resolves.toMatchObject({ width: 8, height: 8, format: "webp" });
  await rm(directory, { recursive: true, force: true });
});
