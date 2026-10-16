import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { validarNombreObjeto } from "./backup-storage";

type StorageFetcher = (input: string, init?: RequestInit) => Promise<Response>;
type StorageManifest = { tipo: string; objetos: Array<{ bucket: string; nombre: string; bytes: number; sha256: string }> };

export async function leerManifestStorage(directory: string): Promise<StorageManifest> {
  const manifest = JSON.parse(await readFile(path.join(directory, "storage-manifest.json"), "utf8")) as StorageManifest;
  if (manifest.tipo !== "semillas-storage-backup" || !Array.isArray(manifest.objetos)) throw new Error("STORAGE_MANIFEST_INVALID");
  for (const objeto of manifest.objetos) {
    validarNombreObjeto(objeto.nombre);
    const contenido = await readFile(path.join(directory, objeto.bucket, ...objeto.nombre.split("/")));
    if (contenido.byteLength !== objeto.bytes || createHash("sha256").update(contenido).digest("hex") !== objeto.sha256) {
      throw new Error(`STORAGE_CHECKSUM_INVALID:${objeto.bucket}/${objeto.nombre}`);
    }
  }
  return manifest;
}

function rutaObjeto(baseUrl: string, bucket: string, nombre: string) {
  return `${baseUrl.replace(/\/$/, "")}/storage/v1/object/${encodeURIComponent(bucket)}/${nombre.split("/").map(encodeURIComponent).join("/")}`;
}

export function crearSolicitudSubida(baseUrl: string, bucket: string, nombre: string) {
  return rutaObjeto(baseUrl, bucket, nombre);
}

export async function ejecutarRestoreStorage(directory: string, fetcher: StorageFetcher = fetch): Promise<void> {
  const baseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!baseUrl || !key) throw new Error("SUPABASE_STORAGE_CREDENTIALS_REQUIRED");
  const manifest = await leerManifestStorage(directory);
  const buckets = [...new Set(manifest.objetos.map((objeto) => objeto.bucket))];
  for (const bucket of buckets) {
    const response = await fetcher(`${baseUrl}/storage/v1/bucket`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, apikey: key, "Content-Type": "application/json" },
      body: JSON.stringify({ name: bucket, public: false }),
    });
    if (!response.ok && response.status !== 409) throw new Error(`STORAGE_BUCKET_CREATE_FAILED:${bucket}`);
  }
  for (const objeto of manifest.objetos) {
    validarNombreObjeto(objeto.nombre);
    const contenido = await readFile(path.join(directory, objeto.bucket, ...objeto.nombre.split("/")));
    const response = await fetcher(rutaObjeto(baseUrl, objeto.bucket, objeto.nombre), {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, apikey: key, "Content-Type": "application/octet-stream", "x-upsert": "true" },
      body: contenido,
    });
    if (!response.ok) throw new Error(`STORAGE_UPLOAD_FAILED:${objeto.bucket}/${objeto.nombre}`);
  }
}

if (import.meta.main) {
  const directory = process.env.BACKUP_DIR;
  if (!directory) {
    console.error("Configura BACKUP_DIR");
    process.exitCode = 1;
  } else {
    await ejecutarRestoreStorage(directory);
    console.log("Restore Storage completado");
  }
}
