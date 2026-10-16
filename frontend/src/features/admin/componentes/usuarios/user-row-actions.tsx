import { BotonAccion } from "../dashboard/admin.helpers";

export function MenuAccionesUsuario() {
  return (
    <div className="flex items-center justify-end gap-1">
      <BotonAccion title="Ver detalles" icon="fa-eye" />
      <BotonAccion title="Opciones" icon="fa-ellipsis-vertical" />
    </div>
  );
}
