interface Opcion {
  id: string;
  etiqueta?: string | null;
  texto: string;
}

interface OpcionesRespuestaProps {
  opciones: Opcion[];
  colorHover?: string;
  onSelect?: (opcionId: string) => void;
}

export function OpcionesRespuesta({ opciones, onSelect }: OpcionesRespuestaProps) {
  return (
    <div className="crecer-option-list">
      {opciones.map((opcion, index) => (
        <button
          key={opcion.id}
          type="button"
          className="crecer-option"
          onClick={() => onSelect?.(opcion.id)}
        >
          <span className="crecer-option__label">{opcion.etiqueta || index + 1}</span>
          <span>{opcion.texto}</span>
        </button>
      ))}
    </div>
  );
}
