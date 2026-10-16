import { access, readFile } from "node:fs/promises";
import path from "node:path";

const dist = path.resolve(process.argv[2] ?? "frontend/dist");
const requiredFiles = ["index.html", "manifest.webmanifest", "sw.js"];

for (const file of requiredFiles) {
  await access(path.join(dist, file));
}

const indexHtml = await readFile(path.join(dist, "index.html"), "utf8");
if (/<(?:link|script)[^>]+(?:src|href)=["']https?:\/\//i.test(indexHtml)) {
  throw new Error("PWA_EXTERNAL_BOOTSTRAP_RESOURCE");
}

const manifest = JSON.parse(await readFile(path.join(dist, "manifest.webmanifest"), "utf8")) as {
  lang?: string;
  id?: string;
  scope?: string;
  icons?: Array<{ src?: string; sizes?: string }>;
};
const serviceWorker = await readFile(path.join(dist, "sw.js"), "utf8");

if (manifest.lang !== "es" || manifest.id !== "/" || manifest.scope !== "/") {
  throw new Error("PWA_MANIFEST_METADATA_INVALID");
}
if (!manifest.icons?.some((icon) => icon.sizes === "192x192") || !manifest.icons.some((icon) => icon.sizes === "512x512")) {
  throw new Error("PWA_MANIFEST_ICONS_INVALID");
}
const precacheUrls = [...serviceWorker.matchAll(/url:"([^"]+)"/g)].map((match) => match[1] ?? "");
const pesadoEnShell = precacheUrls.some((url) =>
  !url.startsWith("icons/") && /\.(?:mp3|wav|ogg|m4a|mp4|webm|png|jpe?g|webp)\b/i.test(url),
);
if (pesadoEnShell) {
  throw new Error("PWA_PRECACHE_CONTAINS_HEAVY_CONTENT");
}

console.log(`PWA válida: ${requiredFiles.join(", ")}`);
