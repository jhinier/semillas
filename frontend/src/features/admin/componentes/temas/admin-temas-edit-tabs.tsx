import { TabsOpciones } from "@/componentes/ui/tabs-opciones";

type EditTab = "general" | "portada" | "config" | "publicacion";

type AdminTemasEditTabsProps = {
  activeTab: EditTab;
  onTabChange: (tab: EditTab) => void;
};

const tabs: { id: EditTab; label: string; icon: string }[] = [
  { id: "general", label: "Información general", icon: "fa-solid fa-file-invoice" },
  { id: "portada", label: "Portada", icon: "fa-regular fa-image" },
  { id: "config", label: "Configuración", icon: "fa-solid fa-sliders" },
  { id: "publicacion", label: "Publicación", icon: "fa-solid fa-paper-plane" },
];

export function AdminTemasEditTabs({ activeTab, onTabChange }: AdminTemasEditTabsProps) {
  return (
    <TabsOpciones
      opciones={tabs.map((tab) => ({
        id: tab.id,
        label: tab.label,
        icono: <i className={`${tab.icon} text-[10px]`} />,
      }))}
      activo={activeTab}
      onCambiar={(id) => onTabChange(id as EditTab)}
      clase="px-2"
      claseActiva=""
      claseInactiva=""
    />
  );
}
