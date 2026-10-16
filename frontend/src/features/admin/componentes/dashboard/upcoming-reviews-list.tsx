import { Boton } from "@/componentes/ui/boton";
import { FilaListaCompacta } from "@/componentes/ui/fila-lista-compacta";
import { PanelSeccionAdmin } from "@/componentes/ui/panel-seccion-admin";

export type UpcomingReviewItem = {
  id: string;
  dia: string;
  mes: string;
  titulo: string;
  senda: string;
  estado: "En revisión" | "Borrador" | string;
  reviewerNombre: string;
  reviewerAvatar: string;
};

type UpcomingReviewsListProps = {
  revisiones: UpcomingReviewItem[];
  onVerTodas?: () => void;
  onSelectReview?: (id: string) => void;
};

export function UpcomingReviewsList({
  revisiones,
  onVerTodas,
  onSelectReview,
}: UpcomingReviewsListProps) {
  const getBadgeStyle = (estado: string) => {
    switch (estado) {
      case "En revisión":
        return "bg-amber-50 text-amber-600 border border-amber-200/50";
      case "Borrador":
        return "bg-slate-50 text-slate-500 border border-slate-200/50";
      default:
        return "bg-blue-50 text-blue-600 border border-blue-200/50";
    }
  };

  return (
    <PanelSeccionAdmin
      titulo="Próximas revisiones"
      accion={
        <Boton
          variante="texto"
          tamano="pequeno"
          onClick={onVerTodas}
          className="h-auto p-0 text-xs font-bold text-primario hover:bg-transparent hover:text-primario-oscuro"
        >
          Ver todas
        </Boton>
      }
    >
      <div className="flex flex-col gap-3">
        {revisiones.map((rev) => (
          <FilaListaCompacta
            key={rev.id}
            onClick={onSelectReview ? () => onSelectReview(rev.id) : undefined}
            className="select-none"
            izquierda={
              <div className="flex h-12 w-11 shrink-0 flex-col items-center justify-center rounded-xl border border-slate-100 bg-white shadow-xs">
                <span className="text-base font-black leading-none text-neutro-oscuro-max">{rev.dia}</span>
                <span className="mt-0.5 text-[9px] font-extrabold uppercase tracking-wider text-neutro">{rev.mes}</span>
              </div>
            }
            titulo={rev.titulo}
            subtitulo={`Senda: ${rev.senda}`}
            derecha={
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span className={`inline-flex rounded-lg px-2 py-0.5 text-[9px] font-bold ${getBadgeStyle(rev.estado)}`}>
                  {rev.estado}
                </span>
                <div className="flex items-center gap-1">
                  <img
                    src={rev.reviewerAvatar}
                    alt={rev.reviewerNombre}
                    className="h-4 w-4 rounded-full border border-slate-200 object-cover"
                  />
                  <span className="text-[10px] font-bold leading-none text-neutro-oscuro">
                    {rev.reviewerNombre}
                  </span>
                </div>
              </div>
            }
            contenidoClassName="self-center"
            derechaClassName="self-center"
          />
        ))}
      </div>
    </PanelSeccionAdmin>
  );
}
