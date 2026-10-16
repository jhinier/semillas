interface GrupoEdad {
  id: string;
  nombre: string;
}

interface UsuarioCreador {
  nombre_visible?: string | null;
}

interface ThemeMetadataCardProps {
  creadoPor?: UsuarioCreador | null;
  publicadoEn?: string | null;
  actualizadoEn?: string | null;
  gruposEdad?: GrupoEdad[] | null;
}

function formatearFecha(fecha: string | null | undefined): string {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleDateString("es-EC", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function ThemeMetadataCard({
  creadoPor,
  publicadoEn,
  actualizadoEn,
  gruposEdad,
}: ThemeMetadataCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="font-bold text-neutro-oscuro-max mb-3">Metadatos</h3>
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutro">Creado por</p>
          <p className="font-semibold text-neutro-oscuro-max mt-0.5">
            {creadoPor?.nombre_visible ?? "—"}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutro">Publicado</p>
          <p className="font-semibold text-neutro-oscuro-max mt-0.5">
            {formatearFecha(publicadoEn) || "No publicado"}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutro">Actualizado</p>
          <p className="font-semibold text-neutro-oscuro-max mt-0.5">
            {formatearFecha(actualizadoEn)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutro">Grupos de edad</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {gruposEdad && gruposEdad.length > 0 ? (
              gruposEdad.map((g) => (
                <span
                  key={g.id}
                  className="text-xs px-2 py-0.5 bg-crema-fondo rounded-md text-neutro-oscuro font-semibold"
                >
                  {g.nombre}
                </span>
              ))
            ) : (
              <span className="text-xs text-neutro">—</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
