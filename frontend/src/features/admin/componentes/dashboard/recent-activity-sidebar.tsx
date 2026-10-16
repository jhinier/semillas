import { PanelSeccionAdmin } from "@/componentes/ui/panel-seccion-admin";

export type ActivityLogItem = {
  id: string;
  texto: string;
  haceCuanto: string;
  tipo: "tema" | "actividad" | "club" | "recurso" | "aprobacion" | string;
};

type RecentActivitySidebarProps = {
  actividades: ActivityLogItem[];
  onVerTodaLaActividad?: () => void;
};

export function RecentActivitySidebar({
  actividades,
  onVerTodaLaActividad,
}: RecentActivitySidebarProps) {
  const getIconConfig = (tipo: string) => {
    switch (tipo) {
      case "tema":
        return { icon: "fa-leaf", color: "text-green-600", bg: "bg-green-100" };
      case "actividad":
        return { icon: "fa-pen-to-square", color: "text-amber-500", bg: "bg-amber-100" };
      case "club":
        return { icon: "fa-people-group", color: "text-violet-500", bg: "bg-violet-100" };
      case "recurso":
        return { icon: "fa-cloud-arrow-up", color: "text-blue-500", bg: "bg-blue-100" };
      case "aprobacion":
      default:
        return { icon: "fa-circle-check", color: "text-amber-500", bg: "bg-amber-100" };
    }
  };

  return (
    <PanelSeccionAdmin
      titulo="Actividad reciente"
      footer={
        <button
          type="button"
          onClick={onVerTodaLaActividad}
          className="inline-block select-none py-1 text-center text-xs font-extrabold text-primario transition-colors hover:text-primario-oscuro"
        >
          Ver toda la actividad
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        {actividades.map((act) => {
          const config = getIconConfig(act.tipo);
          return (
            <div key={act.id} className="flex items-start gap-3 select-none">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${config.bg}`}>
                <i className={`fa-solid ${config.icon} text-xs ${config.color}`} />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="text-[12.8px] font-semibold leading-snug text-neutro-oscuro-max">
                  {act.texto}
                </p>
                <span className="mt-1 text-[10px] leading-none text-neutro">
                  {act.haceCuanto}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </PanelSeccionAdmin>
  );
}
