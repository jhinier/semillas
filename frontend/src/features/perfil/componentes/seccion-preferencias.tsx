import { useEffect, useState } from "react";
import { Eye, Headphones, Languages, SunMoon, Type, UserRoundCog } from "lucide-react";
import { leerPreferenciaPerfil } from "@/shared/accessibility/preferences";

interface SeccionPreferenciasProps {
  grupoEdadLabel: string;
  prefiereAudio: boolean;
  tamanoTextoLabel: string;
  scopeId?: string;
  onEditarPerfil: () => void;
  onEditarPreferencias: () => void;
}

const preferenceItems = [
  { id: "franja", label: "Franja", icon: UserRoundCog },
  { id: "audio", label: "Audio", icon: Headphones },
  { id: "texto", label: "Tamaño de texto", icon: Type },
  { id: "tema", label: "Tema visual", icon: SunMoon },
  { id: "contraste", label: "Alto contraste", icon: Eye },
] as const;

const ETIQUETAS_TEMA: Record<string, string> = {
  claro: "Claro",
  oscuro: "Oscuro",
  sistema: "Sistema",
};

export function SeccionPreferencias({
  grupoEdadLabel,
  prefiereAudio,
  tamanoTextoLabel,
  scopeId,
  onEditarPerfil,
  onEditarPreferencias,
}: SeccionPreferenciasProps) {
  const [temaVisual, setTemaVisual] = useState(() =>
    leerPreferenciaPerfil("semillas-pref-tema", scopeId, "claro") || "claro",
  );
  const [altoContraste, setAltoContraste] = useState(() =>
    leerPreferenciaPerfil("semillas-pref-contraste", scopeId) === "alto",
  );

  useEffect(() => {
    const actualizar = () => {
      setTemaVisual(leerPreferenciaPerfil("semillas-pref-tema", scopeId, "claro") || "claro");
      setAltoContraste(leerPreferenciaPerfil("semillas-pref-contraste", scopeId) === "alto");
    };
    actualizar();
    window.addEventListener("semillas:preferences-changed", actualizar);
    window.addEventListener("storage", actualizar);
    return () => {
      window.removeEventListener("semillas:preferences-changed", actualizar);
      window.removeEventListener("storage", actualizar);
    };
  }, [scopeId]);

  const values = {
    franja: grupoEdadLabel,
    audio: prefiereAudio ? "Activado" : "Desactivado",
    texto: tamanoTextoLabel,
    tema: ETIQUETAS_TEMA[temaVisual] || "Claro",
    contraste: altoContraste ? "Activado" : "Normal",
  };

  return (
    <section className="profile-side-card">
      <div className="profile-side-card__heading">
        <div>
          <p className="profile-eyebrow">Aprendizaje</p>
          <h2>Preferencias</h2>
        </div>
        <span className="profile-side-card__status is-neutral">
          <Languages size={17} aria-hidden="true" />
        </span>
      </div>

      <dl className="profile-preferences-list">
        {preferenceItems.map(({ id, label, icon: Icon }) => (
          <div key={id} className="profile-preference-row">
            <span className="profile-preference-row__icon" aria-hidden="true">
              <Icon size={18} />
            </span>
            <div>
              <dt>{label}</dt>
              <dd>{values[id]}</dd>
            </div>
          </div>
        ))}
      </dl>

      <div className="profile-side-card__footer-actions">
        <button type="button" className="profile-text-button" onClick={onEditarPerfil}>
          Editar perfil
        </button>
        <button type="button" className="profile-text-button" onClick={onEditarPreferencias}>
          Cambiar preferencias
        </button>
      </div>
    </section>
  );
}
