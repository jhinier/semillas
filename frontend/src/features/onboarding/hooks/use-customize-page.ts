import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { actualizarPerfil } from "@/features/perfil/profile.api";
import { limpiarNombreSugeridoDeGoogle, leerNombreSugeridoDeGoogle } from "@/shared/auth/google-profile";

export function useCustomizePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [grupoEdadId, setGrupoEdadId] = useState<string>("");
  const [nickname, setNickname] = useState<string>(() => leerNombreSugeridoDeGoogle() || "Semillero");
  const [selectedAvatar, setSelectedAvatar] = useState<number>(1);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    const savedId = localStorage.getItem("onboarding_grupo_edad_id");
    if (savedId) setGrupoEdadId(savedId);
  }, []);

  const actualizarPerfilMutation = useMutation({
    mutationFn: actualizarPerfil,
    onSuccess() {
      limpiarNombreSugeridoDeGoogle();
      void queryClient.invalidateQueries({ queryKey: ["me"] });
      void queryClient.invalidateQueries({ queryKey: ["temas"] });
      navigate({ to: "/app" });
    },
  });

  const handleFinish = () => {
    actualizarPerfilMutation.mutate({
      grupo_edad_id: grupoEdadId || "semillas",
      apodo: nickname.trim() || "Semillero",
      clave_avatar: String(selectedAvatar),
    });
  };

  const isButtonEnabled = nickname.trim().length > 0 && !actualizarPerfilMutation.isPending;

  return {
    nickname,
    setNickname,
    selectedAvatar,
    setSelectedAvatar,
    isHelpOpen,
    setIsHelpOpen,
    handleFinish,
    isButtonEnabled,
    actualizarPerfilMutation,
    navigateToBack: () => navigate({ to: "/onboarding" }),
  };
}
