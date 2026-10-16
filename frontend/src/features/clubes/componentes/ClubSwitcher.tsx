import { Plus, Users } from "lucide-react";
import type { Club } from "@/features/clubes/clubes.api";

interface ClubSwitcherProps {
  clubs: Club[];
  activeId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
}

export function ClubSwitcher({ clubs, activeId, onSelect, onAdd }: ClubSwitcherProps) {
  return (
    <div className="club-switcher" role="list" aria-label="Tus clubes">
      {clubs.map((club) => (
        <button
          key={club.id}
          type="button"
          role="listitem"
          className="club-switcher__item"
          data-active={club.id === activeId}
          onClick={() => onSelect(club.id)}
        >
          <span aria-hidden="true"><Users size={17} /></span>
          <span>{club.nombre}</span>
          <small>{club.member_count ?? 0}</small>
        </button>
      ))}
      <button type="button" className="club-switcher__add" onClick={onAdd}>
        <Plus size={17} /> <span>Agregar club</span>
      </button>
    </div>
  );
}
