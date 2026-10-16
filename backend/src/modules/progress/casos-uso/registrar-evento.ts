import type { ProgressRepository } from "../progress.repository";

type Dependencias = { progreso: ProgressRepository };

type Entrada = {
  evento_id_cliente: string;
  tipo_evento: string;
  tema_id?: string;
  paso_id?: string;
  actividad_id?: string;
  correcta?: boolean;
  puntaje?: number;
  xp_otorgada?: number;
  datos?: Record<string, unknown>;
  ocurrido_en_cliente?: string;
  dispositivo_id?: string;
};

export function crearCasoRegistrarEvento({ progreso }: Dependencias) {
  return async function registrarEvento(usuarioId: string, entrada: Entrada) {
    const resultado = await progreso.registrarEvento(usuarioId, entrada);

    if (!resultado) {
      return { duplicado: true, mensaje: "Evento ya procesado" };
    }

    const { data, logrosGanados } = resultado;

    if (!data) {
      return { duplicado: true, mensaje: "Evento ya procesado" };
    }

    return {
      duplicado: false,
      evento: data,
      logros_ganados: logrosGanados ?? [],
    };
  };
}
