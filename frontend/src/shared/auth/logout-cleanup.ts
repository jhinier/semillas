export type LogoutCleanupDependencies = {
  clearOfflineTables: Array<() => Promise<unknown>>;
  listCacheNames?: () => Promise<string[]>;
  deleteCache?: (name: string) => Promise<boolean>;
  clearQueries: () => void;
};

export async function limpiarDatosSesionOffline(dependencias: LogoutCleanupDependencies): Promise<void> {
  await Promise.all(dependencias.clearOfflineTables.map((limpiar) => limpiar()));
  if (dependencias.listCacheNames && dependencias.deleteCache) {
    const nombres = await dependencias.listCacheNames();
    await Promise.all(
      nombres
        .filter((nombre) => nombre.includes("semillas-user-api") || nombre.includes("semillas-offline-media"))
        .map((nombre) => dependencias.deleteCache!(nombre)),
    );
  }
  dependencias.clearQueries();
}
