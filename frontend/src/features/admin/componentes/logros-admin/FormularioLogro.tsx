import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import {
  AlertCircle,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  Flame,
  FolderOpen,
  ImageOff,
  ImagePlus,
  Link2,
  Loader2,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import in1Img from "@/assets/images/Ilustraciones/in1.webp";
import in2Img from "@/assets/images/Ilustraciones/in2.webp";
import recompensaImg from "@/assets/images/Ilustraciones/Recompensa.webp";
import semillaImg from "@/assets/images/Ilustraciones/Semilla.webp";
import exploradoresImg from "@/assets/images/Ilustraciones/Exploradores.webp";
import versiculoImg from "@/assets/images/Ilustraciones/Versiculo del dia.webp";
import { obtenerApiUrlPublica } from "@/shared/config/env";
import {
  obtenerRecursosMultimedia,
  subirArchivo,
  validarArchivoMultimediaCliente,
  type RecursoMultimedia,
} from "@/features/media/media.api";
import { ResolvedMediaImage } from "@/features/media/resolved-media-image";
import { esUrlDirectaValida } from "@/features/media/use-resolved-media-url";
import { MediaGalleryDialog } from "../medios/media-gallery-dialog";
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
  errorEnvio?: string | null;
  onCerrar: () => void;
  onGuardar: (valores: ValoresFormulario) => void;
  onSubirImagen?: (
    archivo: File,
    metadata?: { titulo?: string; textoAlternativo?: string },
  ) => Promise<RecursoMultimedia>;
  recursosBiblioteca?: RecursoMultimedia[];
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

function esUrlImagenAceptada(rawUrl: string): boolean {
  const limpia = rawUrl.trim();
  if (!limpia) return true;
  if (limpia.startsWith("/")) return true;
  try {
    const parsed = new URL(limpia);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
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

function resolverUrlGuardableDesdeRecurso(recurso: RecursoMultimedia): string {
  const publica = recurso.url_publica?.trim() ?? "";
  if (publica.includes("/media/archivo/")) {
    return publica;
  }
  if (publica.startsWith("/src/assets/")) {
    return publica;
  }
  if (recurso.id) {
    return `${obtenerApiUrlPublica()}/media/${recurso.id}/url`;
  }
  return publica;
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
  errorEnvio,
  onCerrar,
  onGuardar,
  onSubirImagen,
  recursosBiblioteca: recursosIniciales,
}: Props) {
  const inputArchivoRef = useRef<HTMLInputElement>(null);
  const inputNombreRef = useRef<HTMLInputElement>(null);
  const inputDescripcionRef = useRef<HTMLTextAreaElement>(null);
  const inputCodigoRef = useRef<HTMLInputElement>(null);
  const inputMetaRef = useRef<HTMLInputElement>(null);
  const inputXpRef = useRef<HTMLInputElement>(null);
  const inputUrlExternaRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const valoresInicialesBase = modo === "editar" && logro ? valoresDesdeLogro(logro) : VALORES_INICIALES;
  const [valores, setValores] = useState<ValoresFormulario>(valoresInicialesBase);
  const [metaTexto, setMetaTexto] = useState(String(valoresInicialesBase.valor_criterio));
  const [xpTexto, setXpTexto] = useState(String(valoresInicialesBase.bono_xp));
  const [codigoManual, setCodigoManual] = useState(modo === "editar");
  const [detallesCodigoAbiertos, setDetallesCodigoAbiertos] = useState(false);
  const [tocadoNombre, setTocadoNombre] = useState(false);
  const [tocadoCodigo, setTocadoCodigo] = useState(false);
  const [intentoEnviar, setIntentoEnviar] = useState(false);
  const [errorImagen, setErrorImagen] = useState(false);
  const [mostrarUrlExterna, setMostrarUrlExterna] = useState(false);

  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [errorSubida, setErrorSubida] = useState<string | null>(null);
  const [arrastrandoArchivo, setArrastrandoArchivo] = useState(false);
  const [previewLocalSubida, setPreviewLocalSubida] = useState<string | null>(null);
  const [nombreImagenPersonalizada, setNombreImagenPersonalizada] = useState<string | null>(null);

  const [bibliotecaAbierta, setBibliotecaAbierta] = useState(false);
  const [cargandoBiblioteca, setCargandoBiblioteca] = useState(false);
  const [errorBiblioteca, setErrorBiblioteca] = useState<string | null>(null);
  const [recursosBiblioteca, setRecursosBiblioteca] = useState<RecursoMultimedia[]>(
    recursosIniciales ?? [],
  );
  const [recursoSeleccionadoId, setRecursoSeleccionadoId] = useState<string | null>(null);

  function limpiarObjectUrlTemporal() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }

  useEffect(() => {
    return () => {
      limpiarObjectUrlTemporal();
    };
  }, []);

  useEffect(() => {
    if (recursosIniciales) {
      setRecursosBiblioteca(recursosIniciales);
    }
  }, [recursosIniciales]);

  useEffect(() => {
    if (!abierto) return;
    limpiarObjectUrlTemporal();
    setErrorImagen(false);
    setErrorSubida(null);
    setErrorBiblioteca(null);
    setSubiendoImagen(false);
    setArrastrandoArchivo(false);
    setPreviewLocalSubida(null);
    setNombreImagenPersonalizada(null);
    setRecursoSeleccionadoId(null);
    setDetallesCodigoAbiertos(false);
    setTocadoNombre(false);
    setTocadoCodigo(false);
    setIntentoEnviar(false);
    if (modo === "editar" && logro) {
      const iniciales = valoresDesdeLogro(logro);
      setValores(iniciales);
      setMetaTexto(String(iniciales.valor_criterio));
      setXpTexto(String(iniciales.bono_xp));
      setCodigoManual(true);
      const urlLimpia = iniciales.url_icono.trim();
      const coincidePreset = INSIGNIAS_PREDEFINIDAS.some((op) => esPresetActivo(op, urlLimpia));
      setMostrarUrlExterna(Boolean(urlLimpia) && !coincidePreset);
      if (urlLimpia && !coincidePreset) {
        setNombreImagenPersonalizada("Imagen personalizada actual");
      }
    } else {
      setValores(VALORES_INICIALES);
      setMetaTexto(String(VALORES_INICIALES.valor_criterio));
      setXpTexto(String(VALORES_INICIALES.bono_xp));
      setCodigoManual(false);
      setMostrarUrlExterna(false);
    }
    // Solo reinicializar cuando cambia el estado de apertura, modo o el ID del logro
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, modo, logro?.id]);

  const urlActualLimpia = valores.url_icono.trim();
  const presetSeleccionado = INSIGNIAS_PREDEFINIDAS.find((preset) =>
    esPresetActivo(preset, urlActualLimpia),
  );

  if (!abierto) return null;

  const codigoCalculado =
    modo === "crear" && !codigoManual
      ? generarCodigoLogroDesdeNombre(valores.nombre)
      : valores.codigo;

  const nombreTrim = valores.nombre.trim();
  const errorNombreRaw =
    nombreTrim.length < 3
      ? "Escribe un nombre de al menos 3 letras (ej. Primer paso)."
      : nombreTrim.length > 100
        ? "El nombre del logro no puede superar los 100 caracteres."
        : null;
  const errorDescripcionRaw =
    valores.descripcion.trim().length > 300
      ? "El mensaje de felicitación no puede superar los 300 caracteres."
      : null;
  const errorCodigoRaw = modo === "crear" ? validarCodigoLogro(codigoCalculado) : null;

  const metaLimpio = metaTexto.trim();
  const metaNumero = metaLimpio === "" ? Number.NaN : Number(metaLimpio);
  const errorValorRaw =
    !metaLimpio || !Number.isInteger(metaNumero) || metaNumero < 1 || metaNumero > 10000
      ? "Escribe una cantidad entera entre 1 y 10,000."
      : null;

  const xpLimpio = xpTexto.trim();
  const xpNumero = xpLimpio === "" ? 0 : Number(xpLimpio);
  const errorXpRaw =
    !Number.isInteger(xpNumero) || xpNumero < 0 || xpNumero > 10000
      ? "El bono de XP debe ser un número entero entre 0 y 10,000."
      : null;

  const urlNormalizadaPreview = normalizarUrlIconoParaEnvio(urlActualLimpia);
  const errorUrlExternaRaw =
    mostrarUrlExterna && urlActualLimpia
      ? !esUrlImagenAceptada(urlActualLimpia)
        ? "Ingresa un enlace válido que empiece con https:// o http://."
        : urlNormalizadaPreview.length > 500
          ? "El enlace de imagen no puede superar los 500 caracteres."
          : null
      : null;

  const mostrarErrorNombre = tocadoNombre || intentoEnviar ? errorNombreRaw : null;
  const mostrarErrorDescripcion = intentoEnviar || errorDescripcionRaw !== null ? errorDescripcionRaw : null;
  const mostrarErrorCodigo = tocadoCodigo || intentoEnviar ? errorCodigoRaw : null;
  const mostrarErrorValor = intentoEnviar ? errorValorRaw : null;
  const mostrarErrorXp = intentoEnviar ? errorXpRaw : null;
  const mostrarErrorUrlExterna = intentoEnviar ? errorUrlExternaRaw : null;

  const primerError = errorNombreRaw
    ? {
        campo: "nombre" as const,
        mensaje: errorNombreRaw,
        enfocar: () => {
          inputNombreRef.current?.scrollIntoView?.({ behavior: "smooth", block: "center" });
          inputNombreRef.current?.focus({ preventScroll: true });
        },
      }
    : errorDescripcionRaw
      ? {
          campo: "descripcion" as const,
          mensaje: errorDescripcionRaw,
          enfocar: () => {
            inputDescripcionRef.current?.scrollIntoView?.({ behavior: "smooth", block: "center" });
            inputDescripcionRef.current?.focus({ preventScroll: true });
          },
        }
      : errorCodigoRaw
        ? {
            campo: "codigo" as const,
            mensaje: errorCodigoRaw,
            enfocar: () => {
              setDetallesCodigoAbiertos(true);
              if (typeof window !== "undefined") {
                window.requestAnimationFrame(() => {
                  inputCodigoRef.current?.scrollIntoView?.({ behavior: "smooth", block: "center" });
                  inputCodigoRef.current?.focus({ preventScroll: true });
                });
              }
            },
          }
        : errorValorRaw
          ? {
              campo: "meta" as const,
              mensaje: errorValorRaw,
              enfocar: () => {
                inputMetaRef.current?.scrollIntoView?.({ behavior: "smooth", block: "center" });
                inputMetaRef.current?.focus({ preventScroll: true });
              },
            }
          : errorXpRaw
            ? {
                campo: "xp" as const,
                mensaje: errorXpRaw,
                enfocar: () => {
                  inputXpRef.current?.scrollIntoView?.({ behavior: "smooth", block: "center" });
                  inputXpRef.current?.focus({ preventScroll: true });
                },
              }
            : errorUrlExternaRaw
              ? {
                  campo: "url" as const,
                  mensaje: errorUrlExternaRaw,
                  enfocar: () => {
                    inputUrlExternaRef.current?.scrollIntoView?.({ behavior: "smooth", block: "center" });
                    inputUrlExternaRef.current?.focus({ preventScroll: true });
                  },
                }
              : null;

  const formularioValido = !primerError;

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

  async function subirImagenMedalla(
    archivo: File,
    metadata?: { titulo?: string; textoAlternativo?: string },
  ): Promise<RecursoMultimedia | null> {
    const errorArchivo = validarArchivoMultimediaCliente(archivo, "imagen");
    if (errorArchivo) {
      setErrorSubida(errorArchivo);
      return null;
    }

    setErrorSubida(null);
    setSubiendoImagen(true);

    limpiarObjectUrlTemporal();
    const previewTemporal = typeof URL !== "undefined" ? URL.createObjectURL(archivo) : null;
    if (previewTemporal) {
      objectUrlRef.current = previewTemporal;
      setPreviewLocalSubida(previewTemporal);
    }

    const tituloArchivo = metadata?.titulo?.trim() || valores.nombre.trim() || archivo.name.replace(/\.[^.]+$/, "");
    const altArchivo = metadata?.textoAlternativo?.trim() || `Insignia de logro ${tituloArchivo}`;

    try {
      const recurso = onSubirImagen
        ? await onSubirImagen(archivo, { titulo: tituloArchivo, textoAlternativo: altArchivo })
        : await subirArchivo(archivo, "imagen", altArchivo, tituloArchivo);

      const urlParaGuardar = resolverUrlGuardableDesdeRecurso(recurso);
      actualizar("url_icono", urlParaGuardar);
      setPreviewLocalSubida(
        esUrlDirectaValida(recurso.url_publica) ? recurso.url_publica.trim() : previewTemporal,
      );
      setNombreImagenPersonalizada(recurso.titulo || archivo.name);
      setRecursoSeleccionadoId(recurso.id);
      setMostrarUrlExterna(false);
      setRecursosBiblioteca((prev) => [recurso, ...prev.filter((item) => item.id !== recurso.id)]);
      return recurso;
    } catch (error) {
      limpiarObjectUrlTemporal();
      setPreviewLocalSubida(null);
      setErrorSubida(
        error instanceof Error
          ? error.message
          : "No pudimos subir la imagen en este momento. Intenta con otro archivo PNG, JPG o WebP.",
      );
      return null;
    } finally {
      setSubiendoImagen(false);
    }
  }

  function manejarSeleccionArchivoInput(evento: ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    evento.target.value = "";
    if (!archivo) return;
    void subirImagenMedalla(archivo);
  }

  function manejarDropImagen(evento: DragEvent<HTMLDivElement>) {
    evento.preventDefault();
    evento.stopPropagation();
    setArrastrandoArchivo(false);
    const archivo = evento.dataTransfer.files?.[0];
    if (!archivo) return;
    void subirImagenMedalla(archivo);
  }

  async function abrirBibliotecaMedallas() {
    setErrorBiblioteca(null);
    setBibliotecaAbierta(true);
    if (recursosBiblioteca.length > 0 || cargandoBiblioteca) return;
    setCargandoBiblioteca(true);
    try {
      const lista = await obtenerRecursosMultimedia();
      setRecursosBiblioteca(lista);
    } catch (error) {
      setErrorBiblioteca(
        error instanceof Error
          ? error.message
          : "No pudimos cargar la biblioteca multimedia en este momento.",
      );
    } finally {
      setCargandoBiblioteca(false);
    }
  }

  function quitarImagenPersonalizada() {
    limpiarObjectUrlTemporal();
    setPreviewLocalSubida(null);
    setNombreImagenPersonalizada(null);
    setRecursoSeleccionadoId(null);
    setErrorSubida(null);
    actualizar("url_icono", "");
  }

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setIntentoEnviar(true);
    setTocadoNombre(true);
    setTocadoCodigo(true);
    if (subiendoImagen) return;
    if (primerError) {
      primerError.enfocar();
      return;
    }
    onGuardar({
      ...valores,
      codigo: codigoCalculado.trim().toLowerCase(),
      nombre: nombreTrim,
      descripcion: valores.descripcion.trim(),
      url_icono: normalizarUrlIconoParaEnvio(valores.url_icono),
      bono_xp: Math.max(0, Math.min(10000, Math.round(xpNumero))),
      valor_criterio: Math.max(1, Math.min(10000, Math.round(metaNumero))),
    });
  }

  const titulo = modo === "crear" ? "Nuevo logro" : `Editar ${logro?.nombre ?? "logro"}`;
  const fallbackIcono = codigoCalculado.includes("2") ? in2Img : in1Img;
  const tieneImagenPersonalizada = Boolean(urlActualLimpia) && !presetSeleccionado;
  const urlCustomRaw = previewLocalSubida || (tieneImagenPersonalizada ? urlActualLimpia : null);
  const recursoIdCustom = previewLocalSubida ? null : recursoSeleccionadoId;
  const urlPreviewRaw = previewLocalSubida || (!presetSeleccionado && urlActualLimpia ? urlActualLimpia : null);
  const fallbackPreviewSrc = presetSeleccionado?.previewSrc || fallbackIcono;

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
            ref={inputNombreRef}
            value={valores.nombre}
            maxLength={100}
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
            ref={inputDescripcionRef}
            value={valores.descripcion}
            maxLength={300}
            onChange={(e) => actualizar("descripcion", e.target.value)}
            rows={2}
            placeholder="Ej. ¡Completaste tu primer tema y aprendiste cuánto te ama Dios!"
            className="admin-logros-textarea"
            aria-invalid={mostrarErrorDescripcion ? true : undefined}
          />
          {mostrarErrorDescripcion ? (
            <span className="admin-logros-error" role="alert">{mostrarErrorDescripcion}</span>
          ) : null}
        </label>

        <details
          className="admin-logros-details"
          open={detallesCodigoAbiertos || Boolean(mostrarErrorCodigo)}
          onToggle={(e) => setDetallesCodigoAbiertos(e.currentTarget.open)}
        >
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
                  ref={inputCodigoRef}
                  value={codigoCalculado}
                  maxLength={50}
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
                <span className="admin-logros-error" role="alert">{mostrarErrorCodigo}</span>
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
                  onClick={() => {
                    setMetaTexto(String(cantidad));
                    actualizar("valor_criterio", cantidad);
                  }}
                  className={`admin-logros-chip ${valores.valor_criterio === cantidad && metaTexto.trim() !== "" ? "is-selected" : ""}`}
                >
                  {formatearMetaCriterio(valores.codigo_criterio, cantidad)}
                </button>
              ))}
            </div>
            <input
              ref={inputMetaRef}
              id="logro-meta-input"
              type="number"
              min={1}
              max={10000}
              step={1}
              value={metaTexto}
              onChange={(e) => {
                const raw = e.target.value;
                setMetaTexto(raw);
                const parsed = Number(raw);
                if (raw.trim() !== "" && Number.isFinite(parsed) && parsed >= 1) {
                  actualizar("valor_criterio", Math.min(10000, Math.round(parsed)));
                }
              }}
              onBlur={() => {
                if (metaTexto.trim() === "" || Number(metaTexto) < 1) {
                  setMetaTexto(String(valores.valor_criterio || 1));
                }
              }}
              className="admin-logros-input"
              aria-invalid={mostrarErrorValor ? true : undefined}
            />
            {mostrarErrorValor ? (
              <span className="admin-logros-error" role="alert">{mostrarErrorValor}</span>
            ) : null}
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
                  onClick={() => {
                    setXpTexto(String(xp));
                    actualizar("bono_xp", xp);
                  }}
                  className={`admin-logros-chip ${valores.bono_xp === xp ? "is-selected" : ""}`}
                >
                  {xp === 0 ? "Sin XP" : `+${xp} XP`}
                </button>
              ))}
            </div>
            <input
              ref={inputXpRef}
              id="logro-xp-input"
              type="number"
              min={0}
              max={10000}
              step={1}
              value={xpTexto}
              onChange={(e) => {
                const raw = e.target.value;
                setXpTexto(raw);
                if (raw.trim() === "") {
                  actualizar("bono_xp", 0);
                  return;
                }
                const parsed = Number(raw);
                if (Number.isFinite(parsed) && parsed >= 0) {
                  actualizar("bono_xp", Math.min(10000, Math.round(parsed)));
                }
              }}
              onBlur={() => {
                if (xpTexto.trim() === "") {
                  setXpTexto("0");
                  actualizar("bono_xp", 0);
                }
              }}
              className="admin-logros-input"
              aria-invalid={mostrarErrorXp ? true : undefined}
            />
            {mostrarErrorXp ? (
              <span className="admin-logros-error" role="alert">{mostrarErrorXp}</span>
            ) : null}
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
            <h3 className="admin-logros-step__title">Elige o sube la imagen de la medalla</h3>
            <p className="admin-logros-step__desc">
              Sube una imagen desde tu dispositivo, búscala en la biblioteca o selecciona un diseño listo.
            </p>
          </div>
        </div>

        <input
          ref={inputArchivoRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={manejarSeleccionArchivoInput}
          className="sr-only"
          aria-label="Seleccionar archivo de imagen para la medalla"
        />

        {/* Tarjeta si ya hay una imagen subida/personalizada activa */}
        {tieneImagenPersonalizada ? (
          <div className={`admin-logros-custom-preview ${errorImagen ? "is-error" : ""}`}>
            <div className="admin-logros-custom-preview__info">
              <ResolvedMediaImage
                resourceId={recursoIdCustom}
                rawUrl={urlCustomRaw}
                alt="Medalla personalizada"
                className="admin-logros-custom-preview__img"
                onImageErrorChange={setErrorImagen}
                renderFallback={({ isLoading }) => (
                  <span className="admin-logros-custom-preview__fallback" aria-hidden="true">
                    {isLoading ? <Loader2 className="size-5 animate-spin" /> : <ImageOff className="size-5" />}
                  </span>
                )}
              />
              <div className="min-w-0">
                <p className="admin-logros-label truncate">
                  {errorImagen
                    ? "No pudimos cargar esta imagen"
                    : nombreImagenPersonalizada || "Imagen personalizada activa"}
                </p>
                <p className="admin-logros-hint">
                  {errorImagen
                    ? "Sube otra imagen, elige de la biblioteca o selecciona un diseño listo."
                    : "Esta imagen aparecerá como medalla del logro."}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={subiendoImagen}
                onClick={() => inputArchivoRef.current?.click()}
                className="admin-logros-secondary-btn"
              >
                <Upload className="size-4" aria-hidden="true" />
                Cambiar imagen
              </button>
              <button
                type="button"
                disabled={subiendoImagen}
                onClick={quitarImagenPersonalizada}
                className="admin-logros-secondary-btn"
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Quitar
              </button>
            </div>
          </div>
        ) : null}

        {/* Zona de carga directa y biblioteca */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setArrastrandoArchivo(true);
          }}
          onDragLeave={() => setArrastrandoArchivo(false)}
          onDrop={manejarDropImagen}
          className={`admin-logros-upload-box ${arrastrandoArchivo ? "is-dragging" : ""}`}
        >
          <div className="admin-logros-upload-box__icon" aria-hidden="true">
            {subiendoImagen ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <ImagePlus className="size-5" />
            )}
          </div>
          <div>
            <p className="admin-logros-label">
              {subiendoImagen
                ? "Subiendo imagen de medalla…"
                : "Sube tu propia imagen de medalla"}
            </p>
            <p className="admin-logros-hint mt-0.5">
              Arrastra una imagen aquí o haz clic para seleccionarla (PNG, JPG o WebP · Máx. 5 MB)
            </p>
          </div>
          <div className="admin-logros-upload-actions">
            <button
              type="button"
              disabled={subiendoImagen}
              onClick={() => inputArchivoRef.current?.click()}
              className="admin-logros-primary-btn"
            >
              <Upload className="size-4" aria-hidden="true" />
              {subiendoImagen ? "Subiendo…" : "Subir imagen"}
            </button>
            <button
              type="button"
              disabled={subiendoImagen || cargandoBiblioteca}
              onClick={() => void abrirBibliotecaMedallas()}
              className="admin-logros-secondary-btn"
            >
              <FolderOpen className="size-4" aria-hidden="true" />
              {cargandoBiblioteca ? "Cargando biblioteca…" : "Elegir de biblioteca"}
            </button>
          </div>
          {errorSubida || errorBiblioteca ? (
            <p className="admin-logros-error mt-1" role="alert">
              {errorSubida || errorBiblioteca}
            </p>
          ) : null}
        </div>

        <div className="admin-logros-field">
          <span className="admin-logros-hint font-semibold">
            O elige una medalla prediseñada de Semillas:
          </span>
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
                    limpiarObjectUrlTemporal();
                    setPreviewLocalSubida(null);
                    setNombreImagenPersonalizada(null);
                    setRecursoSeleccionadoId(null);
                    setErrorSubida(null);
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
                ref={inputUrlExternaRef}
                id="formulario-logro-icono"
                value={valores.url_icono}
                maxLength={500}
                onChange={(e) => {
                  limpiarObjectUrlTemporal();
                  setPreviewLocalSubida(null);
                  setNombreImagenPersonalizada(null);
                  actualizar("url_icono", e.target.value);
                }}
                placeholder="https://cdn.semillas.org/medios/logros/amor.png"
                className="admin-logros-input"
                aria-invalid={mostrarErrorUrlExterna ? true : undefined}
              />
              {mostrarErrorUrlExterna ? (
                <span className="admin-logros-error" role="alert">{mostrarErrorUrlExterna}</span>
              ) : (
                <span className="admin-logros-hint">
                  Opcional. Si el enlace falla o se deja vacío, se usará la medalla dorada predeterminada.
                </span>
              )}
            </div>
          ) : null}
        </div>
      </section>
    </>
  );

  const pasoIdentidadListo = !errorNombreRaw && !errorCodigoRaw && !errorDescripcionRaw;
  const pasoReglaListo = !errorValorRaw && !errorXpRaw;

  const alertaPieContenido =
    intentoEnviar && primerError
      ? { mensaje: primerError.mensaje, alCampo: primerError.enfocar }
      : errorEnvio
        ? { mensaje: errorEnvio, alCampo: null }
        : null;

  const alertaPieFormulario = alertaPieContenido ? (
    <div className="admin-logros-submit-alert" role="alert">
      <div className="admin-logros-submit-alert__content">
        <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
        <span>{alertaPieContenido.mensaje}</span>
      </div>
      {alertaPieContenido.alCampo ? (
        <button
          type="button"
          onClick={alertaPieContenido.alCampo}
          className="admin-logros-submit-alert__action"
        >
          Ir al campo
        </button>
      ) : null}
    </div>
  ) : null;

  const textoBotonGuardar = subiendoImagen
    ? "Subiendo imagen…"
    : guardando
      ? "Guardando…"
      : modo === "crear"
        ? "Crear logro"
        : "Guardar cambios";

  const tarjetaVistaPrevia = (
    <aside className="admin-logros-preview-panel" aria-label="Vista previa para el estudiante">
      <div>
        <p className="admin-logros-eyebrow">Vista previa</p>
        <h3 className="admin-logros-step__title mt-1">Así lo verá el estudiante</h3>
      </div>

      <article className="admin-logros-preview-card">
        <div className="admin-logros-preview-card__art">
          <ResolvedMediaImage
            resourceId={recursoIdCustom}
            rawUrl={urlPreviewRaw}
            fallbackSrc={fallbackPreviewSrc}
            alt="Vista previa de insignia"
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
        <div className={`admin-logros-check-item ${pasoIdentidadListo ? "is-ready" : "is-pending"}`}>
          {pasoIdentidadListo ? (
            <Check className="size-4 shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          )}
          <span>
            {errorNombreRaw
              ? "Paso 1: Elige un nombre (mín. 3 letras)"
              : errorCodigoRaw
                ? `Paso 1: ${errorCodigoRaw}`
                : errorDescripcionRaw
                  ? `Paso 1: ${errorDescripcionRaw}`
                  : "Nombre listo para mostrar"}
          </span>
        </div>
        <div className={`admin-logros-check-item ${pasoReglaListo ? "is-ready" : "is-pending"}`}>
          {pasoReglaListo ? (
            <Check className="size-4 shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          )}
          <span>
            {errorValorRaw
              ? `Paso 2: ${errorValorRaw}`
              : `Regla clara: ${formatearMetaCriterio(valores.codigo_criterio, valores.valor_criterio)}`}
          </span>
        </div>
        <div className={`admin-logros-check-item ${!errorXpRaw ? "is-ready" : "is-pending"}`}>
          {!errorXpRaw ? (
            <Check className="size-4 shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          )}
          <span>
            {errorXpRaw
              ? `Paso 2: ${errorXpRaw}`
              : valores.bono_xp > 0
                ? `Entrega +${valores.bono_xp} XP al reclamarse`
                : "Medalla conmemorativa (0 XP)"}
          </span>
        </div>
      </div>
    </aside>
  );

  const selectorBiblioteca = bibliotecaAbierta ? (
    <MediaGalleryDialog
      open={bibliotecaAbierta}
      title="Imagen para medalla de logro"
      acceptedTypes={["imagen"]}
      resources={recursosBiblioteca}
      selectedResourceId={recursoSeleccionadoId}
      isUploading={subiendoImagen}
      onClose={() => setBibliotecaAbierta(false)}
      onRemove={() => {
        quitarImagenPersonalizada();
        setBibliotecaAbierta(false);
      }}
      onSelect={(resourceId) => {
        const encontrado = recursosBiblioteca.find((r) => r.id === resourceId);
        if (encontrado) {
          limpiarObjectUrlTemporal();
          const urlGuardable = resolverUrlGuardableDesdeRecurso(encontrado);
          actualizar("url_icono", urlGuardable);
          setPreviewLocalSubida(
            esUrlDirectaValida(encontrado.url_publica) ? encontrado.url_publica.trim() : null,
          );
          setNombreImagenPersonalizada(encontrado.titulo || "Imagen de biblioteca");
          setRecursoSeleccionadoId(encontrado.id);
          setMostrarUrlExterna(false);
        }
        setBibliotecaAbierta(false);
      }}
      onUpload={async (file, metadata) => {
        const recurso = await subirImagenMedalla(file, metadata);
        if (recurso) {
          setBibliotecaAbierta(false);
        }
      }}
    />
  ) : null;

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
              {alertaPieFormulario}
              <button
                type="button"
                onClick={onCerrar}
                disabled={guardando || subiendoImagen}
                className="admin-logros-secondary-btn"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando || subiendoImagen}
                className="admin-logros-primary-btn"
              >
                {textoBotonGuardar}
              </button>
            </footer>
          </div>
          {tarjetaVistaPrevia}
        </form>
        {selectorBiblioteca}
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
      <form onSubmit={enviar} noValidate className="admin-logros-modal-card admin-logros-modal-card--wide">
        <header className="admin-logros-modal-head">
          <div className="min-w-0">
            <h2 id="formulario-logro-titulo" className="admin-logros-title text-xl truncate">
              {titulo}
            </h2>
            <p className="admin-logros-subtitle mt-0.5 text-sm">
              Configura el nombre, la meta y el diseño que verá el estudiante.
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="admin-logros-close-btn"
            aria-label="Cerrar"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <div className="admin-logros-modal-body admin-logros-modal-body--split">
          <div className="admin-logros-modal-scroll">{pasosContenido}</div>
          <div className="admin-logros-modal-aside">{tarjetaVistaPrevia}</div>
        </div>

        <footer className="admin-logros-modal-foot">
          {alertaPieFormulario}
          <button
            type="button"
            onClick={onCerrar}
            disabled={guardando || subiendoImagen}
            className="admin-logros-secondary-btn"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando || subiendoImagen}
            className="admin-logros-primary-btn"
          >
            {textoBotonGuardar}
          </button>
        </footer>
      </form>
      {selectorBiblioteca}
    </div>
  );
}
