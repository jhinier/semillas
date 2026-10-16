import { SlidersHorizontal, UserRound, WandSparkles } from "lucide-react";

export type ProfileSection = "resumen" | "editar" | "ajustes";

interface ProfileSectionNavProps {
  active: ProfileSection;
  onChange: (section: ProfileSection) => void;
}

const sections = [
  { id: "resumen" as const, label: "Resumen", icon: UserRound },
  { id: "editar" as const, label: "Editar perfil", icon: WandSparkles },
  { id: "ajustes" as const, label: "Preferencias", icon: SlidersHorizontal },
];

export function ProfileSectionNav({ active, onChange }: ProfileSectionNavProps) {
  return (
    <nav className="profile-section-nav" aria-label="Secciones del perfil">
      {sections.map(({ id, label, icon: Icon }) => {
        const selected = active === id;
        return (
          <button
            key={id}
            type="button"
            className={`profile-section-nav__item ${selected ? "is-active" : ""}`}
            aria-current={selected ? "page" : undefined}
            onClick={() => onChange(id)}
          >
            <Icon size={18} aria-hidden="true" />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
