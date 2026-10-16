export { InstalacionPrompt } from "./componentes/instalacion-prompt";
export { InstalarAppBanner } from "./componentes/instalar-app-banner";
export { AvisoInstalarIOS } from "./componentes/aviso-instalar-ios";
export { useInstalarPWA } from "@/shared/hooks/use-instalar-pwa";
export {
  esIOS,
  esSafariIOS,
  esAndroid,
  esMovil,
  detectarPlataforma,
  estaInstaladaComoPWA,
  soportaPromptInstalacion,
  obtenerEstadoPantalla,
  type EventoAntesDeInstalar,
  type ResultadoInstalacion,
  type Plataforma,
  type EstadoPantalla,
} from "./lib/plataforma";