import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

type Manifest = {
  tipo: string;
  archivos: Array<{ archivo: string; bytes: number; sha256: string }>;
};
const DATABASE_URL_PLACEHOLDER = "$SUPABASE_DATABASE_URL";

export async function validarManifestBackup(directory: string): Promise<Manifest> {
  const manifest = JSON.parse(await readFile(path.join(directory, "manifest.json"), "utf8")) as Manifest;
  if (manifest.tipo !== "semillas-db-backup" || !Array.isArray(manifest.archivos) || manifest.archivos.length !== 3) {
    throw new Error("BACKUP_MANIFEST_INVALID");
  }
  for (const entry of manifest.archivos) {
    const contenido = await readFile(path.join(directory, entry.archivo));
    const checksum = createHash("sha256").update(contenido).digest("hex");
    if (contenido.byteLength !== entry.bytes || checksum !== entry.sha256) {
      throw new Error(`BACKUP_CHECKSUM_INVALID:${entry.archivo}`);
    }
  }
  return manifest;
}

export function comandosRestoreDb(directory: string, databaseUrl: string): string[][] {
  return [
    ["psql", DATABASE_URL_PLACEHOLDER, "--set", "ON_ERROR_STOP=1", "--single-transaction", "--file", path.join(directory, "restore.sql")],
  ];
}

async function ejecutar(comando: string[]): Promise<void> {
  const proceso = Bun.spawn(comando, { stdout: "ignore", stderr: "pipe" });
  if (await proceso.exited !== 0) throw new Error("RESTORE_COMMAND_FAILED");
}

export async function ejecutarRestoreDb(directory: string, databaseUrl: string): Promise<void> {
  await validarManifestBackup(directory);
  if (!databaseUrl.startsWith("postgres")) throw new Error("DATABASE_URL_INVALID");
  const temporal = await mkdtemp(path.join(os.tmpdir(), "semillas-restore-"));
  const restoreFile = path.join(temporal, "restore.sql");
  try {
    const [roles, schema, data] = await Promise.all([
      readFile(path.join(directory, "roles.sql"), "utf8"),
      readFile(path.join(directory, "schema.sql"), "utf8"),
      readFile(path.join(directory, "data.sql"), "utf8"),
    ]);
    await writeFile(restoreFile, `${roles}\n${schema}\n${data}\n`, "utf8");
    await ejecutar(["psql", databaseUrl, "--set", "ON_ERROR_STOP=1", "--single-transaction", "--file", restoreFile]);
  } finally {
    await rm(temporal, { recursive: true, force: true });
  }
}

if (import.meta.main) {
  const directory = process.env.BACKUP_DIR;
  const databaseUrl = process.env.SUPABASE_DATABASE_URL;
  if (!directory || !databaseUrl) {
    console.error("Configura BACKUP_DIR y SUPABASE_DATABASE_URL");
    process.exitCode = 1;
  } else {
    await ejecutarRestoreDb(directory, databaseUrl);
    console.log("Restore DB completado");
  }
}
