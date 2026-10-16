import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { crearSesionInvitado, iniciarSesionFacebook, iniciarSesionGoogle } from "@/features/auth/auth.api";
import { sessionStorageApi } from "@/shared/api/session";
import { sincronizarSesionAutenticada } from "@/shared/auth/supabase";
import { obtenerMiPerfil, reclamarCuentaInvitada } from "@/features/perfil/profile.api";
import { esFacebookPermitidoEnOrigen, estaGoogleHabilitado, obtenerRedirectGoogle, obtenerRedirectFacebook } from "@/features/auth/social-login";
import { obtenerRutaPostLogin } from "@/shared/auth/post-login";
import { migrarInvitadoSiCorresponde } from "../migracion-invitado";

type UseLoginPageOptions = {
  redirectTo: string;
};

export function useLoginPage({ redirectTo }: UseLoginPageOptions) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tabActivo, setTabActivo] = useState<"social" | "email">("social");
  const facebookDisponible = esFacebookPermitidoEnOrigen(window.location.origin);
  const googleDisponible = estaGoogleHabilitado();

  const guestMutation = useMutation({
    mutationFn: crearSesionInvitado,
    onSuccess(data) {
      sessionStorageApi.setGuestUserId(data.autenticacion.valor);
      sessionStorageApi.setGuestToken(data.autenticacion.token);
      navigate({ to: "/onboarding" });
    },
  });

  const googleMutation = useMutation({
    mutationFn: () => iniciarSesionGoogle(obtenerRedirectGoogle(window.location.origin)),
  });

  const facebookMutation = useMutation({
    mutationFn: () => iniciarSesionFacebook(obtenerRedirectFacebook(window.location.origin)),
  });

  const handleEmailSuccess = async () => {
    await sincronizarSesionAutenticada();
    try {
      await migrarInvitadoSiCorresponde({
        guestUserId: sessionStorageApi.getGuestUserId(),
        accessToken: sessionStorageApi.getAccessToken(),
        vincularCuenta: reclamarCuentaInvitada,
        limpiarSesionInvitado: () => sessionStorageApi.clearGuestSession(),
      });
    } catch (e) {
      console.warn("No se pudo migrar la cuenta de invitado:", e);
      // Limpiamos la sesión de invitado para que no bloquee futuros inicios de sesión
      sessionStorageApi.clearGuestSession();
    }
    const perfilRespuesta = await queryClient.ensureQueryData({
      queryKey: ["me"],
      queryFn: obtenerMiPerfil,
    });
    const rutaPostLogin = obtenerRutaPostLogin(perfilRespuesta.perfil, perfilRespuesta.usuario);
    navigate({ to: redirectTo === "/onboarding" ? rutaPostLogin : redirectTo });
  };

  return {
    tabActivo,
    setTabActivo,
    guestMutation,
    googleMutation,
    facebookMutation,
    googleDisponible,
    handleEmailSuccess,
    facebookDisponible,
  };
}
