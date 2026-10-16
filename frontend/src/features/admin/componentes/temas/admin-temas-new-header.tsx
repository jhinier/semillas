interface AdminTemasNewHeaderProps {
  onBack: () => void;
}

export function AdminTemasNewHeader({ onBack }: AdminTemasNewHeaderProps) {
  return (
    <button
      onClick={onBack}
      className="flex items-center gap-2 text-xs font-bold text-emerald-400/50 hover:text-emerald-100 transition-colors bg-[#142e22] border border-[#1a3a2a] px-3 py-1.5 rounded-full w-max select-none cursor-pointer"
    >
      <i className="fa-solid fa-arrow-left text-[10px]" />
      Volver a temas
    </button>
  );
}
