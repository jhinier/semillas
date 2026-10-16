import { useEffect, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  Check,
  Copy,
  KeyRound,
  Pencil,
  RefreshCw,
} from "lucide-react";
import type { DetalleClubAdmin } from "../../admin-clubes.api";

interface ConfiguracionClubAdminProps {
  detalle: DetalleClubAdmin;
  guardando: boolean;
  onGuardar: (datos: { nombre: string; descripcion: string | null }) => Promise<void>;
  onRegenerar: () => Promise<void>;
  onEstado: () => void;
}

async function copiarTexto(texto: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(texto);
    return;
  }

  const area = document.createElement("textarea");
  area.value = texto;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  area.remove();
}

export function ConfiguracionClubAdmin({
  detalle,
  guardando,
  onGuardar,
  onRegenerar,
  onEstado,
}: ConfiguracionClubAdminProps) {
  const [nombre, setNombre] = useState(detalle.club.nombre);
  const [descripcion, setDescripcion] = useState(detalle.club.descripcion ?? "");
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    setNombre(detalle.club.nombre);
    setDescripcion(detalle.club.descripcion ?? "");
  }, [detalle.club.descripcion, detalle.club.nombre]);

  const copiar = async () => {
    await copiarTexto(detalle.club.codigo_invitacion);
    setCopiado(true);
    window.setTimeout(() => setCopiado(false), 1600);
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_22rem] gap-5">
      <form
        className="rounded-xl border border-slate-200 bg-white p-5"
        onSubmit={(evento) => {
          evento.preventDefault();
          void onGuardar({ nombre: nombre.trim(), descripcion: descripcion.trim() || null });
        }}
      >
        <div className="flex items-center gap-2">
          <Pencil className="size-4 text-emerald-700" aria-hidden="true" />
          <h2 className="font-black text-slate-900">Información general</h2>
        </div>
        <div className="mt-5 grid gap-4">
          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            Nombre
            <input
              required
              minLength={3}
              maxLength={80}
              value={nombre}
              onChange={(evento) => setNombre(evento.target.value)}
              disabled={guardando}
              className="rounded-xl border border-slate-300 px-3.5 py-2.5 font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            Descripción
            <textarea
              rows={5}
              maxLength={300}
              value={descripcion}
              onChange={(evento) => setDescripcion(evento.target.value)}
              disabled={guardando}
              className="resize-none rounded-xl border border-slate-300 px-3.5 py-2.5 font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <button
            type="submit"
            disabled={guardando || nombre.trim().length < 3}
            className="justify-self-end rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Guardar cambios
          </button>
        </div>
      </form>

      <div className="grid content-start gap-5">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <KeyRound className="size-4 text-violet-700" aria-hidden="true" />
            <h2 className="font-black text-slate-900">Código de invitación</h2>
          </div>
          <p className="mt-2 text-sm leading-5 text-slate-500">
            Compártelo únicamente con personas que deban ingresar al club.
          </p>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2.5">
            <code className="flex-1 text-base font-black tracking-[0.16em] text-violet-800">
              {detalle.club.codigo_invitacion}
            </code>
            <button
              type="button"
              onClick={() => void copiar()}
              className="grid size-9 place-items-center rounded-lg text-violet-700 hover:bg-violet-100"
              aria-label="Copiar código de invitación"
            >
              {copiado ? <Check className="size-4" /> : <Copy className="size-4" />}
            </button>
          </div>
          <button
            type="button"
            onClick={() => void onRegenerar()}
            disabled={guardando}
            className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-violet-700 hover:underline disabled:opacity-50"
          >
            <RefreshCw className="size-3.5" aria-hidden="true" /> Generar un código nuevo
          </button>
        </section>

        <section className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h2 className="font-black text-red-900">Estado del club</h2>
          <p className="mt-2 text-sm leading-5 text-red-700">
            {detalle.club.activo
              ? "Archivar oculta el club y evita nuevas incorporaciones."
              : "Reactiva el club para permitir nuevamente su uso."}
          </p>
          <button
            type="button"
            onClick={onEstado}
            disabled={guardando}
            className={`mt-4 inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-bold text-white disabled:opacity-50 ${
              detalle.club.activo
                ? "bg-red-600 hover:bg-red-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {detalle.club.activo ? (
              <Archive className="size-4" aria-hidden="true" />
            ) : (
              <ArchiveRestore className="size-4" aria-hidden="true" />
            )}
            {detalle.club.activo ? "Archivar club" : "Reactivar club"}
          </button>
        </section>
      </div>
    </div>
  );
}
