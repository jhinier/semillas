import { peticion } from "../../shared/api/api";
import type { Senda } from "../../shared/api/api";

export function obtenerSendas() {
  return peticion<Senda[]>("/sendas", { autenticar: false });
}
