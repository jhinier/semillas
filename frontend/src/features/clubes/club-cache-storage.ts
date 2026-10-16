import { db } from "@/lib/offline/db";

export async function limpiarCacheClubesScope(scopeId: string): Promise<void> {
  await db.clubsCache.toCollection().filter((entry) => entry.key.startsWith(`${scopeId}:`)).delete();
}
