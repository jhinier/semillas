import { type ConfiguracionActividad, obtenerListaTexto } from "../activity-config-utils";
import { CampoConfiguracion } from "../activity-config-primitives";
import { ListaTextoEditor } from "../activity-config-list-editors";

const TAMAÑOS_PREDEFINIDOS = [
  { etiqueta: "8×8 (Corto)", filas: 8, columnas: 8 },
  { etiqueta: "10×10 (Equilibrado)", filas: 10, columnas: 10 },
  { etiqueta: "12×12 (Amplio)", filas: 12, columnas: 12 },
];

function limitarDimension(valor: unknown, predeterminado = 10): number {
  const num = Number(valor);
  if (!Number.isFinite(num) || num <= 0) return predeterminado;
  return Math.max(6, Math.min(15, Math.round(num)));
}

export function SopaLetrasBuilder({
  configuracion,
  onChange,
}: {
  configuracion: ConfiguracionActividad;
  onChange: (configuracion: ConfiguracionActividad) => void;
}) {
  const palabras = obtenerListaTexto(configuracion.palabras);
  const filas = limitarDimension(configuracion.filas, 10);
  const columnas = limitarDimension(configuracion.columnas, 10);
  const longitudMaxima = Math.max(
    0,
    ...palabras.map((p) => p.trim().replace(/\s+/g, "").length),
  );
  const minimoSugerido = Math.max(6, Math.min(15, longitudMaxima));

  const actualizarPalabras = (nuevasPalabras: string[]) => {
    const maxLen = Math.max(
      0,
      ...nuevasPalabras.map((p) => p.trim().replace(/\s+/g, "").length),
    );
    const siguienteFilas = maxLen > filas && maxLen <= 15 ? maxLen : filas;
    const siguienteColumnas = maxLen > columnas && maxLen <= 15 ? maxLen : columnas;
    onChange({
      ...configuracion,
      palabras: nuevasPalabras,
      filas: siguienteFilas,
      columnas: siguienteColumnas,
    });
  };

  const cambiarDimension = (clave: "filas" | "columnas", raw: string) => {
    const parsed = Number.parseInt(raw, 10);
    const valor = Number.isNaN(parsed) ? 10 : Math.max(6, Math.min(15, parsed));
    onChange({
      ...configuracion,
      filas: clave === "filas" ? valor : filas,
      columnas: clave === "columnas" ? valor : columnas,
    });
  };

  return (
    <div className="admin-config-builder__columns">
      <div className="admin-field admin-field--wide">
        <span>Tamaño del tablero</span>
        <div className="mt-1 flex flex-wrap gap-2">
          {TAMAÑOS_PREDEFINIDOS.map((preset) => {
            const activo = filas === preset.filas && columnas === preset.columnas;
            return (
              <button
                key={preset.etiqueta}
                type="button"
                className={activo ? "admin-primary-button !py-1.5 !px-3 text-xs" : "admin-secondary-button !py-1.5 !px-3 text-xs"}
                onClick={() =>
                  onChange({
                    ...configuracion,
                    filas: preset.filas,
                    columnas: preset.columnas,
                  })
                }
              >
                {preset.etiqueta}
              </button>
            );
          })}
        </div>
        <small>
          Cuadrícula actual: {filas} × {columnas} casillas.
          {longitudMaxima > 0 ? ` La palabra más larga usa ${longitudMaxima} letras (mínimo ${minimoSugerido}).` : ""}
        </small>
      </div>

      <CampoConfiguracion
        label="Filas"
        value={String(filas)}
        type="number"
        min={6}
        max={15}
        help="Entre 6 y 15 filas."
        onChange={(valor) => cambiarDimension("filas", valor)}
      />
      <CampoConfiguracion
        label="Columnas"
        value={String(columnas)}
        type="number"
        min={6}
        max={15}
        help="Entre 6 y 15 columnas."
        onChange={(valor) => cambiarDimension("columnas", valor)}
      />

      <ListaTextoEditor
        titulo="Palabras"
        valores={palabras}
        etiquetaAgregar="Agregar palabra"
        onChange={actualizarPalabras}
      />
    </div>
  );
}
