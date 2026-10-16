import { Boton } from "@/componentes/ui/boton";
import { TarjetaMetricaCompacta } from "@/componentes/ui/card-metrica";
import { PanelSeccionAdmin } from "@/componentes/ui/panel-seccion-admin";

type ContentStatusGridProps = {
  borradores: number;
  enRevision: number;
  publicados: number;
  archivados: number;
  onVerTodo?: () => void;
};

export function ContentStatusGrid({
  borradores,
  enRevision,
  publicados,
  archivados,
  onVerTodo,
}: ContentStatusGridProps) {
  const total = borradores + enRevision + publicados + archivados;

  const statusItems = [
    {
      label: "Borradores",
      value: borradores,
      subtexto: total === 0 ? "0% del total" : `${Math.round((borradores / total) * 100)}% del total`,
      icon: <i className="fa-solid fa-file-lines text-sm text-amber-500" />,
      tone: { fondoIcono: "bg-amber-100", colorSubtexto: "text-amber-500" },
    },
    {
      label: "En revisión",
      value: enRevision,
      subtexto: total === 0 ? "0% del total" : `${Math.round((enRevision / total) * 100)}% del total`,
      icon: <i className="fa-solid fa-clock text-sm text-blue-500" />,
      tone: { fondoIcono: "bg-blue-100", colorSubtexto: "text-blue-500" },
    },
    {
      label: "Publicados",
      value: publicados,
      subtexto: total === 0 ? "0% del total" : `${Math.round((publicados / total) * 100)}% del total`,
      icon: <i className="fa-solid fa-circle-check text-sm text-green-600" />,
      tone: { fondoIcono: "bg-green-100", colorSubtexto: "text-green-600" },
    },
    {
      label: "Archivados",
      value: archivados,
      subtexto: total === 0 ? "0% del total" : `${Math.round((archivados / total) * 100)}% del total`,
      icon: <i className="fa-solid fa-box-archive text-sm text-slate-500" />,
      tone: { fondoIcono: "bg-slate-100", colorSubtexto: "text-slate-500" },
    },
  ];

  return (
    <PanelSeccionAdmin
      titulo="Estado del contenido"
      descripcion="Resumen general del estado de todo el contenido."
      accion={
        <Boton
          variante="contorno"
          tamano="pequeno"
          onClick={onVerTodo}
          className="h-9 rounded-xl border-slate-200 px-4 text-xs font-bold text-slate-600"
        >
          Ver todo
        </Boton>
      }
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {statusItems.map((item) => (
          <TarjetaMetricaCompacta
            key={item.label}
            titulo={item.label}
            valor={item.value}
            subtexto={item.subtexto}
            icono={item.icon}
            tono={item.tone}
          />
        ))}
      </div>
    </PanelSeccionAdmin>
  );
}
