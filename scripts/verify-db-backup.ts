import { validarManifestBackup } from "./restore-supabase";

const directory = process.env.BACKUP_DIR;

if (!directory) {
  console.error("Configura BACKUP_DIR");
  process.exitCode = 1;
} else {
  await validarManifestBackup(directory);
  console.log("Backup DB válido: manifest y checksums verificados");
}
