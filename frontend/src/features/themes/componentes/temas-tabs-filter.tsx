import type { FC } from "react";
import { TabsOpciones } from "@/componentes/ui/navegacion-tabs";

export type FiltroTab = "todos" | "completados" | "progreso" | "favoritos";

export interface TemasTabsFilterProps {
  activo: FiltroTab;
  onChange: (tab: FiltroTab) => void;
  counts?: Partial<Record<FiltroTab, number>>;
}

export const TemasTabsFilter: FC<TemasTabsFilterProps> = ({ activo, onChange, counts }) => {
  return (
    <TabsOpciones
      activo={activo}
      onCambiar={(tab) => onChange(tab as FiltroTab)}
      opciones={[
        { id: "todos", label: "Todos", count: counts?.todos },
        { id: "completados", label: "Completados", count: counts?.completados },
        { id: "progreso", label: "En progreso", count: counts?.progreso },
        { id: "favoritos", label: "Favoritos", count: counts?.favoritos },
      ]}
      clase="temas-tabs-scroll !mb-3 !gap-5 flex-nowrap overflow-x-auto whitespace-nowrap"
    />
  );
};
