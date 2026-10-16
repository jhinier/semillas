import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { actualizarTema, obtenerTemaAdmin } from "../admin.api";
import { obtenerUrlPortadaTema } from "../../themes/themes.api";
import { subirArchivo } from "../../media/media.api";
import { usePortadaHandlers } from "../componentes/temas/use-portada-handlers";
import { useThemeMutations } from "../componentes/temas/use-theme-mutations";

export function useThemeEditPage({ themeId }: { themeId: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const inputPortadaRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<"general" | "portada" | "config" | "publicacion">("general");
  const [title, setTitle] = useState("");
  const [targetAudience, setTargetAudience] = useState("Niños de 6 a 10 años");
  const [shortDesc, setShortDesc] = useState("");
  const [category, setCategory] = useState("confianza");
  const [duration, setDuration] = useState(45);
  const [keyVerse, setKeyVerse] = useState("Salmo 23:1");
  const [mainMessage, setMainMessage] = useState("");
  const [tagsList, setTagsList] = useState<string[]>([]);

  const themeQuery = useQuery({
    queryKey: ["admin", "theme", themeId],
    queryFn: () => obtenerTemaAdmin(themeId),
  });

  const portadaQuery = useQuery({
    queryKey: ["theme-portada", themeId],
    queryFn: () => obtenerUrlPortadaTema(themeId),
    enabled: Boolean(themeQuery.data?.portada_recurso_id),
    staleTime: 10 * 60 * 1000,
    gcTime: 11 * 60 * 1000,
    retry: 1,
  });

  const theme = themeQuery.data;
  const portadaUrl = portadaQuery.data?.url ?? theme?.portada_recurso?.url_publica ?? null;

  const portadaMutation = useMutation({
    mutationFn: async (archivo: File | null) => {
      if (!archivo) {
        return actualizarTema(themeId, { portada_recurso_id: null });
      }
      const recurso = await subirArchivo(archivo, "imagen", `Portada ${title || theme?.titulo || "tema"}`);
      return actualizarTema(themeId, { portada_recurso_id: recurso.id });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "theme", themeId] });
      await queryClient.invalidateQueries({ queryKey: ["theme-portada", themeId] });
    },
  });

  const { updateMutation, publicarMutation, borradorMutation, archivarMutation, duplicarMutation } = useThemeMutations({
    themeId,
    title,
    mainMessage,
    shortDesc,
    duration,
    xpRecompensa: theme?.xp_recompensa,
  });

  const { handlePortadaInput, handleAbrirSelectorPortada, handleQuitarPortada } = usePortadaHandlers({
    inputPortadaRef,
    portadaMutation,
    titulo: title,
    temaTitulo: theme?.titulo,
  });

  return {
    themeId,
    navigate,
    queryClient,
    inputPortadaRef,
    activeTab,
    setActiveTab,
    title,
    setTitle,
    targetAudience,
    setTargetAudience,
    shortDesc,
    setShortDesc,
    category,
    setCategory,
    duration,
    setDuration,
    keyVerse,
    setKeyVerse,
    mainMessage,
    setMainMessage,
    tagsList,
    setTagsList,
    themeQuery,
    portadaQuery,
    theme,
    portadaUrl,
    portadaMutation,
    updateMutation,
    publicarMutation,
    borradorMutation,
    archivarMutation,
    duplicarMutation,
    handlePortadaInput,
    handleAbrirSelectorPortada,
    handleQuitarPortada,
  };
}
