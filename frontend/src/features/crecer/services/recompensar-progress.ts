import type { EventoProgreso } from "@/shared/api/api";

type RegistrarEventos = (eventos: EventoProgreso[]) => Promise<void>;

export async function completarTema(
  temaId: string,
  pasoId: string | undefined,
  registrarEventos: RegistrarEventos,
): Promise<void> {
  await registrarEventos([
    {
      evento_id_cliente: crypto.randomUUID(),
      tipo_evento: "tema_completado",
      tema_id: temaId,
      paso_id: pasoId,
      ocurrido_en_cliente: new Date().toISOString(),
    },
  ]);
}
