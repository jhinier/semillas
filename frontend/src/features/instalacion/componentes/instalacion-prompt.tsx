import { useEffect, useState } from "react";
import {
  esIOS,
  esMovil,
  estaInstaladaComoPWA,
} from "../lib/plataforma";
import { useInstalarPWA } from "@/shared/hooks/use-instalar-pwa";
import { InstalarAppBanner } from "./instalar-app-banner";
import { AvisoInstalarIOS } from "./aviso-instalar-ios";

export interface InstalacionPromptProps {
  retrasoMs?: number;
}

export function InstalacionPrompt({ retrasoMs = 1500 }: InstalacionPromptProps) {
  const { disponible } = useInstalarPWA();
  const [lista, setLista] = useState(false);
  const [instalada, setInstalada] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setInstalada(estaInstaladaComoPWA());
    const timer = window.setTimeout(() => setLista(true), retrasoMs);
    return () => window.clearTimeout(timer);
  }, [retrasoMs]);

  if (!lista || instalada) return null;
  if (!esMovil()) return null;

  if (disponible) {
    return <InstalarAppBanner />;
  }

  if (esIOS()) {
    return <AvisoInstalarIOS />;
  }

  return null;
}