import { validarManifestBackup } from "./restore-supabase";
import { leerManifestStorage } from "./restore-storage";

const directory = process.env.BACKUP_DIR;
if (!directory) {
  console.error("Configura BACKUP_DIR");
  process.exitCode = 1;
} else {
  await validarManifestBackup(directory);
  await leerManifestStorage(directory);
  console.log("Backups válidos: DB y Storage");
}
