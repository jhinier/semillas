import { Loader } from "lucide-react";

export function EditThemeLoading() {
  return (
    <div className="flex justify-center py-12">
      <Loader className="animate-spin text-green-600" size={24} />
    </div>
  );
}
