import { expect, test } from "bun:test";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { comandosBackupDb, validarConfiguracionBackup } from "./backup-supabase";
import { comandosRestoreDb, validarManifestBackup } from "./restore-supabase";

test("rechaza destinos de backup fuera de backups", () => {
  expect(() => validarConfiguracionBackup({ outputDir: "/tmp/secreto", projectRef: "abc123" })).toThrow("BACKUP_DIRECTORY_UNSAFE");
  expect(() => validarConfiguracionBackup({ outputDir: "backups/run-1", projectRef: "abc123" })).not.toThrow();
});

test("construye comandos sin imprimir credenciales", () => {
  const backup = comandosBackupDb("backups/run-1").flat().join(" ");
  expect(backup).toContain("pg_dump");
  expect(backup).toContain("pg_dumpall");
  expect(backup).toContain("--data-only");
  expect(backup).not.toContain("postgresql://");
  const restore = comandosRestoreDb("backups/run-1", "postgresql://example.test/db").flat().join(" ");
  expect(restore).not.toContain("postgresql://");
  expect(restore).toContain("ON_ERROR_STOP=1");
  expect(restore).toContain("--single-transaction");
});

test("rechaza manifest o checksum inválido", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "semillas-restore-"));
  await mkdir(directory, { recursive: true });
  for (const name of ["schema.sql", "data.sql", "roles.sql"]) await writeFile(path.join(directory, name), name);
  await writeFile(path.join(directory, "manifest.json"), JSON.stringify({ tipo: "semillas-db-backup", archivos: [] }));
  await expect(validarManifestBackup(directory)).rejects.toThrow("BACKUP_MANIFEST_INVALID");
});
