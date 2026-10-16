import { useState } from "react";

export function useThemeTableMenu() {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const abrirMenu = (id: string) => setActiveMenuId(id);
  const cerrarMenu = () => setActiveMenuId(null);
  const alternarMenu = (id: string) =>
    setActiveMenuId(activeMenuId === id ? null : id);
  const isMenuAbierto = (id: string) => activeMenuId === id;

  return {
    activeMenuId,
    abrirMenu,
    cerrarMenu,
    alternarMenu,
    isMenuAbierto,
  };
}
