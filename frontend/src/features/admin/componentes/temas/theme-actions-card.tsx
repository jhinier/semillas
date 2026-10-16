import { Edit, Bookmark, Gamepad, Eye } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

interface Accion {
  icon: typeof Edit;
  label: string;
  to: "/admin/temas/$themeId/edit" | "/admin/temas/$themeId/crecer" | "/admin/temas/$themeId/activities" | "/admin/temas/$themeId/preview";
  params: { themeId: string };
}

interface ThemeActionsCardProps {
  themeId: string;
}

export function ThemeActionsCard({ themeId }: ThemeActionsCardProps) {
  const navigate = useNavigate();

  const acciones: Accion[] = [
    { icon: Edit, label: "Editar tema", to: "/admin/temas/$themeId/edit" as const, params: { themeId } },
    { icon: Bookmark, label: "Editor CRECER", to: "/admin/temas/$themeId/crecer" as const, params: { themeId } },
    { icon: Gamepad, label: "Actividades", to: "/admin/temas/$themeId/activities" as const, params: { themeId } },
    { icon: Eye, label: "Vista previa", to: "/admin/temas/$themeId/preview" as const, params: { themeId } },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="font-bold text-neutro-oscuro-max mb-4">Acciones</h3>
      <div className="flex flex-col gap-2">
        {acciones.map((accion) => (
          <button
            key={accion.label}
            type="button"
            onClick={() => navigate({ to: accion.to, params: accion.params })}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-neutro-oscuro-max hover:bg-crema-fondo transition-colors cursor-pointer"
          >
            <accion.icon size={16} className="text-neutro" />
            {accion.label}
          </button>
        ))}
      </div>
    </div>
  );
}
