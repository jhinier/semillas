import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

type StorageFetcher = (input: string, init?: RequestInit) => Promise<Response>;
export type StorageBackupEntry = { bucket: string; nombre: string; bytes: number; sha256: string };

export function validarNombreObjeto(nombre: string): void {
  if (!nombre || nombre.startsWith("/") || nombre.split("/").some((segmento) => segmento === ".." || segmento === ".")) {
    throw new Error("STORAGE_OBJECT_PATH_INVALID");
  }
}

function requerirConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_STORAGE_CREDENTIALS_REQUIRED");
  return { url: url.replace(/\/$/, ""), key };
}

function headers(key: string): HeadersInit {
  return { Authorization: `Bearer ${key}`, apikey: key };
}

async function listarObjetos(fetcher: StorageFetcher, baseUrl: string, key: string, bucket: string, prefix = ""): Promise<string[]> {
  const response = await fetcher(`${baseUrl}/storage/v1/object/list/${encodeURIComponent(bucket)}`, {
    method: "POST",
    headers: { ...headers(key), "Content-Type": "application/json" },
    body: JSON.stringify({ prefix, limit: 1000, offset: 0 }),
  });
  if (!response.ok) throw new Error(`STORAGE_LIST_FAILED:${bucket}`);
  const filas = await response.json() as Array<{ name?: string; id?: string | null }>;
  const objetos: string[] = [];
  for (const fila of filas) {
    if (!fila.name) continue;
    const nombre = prefix ? `${prefix}/${fila.name}` : fila.name;
    if (fila.id) objetos.push(nombre);
    else objetos.push(...await listarObjetos(fetcher, baseUrl, key, bucket, nombre));
  }
  return objetos;
}

export async function ejecutarBackupStorage(outputDir: string, fetcher: StorageFetcher = fetch): Promise<StorageBackupEntry[]> {
  const { url, key } = requerirConfig();
  const response = await fetcher(`${url}/storage/v1/bucket`, { headers: headers(key) });
  if (!response.ok) throw new Error("STORAGE_BUCKETS_FAILED");
  const buckets = await response.json() as Array<{ name: string }>;
  const entries: StorageBackupEntry[] = [];
  for (const bucket of buckets) {
    for (const nombre of await listarObjetos(fetcher, url, key, bucket.name)) {
      validarNombreObjeto(nombre);
      const fileResponse = await fetcher(`${url}/storage/v1/object/authenticated/${encodeURIComponent(bucket.name)}/${nombre.split("/").map(encodeURIComponent).join("/")}`, { headers: headers(key) });
      if (!fileResponse.ok) throw new Error(`STORAGE_DOWNLOAD_FAILED:${bucket.name}`);
      const contenido = Buffer.from(await fileResponse.arrayBuffer());
      const destino = path.join(outputDir, bucket.name, ...nombre.split("/"));
      await mkdir(path.dirname(destino), { recursive: true });
      await writeFile(destino, contenido);
      entries.push({ bucket: bucket.name, nombre, bytes: contenido.byteLength, sha256: createHash("sha256").update(contenido).digest("hex") });
    }
  }
  await writeFile(path.join(outputDir, "storage-manifest.json"), `${JSON.stringify({ tipo: "semillas-storage-backup", creado_en: new Date().toISOString(), objetos: entries }, null, 2)}\n`);
  return entries;
}

if (import.meta.main) {
  const outputDir = process.env.BACKUP_DIR;
  if (!outputDir) {
    console.error("Configura BACKUP_DIR");
    process.exitCode = 1;
  } else {
    await ejecutarBackupStorage(outputDir);
    console.log(`Backup Storage creado en ${outputDir}`);
  }
}
