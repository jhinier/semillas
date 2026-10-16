import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export type BackupConfig = { outputDir: string; projectRef: string };
const DATABASE_URL_PLACEHOLDER = "$SUPABASE_DATABASE_URL";

export function validarConfiguracionBackup(config: BackupConfig): void {
  if (!config.projectRef.trim() || !/^[a-z0-9-]+$/.test(config.projectRef)) {
    throw new Error("SUPABASE_PROJECT_REF_INVALID");
  }
  const output = path.resolve(config.outputDir);
  const repo = path.resolve(".");
  if (output === repo || !output.endsWith(`${path.sep}backups`) && !output.includes(`${path.sep}backups${path.sep}`)) {
    throw new Error("BACKUP_DIRECTORY_UNSAFE");
  }
}

export function comandosBackupDb(outputDir: string): string[][] {
  return [
    ["pg_dump", "--dbname", DATABASE_URL_PLACEHOLDER, "--schema=public", "--schema-only", "--no-owner", "--no-privileges", "--file", path.join(outputDir, "schema.sql")],
    ["pg_dump", "--dbname", DATABASE_URL_PLACEHOLDER, "--data-only", "--schema=public", "--no-owner", "--no-privileges", "--column-inserts", "--file", path.join(outputDir, "data.sql")],
    ["pg_dumpall", "--dbname", DATABASE_URL_PLACEHOLDER, "--roles-only", "--file", path.join(outputDir, "roles.sql")],
  ];
}

function resolverComando(comando: string[], databaseUrl: string): string[] {
  return comando.map((argumento) => argumento === DATABASE_URL_PLACEHOLDER ? databaseUrl : argumento);
}

async function ejecutar(comando: string[], databaseUrl: string): Promise<void> {
  const proceso = Bun.spawn(resolverComando(comando, databaseUrl), { stdout: "ignore", stderr: "pipe", env: process.env });
  const codigo = await proceso.exited;
  if (codigo !== 0) throw new Error(`BACKUP_COMMAND_FAILED:${comando.slice(0, 3).join(" ")}`);
}

export async function crearManifestBackup(outputDir: string, projectRef: string) {
  const archivos = ["schema.sql", "data.sql", "roles.sql"];
  const entradas = [];
  for (const nombre of archivos) {
    const contenido = await Bun.file(path.join(outputDir, nombre)).arrayBuffer();
    entradas.push({
      archivo: nombre,
      bytes: contenido.byteLength,
      sha256: createHash("sha256").update(Buffer.from(contenido)).digest("hex"),
    });
  }
  const manifest = {
    tipo: "semillas-db-backup",
    proyecto: projectRef,
    creado_en: new Date().toISOString(),
    archivos: entradas,
  };
  await writeFile(path.join(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

export async function ejecutarBackupDb(config: BackupConfig): Promise<void> {
  validarConfiguracionBackup(config);
  const databaseUrl = process.env.SUPABASE_DATABASE_URL;
  if (!databaseUrl?.startsWith("postgres")) throw new Error("SUPABASE_DATABASE_URL_REQUIRED");
  await mkdir(config.outputDir, { recursive: true });
  for (const comando of comandosBackupDb(config.outputDir)) await ejecutar(comando, databaseUrl);
  await crearManifestBackup(config.outputDir, config.projectRef);
}

if (import.meta.main) {
  const projectRef = process.env.SUPABASE_PROJECT_REF;
  const outputDir = process.env.BACKUP_DIR ?? path.join("backups", new Date().toISOString().replace(/[:.]/g, "-"));
  if (!projectRef) {
    console.error("Configura SUPABASE_PROJECT_REF");
    process.exitCode = 1;
  } else {
    await ejecutarBackupDb({ outputDir, projectRef });
    console.log(`Backup DB creado en ${outputDir}`);
  }
}
