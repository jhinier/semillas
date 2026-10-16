import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  onClick: () => void;
}

export function BackButton({ onClick }: BackButtonProps) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-1 text-sm text-emerald-300/60 mb-6 hover:text-emerald-100 transition-colors">
      <ArrowLeft size={16} /> Volver
    </button>
  );
}
