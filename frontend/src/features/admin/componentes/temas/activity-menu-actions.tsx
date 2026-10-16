import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { MenuDesplegable, type ItemMenu } from "@/componentes/ui/menu-desplegable";
import { BotonAccion } from "../dashboard/admin.helpers";
import type { ActivityTableRow } from "./admin-activities-table";

interface MenuAccionesActividadProps {
  navigate: ReturnType<typeof useNavigate>;
  act: ActivityTableRow;
  onEliminar: () => void;
}

export function MenuAccionesActividad({
  navigate,
  act,
  onEliminar,
}: MenuAccionesActividadProps) {
  const [open, setOpen] = useState(false);

  const itemsMenu: ItemMenu[] = [
    {
      label: "Copiar enlace",
      icono: "fa-link",
      onClick: () =>
        navigator.clipboard.writeText(
          `${window.location.origin}/app/temas/${act.temaSlug}/actividades/${act.id}`
        ),
    },
    {
      label: "Eliminar",
      icono: "fa-trash",
      iconoColor: "text-red-500",
      textoColor: "text-red-500",
      onClick: onEliminar,
    },
  ];

  return (
    <div className="flex items-center justify-end gap-1">
      <BotonAccion
        onClick={() =>
          navigate({
            to: "/app/actividades/$activityId",
            params: { activityId: act.id },
          })
        }
        title="Vista previa"
        icon="fa-eye"
      />
      <BotonAccion
        onClick={() =>
          navigate({
            to: "/admin/temas/$themeId/activities",
            params: { themeId: act.temaId },
            search: { form: "editar", actividadId: act.id },
          })
        }
        title="Editar"
        icon="fa-pencil"
      />
      <MenuDesplegable
        items={itemsMenu}
        estaAbierto={open}
        onAlternar={() => setOpen(!open)}
        onCerrar={() => setOpen(false)}
      />
    </div>
  );
}
