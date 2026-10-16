import type { SyncRepository } from "./sync.repository";

export interface SyncUnitOfWork {
  ejecutar<T>(operacion: (repositorio: SyncRepository) => Promise<T>): Promise<T>;
}

export function crearSyncUnitOfWork(repositorio: SyncRepository): SyncUnitOfWork {
  return {
    ejecutar: (operacion) => repositorio.ejecutarAtomico
      ? repositorio.ejecutarAtomico(operacion)
      : operacion(repositorio),
  };
}
