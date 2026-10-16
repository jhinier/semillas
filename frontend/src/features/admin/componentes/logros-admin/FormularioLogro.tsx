import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { CodigoCriterioLogro, LogroAdminResumen } from "../../admin-logros.api";
import { CRITERIOS_LOGRO, validarCodigoLogro } from "./logros-admin-utils";

type Modo = "crear" | "editar";

type ValoresFormulario = {
  codigo: string;
  nombre: string;
  descripcion: string;
  url_icono: string;
  bono_xp: number;
  codigo_criterio: CodigoCriterioLogro;
  valor_criterio: number;
};

type Props = {
  abierto: boolean;
  modo: Modo;
  logro?: LogroAdminResumen | null;
  presentacion?: "modal" | "pagina";
  guardando: boolean;
  onCerrar: () => void;
  onGuardar: (valores: ValoresFormulario) => void;
};

const VALORES_INICIALES: ValoresFormulario = {
  codigo: "",
  nombre: "",
  descripcion: "",
  url_icono: "",
  bono_xp: 0,
  codigo_criterio: "temas_completados",
  valor_criterio: 1,
};

function valoresDesdeLogro(logro: LogroAdminResumen): ValoresFormulario {
  return {
    codigo: logro.codigo,
    nombre: logro.nombre,
    descripcion: logro.descripcion ?? "",
    url_icono: logro.url_icono ?? "",
    bono_xp: logro.bono_xp,
    codigo_criterio: logro.codigo_criterio,
    valor_criterio: logro.valor_criterio,
  };
}

export function FormularioLogro({
  abierto,
  modo,
  logro,
  presentacion = "modal",
  guardando,
  onCerrar,
  onGuardar,
}: Props) {
  const [valores, setValores] = useState<ValoresFormulario>(VALORES_INICIALES);

  useEffect(() => {
    if (!abierto) return;
    if (modo === "editar" && logro) {
      setValores(valoresDesdeLogro(logro));
    } else {
      setValores(VALORES_INICIALES);
    }
  }, [abierto, modo, logro]);

  if (!abierto) return null;

  const errorCodigo = modo === "crear" ? validarCodigoLogro(valores.codigo) : null;
  const errorNombre = valores.nombre.trim().length < 3 ? "Mínimo 3 caracteres." : null;
  const errorValor = valores.valor_criterio < 1 ? "Debe ser al menos 1." : null;

  const formularioValido =
    !errorCodigo && !errorNombre && !errorValor && valores.nombre.trim().length > 0;

  function actualizar<K extends keyof ValoresFormulario>(clave: K, valor: ValoresFormulario[K]) {
    setValores((actual) => ({ ...actual, [clave]: valor }));
  }

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!formularioValido) return;
    onGuardar({
      ...valores,
      codigo: valores.codigo.trim().toLowerCase(),
      nombre: valores.nombre.trim(),
      descripcion: valores.descripcion.trim(),
      url_icono: valores.url_icono.trim(),
    });
  }

  const titulo = modo === "crear" ? "Nuevo logro" : `Editar ${logro?.nombre ?? "logro"}`;

  const contenidoFormulario = (
    <form
      onSubmit={enviar}
      className={
        presentacion === "pagina"
          ? "mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-sm"
          : "relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
      }
    >
      <header className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
        <div>
          <h2 id="formulario-logro-titulo" className="text-xl font-black text-slate-950">
            {titulo}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Configura cómo y cuándo se desbloquea este reconocimiento.
          </p>
        </div>
        <button
          type="button"
          onClick={onCerrar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          aria-label="Cerrar"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </header>

      <div className="grid gap-5 px-6 py-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            Código
            {modo === "editar" ? (
              <input
                value={valores.codigo}
                disabled
                className="rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 font-mono text-sm font-normal text-slate-500"
              />
            ) : (
              <input
                value={valores.codigo}
                onChange={(e) => actualizar("codigo", e.target.value)}
                placeholder="primer-tema"
                className="rounded-xl border border-slate-300 px-3.5 py-2.5 font-mono text-sm font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                aria-invalid={errorCodigo ? true : undefined}
              />
            )}
            {errorCodigo ? (
              <span className="text-xs font-normal text-red-600">{errorCodigo}</span>
            ) : (
              <span className="text-xs font-normal text-slate-500">
                Identificador único en minúsculas, sin espacios.
              </span>
            )}
          </label>

          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            Bono de XP
            <input
              type="number"
              min={0}
              max={10000}
              value={valores.bono_xp}
              onChange={(e) => actualizar("bono_xp", Number(e.target.value))}
              className="rounded-xl border border-slate-300 px-3.5 py-2.5 font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
        </div>

        <label className="grid gap-1.5 text-sm font-bold text-slate-700">
          Nombre visible
          <input
            value={valores.nombre}
            onChange={(e) => actualizar("nombre", e.target.value)}
            placeholder="El Amor de Dios"
            className="rounded-xl border border-slate-300 px-3.5 py-2.5 font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            aria-invalid={errorNombre ? true : undefined}
          />
          {errorNombre ? (
            <span className="text-xs font-normal text-red-600">{errorNombre}</span>
          ) : null}
        </label>

        <label className="grid gap-1.5 text-sm font-bold text-slate-700">
          Descripción para el niño
          <textarea
            value={valores.descripcion}
            onChange={(e) => actualizar("descripcion", e.target.value)}
            rows={3}
            placeholder="Completaste tu primer tema sobre el amor de Dios."
            className="rounded-xl border border-slate-300 px-3.5 py-2.5 font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          />
        </label>

        <label className="grid gap-1.5 text-sm font-bold text-slate-700">
          URL del ícono
          <input
            value={valores.url_icono}
            onChange={(e) => actualizar("url_icono", e.target.value)}
            placeholder="https://cdn.semillas.org/medios/logros/amor.png"
            className="rounded-xl border border-slate-300 px-3.5 py-2.5 font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          />
          <span className="text-xs font-normal text-slate-500">
            Opcional. URL absoluta a una imagen PNG o SVG.
          </span>
        </label>

        <div className="grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-[1fr_8rem]">
          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            Criterio de desbloqueo
            <select
              value={valores.codigo_criterio}
              onChange={(e) => actualizar("codigo_criterio", e.target.value as CodigoCriterioLogro)}
              className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            >
              {CRITERIOS_LOGRO.map((c) => (
                <option key={c.codigo} value={c.codigo}>
                  {c.etiqueta}
                </option>
              ))}
            </select>
            <span className="text-xs font-normal text-slate-500">
              {CRITERIOS_LOGRO.find((c) => c.codigo === valores.codigo_criterio)?.descripcionCorta}
            </span>
          </label>

          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            Meta
            <input
              type="number"
              min={1}
              max={10000}
              value={valores.valor_criterio}
              onChange={(e) => actualizar("valor_criterio", Number(e.target.value))}
              className="rounded-xl border border-slate-300 px-3.5 py-2.5 font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              aria-invalid={errorValor ? true : undefined}
            />
            <span className="text-xs font-normal text-slate-500">
              {CRITERIOS_LOGRO.find((c) => c.codigo === valores.codigo_criterio)?.unidad}
            </span>
          </label>
        </div>
      </div>

      <footer className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
        <button
          type="button"
          onClick={onCerrar}
          disabled={guardando}
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={guardando || !formularioValido}
          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {guardando ? "Guardando…" : modo === "crear" ? "Crear logro" : "Guardar cambios"}
        </button>
      </footer>
    </form>
  );

  if (presentacion === "pagina") {
    return <section aria-labelledby="formulario-logro-titulo">{contenidoFormulario}</section>;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="formulario-logro-titulo"
      className="fixed inset-0 z-50 grid place-items-center p-6"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/45"
        aria-label="Cerrar formulario"
        onClick={onCerrar}
      />
      {contenidoFormulario}
    </div>
  );
}
