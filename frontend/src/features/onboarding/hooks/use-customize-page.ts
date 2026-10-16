import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { actualizarPerfil } from "@/features/perfil/profile.api";
import { limpiarNombreSugeridoDeGoogle, leerNombreSugeridoDeGoogle } from "@/shared/auth/google-profile";

export function useCustomizePage() {
  const navigate = useNavigate();
  const [grupoEdadId, setGrupoEdadId] = useState<string>("");
  const [nickname, setNickname] = useState<string>(() => leerNombreSugeridoDeGoogle());
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
      localStorage.removeItem("onboarding_grupo_edad_id");
      navigate({ to: "/app" });
    },
  });

  const isUuid = (str: string) =>
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);

  const handleFinish = () => {
    actualizarPerfilMutation.mutate({
      grupo_edad_id: isUuid(grupoEdadId) ? grupoEdadId : null,
      apodo: nickname.trim(),
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
