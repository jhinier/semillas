interface Confirmacion {
  tipo: "archivar" | "reactivar" | "expulsar" | "transferir" | "cerrar-reto";
  club: { id: string; nombre: string };
  nombreObjetivo?: string;
  usuarioId?: string;
  retoId?: string;
}

const contenidoConfirmacion: Record<Confirmacion["tipo"], { accion: string; descripcion: string; peligro: boolean }> = {
  archivar: {
    accion: "Archivar",
    descripcion: "El club dejará de estar disponible para sus miembros hasta que un administrador lo reactive.",
    peligro: true,
  },
  reactivar: {
    accion: "Reactivar",
    descripcion: "El club volverá a estar disponible y podrá recibir actividad y nuevos miembros.",
    peligro: false,
  },
  expulsar: {
    accion: "Expulsar",
    descripcion: "La persona perderá su membresía, pero conservará su cuenta y progreso personal.",
    peligro: true,
  },
  transferir: {
    accion: "Transferir liderazgo a",
    descripcion: "La persona seleccionada pasará a ser responsable del club y el responsable actual quedará como miembro.",
    peligro: false,
  },
  "cerrar-reto": {
    accion: "Cerrar",
    descripcion: "El reto finalizará inmediatamente y dejará de recibir nuevos aportes.",
    peligro: true,
  },
};

interface DialogoConfirmacionProps {
  confirmacion: Confirmacion;
  mutando: boolean;
  onConfirmar?: () => void;
  onCancelar?: () => void;
}

export function DialogoConfirmacion({ confirmacion, mutando, onConfirmar, onCancelar }: DialogoConfirmacionProps) {
  const contenido = contenidoConfirmacion[confirmacion.tipo];
  const objetivo = confirmacion.nombreObjetivo ? ` ${confirmacion.nombreObjetivo}` : ` ${confirmacion.club.nombre}`;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="confirmar-clubes-title" className="fixed inset-0 z-50 grid place-items-center p-6">
      <button type="button" aria-label="Cancelar confirmación" onClick={onCancelar} className="absolute inset-0 cursor-default bg-slate-950/45" />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <h3 id="confirmar-clubes-title" className="text-xl font-black text-slate-950">
          ¿{contenido.accion}{objetivo}?
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{contenido.descripcion}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancelar} disabled={mutando} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={mutando}
            className={`rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50 ${contenido.peligro ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
          >
            {mutando ? "Procesando…" : contenido.accion}
          </button>
        </div>
      </div>
    </div>
  );
}

export type { Confirmacion };
