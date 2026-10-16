import { readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

export type AssetLimits = {
  maxBytes: number;
  maxWidth: number;
  maxHeight: number;
};

export const DEFAULT_ASSET_LIMITS: AssetLimits = {
  maxBytes: 4 * 1024 * 1024,
  maxWidth: 4096,
  maxHeight: 4096,
};

export async function validarAssetVisual(
  filePath: string,
  limits: AssetLimits = DEFAULT_ASSET_LIMITS,
) {
  const archivo = Bun.file(filePath);
  const metadata = await sharp(filePath).metadata();
  const bytes = archivo.size;

  if (bytes > limits.maxBytes) throw new Error(`ASSET_SIZE_EXCEEDED:${filePath}`);
  if ((metadata.width ?? 0) > limits.maxWidth || (metadata.height ?? 0) > limits.maxHeight) {
    throw new Error(`ASSET_DIMENSIONS_EXCEEDED:${filePath}`);
  }

  return { filePath, bytes, width: metadata.width ?? 0, height: metadata.height ?? 0, format: metadata.format ?? "unknown" };
}

async function listarArchivos(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listarArchivos(fullPath));
    else if (/\.(?:png|jpe?g|webp|avif)$/i.test(entry.name)) files.push(fullPath);
  }
  return files;
}

export async function auditarAssets(directory: string, limits?: AssetLimits) {
  const files = await listarArchivos(directory);
  return Promise.all(files.map((filePath) => validarAssetVisual(filePath, limits)));
}

export async function convertirAssetsAWebp(directory: string, sourceRoot = "frontend/src") {
  const files = (await listarArchivos(directory)).filter((filePath) => /\.(?:png|jpe?g)$/i.test(filePath));
  const converted = [] as Array<{ from: string; to: string; bytes: number }>;

  for (const filePath of files) {
    const relative = path.relative(directory, filePath).split(path.sep).join("/");
    const output = filePath.replace(/\.(?:png|jpe?g)$/i, ".webp");
    await sharp(filePath).webp({ quality: 82, effort: 4 }).toFile(output);
    const assetReference = `assets/images/${relative}`;
    const webpReference = assetReference.replace(/\.(?:png|jpe?g)$/i, ".webp");
    const sourceFiles = new Bun.Glob(`${sourceRoot}/**/*.{ts,tsx,css}`).scan(".");
    for await (const sourceFile of sourceFiles) {
      const contents = await Bun.file(sourceFile).text();
      if (!contents.includes(assetReference)) continue;
      await writeFile(sourceFile, contents.replaceAll(assetReference, webpReference), "utf8");
    }
    await unlink(filePath);
    converted.push({ from: filePath, to: output, bytes: Bun.file(output).size });
  }
  return converted;
}

if (import.meta.main) {
  const shouldConvert = process.argv.includes("--convert");
  const directory = process.argv.find((argument) => !argument.startsWith("--") && argument !== process.argv[0] && argument !== process.argv[1]) ?? "frontend/src/assets/images";
  if (shouldConvert) {
    const converted = await convertirAssetsAWebp(directory);
    console.log(`Assets convertidos a WebP: ${converted.length}`);
  }
  const assets = await auditarAssets(directory);
  console.log(`Assets válidos: ${assets.length}`);
}
