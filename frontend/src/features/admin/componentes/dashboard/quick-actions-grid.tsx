import { BloqueIconoTexto } from "@/componentes/ui/bloque-icono-texto";
import { PanelSeccionAdmin } from "@/componentes/ui/panel-seccion-admin";
import { Boton } from "@/componentes/ui/boton";

type ActionItem = {
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  cardBg: string;
  onClick: () => void;
};

type QuickActionsGridProps = {
  onCrearTema: () => void;
  onAgregarActividad: () => void;
  onSubirRecurso: () => void;
  onRevisarContenido: () => void;
};

export function QuickActionsGrid({
  onCrearTema,
  onAgregarActividad,
  onSubirRecurso,
  onRevisarContenido,
}: QuickActionsGridProps) {
  const actions: ActionItem[] = [
    {
      title: "Crear tema",
      description: "Desarrolla un nuevo tema para tus sendas.",
      icon: "fa-circle-plus",
      iconColor: "text-green-600",
      iconBg: "bg-green-100",
      cardBg: "hover:border-green-300 hover:bg-green-50/50",
      onClick: onCrearTema,
    },
    {
      title: "Agregar actividad",
      description: "Crea actividades interactivas.",
      icon: "fa-pen-clip",
      iconColor: "text-amber-500",
      iconBg: "bg-amber-100",
      cardBg: "hover:border-amber-300 hover:bg-amber-50/50",
      onClick: onAgregarActividad,
    },
    {
      title: "Subir recurso",
      description: "Añade videos, audios o documentos.",
      icon: "fa-cloud-arrow-up",
      iconColor: "text-blue-500",
      iconBg: "bg-blue-100",
      cardBg: "hover:border-blue-300 hover:bg-blue-50/50",
      onClick: onSubirRecurso,
    },
    {
      title: "Revisar contenido",
      description: "Revisa y aprueba contenido pendiente.",
      icon: "fa-shield-halved",
      iconColor: "text-violet-500",
      iconBg: "bg-violet-100",
      cardBg: "hover:border-violet-300 hover:bg-violet-50/50",
      onClick: onRevisarContenido,
    },
  ];

  return (
    <PanelSeccionAdmin
      titulo="Acciones rápidas"
      descripcion="Crea, administra y revisa contenido fácilmente."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((act) => (
          <Boton
            key={act.title}
            type="button"
            onClick={act.onClick}
            className={`rounded-2xl border border-slate-100 bg-white p-4 text-left outline-none transition-all duration-200 ${act.cardBg}`}
            variante="texto"
          >
            <BloqueIconoTexto
              icono={<i className={`fa-solid ${act.icon} ${act.iconColor}`} />}
              titulo={act.title}
              descripcion={act.description}
              className="w-full"
              iconoCajaClassName={act.iconBg}
              tituloClassName="text-neutro-oscuro-max"
              descripcionClassName="text-neutro"
            />
          </Boton>
        ))}
      </div>
    </PanelSeccionAdmin>
  );
}
