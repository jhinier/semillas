export type AdminActivitiesTabCounts = {
  todos: number;
  quiz: number;
  flashcards: number;
  completar: number;
  verdaderoFalso: number;
  sopa: number;
};

export type AdminActivitiesTabsProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabCounts: AdminActivitiesTabCounts;
};

export function AdminActivitiesTabs({ activeTab, onTabChange, tabCounts }: AdminActivitiesTabsProps) {
  return (
    <label className="activity-type-filter">
      <span>Tipo de actividad</span>
      <select value={activeTab} onChange={(event) => onTabChange(event.target.value)}>
        <option value="todos">Todas las actividades ({tabCounts.todos})</option>
        <option value="quiz">Quiz ({tabCounts.quiz})</option>
        <option value="flashcard">Flashcards ({tabCounts.flashcards})</option>
        <option value="completar">Completar versículo ({tabCounts.completar})</option>
        <option value="verdadero-falso">Verdadero o falso ({tabCounts.verdaderoFalso})</option>
        <option value="sopa">Sopa de letras ({tabCounts.sopa})</option>
      </select>
    </label>
  );
}
