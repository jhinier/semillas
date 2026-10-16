import { ArrowLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

interface AdminTemaDetalleHeaderProps {
  onBack?: () => void;
}

export function AdminTemaDetalleHeader({ onBack }: AdminTemaDetalleHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate({ to: "/admin/temas" });
    }
  };

  return (
    <button
      onClick={handleBack}
      className="flex items-center gap-1 text-sm text-emerald-300/60 mb-6 hover:text-emerald-100 transition-colors"
    >
      <ArrowLeft size={16} /> Volver a temas
    </button>
  );
}
