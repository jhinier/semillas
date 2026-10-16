import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const sourceRoot = path.join(repoRoot, "frontend", "src");

const componentRoots = [
  path.join(sourceRoot, "componentes"),
  path.join(sourceRoot, "components"),
  path.join(sourceRoot, "features"),
  path.join(sourceRoot, "shared", "layout"),
  path.join(sourceRoot, "paginas"),
];

function walk(directory, predicate = () => true) {
  if (!existsSync(directory)) return [];

  const files = [];
  for (const entry of readdirSync(directory)) {
    const absolutePath = path.join(directory, entry);
    const stats = statSync(absolutePath);
    if (stats.isDirectory()) files.push(...walk(absolutePath, predicate));
    else if (predicate(absolutePath)) files.push(absolutePath);
  }
  return files;
}

function isTypeScriptSource(filePath) {
  return filePath.endsWith(".tsx") && !/\.(?:stories|test)\.tsx$/.test(filePath);
}

function isVisualComponent(filePath) {
  if (!isTypeScriptSource(filePath)) return false;

  const relative = path.relative(sourceRoot, filePath).replaceAll(path.sep, "/");
  const isFeatureComponent = relative.startsWith("features/") && relative.includes("/componentes/");
  const isDirectPage = relative.startsWith("paginas/") && !relative.slice("paginas/".length).includes("/");
  const isIncluded =
    relative.startsWith("componentes/") ||
    relative.startsWith("components/") ||
    relative.startsWith("shared/layout/") ||
    isFeatureComponent ||
    isDirectPage;

  if (!isIncluded) return false;

  const source = readFileSync(filePath, "utf8");
  return /export\s+(?:default\s+)?(?:function|const|class)\s+[A-ZÁÉÍÓÚÑ]/u.test(source);
}

function resolveLocalImport(specifier, parentDirectory) {
  let basePath;
  if (specifier.startsWith(".")) basePath = path.resolve(parentDirectory, specifier);
  else if (specifier.startsWith("@/")) basePath = path.join(sourceRoot, specifier.slice(2));
  else return null;

  const candidates = [
    basePath,
    `${basePath}.tsx`,
    `${basePath}.ts`,
    path.join(basePath, "index.tsx"),
    path.join(basePath, "index.ts"),
  ];

  return candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile()) ?? null;
}

function getLocalImports(filePath) {
  const source = readFileSync(filePath, "utf8");
  const imports = [];
  const importPattern = /(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g;

  for (const match of source.matchAll(importPattern)) {
    const resolved = resolveLocalImport(match[1], path.dirname(filePath));
    if (resolved && resolved.startsWith(sourceRoot)) imports.push(path.resolve(resolved));
  }

  return imports;
}

const candidates = new Set(
  componentRoots.flatMap((root) => walk(root, isVisualComponent)).map((filePath) => path.resolve(filePath)),
);
const storyFiles = walk(sourceRoot, (filePath) => filePath.endsWith(".stories.tsx"));
const reachable = new Set();
const pending = [...storyFiles.map((filePath) => path.resolve(filePath))];

while (pending.length > 0) {
  const current = pending.pop();
  if (!current || reachable.has(current)) continue;

  reachable.add(current);
  for (const importedFile of getLocalImports(current)) {
    if (!reachable.has(importedFile)) pending.push(importedFile);
  }
}

const missing = [...candidates]
  .filter((filePath) => !reachable.has(filePath))
  .sort((a, b) => a.localeCompare(b));
const covered = candidates.size - missing.length;

console.log(`Storybook: ${covered}/${candidates.size} componentes visuales cubiertos mediante historias directas o compuestas.`);
console.log(`Historias encontradas: ${storyFiles.length}.`);

if (missing.length > 0) {
  console.error("\nComponentes sin cobertura Storybook:");
  for (const filePath of missing) {
    console.error(`- ${path.relative(sourceRoot, filePath).replaceAll(path.sep, "/")}`);
  }
  process.exitCode = 1;
}
