import { useEffect, useState, type FormEvent } from "react";
import { Medal, X } from "lucide-react";
import in1Img from "@/assets/images/Ilustraciones/in1.webp";
import in2Img from "@/assets/images/Ilustraciones/in2.webp";
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

const CODIGOS_CRITERIO_VALIDOS = new Set<CodigoCriterioLogro>([
  "temas_completados",
  "actividades_completadas",
  "dias_racha",
]);

function valoresDesdeLogro(logro: LogroAdminResumen): ValoresFormulario {
  const criterioValido: CodigoCriterioLogro = CODIGOS_CRITERIO_VALIDOS.has(logro.codigo_criterio)
    ? logro.codigo_criterio
    : "temas_completados";
  const valorNormalizado =
    typeof logro.valor_criterio === "number" && Number.isFinite(logro.valor_criterio) && logro.valor_criterio >= 1
      ? Math.round(logro.valor_criterio)
      : 1;
  const bonoNormalizado =
    typeof logro.bono_xp === "number" && Number.isFinite(logro.bono_xp) && logro.bono_xp >= 0
      ? Math.round(logro.bono_xp)
      : 0;

  return {
    codigo: logro.codigo ?? "",
    nombre: logro.nombre ?? "",
    descripcion: logro.descripcion ?? "",
    url_icono: logro.url_icono ?? "",
    bono_xp: bonoNormalizado,
    codigo_criterio: criterioValido,
    valor_criterio: valorNormalizado,
  };
}

function normalizarUrlIconoParaEnvio(rawUrl: string): string {
  const limpia = rawUrl.trim();
  if (!limpia) return "";
  if (/^https?:\/\//i.test(limpia)) return limpia;
  if (typeof window !== "undefined" && limpia.startsWith("/")) {
    try {
      return new URL(limpia, window.location.origin).toString();
    } catch {
      return "";
    }
  }
  return "";
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
  const [valores, setValores] = useState<ValoresFormulario>(
    modo === "editar" && logro ? valoresDesdeLogro(logro) : VALORES_INICIALES,
  );
  const [errorImagen, setErrorImagen] = useState(false);

  useEffect(() => {
    if (!abierto) return;
    setErrorImagen(false);
    if (modo === "editar" && logro) {
      setValores(valoresDesdeLogro(logro));
    } else {
      setValores(VALORES_INICIALES);
    }
    // Solo reinicializar cuando cambia el estado de apertura, modo o el ID del logro
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, modo, logro?.id]);

  if (!abierto) return null;

  const errorCodigo = modo === "crear" ? validarCodigoLogro(valores.codigo) : null;
  const errorNombre = valores.nombre.trim().length < 3 ? "Mínimo 3 caracteres." : null;
  const errorValor = !Number.isFinite(valores.valor_criterio) || valores.valor_criterio < 1 ? "Debe ser al menos 1." : null;

  const formularioValido =
    !errorCodigo && !errorNombre && !errorValor && valores.nombre.trim().length > 0;

  function actualizar<K extends keyof ValoresFormulario>(clave: K, valor: ValoresFormulario[K]) {
    if (clave === "url_icono") {
      setErrorImagen(false);
    }
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
      url_icono: normalizarUrlIconoParaEnvio(valores.url_icono),
      bono_xp: Math.max(0, Math.round(Number(valores.bono_xp) || 0)),
      valor_criterio: Math.max(1, Math.round(Number(valores.valor_criterio) || 1)),
    });
  }

  const titulo = modo === "crear" ? "Nuevo logro" : `Editar ${logro?.nombre ?? "logro"}`;
  const fallbackIcono = valores.codigo.includes("1") ? in1Img : in2Img;
  const previewSrc = !errorImagen && valores.url_icono.trim() ? valores.url_icono.trim() : fallbackIcono;

  const contenidoFormulario = (
    <form
      onSubmit={enviar}
      className={
        presentacion === "pagina"
          ? "mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-sm"
          : "relative z-10 flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      }
    >
      <header className="flex shrink-0 items-start justify-between border-b border-slate-200 px-6 py-4">
        <div>
          <h2 id="formulario-logro-titulo" className="text-xl font-black text-slate-950">
            {titulo}
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
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

      <div className="grid gap-4 overflow-y-auto px-6 py-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            Código
            {modo === "editar" ? (
              <input
                value={valores.codigo}
                readOnly
                className="rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2 font-mono text-sm font-normal text-slate-600 outline-none"
              />
            ) : (
              <input
                value={valores.codigo}
                onChange={(e) => actualizar("codigo", e.target.value)}
                placeholder="primer-tema"
                className="rounded-xl border border-slate-300 px-3.5 py-2 font-mono text-sm font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
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
              onChange={(e) => actualizar("bono_xp", Math.max(0, Number(e.target.value) || 0))}
              className="rounded-xl border border-slate-300 px-3.5 py-2 font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
        </div>

        <label className="grid gap-1.5 text-sm font-bold text-slate-700">
          Nombre visible
          <input
            value={valores.nombre}
            onChange={(e) => actualizar("nombre", e.target.value)}
            placeholder="El Amor de Dios"
            className="rounded-xl border border-slate-300 px-3.5 py-2 font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
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
            rows={2}
            placeholder="Completaste tu primer tema sobre el amor de Dios."
            className="rounded-xl border border-slate-300 px-3.5 py-2 font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          />
        </label>

        <div className="grid gap-1.5 text-sm font-bold text-slate-700">
          <label htmlFor="formulario-logro-icono">URL del ícono</label>
          <div className="flex items-center gap-3">
            <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              {previewSrc ? (
                <img
                  src={previewSrc}
                  alt="Vista previa de insignia"
                  className="size-full object-cover"
                  onError={() => setErrorImagen(true)}
                />
              ) : (
                <Medal className="size-5 text-emerald-600" aria-hidden="true" />
              )}
            </div>
            <input
              id="formulario-logro-icono"
              value={valores.url_icono}
              onChange={(e) => actualizar("url_icono", e.target.value)}
              placeholder="https://cdn.semillas.org/medios/logros/amor.png"
              className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3.5 py-2 font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <span className="text-xs font-normal text-slate-500">
            Opcional. URL absoluta a una imagen PNG, WebP o SVG (si se deja vacío o falla, se usa la insignia predeterminada).
          </span>
        </div>

        <div className="grid gap-4 rounded-xl border border-slate-200/80 bg-slate-50 p-4 sm:grid-cols-[1fr_9rem]">
          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            Criterio de desbloqueo
            <select
              value={valores.codigo_criterio}
              onChange={(e) => actualizar("codigo_criterio", e.target.value as CodigoCriterioLogro)}
              className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
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
              onChange={(e) => actualizar("valor_criterio", Math.max(1, Number(e.target.value) || 1))}
              className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              aria-invalid={errorValor ? true : undefined}
            />
            <span className="text-xs font-normal text-slate-500">
              {CRITERIOS_LOGRO.find((c) => c.codigo === valores.codigo_criterio)?.unidad}
            </span>
          </label>
        </div>
      </div>

      <footer className="flex shrink-0 justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
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
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6"
    >
      <button
        type="button"
        className="fixed inset-0 bg-slate-950/45"
        aria-label="Cerrar formulario"
        onClick={onCerrar}
      />
      {contenidoFormulario}
    </div>
  );
}
