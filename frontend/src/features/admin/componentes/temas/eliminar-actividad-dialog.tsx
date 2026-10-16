import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { eliminarActividad } from "../../admin.api";
import type { ActivityTableRow } from "./admin-activities-table";

type EliminarActividadDialogProps = {
  actividad: ActivityTableRow;
  onClose: () => void;
  onConfirm: () => void;
};

export function EliminarActividadDialog({ actividad, onClose, onConfirm }: EliminarActividadDialogProps) {
  const [confirmText, setConfirmText] = useState("");

  const deleteMutation = useMutation({
    mutationFn: () => eliminarActividad(actividad.id),
    onSuccess: () => {
      onConfirm();
    },
  });

  const handleConfirm = () => {
    if (confirmText.toLowerCase() === "eliminar") {
      deleteMutation.mutate();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-xl font-black text-slate-800 mb-2">Eliminar actividad</h2>
        <p className="text-sm text-slate-500 mb-4">
          ¿Estás seguro de que quieres eliminar <strong className="text-slate-700">{actividad.titulo}</strong>? Esta acción no se puede deshacer.
        </p>

        <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4">
          <p className="text-xs text-red-600 font-medium">
            <i className="fa-solid fa-triangle-exclamation mr-1" />
            Se eliminarán también todas las opciones asociadas a esta actividad.
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-600 mb-1">
            Escribe <span className="text-red-500">eliminar</span> para confirmar
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="eliminar"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirmText.toLowerCase() !== "eliminar" || deleteMutation.isPending}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader className="animate-spin" size={16} />
                Eliminando...
              </>
            ) : (
              "Eliminar"
            )}
          </button>
        </div>

        {deleteMutation.isError && (
          <p className="mt-3 text-xs text-red-500 text-center">
            <i className="fa-solid fa-circle-exclamation mr-1" />
            Error al eliminar. Intenta de nuevo.
          </p>
        )}
      </div>
    </div>
  );
}
