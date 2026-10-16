const segmento = (id: string) => encodeURIComponent(id);

export const RUTAS_API = {
  PERFIL: { VINCULAR_CUENTA: "/perfil/vincular-cuenta" },
  CLUBES: {
    LISTAR: "/clubes", MIOS: "/clubes/mios", CREAR: "/clubes", UNIRSE: "/clubes/unirse",
    DETALLE: (id: string) => `/clubes/${segmento(id)}`,
    SALIR: (id: string) => `/clubes/${segmento(id)}/salir`,
    REGENERAR_CODIGO: (id: string) => `/clubes/${segmento(id)}/regenerar-codigo`,
    TRANSFERIR: (id: string) => `/clubes/${segmento(id)}/transferir-liderazgo`,
    MIEMBRO: (id: string, miembroToken: string) => `/clubes/${segmento(id)}/miembros/${segmento(miembroToken)}`,
    RANKING: (id: string) => `/clubes/${segmento(id)}/ranking`,
    RETOS: (id: string) => `/clubes/${segmento(id)}/retos`,
    REPORTES: (id: string) => `/clubes/${segmento(id)}/reportes`,
    RECLAMAR_RETO: (id: string, retoId: string) => `/clubes/${segmento(id)}/retos/${segmento(retoId)}/reclamar`,
  },
  SYNC: { PUSH: "/sync/push", PULL: "/sync/pull" },
  PROGRESO: { REGISTRAR: "/progreso/eventos", MI: "/progreso/mi" },
  MEDIA: {
    LISTAR: "/media", SUBIR: "/media/subir",
    VER: (id: string) => `/media/${segmento(id)}`,
    URL_FIRMADA: (id: string) => `/media/${segmento(id)}/url`,
    ACTUALIZAR: (id: string) => `/media/${segmento(id)}`,
    REEMPLAZAR: (id: string) => `/media/${segmento(id)}/reemplazar`,
    ELIMINAR: (id: string) => `/media/${segmento(id)}`,
  },
} as const;
