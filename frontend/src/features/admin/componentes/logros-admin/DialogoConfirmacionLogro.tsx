import { Loader2, X } from "lucide-react";
import "./admin-logros-studio.css";

export type ConfirmacionLogroAccion = {
  tipo: "archivar" | "reactivar";
  logroId: string;
  nombre: string;
};

type Props = {
  confirmacion: ConfirmacionLogroAccion | null;
  mutando: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
};

export function DialogoConfirmacionLogro({ confirmacion, mutando, onConfirmar, onCancelar }: Props) {
  if (!confirmacion) return null;

  const esArchivar = confirmacion.tipo === "archivar";
  const titulo = esArchivar ? `¿Archivar "${confirmacion.nombre}"?` : `¿Reactivar "${confirmacion.nombre}"?`;
  const descripcion = esArchivar
    ? "El logro dejará de otorgarse a nuevos usuarios. Los usuarios que ya lo desbloquearon conservan su progreso."
    : "El logro volverá a estar disponible para nuevos desbloqueos.";
  const textoAccion = esArchivar ? "Archivar" : "Reactivar";
  const colorAccion = esArchivar ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialogo-confirmar-logro-titulo"
      className="fixed inset-0 z-50 grid place-items-center p-6"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]"
        aria-label="Cancelar"
        onClick={onCancelar}
      />
      <div className="admin-logros-modal-card max-w-md p-6">
        <header className="flex items-start justify-between gap-3">
          <h2 id="dialogo-confirmar-logro-titulo" className="admin-logros-title text-xl">
            {titulo}
          </h2>
          <button
            type="button"
            onClick={onCancelar}
            className="admin-logros-secondary-btn min-h-0 p-2"
            aria-label="Cerrar"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>
        <p className="admin-logros-subtitle mt-2 text-sm leading-6">{descripcion}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancelar}
            disabled={mutando}
            className="admin-logros-secondary-btn"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={mutando}
            className={`inline-flex min-h-[2.75rem] items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50 ${colorAccion}`}
          >
            {mutando ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            {mutando ? "Procesando…" : textoAccion}
          </button>
        </div>
      </div>
    </div>
  );
}
