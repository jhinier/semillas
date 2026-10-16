import { Archive, ArchiveRestore } from "lucide-react";
import type { ClubAdminResumen } from "../../admin-clubes.api";

const etiquetas: Record<"archivar" | "reactivar", string> = {
  archivar: "Archivar",
  reactivar: "Reactivar",
};

interface BotonEstadoClubProps {
  club: ClubAdminResumen;
  deshabilitado: boolean;
  soloIcono?: boolean;
  onAccion?: (confirmacion: { tipo: "archivar" | "reactivar"; club: ClubAdminResumen }) => void;
}

export function BotonEstadoClub({ club, deshabilitado, soloIcono = false, onAccion }: BotonEstadoClubProps) {
  const tipo = club.activo ? "archivar" : "reactivar";
  const Icono = club.activo ? Archive : ArchiveRestore;
  return (
    <button
      type="button"
      title={`${etiquetas[tipo]} ${club.nombre}`}
      aria-label={`${etiquetas[tipo]} ${club.nombre}`}
      disabled={deshabilitado}
      onClick={() => onAccion?.({ tipo, club })}
      className={`inline-flex items-center justify-center gap-2 rounded-lg text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
        club.activo ? "text-slate-600 hover:bg-slate-100" : "text-emerald-700 hover:bg-emerald-50"
      } ${soloIcono ? "size-9" : "px-3 py-2"}`}
    >
      <Icono className="size-4" aria-hidden="true" />
      {soloIcono ? <span className="sr-only">{etiquetas[tipo]}</span> : etiquetas[tipo]}
    </button>
  );
}
