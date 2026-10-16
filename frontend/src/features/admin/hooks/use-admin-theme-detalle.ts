import { useQuery } from "@tanstack/react-query";
import { obtenerTemaAdmin, obtenerPasosAdmin } from "@/features/admin/admin.api";
import { obtenerActividades } from "@/features/themes/themes.api";

type UseAdminThemeDetalleOptions = {
  themeId: string;
};

export function useAdminThemeDetalle({ themeId }: UseAdminThemeDetalleOptions) {
  const themeQuery = useQuery({
    queryKey: ["admin", "theme", themeId],
    queryFn: () => obtenerTemaAdmin(themeId),
  });

  const stepsQuery = useQuery({
    queryKey: ["admin", "theme", themeId, "steps"],
    queryFn: () => obtenerPasosAdmin(themeId),
  });

  const activitiesQuery = useQuery({
    queryKey: ["admin", "theme", themeId, "activities"],
    queryFn: () => obtenerActividades(themeId),
  });

  return {
    themeQuery,
    stepsQuery,
    activitiesQuery,
    theme: themeQuery.data,
  };
}
