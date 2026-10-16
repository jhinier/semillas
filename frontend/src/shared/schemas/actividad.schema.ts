/**
 * Punto de compatibilidad para imports antiguos. El contrato real vive en
 * actividad-config.schema.ts y solo usa códigos canónicos.
 */
export {
  ActividadConfigSchema,
  ActividadConfigSchema as actividadConfigSchema,
  CODIGOS_ACTIVIDAD_CANONICOS,
} from "./actividad-config.schema";
export type { ActividadConfig } from "./actividad-config.schema";
