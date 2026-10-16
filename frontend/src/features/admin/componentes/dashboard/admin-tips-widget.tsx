import { AdminWidgetCard } from "./admin-widget-card";

type Tip = {
  iconBg: string;
  iconColor: string;
  icon: string;
  title: string;
  description: string;
};

const TIPS: Tip[] = [
  {
    iconBg: "bg-purple-900/30",
    iconColor: "text-purple-400",
    icon: "fa-wand-magic-sparkles",
    title: "Varía los tipos de actividades",
    description: "Combina diferentes formatos para mantener el aprendizaje dinámico y entretenido.",
  },
  {
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    icon: "fa-pen-nib",
    title: "Alinea con la sendero",
    description: "Asegúrate de que cada actividad refuerce el tema y objetivo de la sendero.",
  },
  {
    iconBg: "bg-orange-900/30",
    iconColor: "text-orange-400",
    icon: "fa-puzzle-piece",
    title: "Revisa antes de publicar",
    description: "Una buena revisión garantiza claridad, precisión y una mejor experiencia para los niños.",
  },
];

export function AdminTipsWidget() {
  return (
    <AdminWidgetCard title="Consejos rápidos" padding="sm">
      <div className="flex flex-col gap-4">
        {TIPS.map((tip) => (
          <div key={tip.title} className="flex gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${tip.iconBg} ${tip.iconColor}`}>
              <i className={`fa-solid ${tip.icon} text-xs`} />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-slate-700 text-xs sm:text-sm">{tip.title}</span>
              <span className="text-xs text-slate-400 mt-0.5 leading-snug">{tip.description}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 bg-emerald-100 rounded-2xl p-4 border border-emerald-800/30 flex gap-3 text-left">
        <div className="w-7 h-7 rounded-full bg-emerald-900/50 flex items-center justify-center shrink-0 text-green-400">
          <i className="fa-solid fa-leaf text-xs" />
        </div>
        <p className="text-xs font-bold text-emerald-200 leading-snug mt-0.5">
          Cada actividad es una semilla que fortalece la fe y el corazón de nuestros niños.
        </p>
      </div>
    </AdminWidgetCard>
  );
}
