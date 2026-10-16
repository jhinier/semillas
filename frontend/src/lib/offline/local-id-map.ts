export type LocalIdMap = Map<string, string>;

/** Crea IDs locales estables durante la importación de un paquete. */
export function crearMapaIdsLocales(
  serverIds: Iterable<string>,
  existentes: ReadonlyMap<string, string> = new Map(),
): LocalIdMap {
  const mapa: LocalIdMap = new Map();
  for (const serverId of serverIds) {
    const localId = existentes.get(serverId) ?? crypto.randomUUID();
    mapa.set(serverId, localId);
  }
  return mapa;
}

export function obtenerIdLocal(mapa: LocalIdMap, serverId: string): string {
  const localId = mapa.get(serverId);
  if (!localId) throw new Error(`No existe mapeo local para ${serverId}`);
  return localId;
}
