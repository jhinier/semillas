import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  archivarTema,
  actualizarTema,
  despublicarTema,
  duplicarTema,
  publicarTema,
} from "../../admin.api";

interface UseThemeMutationsProps {
  themeId: string;
  title: string;
  mainMessage: string;
  shortDesc: string;
  duration: number;
  xpRecompensa?: number;
}

export function useThemeMutations({
  themeId,
  title,
  mainMessage,
  shortDesc,
  duration,
  xpRecompensa,
}: UseThemeMutationsProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: () =>
      actualizarTema(themeId, {
        titulo: title,
        objetivo: mainMessage,
        resumen: shortDesc,
        xp_recompensa: xpRecompensa ?? 100,
        minutos_estimados: Number(duration),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "theme", themeId] });
      navigate({ to: "/admin/temas" });
    },
  });

  const publicarMutation = useMutation({
    mutationFn: () => publicarTema(themeId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "theme", themeId] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "themes"] });
    },
  });

  const borradorMutation = useMutation({
    mutationFn: () => despublicarTema(themeId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "theme", themeId] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "themes"] });
    },
  });

  const archivarMutation = useMutation({
    mutationFn: () => archivarTema(themeId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "theme", themeId] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "themes"] });
    },
  });

  const duplicarMutation = useMutation({
    mutationFn: () => duplicarTema(themeId),
    onSuccess: async (duplicado) => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "theme", themeId] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "themes"] });
      navigate({ to: "/admin/temas/$themeId/edit", params: { themeId: duplicado.id } });
    },
  });

  return {
    updateMutation,
    publicarMutation,
    borradorMutation,
    archivarMutation,
    duplicarMutation,
  };
}
