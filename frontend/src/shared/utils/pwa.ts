export type ResultadoInstalacion = "aceptada" | "rechazada" | "no_disponible";

export type EventoAntesDeInstalar = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

declare global {
  interface Window {
    semillasDeferredPrompt: EventoAntesDeInstalar | null;
  }

  interface Navigator {
    standalone?: boolean;
  }
}

export function esIOS(): boolean {
  if (typeof window === "undefined" || !window.navigator) {
    return false;
  }
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function esMovil(): boolean {
  if (typeof window === "undefined" || !window.navigator) {
    return false;
  }
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    window.navigator.userAgent.toLowerCase()
  );
}

export function esSafariIOS(): boolean {
  if (!esIOS()) {
    return false;
  }
  const ua = window.navigator.userAgent;
  // Chrome/CriOS and Firefox/FxiOS on iOS are not Safari
  return /safari/i.test(ua) && !/crios/i.test(ua) && !/fxios/i.test(ua);
}

export function estaInstaladaComoPWA(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const standalone = window.matchMedia("(display-mode: standalone)").matches;
  const fullscreen = window.matchMedia("(display-mode: fullscreen)").matches;
  const iosStandalone = window.navigator.standalone === true;

  return standalone || fullscreen || iosStandalone;
}
