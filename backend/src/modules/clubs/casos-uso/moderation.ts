import type { CrearReporteClubInput, ResolverReporteClubInput } from "../moderation.schemas";
import { puedeTransicionarReporte } from "../moderation-policy";

type RepositorioModeracion = {
  obtenerClub: (clubId: string) => Promise<{ activo: boolean } | null>;
  obtenerMembresia: (usuarioId: string, clubId: string) => Promise<unknown>;
  obtenerMembresiaPorToken: (tokenPublico: string, clubId: string) => Promise<{ usuarioId: string } | null>;
  contarReportesRecientes: (usuarioId: string, desde: Date) => Promise<number>;
  crearReporte: (input: Omit<CrearReporteClubInput, "miembro_token"> & { clubId: string; reportadoPor: string; reportadoUsuarioId: string }) => Promise<unknown>;
  obtenerReporte: (id: string) => Promise<unknown>;
  resolverReporte: (id: string, input: ResolverReporteClubInput & { resueltoPor: string }) => Promise<unknown>;
  listarReportes: (estado?: string) => Promise<unknown[]>;
};

export function crearCasoModeracionClub(repositorio: RepositorioModeracion) {
  return {
    reportar: async (clubId: string, usuarioId: string, input: CrearReporteClubInput) => {
      const club = await repositorio.obtenerClub(clubId);
      if (!club || !club.activo) return { error: { mensaje: "Club inactivo", codigo: "FORBIDDEN", estado: 403 } } as const;
      if (!await repositorio.obtenerMembresia(usuarioId, clubId)) return { error: { mensaje: "No perteneces a este club", codigo: "FORBIDDEN", estado: 403 } } as const;
      const reportado = await repositorio.obtenerMembresiaPorToken(input.miembro_token, clubId);
      if (!reportado) return { error: { mensaje: "La persona reportada no pertenece a este club", codigo: "BAD_REQUEST", estado: 400 } } as const;
      if (reportado.usuarioId === usuarioId) return { error: { mensaje: "No puedes reportarte a ti mismo", codigo: "BAD_REQUEST", estado: 400 } } as const;
      if (await repositorio.contarReportesRecientes(usuarioId, new Date(Date.now() - 60 * 60 * 1000)) >= 5) {
        return { error: { mensaje: "Has alcanzado el límite de reportes por hora", codigo: "RATE_LIMITED", estado: 429 } } as const;
      }
      return repositorio.crearReporte({ clubId, categoria: input.categoria, detalle: input.detalle, reportadoPor: usuarioId, reportadoUsuarioId: reportado.usuarioId });
    },
    listar: (estado?: string) => repositorio.listarReportes(estado),
    resolver: async (id: string, input: ResolverReporteClubInput, usuarioId: string) => {
      const reporte = await repositorio.obtenerReporte(id);
      if (!reporte) return { error: { mensaje: "Reporte no encontrado", codigo: "NOT_FOUND", estado: 404 } } as const;
      const estadoActual = (reporte as { estado?: string }).estado;
      if (!estadoActual || !puedeTransicionarReporte(estadoActual as Parameters<typeof puedeTransicionarReporte>[0], input.estado)) {
        return { error: { mensaje: "La transición del reporte no está permitida", codigo: "CONFLICT", estado: 409 } } as const;
      }
      return repositorio.resolverReporte(id, { ...input, resueltoPor: usuarioId });
    },
  };
}
