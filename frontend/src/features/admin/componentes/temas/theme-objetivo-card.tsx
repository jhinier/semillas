interface ThemeObjetivoCardProps {
  objetivo: string;
}

export function ThemeObjetivoCard({ objetivo }: ThemeObjetivoCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="font-bold text-neutro-oscuro-max mb-3">Objetivo</h3>
      <p className="text-sm text-neutro-oscuro">{objetivo}</p>
    </div>
  );
}
