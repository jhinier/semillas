export { gamificationRoutes } from "./gamification.routes";
export { adminLogrosRoutes } from "./admin-logros.routes";
export { crearGamificationRepository } from "./gamification.repository";
export { crearAdminLogrosRepository } from "./admin-logros.repository";
export { crearCasoObtenerMiGamificacion } from "./casos-uso/obtener-mi";
export { crearCasosUsoAdminLogros } from "./casos-uso/admin-logros";
export {
  criteriosLogro,
  codigoCriterioLogroSchema,
  crearLogroAdminSchema,
  actualizarLogroAdminSchema,
  adminLogrosListSchema,
  logroParamsSchema,
} from "./admin-logros.schemas";
export type {
  CrearLogroAdminEntrada,
  ActualizarLogroAdminEntrada,
  AdminLogrosListEntrada,
  CodigoCriterioLogro,
} from "./admin-logros.schemas";