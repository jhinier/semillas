import { useEffect, useState, type FormEvent } from "react";
import {
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  Flame,
  Link2,
  Sparkles,
  X,
} from "lucide-react";
import in1Img from "@/assets/images/Ilustraciones/in1.webp";
import in2Img from "@/assets/images/Ilustraciones/in2.webp";
import recompensaImg from "@/assets/images/Ilustraciones/Recompensa.webp";
import semillaImg from "@/assets/images/Ilustraciones/Semilla.webp";
import exploradoresImg from "@/assets/images/Ilustraciones/Exploradores.webp";
import versiculoImg from "@/assets/images/Ilustraciones/Versiculo del dia.webp";
import type { CodigoCriterioLogro, LogroAdminResumen } from "../../admin-logros.api";
import {
  CRITERIOS_LOGRO,
  describirReglaLogro,
  formatearMetaCriterio,
  generarCodigoLogroDesdeNombre,
  validarCodigoLogro,
} from "./logros-admin-utils";
import "./admin-logros-studio.css";

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

type InsigniaPreset = {
  id: string;
  nombre: string;
  valorUrl: string;
  previewSrc: string;
  coincidencia?: string;
};

const INSIGNIAS_PREDEFINIDAS: InsigniaPreset[] = [
  { id: "default", nombre: "Dorada", valorUrl: "", previewSrc: in1Img },
  { id: "estrella", nombre: "Estrella", valorUrl: in2Img, previewSrc: in2Img, coincidencia: "in2." },
  { id: "recompensa", nombre: "Cofre premio", valorUrl: recompensaImg, previewSrc: recompensaImg, coincidencia: "Recompensa." },
  { id: "versiculo", nombre: "Biblia y luz", valorUrl: versiculoImg, previewSrc: versiculoImg, coincidencia: "Versiculo del dia" },
  { id: "semilla", nombre: "Semilla", valorUrl: semillaImg, previewSrc: semillaImg, coincidencia: "Semilla." },
  { id: "explorador", nombre: "Explorador", valorUrl: exploradoresImg, previewSrc: exploradoresImg, coincidencia: "Exploradores." },
];

const METAS_RAPIDAS = [1, 3, 5, 10];
const XP_RAPIDOS = [0, 10, 25, 50, 100];

const VALORES_INICIALES: ValoresFormulario = {
  codigo: "",
  nombre: "",
  descripcion: "",
  url_icono: "",
  bono_xp: 25,
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

function esPresetActivo(preset: InsigniaPreset, urlActual: string): boolean {
  const limpia = urlActual.trim();
  if (!limpia) return preset.id === "default";
  if (limpia === preset.valorUrl) return true;
  if (preset.coincidencia && limpia.includes(preset.coincidencia)) return true;
  return false;
}

function iconoParaCriterio(codigo: CodigoCriterioLogro) {
  if (codigo === "actividades_completadas") return <CheckCircle2 className="size-4 text-emerald-500" aria-hidden="true" />;
  if (codigo === "dias_racha") return <Flame className="size-4 text-amber-500" aria-hidden="true" />;
  return <BookOpen className="size-4 text-violet-500" aria-hidden="true" />;
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
  const [codigoManual, setCodigoManual] = useState(modo === "editar");
  const [tocadoNombre, setTocadoNombre] = useState(false);
  const [tocadoCodigo, setTocadoCodigo] = useState(false);
  const [intentoEnviar, setIntentoEnviar] = useState(false);
  const [errorImagen, setErrorImagen] = useState(false);
  const [mostrarUrlExterna, setMostrarUrlExterna] = useState(false);

  useEffect(() => {
    if (!abierto) return;
    setErrorImagen(false);
    setTocadoNombre(false);
    setTocadoCodigo(false);
    setIntentoEnviar(false);
    if (modo === "editar" && logro) {
      const iniciales = valoresDesdeLogro(logro);
      setValores(iniciales);
      setCodigoManual(true);
      const urlLimpia = iniciales.url_icono.trim();
      const coincidePreset = INSIGNIAS_PREDEFINIDAS.some((op) => esPresetActivo(op, urlLimpia));
      setMostrarUrlExterna(Boolean(urlLimpia) && !coincidePreset);
    } else {
      setValores(VALORES_INICIALES);
      setCodigoManual(false);
      setMostrarUrlExterna(false);
    }
    // Solo reinicializar cuando cambia el estado de apertura, modo o el ID del logro
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, modo, logro?.id]);

  if (!abierto) return null;

  const codigoCalculado =
    modo === "crear" && !codigoManual
      ? generarCodigoLogroDesdeNombre(valores.nombre)
      : valores.codigo;

  const errorNombreRaw =
    valores.nombre.trim().length < 3
      ? "Escribe un nombre de al menos 3 letras (ej. Primer paso)."
      : null;
  const errorCodigoRaw = modo === "crear" ? validarCodigoLogro(codigoCalculado) : null;
  const errorValorRaw =
    !Number.isFinite(valores.valor_criterio) || valores.valor_criterio < 1
      ? "La meta debe ser al menos 1."
      : null;

  const mostrarErrorNombre = (tocadoNombre || intentoEnviar) ? errorNombreRaw : null;
  const mostrarErrorCodigo = (tocadoCodigo || intentoEnviar) ? errorCodigoRaw : null;
  const formularioValido = !errorNombreRaw && !errorCodigoRaw && !errorValorRaw;

  function actualizar<K extends keyof ValoresFormulario>(clave: K, valor: ValoresFormulario[K]) {
    if (clave === "url_icono") {
      setErrorImagen(false);
    }
    setValores((actual) => {
      const siguiente = { ...actual, [clave]: valor };
      if (clave === "nombre" && modo === "crear" && !codigoManual) {
        siguiente.codigo = generarCodigoLogroDesdeNombre(String(valor));
      }
      return siguiente;
    });
  }

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setIntentoEnviar(true);
    setTocadoNombre(true);
    setTocadoCodigo(true);
    if (!formularioValido) return;
    onGuardar({
      ...valores,
      codigo: codigoCalculado.trim().toLowerCase(),
      nombre: valores.nombre.trim(),
      descripcion: valores.descripcion.trim(),
      url_icono: normalizarUrlIconoParaEnvio(valores.url_icono),
      bono_xp: Math.max(0, Math.round(Number(valores.bono_xp) || 0)),
      valor_criterio: Math.max(1, Math.round(Number(valores.valor_criterio) || 1)),
    });
  }

  const titulo = modo === "crear" ? "Nuevo logro" : `Editar ${logro?.nombre ?? "logro"}`;
  const fallbackIcono = codigoCalculado.includes("2") ? in2Img : in1Img;
  const urlActualLimpia = valores.url_icono.trim();
  const previewSrc =
    !errorImagen && urlActualLimpia ? urlActualLimpia : fallbackIcono;
  const reglaTexto = describirReglaLogro(valores.codigo_criterio, valores.valor_criterio);
  const criterioSeleccionado =
    CRITERIOS_LOGRO.find((c) => c.codigo === valores.codigo_criterio) ?? CRITERIOS_LOGRO[0]!;

  const pasosContenido = (
    <>
      {/* Paso 1: Identidad del logro */}
      <section className="admin-logros-step" aria-label="Paso 1: Nombre y mensaje">
        <div className="admin-logros-step__head">
          <span className="admin-logros-step__num" aria-hidden="true">1</span>
          <div>
            <h3 className="admin-logros-step__title">Nombre y mensaje para el niño</h3>
            <p className="admin-logros-step__desc">
              Usa palabras claras y motivadoras que los niños comprendan rápido.
            </p>
          </div>
        </div>

        <label className="admin-logros-field">
          <span className="admin-logros-label">Nombre del logro</span>
          <input
            value={valores.nombre}
            onChange={(e) => actualizar("nombre", e.target.value)}
            onBlur={() => setTocadoNombre(true)}
            placeholder="Ej. Explorador del Amor de Dios"
            className="admin-logros-input"
            aria-invalid={mostrarErrorNombre ? true : undefined}
          />
          {mostrarErrorNombre ? (
            <span className="admin-logros-error" role="alert">{mostrarErrorNombre}</span>
          ) : (
            <span className="admin-logros-hint">
              Aparecerá como título de la medalla en el perfil del niño.
            </span>
          )}
        </label>

        <label className="admin-logros-field">
          <span className="admin-logros-label">Mensaje de felicitación (opcional)</span>
          <textarea
            value={valores.descripcion}
            onChange={(e) => actualizar("descripcion", e.target.value)}
            rows={2}
            placeholder="Ej. ¡Completaste tu primer tema y aprendiste cuánto te ama Dios!"
            className="admin-logros-textarea"
          />
        </label>

        <details className="admin-logros-details" open={Boolean(mostrarErrorCodigo)}>
          <summary>Configuración técnica opcional (identificador interno)</summary>
          <div className="admin-logros-details__body">
            <label className="admin-logros-field">
              <span className="admin-logros-label">Código</span>
              {modo === "editar" ? (
                <input
                  value={valores.codigo}
                  readOnly
                  className="admin-logros-input font-mono text-sm"
                />
              ) : (
                <input
                  value={codigoCalculado}
                  onChange={(e) => {
                    setCodigoManual(true);
                    actualizar("codigo", e.target.value);
                  }}
                  onBlur={() => setTocadoCodigo(true)}
                  placeholder="primer-tema"
                  className="admin-logros-input font-mono text-sm"
                  aria-invalid={mostrarErrorCodigo ? true : undefined}
                />
              )}
              {mostrarErrorCodigo ? (
                <span className="admin-logros-error">{mostrarErrorCodigo}</span>
              ) : (
                <span className="admin-logros-hint">
                  Se genera automáticamente a partir del nombre. Solo minúsculas, números y guiones.
                </span>
              )}
            </label>
          </div>
        </details>
      </section>

      {/* Paso 2: Regla de desbloqueo y puntos XP */}
      <section className="admin-logros-step" aria-label="Paso 2: Cómo se gana y recompensa">
        <div className="admin-logros-step__head">
          <span className="admin-logros-step__num" aria-hidden="true">2</span>
          <div>
            <h3 className="admin-logros-step__title">¿Cómo se gana este logro?</h3>
            <p className="admin-logros-step__desc">
              Elige qué debe lograr el estudiante y cuántos puntos de experiencia (XP) recibe.
            </p>
          </div>
        </div>

        <fieldset className="admin-logros-field border-0 p-0">
          <legend className="admin-logros-label mb-2">Criterio de desbloqueo</legend>
          <div className="admin-logros-choice-grid" role="radiogroup" aria-label="Criterio de desbloqueo">
            {CRITERIOS_LOGRO.map((c) => {
              const seleccionado = valores.codigo_criterio === c.codigo;
              return (
                <button
                  key={c.codigo}
                  type="button"
                  role="radio"
                  aria-checked={seleccionado}
                  onClick={() => actualizar("codigo_criterio", c.codigo)}
                  className={`admin-logros-choice ${seleccionado ? "is-selected" : ""}`}
                >
                  <span className="admin-logros-choice__title">
                    {iconoParaCriterio(c.codigo)}
                    {c.etiqueta}
                  </span>
                  <span className="admin-logros-choice__desc">{c.descripcionCorta}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="admin-logros-numbers-grid">
          <div className="admin-logros-field">
            <label htmlFor="logro-meta-input" className="admin-logros-label">
              Cantidad necesaria ({criterioSeleccionado.unidad})
            </label>
            <div className="admin-logros-chips" aria-label="Cantidades rápidas">
              {METAS_RAPIDAS.map((cantidad) => (
                <button
                  key={cantidad}
                  type="button"
                  onClick={() => actualizar("valor_criterio", cantidad)}
                  className={`admin-logros-chip ${valores.valor_criterio === cantidad ? "is-selected" : ""}`}
                >
                  {formatearMetaCriterio(valores.codigo_criterio, cantidad)}
                </button>
              ))}
            </div>
            <input
              id="logro-meta-input"
              type="number"
              min={1}
              max={10000}
              value={valores.valor_criterio}
              onChange={(e) => actualizar("valor_criterio", Math.max(1, Number(e.target.value) || 1))}
              className="admin-logros-input"
              aria-invalid={errorValorRaw ? true : undefined}
            />
          </div>

          <div className="admin-logros-field">
            <label htmlFor="logro-xp-input" className="admin-logros-label">
              Puntos de premio (Bono de XP)
            </label>
            <div className="admin-logros-chips" aria-label="Puntos XP rápidos">
              {XP_RAPIDOS.map((xp) => (
                <button
                  key={xp}
                  type="button"
                  onClick={() => actualizar("bono_xp", xp)}
                  className={`admin-logros-chip ${valores.bono_xp === xp ? "is-selected" : ""}`}
                >
                  {xp === 0 ? "Sin XP" : `+${xp} XP`}
                </button>
              ))}
            </div>
            <input
              id="logro-xp-input"
              type="number"
              min={0}
              max={10000}
              value={valores.bono_xp}
              onChange={(e) => actualizar("bono_xp", Math.max(0, Number(e.target.value) || 0))}
              className="admin-logros-input"
            />
          </div>
        </div>

        <div className="admin-logros-rule-summary">
          <Sparkles className="size-4 shrink-0" aria-hidden="true" />
          <span>
            Regla automática: <strong>{reglaTexto}</strong>
            {valores.bono_xp > 0 ? ` (+${valores.bono_xp} XP)` : " (insignia sin XP extra)"}
          </span>
        </div>
      </section>

      {/* Paso 3: Imagen visual de la insignia */}
      <section className="admin-logros-step" aria-label="Paso 3: Imagen de la insignia">
        <div className="admin-logros-step__head">
          <span className="admin-logros-step__num" aria-hidden="true">3</span>
          <div>
            <h3 className="admin-logros-step__title">Elige la imagen de la medalla</h3>
            <p className="admin-logros-step__desc">
              Escoge una ilustración lista para usar o pega un enlace si ya tienes una imagen subida.
            </p>
          </div>
        </div>

        <div className="admin-logros-badge-grid" role="radiogroup" aria-label="Diseños de medalla">
          {INSIGNIAS_PREDEFINIDAS.map((preset) => {
            const activo = esPresetActivo(preset, valores.url_icono);
            return (
              <button
                key={preset.id}
                type="button"
                role="radio"
                aria-checked={activo}
                onClick={() => {
                  actualizar("url_icono", preset.valorUrl);
                  setMostrarUrlExterna(false);
                }}
                className={`admin-logros-badge-option ${activo ? "is-selected" : ""}`}
              >
                <img src={preset.previewSrc} alt="" aria-hidden="true" />
                <span>{preset.nombre}</span>
              </button>
            );
          })}
        </div>

        <div>
          <button
            type="button"
            onClick={() => setMostrarUrlExterna((prev) => !prev)}
            className="admin-logros-secondary-btn"
          >
            <Link2 className="size-4" aria-hidden="true" />
            {mostrarUrlExterna ? "Ocultar enlace externo" : "Usar enlace de imagen externo"}
          </button>

          {mostrarUrlExterna ? (
            <div className="admin-logros-field mt-3">
              <label htmlFor="formulario-logro-icono" className="admin-logros-label">
                URL del ícono
              </label>
              <input
                id="formulario-logro-icono"
                value={valores.url_icono}
                onChange={(e) => actualizar("url_icono", e.target.value)}
                placeholder="https://cdn.semillas.org/medios/logros/amor.png"
                className="admin-logros-input"
              />
              <span className="admin-logros-hint">
                Opcional. Si el enlace falla o se deja vacío, se usará la medalla dorada predeterminada.
              </span>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );

  const tarjetaVistaPrevia = (
    <aside className="admin-logros-preview-panel" aria-label="Vista previa para el estudiante">
      <div>
        <p className="admin-logros-eyebrow">Vista previa</p>
        <h3 className="admin-logros-step__title mt-1">Así lo verá el estudiante</h3>
      </div>

      <article className="admin-logros-preview-card">
        <div className="admin-logros-preview-card__art">
          <img
            src={previewSrc}
            alt="Vista previa de insignia"
            onError={() => setErrorImagen(true)}
          />
        </div>
        <div className="min-w-0">
          <span className="admin-logros-rule-pill">
            <Award className="size-3.5 text-emerald-600" aria-hidden="true" />
            Insignia desbloqueable
          </span>
          <h4 className="admin-logros-preview-card__title">
            {valores.nombre.trim() || "Nombre de tu logro"}
          </h4>
          <p className="admin-logros-preview-card__desc">
            {valores.descripcion.trim() || "Sigue aprendiendo y completa el reto para ganar esta medalla."}
          </p>
          <div className="admin-logros-preview-card__meta">
            <span className="admin-logros-rule-pill">{reglaTexto}</span>
            <span className="admin-logros-xp-pill">
              {valores.bono_xp > 0 ? `+${valores.bono_xp} XP` : "Reconocimiento"}
            </span>
          </div>
        </div>
      </article>

      <div className="admin-logros-checklist">
        <div className={`admin-logros-check-item ${!errorNombreRaw ? "is-ready" : ""}`}>
          <Check className="size-4 shrink-0" aria-hidden="true" />
          <span>{errorNombreRaw ? "Paso 1: Elige un nombre (mín. 3 letras)" : "Nombre listo para mostrar"}</span>
        </div>
        <div className="admin-logros-check-item is-ready">
          <Check className="size-4 shrink-0" aria-hidden="true" />
          <span>Regla clara: {formatearMetaCriterio(valores.codigo_criterio, valores.valor_criterio)}</span>
        </div>
        <div className="admin-logros-check-item is-ready">
          <Check className="size-4 shrink-0" aria-hidden="true" />
          <span>
            {valores.bono_xp > 0 ? `Entrega +${valores.bono_xp} XP al reclamarse` : "Medalla conmemorativa (0 XP)"}
          </span>
        </div>
      </div>
    </aside>
  );

  if (presentacion === "pagina") {
    return (
      <section aria-labelledby="formulario-logro-titulo">
        <h2 id="formulario-logro-titulo" className="sr-only">
          {titulo}
        </h2>
        <form onSubmit={enviar} noValidate className="admin-logros-builder">
          <div className="admin-logros-steps">
            {pasosContenido}
            <footer className="admin-logros-actions-bar">
              <button
                type="button"
                onClick={onCerrar}
                disabled={guardando}
                className="admin-logros-secondary-btn"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="admin-logros-primary-btn"
              >
                {guardando ? "Guardando…" : modo === "crear" ? "Crear logro" : "Guardar cambios"}
              </button>
            </footer>
          </div>
          {tarjetaVistaPrevia}
        </form>
      </section>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="formulario-logro-titulo"
      className="fixed inset-0 z-50 grid place-items-center p-4"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]"
        aria-label="Cerrar diálogo"
        onClick={onCerrar}
      />
      <form onSubmit={enviar} noValidate className="admin-logros-modal-card">
        <header className="admin-logros-modal-head">
          <div>
            <h2 id="formulario-logro-titulo" className="admin-logros-title text-xl">
              {titulo}
            </h2>
            <p className="admin-logros-subtitle mt-0.5 text-sm">
              Configura el nombre, la meta y el diseño que verá el estudiante.
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="admin-logros-secondary-btn min-h-0 p-2"
            aria-label="Cerrar"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <div className="admin-logros-modal-body">{pasosContenido}</div>

        <footer className="admin-logros-modal-foot">
          <button
            type="button"
            onClick={onCerrar}
            disabled={guardando}
            className="admin-logros-secondary-btn"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className="admin-logros-primary-btn"
          >
            {guardando ? "Guardando…" : modo === "crear" ? "Crear logro" : "Guardar cambios"}
          </button>
        </footer>
      </form>
    </div>
  );
}
