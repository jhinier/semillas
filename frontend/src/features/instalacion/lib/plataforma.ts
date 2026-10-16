export type ResultadoInstalacion = "aceptada" | "rechazada" | "no_disponible";

export type EventoAntesDeInstalar = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export type Plataforma = {
  esIOS: boolean;
  esSafariIOS: boolean;
  esAndroid: boolean;
  esMovil: boolean;
};

export type EstadoPantalla = {
  instalado: boolean;
  soportaPromptNativo: boolean;
  plataforma: Plataforma;
};

declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

export function esIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function esSafariIOS(): boolean {
  return esIOS() && /safari/i.test(navigator.userAgent) && !/crios|fxios|edgios/i.test(navigator.userAgent);
}

export function esAndroid(): boolean {
  if (typeof navigator === "undefined") return false;
  return /android/i.test(navigator.userAgent);
}

export function esMovil(): boolean {
  return esIOS() || esAndroid();
}

export function detectarPlataforma(): Plataforma {
  return {
    esIOS: esIOS(),
    esSafariIOS: esSafariIOS(),
    esAndroid: esAndroid(),
    esMovil: esMovil(),
  };
}

export function estaInstaladaComoPWA(): boolean {
  if (typeof window === "undefined") return false;
  const standalone = window.matchMedia("(display-mode: standalone)").matches;
  const fullscreen = window.matchMedia("(display-mode: fullscreen)").matches;
  const minimalUi = window.matchMedia("(display-mode: minimal-ui)").matches;
  const iosStandalone = navigator.standalone === true;
  return standalone || fullscreen || minimalUi || iosStandalone;
}

export function soportaPromptInstalacion(): boolean {
  if (typeof window === "undefined") return false;
  return "BeforeInstallPromptEvent" in window;
}

export function obtenerEstadoPantalla(): EstadoPantalla {
  return {
    instalado: estaInstaladaComoPWA(),
    soportaPromptNativo: soportaPromptInstalacion(),
    plataforma: detectarPlataforma(),
  };
}