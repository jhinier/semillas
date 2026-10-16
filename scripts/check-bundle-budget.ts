import { brotliCompressSync, gzipSync } from "node:zlib";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

export const BUDGETS = {
  maxLargestJavaScriptGzip: 300 * 1024,
  maxStylesheetGzip: 100 * 1024,
} as const;

type Asset = { file: string; bytes: number; gzip: number; brotli: number };

async function collectAssets(directory: string, prefix = ""): Promise<Asset[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const assets: Asset[] = [];
  for (const entry of entries) {
    const file = path.join(directory, entry.name);
    const relative = path.join(prefix, entry.name);
    if (entry.isDirectory()) {
      assets.push(...(await collectAssets(file, relative)));
      continue;
    }
    if (!/\.(js|css)$/.test(entry.name)) continue;
    const content = await readFile(file);
    assets.push({
      file: relative,
      bytes: content.byteLength,
      gzip: gzipSync(content, { level: 9 }).byteLength,
      brotli: brotliCompressSync(content).byteLength,
    });
  }
  return assets;
}

export async function validarBudget(distDirectory = path.resolve("frontend/dist")) {
  const assets = await collectAssets(path.join(distDirectory, "assets"));
  const javascript = assets.filter((asset) => asset.file.endsWith(".js"));
  const stylesheets = assets.filter((asset) => asset.file.endsWith(".css"));
  const largestJavaScript = javascript.toSorted((a, b) => b.gzip - a.gzip)[0];
  const stylesheetGzip = stylesheets.reduce((total, asset) => total + asset.gzip, 0);
  const initialStylesheetFiles = await obtenerHojasIniciales(distDirectory, stylesheets);
  const initialStylesheetGzip = initialStylesheetFiles.reduce((total, asset) => total + asset.gzip, 0);
  const result = {
    assets,
    largestJavaScript,
    javascriptGzip: javascript.reduce((total, asset) => total + asset.gzip, 0),
    stylesheetGzip,
    valid:
      (!largestJavaScript || largestJavaScript.gzip <= BUDGETS.maxLargestJavaScriptGzip) &&
      initialStylesheetGzip <= BUDGETS.maxStylesheetGzip,
  };
  return { ...result, initialStylesheetFiles, initialStylesheetGzip };
}

async function obtenerHojasIniciales(distDirectory: string, stylesheets: Asset[]): Promise<Asset[]> {
  try {
    const html = await readFile(path.join(distDirectory, "index.html"), "utf8");
    const hrefs = [...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+\.css)["']/g)].map((match) => match[1]);
    const names = new Set(hrefs.map((href) => path.basename(href)));
    const iniciales = stylesheets.filter((asset) => names.has(path.basename(asset.file)));
    return iniciales.length > 0 ? iniciales : stylesheets;
  } catch {
    return stylesheets;
  }
}

function kibibytes(bytes: number) {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

if (import.meta.main) {
  const distDirectory = process.argv[2] ?? path.resolve("frontend/dist");
  try {
    await stat(path.join(distDirectory, "assets"));
    const result = await validarBudget(distDirectory);
    console.log(`JS gzip total: ${kibibytes(result.javascriptGzip)}`);
    console.log(`CSS gzip inicial: ${kibibytes(result.initialStylesheetGzip)} / ${kibibytes(BUDGETS.maxStylesheetGzip)}`);
    console.log(`CSS gzip total informativo: ${kibibytes(result.stylesheetGzip)}`);
    if (result.largestJavaScript) {
      console.log(`JS mayor: ${result.largestJavaScript.file} ${kibibytes(result.largestJavaScript.gzip)} / ${kibibytes(BUDGETS.maxLargestJavaScriptGzip)}`);
    }
    if (!result.valid) {
      console.error("BUNDLE_BUDGET_EXCEEDED");
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(`No se pudo leer el build en ${distDirectory}`, error);
    process.exitCode = 1;
  }
}
