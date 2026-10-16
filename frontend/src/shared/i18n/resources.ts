export const resources = {
  es: {
    common: {
      appName: "Semillas",
      loading: "Cargando…",
      retry: "Reintentar",
      close: "Cerrar",
      completed: "{{count}} actividades completadas",
      completed_one: "{{count}} actividad completada",
      completed_other: "{{count}} actividades completadas",
    },
    pwa: {
      readyOffline: "Semillas está lista para funcionar sin conexión.",
      updateAvailable: "Hay una nueva versión disponible.",
    },
    auth: {
      login: "Iniciar sesión",
      guest: "Jugar como invitado",
      sessionExpired: "Tu sesión expiró. Inicia sesión nuevamente.",
    },
    onboarding: {
      title: "Comencemos tu recorrido",
      chooseAgeGroup: "Elige tu franja de aprendizaje",
    },
    app: {
      home: "Inicio",
      paths: "Sendas",
      progress: "Progreso",
      clubs: "Clubes",
      profile: "Perfil",
    },
    crecer: {
      conectar: "Conectar",
      relatar: "Relatar",
      ensenar: "Enseñar",
      comprobar: "Comprobar",
      experimentar: "Experimentar",
      recompensar: "Recompensar",
    },
    admin: {
      dashboard: "Panel administrativo",
      reviewRequired: "Requiere revisión humana",
    },
  },
} as const;
