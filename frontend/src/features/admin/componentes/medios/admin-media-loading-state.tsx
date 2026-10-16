import { Loader } from "lucide-react";

interface AdminMediaLoadingStateProps {
  isLoading: boolean;
}

export function AdminMediaLoadingState({ isLoading }: AdminMediaLoadingStateProps) {
  if (!isLoading) return null;

  return (
    <div className="flex items-center justify-center py-6">
      <Loader className="animate-spin text-primario" size={24} />
      <span className="text-sm text-slate-500 ml-2">
        Cargando recursos multimedia...
      </span>
    </div>
  );
}
