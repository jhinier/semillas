import { useState } from "react";
import type { CrearRetoClubAdminSolicitud } from "../../admin-clubes.api";

export function enviarRetoDesdeFormulario({
  clubId,
  nombre,
  descripcion,
  metrica = "xp_grupal",
  objetivo,
  xp = "100",
  fechaInicio,
  fechaFin,
  onCrear,
}: {
  clubId: string;
  nombre: string;
  descripcion?: string;
  metrica?: CrearRetoClubAdminSolicitud["codigo_metrica"];
  objetivo: string;
  xp?: string;
  fechaInicio?: string;
  fechaFin: string;
  onCrear?: (clubId: string, datos: CrearRetoClubAdminSolicitud) => void;
}) {
  const nombreLimpio = nombre.trim();
  const valorObjetivo = Number(objetivo);
  const xpReto = Number(xp);
  const inicioBase = fechaInicio || new Date().toISOString().slice(0, 10);
  const fechaInicial = new Date(`${inicioBase}T00:00:00`);
  const fechaFinal = new Date(`${fechaFin}T23:59:59`);

  if (nombreLimpio.length < 3) return "Escribe un nombre de al menos 3 caracteres.";
  if (!Number.isFinite(valorObjetivo) || valorObjetivo < 1) return "La meta debe ser un número mayor que cero.";
  if (!Number.isFinite(xpReto) || xpReto < 0) return "La recompensa de XP no puede ser negativa.";
  if (!fechaFin || Number.isNaN(fechaFinal.getTime()) || Number.isNaN(fechaInicial.getTime())) {
    return "Ingresa una fecha de finalización válida.";
  }
  if (fechaFinal <= fechaInicial) return "La fecha final debe ser posterior a la fecha de inicio.";

  onCrear?.(clubId, {
    nombre: nombreLimpio,
    descripcion: descripcion?.trim() || undefined,
    codigo_metrica: metrica,
    valor_objetivo: valorObjetivo,
    xp_reto: xpReto,
    fecha_inicio: fechaInicial.toISOString(),
    fecha_fin: fechaFinal.toISOString(),
  });
  return null;
}

interface FormularioCrearRetoProps {
  clubId: string;
  deshabilitado: boolean;
  onCrear?: (clubId: string, datos: CrearRetoClubAdminSolicitud) => void;
}

export function FormularioCrearReto({ clubId, deshabilitado, onCrear }: FormularioCrearRetoProps) {
  const hoy = new Date().toISOString().slice(0, 10);
  const [nombre, establecerNombre] = useState("");
  const [descripcion, establecerDescripcion] = useState("");
  const [metrica, establecerMetrica] = useState<CrearRetoClubAdminSolicitud["codigo_metrica"]>("xp_grupal");
  const [objetivo, establecerObjetivo] = useState("10");
  const [xp, establecerXp] = useState("100");
  const [fechaInicio, establecerFechaInicio] = useState(hoy);
  const [fechaFin, establecerFechaFin] = useState("");
  const [errorFormulario, establecerErrorFormulario] = useState<string>();

  const handleSubmit = (evento: React.FormEvent) => {
    evento.preventDefault();
    const error = enviarRetoDesdeFormulario({
      clubId,
      nombre,
      descripcion,
      metrica,
      objetivo,
      xp,
      fechaInicio,
      fechaFin,
      onCrear,
    });
    establecerErrorFormulario(error ?? undefined);
  };

  const claseCampo = "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100";

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <label className="grid gap-1.5 text-sm font-bold text-slate-700" htmlFor={`reto-nombre-${clubId}`}>
        Nombre del reto
        <input
          id={`reto-nombre-${clubId}`}
          required
          value={nombre}
          onChange={(evento) => establecerNombre(evento.target.value)}
          placeholder="Ej. Completar 10 temas"
          disabled={deshabilitado}
          maxLength={120}
          className={claseCampo}
        />
      </label>

      <label className="grid gap-1.5 text-sm font-bold text-slate-700" htmlFor={`reto-descripcion-${clubId}`}>
        Descripción <span className="font-normal text-slate-400">(opcional)</span>
        <textarea
          id={`reto-descripcion-${clubId}`}
          value={descripcion}
          onChange={(evento) => establecerDescripcion(evento.target.value)}
          disabled={deshabilitado}
          maxLength={300}
          rows={2}
          className={`${claseCampo} resize-none`}
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="grid gap-1.5 text-sm font-bold text-slate-700" htmlFor={`reto-metrica-${clubId}`}>
          Métrica
          <select
            id={`reto-metrica-${clubId}`}
            value={metrica}
            onChange={(evento) => establecerMetrica(evento.target.value as CrearRetoClubAdminSolicitud["codigo_metrica"])}
            disabled={deshabilitado}
            className={claseCampo}
          >
            <option value="xp_grupal">XP grupal</option>
            <option value="actividades_completadas">Actividades completadas</option>
            <option value="temas_completados">Temas completados</option>
          </select>
        </label>

        <label className="grid gap-1.5 text-sm font-bold text-slate-700" htmlFor={`reto-objetivo-${clubId}`}>
          Meta
          <input
            id={`reto-objetivo-${clubId}`}
            required
            min="1"
            type="number"
            value={objetivo}
            onChange={(evento) => establecerObjetivo(evento.target.value)}
            disabled={deshabilitado}
            className={claseCampo}
          />
        </label>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <label className="grid gap-1.5 text-sm font-bold text-slate-700" htmlFor={`reto-xp-${clubId}`}>
          Recompensa XP
          <input
            id={`reto-xp-${clubId}`}
            min="0"
            type="number"
            value={xp}
            onChange={(evento) => establecerXp(evento.target.value)}
            disabled={deshabilitado}
            className={claseCampo}
          />
        </label>

        <label className="grid gap-1.5 text-sm font-bold text-slate-700" htmlFor={`reto-inicio-${clubId}`}>
          Inicio
          <input
            id={`reto-inicio-${clubId}`}
            required
            type="date"
            value={fechaInicio}
            onChange={(evento) => establecerFechaInicio(evento.target.value)}
            disabled={deshabilitado}
            className={claseCampo}
          />
        </label>

        <label className="grid gap-1.5 text-sm font-bold text-slate-700" htmlFor={`reto-fin-${clubId}`}>
          Finalización
          <input
            id={`reto-fin-${clubId}`}
            required
            type="date"
            value={fechaFin}
            onChange={(evento) => establecerFechaFin(evento.target.value)}
            disabled={deshabilitado}
            className={claseCampo}
          />
        </label>
      </div>

      {errorFormulario ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {errorFormulario}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={deshabilitado}
        className="justify-self-end rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        Crear reto
      </button>
    </form>
  );
}
