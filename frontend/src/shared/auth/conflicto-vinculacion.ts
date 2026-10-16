import { sessionStorageApi } from "@/shared/api/session";

const CLAVE_CONFLICTO = "semillas_conflicto_vinculacion";
const EVENTO_CONFLICTO = "semillas:conflicto-vinculacion";

export function publicarConflictoVinculacion(mensaje: string) {
  sessionStorageApi.setConflictoMensaje(mensaje);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(EVENTO_CONFLICTO));
  }
}

export function consumirConflictoVinculacion(): string | null {
  const mensaje = sessionStorageApi.getConflictoMensaje();
  if (mensaje === null) {
    return null;
  }
  sessionStorageApi.clearConflictoMensaje();
  return mensaje;
}

export function descartarConflictoVinculacion() {
  sessionStorageApi.clearConflictoMensaje();
}

export function eventoConflictoVinculacion(): string {
  return EVENTO_CONFLICTO;
}
