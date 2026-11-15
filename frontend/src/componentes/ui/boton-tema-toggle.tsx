import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import {
  alternarTemaVisual,
  esTemaOscuroActivo,
} from "@/shared/accessibility/preferences";

interface BotonTemaToggleProps {
  className?: string;
  scopeId?: string | null;
}

export function BotonTemaToggle({ className, scopeId }: BotonTemaToggleProps) {
  const [esOscuro, setEsOscuro] = useState(() => esTemaOscuroActivo(scopeId));

  useEffect(() => {
    const actualizar = () => setEsOscuro(esTemaOscuroActivo(scopeId));
    actualizar();

    window.addEventListener("semillas:preferences-changed", actualizar);
    window.addEventListener("storage", actualizar);
    return () => {
      window.removeEventListener("semillas:preferences-changed", actualizar);
      window.removeEventListener("storage", actualizar);
    };
  }, [scopeId]);

  const handleToggle = () => {
    const nuevoTema = alternarTemaVisual(scopeId);
    setEsOscuro(nuevoTema === "oscuro");
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={esOscuro}
      aria-label={esOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={esOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className={className || "theme-toggle-btn"}
    >
      {esOscuro ? (
        <Sun className="size-[18px] text-amber-400" aria-hidden="true" />
      ) : (
        <Moon className="size-[18px] text-slate-600" aria-hidden="true" />
      )}
    </button>
  );
}
