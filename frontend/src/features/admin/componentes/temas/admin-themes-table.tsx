import { TablaBase } from "@/componentes/ui/tabla-base";
import { useThemeTableMenu } from "../../hooks/use-theme-table-menu";
import { ThemeTableRow } from "./ThemeTableRow";
import type { TemaTableRow } from "./admin-themes-table.types";

type AdminThemesTableProps = {
  temas: TemaTableRow[];
  onEditar: (id: string) => void;
  onCRECER: (id: string) => void;
  onActivities: (id: string) => void;
  onPreview: (id: string) => void;
  onDetalle?: (id: string) => void;
  onPublicar?: (id: string) => void;
  onDespublicar?: (id: string) => void;
};

export function AdminThemesTable({
  temas,
  onEditar,
  onCRECER,
  onActivities,
  onPreview,
  onDetalle,
  onPublicar,
  onDespublicar,
}: AdminThemesTableProps) {
  const { isMenuAbierto, alternarMenu, cerrarMenu } = useThemeTableMenu();

  const encabezados = [
    {
      contenido: (
        <input
          type="checkbox"
          aria-label="Seleccionar todos los temas"
          className="rounded border-slate-300/30 text-primario focus:ring-primario"
        />
      ),
      className: "w-10 pl-6",
    },
    { contenido: "Tema", className: "font-extrabold" },
    { contenido: "Senda", className: "font-semibold" },
    { contenido: "Franja", className: "font-semibold" },
    { contenido: "Estado", className: "font-semibold" },
    {
      contenido: (
        <span className="flex items-center gap-1">
          Última edición{" "}
          <i className="fa-solid fa-sort text-emerald-400/50 text-[10px]" />
        </span>
      ),
      className: "font-semibold",
    },
    { contenido: "Autor", className: "font-semibold" },
    { contenido: "Acciones", className: "pr-6 text-right font-semibold" },
  ];

  return (
    <TablaBase
      encabezados={encabezados}
      contenedorClassName="max-h-[560px] select-none"
      tablaClassName="text-sm"
    >
      {temas.map((tema) => (
        <ThemeTableRow
          key={tema.id}
          tema={tema}
          isMenuAbierto={isMenuAbierto(tema.id)}
          onAlternarMenu={() => alternarMenu(tema.id)}
          onCerrarMenu={cerrarMenu}
          onEditar={() => onEditar(tema.id)}
          onCRECER={() => onCRECER(tema.id)}
          onActivities={() => onActivities(tema.id)}
          onPreview={() => onPreview(tema.id)}
          onDetalle={onDetalle ? () => onDetalle(tema.id) : undefined}
          onPublicar={onPublicar ? () => onPublicar(tema.id) : undefined}
          onDespublicar={
            onDespublicar ? () => onDespublicar(tema.id) : undefined
          }
        />
      ))}
    </TablaBase>
  );
}
