import { TabsOpciones } from "@/componentes/ui/navegacion-tabs";

type TabCounts = {
  todos: number;
  borradores: number;
  revision: number;
  publicados: number;
};

type AdminThemesTabsProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts: TabCounts;
};

export function AdminThemesTabs({ activeTab, onTabChange, counts }: AdminThemesTabsProps) {
  return (
    <TabsOpciones
      activo={activeTab}
      onCambiar={onTabChange}
      opciones={[
        { id: "todos", label: "Todos", count: counts.todos, badgeClassName: "bg-[#1a3a2a] text-emerald-200/70", mostrarBadge: true },
        { id: "borrador", label: "Borradores", count: counts.borradores, badgeClassName: "bg-amber-900/30 text-amber-400 font-bold" },
        { id: "revision", label: "En revisión", count: counts.revision, badgeClassName: "bg-violet-900/30 text-violet-400 font-bold" },
        { id: "publicado", label: "Publicados", count: counts.publicados, badgeClassName: "bg-emerald-900/30 text-emerald-400 font-bold" },
      ]}
      clase="mb-6"
    />
  );
}
