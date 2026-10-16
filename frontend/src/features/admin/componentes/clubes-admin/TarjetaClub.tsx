import type { ClubAdminResumen } from "../../admin-clubes.api";
import { BotonEstadoClub } from "./BotonEstadoClub";
import { ChevronRight, Users } from "lucide-react";

interface TarjetaClubProps {
  club: ClubAdminResumen;
  seleccionado: boolean;
  deshabilitado: boolean;
  onSeleccionar?: (id: string) => void;
  onAccion?: (confirmacion: { tipo: "archivar" | "reactivar"; club: ClubAdminResumen }) => void;
}

export function TarjetaClub({ club, seleccionado, deshabilitado, onSeleccionar, onAccion }: TarjetaClubProps) {
  return (
    <article
      className={`rounded-2xl border p-4 shadow-sm ${
        seleccionado ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200 bg-white"
      }`}
    >
      <button
        type="button"
        onClick={() => onSeleccionar?.(club.id)}
        className="flex w-full items-start justify-between gap-3 text-left"
      >
        <span>
          <span className="block font-black text-slate-800">{club.nombre}</span>
          <span className="mt-1 block text-xs text-slate-500">
            {club.lider?.apodo ?? "Sin líder"} · {club.miembros} miembros
          </span>
        </span>
        <ChevronRight className="size-5 text-slate-400" aria-hidden="true" />
      </button>
      <div className="mt-4 border-t border-slate-100 pt-3">
        <BotonEstadoClub club={club} deshabilitado={deshabilitado} onAccion={onAccion} />
      </div>
    </article>
  );
}
