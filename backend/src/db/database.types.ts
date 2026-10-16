export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      actividad: {
        Row: {
          actualizado_en: string
          configuracion: Json
          consigna: string
          creado_en: string
          dificultad: string
          grupo_edad_id: string
          id: string
          limite_tiempo_seg: number | null
          obligatorio: boolean
          orden: number
          paso_id: string | null
          retroalimentacion: string | null
          tema_id: string
          tipo_actividad_id: string
          titulo: string
          xp_recompensa: number
        }
        Insert: {
          actualizado_en?: string
          configuracion?: Json
          consigna: string
          creado_en?: string
          dificultad?: string
          grupo_edad_id: string
          id?: string
          limite_tiempo_seg?: number | null
          obligatorio?: boolean
          orden: number
          paso_id?: string | null
          retroalimentacion?: string | null
          tema_id: string
          tipo_actividad_id: string
          titulo: string
          xp_recompensa?: number
        }
        Update: {
          actualizado_en?: string
          configuracion?: Json
          consigna?: string
          creado_en?: string
          dificultad?: string
          grupo_edad_id?: string
          id?: string
          limite_tiempo_seg?: number | null
          obligatorio?: boolean
          orden?: number
          paso_id?: string | null
          retroalimentacion?: string | null
          tema_id?: string
          tipo_actividad_id?: string
          titulo?: string
          xp_recompensa?: number
        }
        Relationships: [
          {
            foreignKeyName: "actividad_grupo_edad_id_fkey"
            columns: ["grupo_edad_id"]
            isOneToOne: false
            referencedRelation: "grupo_edad"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actividad_paso_id_fkey"
            columns: ["paso_id"]
            isOneToOne: false
            referencedRelation: "paso_tema"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actividad_tema_id_fkey"
            columns: ["tema_id"]
            isOneToOne: false
            referencedRelation: "tema"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actividad_tema_id_fkey"
            columns: ["tema_id"]
            isOneToOne: false
            referencedRelation: "v_temas_publicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actividad_tipo_actividad_id_fkey"
            columns: ["tipo_actividad_id"]
            isOneToOne: false
            referencedRelation: "tipo_actividad"
            referencedColumns: ["id"]
          },
        ]
      }
      club: {
        Row: {
          activo: boolean
          codigo_invitacion: string
          creado_en: string
          creado_por: string
          descripcion: string | null
          id: string
          nombre: string
        }
        Insert: {
          activo?: boolean
          codigo_invitacion: string
          creado_en?: string
          creado_por: string
          descripcion?: string | null
          id?: string
          nombre: string
        }
        Update: {
          activo?: boolean
          codigo_invitacion?: string
          creado_en?: string
          creado_por?: string
          descripcion?: string | null
          id?: string
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "usuario_app"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "v_nivel_usuario"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "club_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "v_xp_usuario"
            referencedColumns: ["usuario_id"]
          },
        ]
      }
      configuracion_plataforma: {
        Row: {
          actualizado_en: string
          actualizado_por: string | null
          categoria: string
          clave: string
          descripcion: string | null
          valor: Json
        }
        Insert: {
          actualizado_en?: string
          actualizado_por?: string | null
          categoria?: string
          clave: string
          descripcion?: string | null
          valor?: Json
        }
        Update: {
          actualizado_en?: string
          actualizado_por?: string | null
          categoria?: string
          clave?: string
          descripcion?: string | null
          valor?: Json
        }
        Relationships: [
          {
            foreignKeyName: "configuracion_plataforma_actualizado_por_fkey"
            columns: ["actualizado_por"]
            isOneToOne: false
            referencedRelation: "usuario_app"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "configuracion_plataforma_actualizado_por_fkey"
            columns: ["actualizado_por"]
            isOneToOne: false
            referencedRelation: "v_nivel_usuario"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "configuracion_plataforma_actualizado_por_fkey"
            columns: ["actualizado_por"]
            isOneToOne: false
            referencedRelation: "v_xp_usuario"
            referencedColumns: ["usuario_id"]
          },
        ]
      }
      contenido_paso_tema: {
        Row: {
          cuerpo: string
          datos_extra: Json
          grupo_edad_id: string
          id: string
          instruccion_corta: string | null
          paso_id: string
          recurso_audio_id: string | null
          recurso_id: string | null
          titulo: string
        }
        Insert: {
          cuerpo: string
          datos_extra?: Json
          grupo_edad_id: string
          id?: string
          instruccion_corta?: string | null
          paso_id: string
          recurso_audio_id?: string | null
          recurso_id?: string | null
          titulo: string
        }
        Update: {
          cuerpo?: string
          datos_extra?: Json
          grupo_edad_id?: string
          id?: string
          instruccion_corta?: string | null
          paso_id?: string
          recurso_audio_id?: string | null
          recurso_id?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "contenido_paso_tema_grupo_edad_id_fkey"
            columns: ["grupo_edad_id"]
            isOneToOne: false
            referencedRelation: "grupo_edad"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contenido_paso_tema_paso_id_fkey"
            columns: ["paso_id"]
            isOneToOne: false
            referencedRelation: "paso_tema"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contenido_paso_tema_recurso_audio_id_fkey"
            columns: ["recurso_audio_id"]
            isOneToOne: false
            referencedRelation: "recurso_multimedia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contenido_paso_tema_recurso_id_fkey"
            columns: ["recurso_id"]
            isOneToOne: false
            referencedRelation: "recurso_multimedia"
            referencedColumns: ["id"]
          },
        ]
      }
      descarga_sin_conexion_usuario: {
        Row: {
          descargado_en: string
          paquete_id: string
          ultimo_abierto_en: string | null
          usuario_id: string
        }
        Insert: {
          descargado_en?: string
          paquete_id: string
          ultimo_abierto_en?: string | null
          usuario_id: string
        }
        Update: {
          descargado_en?: string
          paquete_id?: string
          ultimo_abierto_en?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "descarga_sin_conexion_usuario_paquete_id_fkey"
            columns: ["paquete_id"]
            isOneToOne: false
            referencedRelation: "paquete_sin_conexion"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "descarga_sin_conexion_usuario_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuario_app"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "descarga_sin_conexion_usuario_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "v_nivel_usuario"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "descarga_sin_conexion_usuario_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "v_xp_usuario"
            referencedColumns: ["usuario_id"]
          },
        ]
      }
      evento_progreso: {
        Row: {
          actividad_id: string | null
          correcta: boolean | null
          datos: Json
          dispositivo_id: string | null
          id: string
          id_evento_cliente: string
          ocurrido_en_cliente: string
          paso_id: string | null
          puntaje: number | null
          recibido_en_servidor: string
          tema_id: string | null
          tipo_evento: Database["public"]["Enums"]["tipo_evento_progreso"]
          usuario_id: string
          xp_otorgada: number
        }
        Insert: {
          actividad_id?: string | null
          correcta?: boolean | null
          datos?: Json
          dispositivo_id?: string | null
          id?: string
          id_evento_cliente: string
          ocurrido_en_cliente: string
          paso_id?: string | null
          puntaje?: number | null
          recibido_en_servidor?: string
          tema_id?: string | null
          tipo_evento: Database["public"]["Enums"]["tipo_evento_progreso"]
          usuario_id: string
          xp_otorgada?: number
        }
        Update: {
          actividad_id?: string | null
          correcta?: boolean | null
          datos?: Json
          dispositivo_id?: string | null
          id?: string
          id_evento_cliente?: string
          ocurrido_en_cliente?: string
          paso_id?: string | null
          puntaje?: number | null
          recibido_en_servidor?: string
          tema_id?: string | null
          tipo_evento?: Database["public"]["Enums"]["tipo_evento_progreso"]
          usuario_id?: string
          xp_otorgada?: number
        }
        Relationships: [
          {
            foreignKeyName: "evento_progreso_actividad_id_fkey"
            columns: ["actividad_id"]
            isOneToOne: false
            referencedRelation: "actividad"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evento_progreso_paso_id_fkey"
            columns: ["paso_id"]
            isOneToOne: false
            referencedRelation: "paso_tema"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evento_progreso_tema_id_fkey"
            columns: ["tema_id"]
            isOneToOne: false
            referencedRelation: "tema"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evento_progreso_tema_id_fkey"
            columns: ["tema_id"]
            isOneToOne: false
            referencedRelation: "v_temas_publicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evento_progreso_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuario_app"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evento_progreso_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "v_nivel_usuario"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "evento_progreso_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "v_xp_usuario"
            referencedColumns: ["usuario_id"]
          },
        ]
      }
      grupo_edad: {
        Row: {
          codigo: string
          creado_en: string
          descripcion: string | null
          edad_maxima: number
          edad_minima: number
          id: string
          imagen_url: string | null
          nombre: string
          orden: number
        }
        Insert: {
          codigo: string
          creado_en?: string
          descripcion?: string | null
          edad_maxima: number
          edad_minima: number
          id?: string
          imagen_url?: string | null
          nombre: string
          orden: number
        }
        Update: {
          codigo?: string
          creado_en?: string
          descripcion?: string | null
          edad_maxima?: number
          edad_minima?: number
          id?: string
          imagen_url?: string | null
          nombre?: string
          orden?: number
        }
        Relationships: []
      }
      libro_biblico: {
        Row: {
          id: number
          nombre: string
          orden: number
          testamento_id: number
        }
        Insert: {
          id?: never
          nombre: string
          orden: number
          testamento_id: number
        }
        Update: {
          id?: never
          nombre?: string
          orden?: number
          testamento_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "libro_biblico_testamento_id_fkey"
            columns: ["testamento_id"]
            isOneToOne: false
            referencedRelation: "testamento_biblico"
            referencedColumns: ["id"]
          },
        ]
      }
      logro: {
        Row: {
          activo: boolean
          bono_xp: number
          codigo: string
          codigo_criterio: string
          creado_en: string
          descripcion: string | null
          id: string
          nombre: string
          url_icono: string | null
          valor_criterio: number | null
        }
        Insert: {
          activo?: boolean
          bono_xp?: number
          codigo: string
          codigo_criterio: string
          creado_en?: string
          descripcion?: string | null
          id?: string
          nombre: string
          url_icono?: string | null
          valor_criterio?: number | null
        }
        Update: {
          activo?: boolean
          bono_xp?: number
          codigo?: string
          codigo_criterio?: string
          creado_en?: string
          descripcion?: string | null
          id?: string
          nombre?: string
          url_icono?: string | null
          valor_criterio?: number | null
        }
        Relationships: []
      }
      logro_usuario: {
        Row: {
          ganado_en: string
          logro_id: string
          reclamado_en: string | null
          usuario_id: string
        }
        Insert: {
          ganado_en?: string
          logro_id: string
          reclamado_en?: string | null
          usuario_id: string
        }
        Update: {
          ganado_en?: string
          logro_id?: string
          reclamado_en?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "logro_usuario_logro_id_fkey"
            columns: ["logro_id"]
            isOneToOne: false
            referencedRelation: "logro"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "logro_usuario_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuario_app"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "logro_usuario_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "v_nivel_usuario"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "logro_usuario_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "v_xp_usuario"
            referencedColumns: ["usuario_id"]
          },
        ]
      }
      miembro_club: {
        Row: {
          club_id: string
          rol_miembro: string
          unido_en: string
          usuario_id: string
        }
        Insert: {
          club_id: string
          rol_miembro?: string
          unido_en?: string
          usuario_id: string
        }
        Update: {
          club_id?: string
          rol_miembro?: string
          unido_en?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "miembro_club_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "club"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "miembro_club_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuario_app"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "miembro_club_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "v_nivel_usuario"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "miembro_club_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "v_xp_usuario"
            referencedColumns: ["usuario_id"]
          },
        ]
      }
      movimiento_xp: {
        Row: {
          cantidad: number
          creado_en: string
          id: string
          metadatos: Json
          origen: string
          origen_id: string | null
          usuario_id: string
        }
        Insert: {
          cantidad: number
          creado_en?: string
          id?: string
          metadatos?: Json
          origen: string
          origen_id?: string | null
          usuario_id: string
        }
        Update: {
          cantidad?: number
          creado_en?: string
          id?: string
          metadatos?: Json
          origen?: string
          origen_id?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "movimiento_xp_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuario_app"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimiento_xp_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "v_nivel_usuario"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "movimiento_xp_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "v_xp_usuario"
            referencedColumns: ["usuario_id"]
          },
        ]
      }
      notificacion_usuario: {
        Row: {
          creado_en: string
          datos: Json
          id: string
          leida_en: string | null
          mensaje: string
          tipo: string
          titulo: string
          usuario_id: string
        }
        Insert: {
          creado_en?: string
          datos?: Json
          id?: string
          leida_en?: string | null
          mensaje: string
          tipo: string
          titulo: string
          usuario_id: string
        }
        Update: {
          creado_en?: string
          datos?: Json
          id?: string
          leida_en?: string | null
          mensaje?: string
          tipo?: string
          titulo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacion_usuario_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuario_app"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificacion_usuario_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "v_nivel_usuario"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "notificacion_usuario_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "v_xp_usuario"
            referencedColumns: ["usuario_id"]
          },
        ]
      }
      opcion_actividad: {
        Row: {
          actividad_id: string
          correcta: boolean
          etiqueta: string | null
          id: string
          orden: number
          retroalimentacion: string | null
          texto: string
        }
        Insert: {
          actividad_id: string
          correcta?: boolean
          etiqueta?: string | null
          id?: string
          orden: number
          retroalimentacion?: string | null
          texto: string
        }
        Update: {
          actividad_id?: string
          correcta?: boolean
          etiqueta?: string | null
          id?: string
          orden?: number
          retroalimentacion?: string | null
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "opcion_actividad_actividad_id_fkey"
            columns: ["actividad_id"]
            isOneToOne: false
            referencedRelation: "actividad"
            referencedColumns: ["id"]
          },
        ]
      }
      paquete_sin_conexion: {
        Row: {
          creado_en: string
          id: string
          manifiesto: Json
          tamano_bytes: number
          tema_id: string
          version_contenido: number
        }
        Insert: {
          creado_en?: string
          id?: string
          manifiesto?: Json
          tamano_bytes?: number
          tema_id: string
          version_contenido: number
        }
        Update: {
          creado_en?: string
          id?: string
          manifiesto?: Json
          tamano_bytes?: number
          tema_id?: string
          version_contenido?: number
        }
        Relationships: [
          {
            foreignKeyName: "paquete_sin_conexion_tema_id_fkey"
            columns: ["tema_id"]
            isOneToOne: false
            referencedRelation: "tema"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paquete_sin_conexion_tema_id_fkey"
            columns: ["tema_id"]
            isOneToOne: false
            referencedRelation: "v_temas_publicos"
            referencedColumns: ["id"]
          },
        ]
      }
      paso_tema: {
        Row: {
          creado_en: string
          id: string
          obligatorio: boolean
          orden: number
          tema_id: string
          tipo_paso_id: string
        }
        Insert: {
          creado_en?: string
          id?: string
          obligatorio?: boolean
          orden: number
          tema_id: string
          tipo_paso_id: string
        }
        Update: {
          creado_en?: string
          id?: string
          obligatorio?: boolean
          orden?: number
          tema_id?: string
          tipo_paso_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "paso_tema_tema_id_fkey"
            columns: ["tema_id"]
            isOneToOne: false
            referencedRelation: "tema"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paso_tema_tema_id_fkey"
            columns: ["tema_id"]
            isOneToOne: false
            referencedRelation: "v_temas_publicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paso_tema_tipo_paso_id_fkey"
            columns: ["tipo_paso_id"]
            isOneToOne: false
            referencedRelation: "tipo_paso_crecer"
            referencedColumns: ["id"]
          },
        ]
      }
      perfil: {
        Row: {
          actualizado_en: string
          apodo: string
          clave_avatar: string | null
          creado_en: string
          grupo_edad_id: string | null
          id: string
          prefiere_audio: boolean
          tamano_texto_preferido: string
          url_avatar: string | null
          usuario_id: string
        }
        Insert: {
          actualizado_en?: string
          apodo: string
          clave_avatar?: string | null
          creado_en?: string
          grupo_edad_id?: string | null
          id?: string
          prefiere_audio?: boolean
          tamano_texto_preferido?: string
          url_avatar?: string | null
          usuario_id: string
        }
        Update: {
          actualizado_en?: string
          apodo?: string
          clave_avatar?: string | null
          creado_en?: string
          grupo_edad_id?: string | null
          id?: string
          prefiere_audio?: boolean
          tamano_texto_preferido?: string
          url_avatar?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "perfil_grupo_edad_id_fkey"
            columns: ["grupo_edad_id"]
            isOneToOne: false
            referencedRelation: "grupo_edad"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perfil_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: true
            referencedRelation: "usuario_app"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perfil_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: true
            referencedRelation: "v_nivel_usuario"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "perfil_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: true
            referencedRelation: "v_xp_usuario"
            referencedColumns: ["usuario_id"]
          },
        ]
      }
      pregunta_reflexion: {
        Row: {
          grupo_edad_id: string
          id: string
          orden: number
          paso_id: string
          pregunta: string
        }
        Insert: {
          grupo_edad_id: string
          id?: string
          orden: number
          paso_id: string
          pregunta: string
        }
        Update: {
          grupo_edad_id?: string
          id?: string
          orden?: number
          paso_id?: string
          pregunta?: string
        }
        Relationships: [
          {
            foreignKeyName: "pregunta_reflexion_grupo_edad_id_fkey"
            columns: ["grupo_edad_id"]
            isOneToOne: false
            referencedRelation: "grupo_edad"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pregunta_reflexion_paso_id_fkey"
            columns: ["paso_id"]
            isOneToOne: false
            referencedRelation: "paso_tema"
            referencedColumns: ["id"]
          },
        ]
      }
      progreso_actividad_usuario: {
        Row: {
          actividad_id: string
          actualizado_en: string
          completado: boolean
          completado_en: string | null
          intentos: number
          mejor_puntaje: number
          usuario_id: string
        }
        Insert: {
          actividad_id: string
          actualizado_en?: string
          completado?: boolean
          completado_en?: string | null
          intentos?: number
          mejor_puntaje?: number
          usuario_id: string
        }
        Update: {
          actividad_id?: string
          actualizado_en?: string
          completado?: boolean
          completado_en?: string | null
          intentos?: number
          mejor_puntaje?: number
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progreso_actividad_usuario_actividad_id_fkey"
            columns: ["actividad_id"]
            isOneToOne: false
            referencedRelation: "actividad"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progreso_actividad_usuario_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuario_app"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progreso_actividad_usuario_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "v_nivel_usuario"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "progreso_actividad_usuario_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "v_xp_usuario"
            referencedColumns: ["usuario_id"]
          },
        ]
      }
      progreso_tema_usuario: {
        Row: {
          actualizado_en: string
          completado_en: string | null
          estado: string
          iniciado_en: string | null
          porcentaje: number
          tema_id: string
          ultimo_paso_id: string | null
          usuario_id: string
        }
        Insert: {
          actualizado_en?: string
          completado_en?: string | null
          estado?: string
          iniciado_en?: string | null
          porcentaje?: number
          tema_id: string
          ultimo_paso_id?: string | null
          usuario_id: string
        }
        Update: {
          actualizado_en?: string
          completado_en?: string | null
          estado?: string
          iniciado_en?: string | null
          porcentaje?: number
          tema_id?: string
          ultimo_paso_id?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progreso_tema_usuario_tema_id_fkey"
            columns: ["tema_id"]
            isOneToOne: false
            referencedRelation: "tema"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progreso_tema_usuario_tema_id_fkey"
            columns: ["tema_id"]
            isOneToOne: false
            referencedRelation: "v_temas_publicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progreso_tema_usuario_ultimo_paso_id_fkey"
            columns: ["ultimo_paso_id"]
            isOneToOne: false
            referencedRelation: "paso_tema"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progreso_tema_usuario_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuario_app"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progreso_tema_usuario_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "v_nivel_usuario"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "progreso_tema_usuario_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "v_xp_usuario"
            referencedColumns: ["usuario_id"]
          },
        ]
      }
      racha_usuario: {
        Row: {
          actualizado_en: string
          dias_actuales: number
          dias_maximos: number
          ultima_actividad_fecha: string | null
          usuario_id: string
        }
        Insert: {
          actualizado_en?: string
          dias_actuales?: number
          dias_maximos?: number
          ultima_actividad_fecha?: string | null
          usuario_id: string
        }
        Update: {
          actualizado_en?: string
          dias_actuales?: number
          dias_maximos?: number
          ultima_actividad_fecha?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "racha_usuario_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: true
            referencedRelation: "usuario_app"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "racha_usuario_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: true
            referencedRelation: "v_nivel_usuario"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "racha_usuario_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: true
            referencedRelation: "v_xp_usuario"
            referencedColumns: ["usuario_id"]
          },
        ]
      }
      recompensa_reto_club_usuario: {
        Row: {
          reclamado_en: string
          reto_id: string
          usuario_id: string
          xp_otorgada: number
        }
        Insert: {
          reclamado_en?: string
          reto_id: string
          usuario_id: string
          xp_otorgada?: number
        }
        Update: {
          reclamado_en?: string
          reto_id?: string
          usuario_id?: string
          xp_otorgada?: number
        }
        Relationships: [
          {
            foreignKeyName: "recompensa_reto_club_usuario_reto_id_fkey"
            columns: ["reto_id"]
            isOneToOne: false
            referencedRelation: "reto_club"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recompensa_reto_club_usuario_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuario_app"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recompensa_reto_club_usuario_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "v_nivel_usuario"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "recompensa_reto_club_usuario_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "v_xp_usuario"
            referencedColumns: ["usuario_id"]
          },
        ]
      }
      recurso_multimedia: {
        Row: {
          activo: boolean
          actualizado_en: string
          alto_px: number | null
          ancho_px: number | null
          bucket_almacenamiento: string
          clave_almacenamiento: string | null
          creado_en: string
          creado_por: string | null
          duracion_seg: number | null
          id: string
          tamano_bytes: number | null
          texto_alternativo: string | null
          tipo: Database["public"]["Enums"]["tipo_recurso_multimedia"]
          tipo_mime: string | null
          titulo: string | null
          url_publica: string
        }
        Insert: {
          activo?: boolean
          actualizado_en?: string
          alto_px?: number | null
          ancho_px?: number | null
          bucket_almacenamiento?: string
          clave_almacenamiento?: string | null
          creado_en?: string
          creado_por?: string | null
          duracion_seg?: number | null
          id?: string
          tamano_bytes?: number | null
          texto_alternativo?: string | null
          tipo: Database["public"]["Enums"]["tipo_recurso_multimedia"]
          tipo_mime?: string | null
          titulo?: string | null
          url_publica: string
        }
        Update: {
          activo?: boolean
          actualizado_en?: string
          alto_px?: number | null
          ancho_px?: number | null
          bucket_almacenamiento?: string
          clave_almacenamiento?: string | null
          creado_en?: string
          creado_por?: string | null
          duracion_seg?: number | null
          id?: string
          tamano_bytes?: number | null
          texto_alternativo?: string | null
          tipo?: Database["public"]["Enums"]["tipo_recurso_multimedia"]
          tipo_mime?: string | null
          titulo?: string | null
          url_publica?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurso_multimedia_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "usuario_app"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurso_multimedia_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "v_nivel_usuario"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "recurso_multimedia_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "v_xp_usuario"
            referencedColumns: ["usuario_id"]
          },
        ]
      }
      referencia_biblica: {
        Row: {
          capitulo: number
          id: string
          libro_id: number
          principal: boolean
          tema_id: string
          versiculo_fin: number
          versiculo_inicio: number
        }
        Insert: {
          capitulo: number
          id?: string
          libro_id: number
          principal?: boolean
          tema_id: string
          versiculo_fin: number
          versiculo_inicio: number
        }
        Update: {
          capitulo?: number
          id?: string
          libro_id?: number
          principal?: boolean
          tema_id?: string
          versiculo_fin?: number
          versiculo_inicio?: number
        }
        Relationships: [
          {
            foreignKeyName: "referencia_biblica_libro_id_fkey"
            columns: ["libro_id"]
            isOneToOne: false
            referencedRelation: "libro_biblico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referencia_biblica_tema_id_fkey"
            columns: ["tema_id"]
            isOneToOne: false
            referencedRelation: "tema"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referencia_biblica_tema_id_fkey"
            columns: ["tema_id"]
            isOneToOne: false
            referencedRelation: "v_temas_publicos"
            referencedColumns: ["id"]
          },
        ]
      }
      registro_auditoria: {
        Row: {
          accion: string
          actor_usuario_id: string | null
          agente_usuario: string | null
          creado_en: string
          datos_antes: Json | null
          datos_despues: Json | null
          direccion_ip: unknown
          entidad_id: string | null
          id: string
          tipo_entidad: string
        }
        Insert: {
          accion: string
          actor_usuario_id?: string | null
          agente_usuario?: string | null
          creado_en?: string
          datos_antes?: Json | null
          datos_despues?: Json | null
          direccion_ip?: unknown
          entidad_id?: string | null
          id?: string
          tipo_entidad: string
        }
        Update: {
          accion?: string
          actor_usuario_id?: string | null
          agente_usuario?: string | null
          creado_en?: string
          datos_antes?: Json | null
          datos_despues?: Json | null
          direccion_ip?: unknown
          entidad_id?: string | null
          id?: string
          tipo_entidad?: string
        }
        Relationships: [
          {
            foreignKeyName: "registro_auditoria_actor_usuario_id_fkey"
            columns: ["actor_usuario_id"]
            isOneToOne: false
            referencedRelation: "usuario_app"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registro_auditoria_actor_usuario_id_fkey"
            columns: ["actor_usuario_id"]
            isOneToOne: false
            referencedRelation: "v_nivel_usuario"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "registro_auditoria_actor_usuario_id_fkey"
            columns: ["actor_usuario_id"]
            isOneToOne: false
            referencedRelation: "v_xp_usuario"
            referencedColumns: ["usuario_id"]
          },
        ]
      }
      regla_nivel: {
        Row: {
          color_insignia: string | null
          id: string
          nombre: string
          numero_nivel: number
          xp_minima: number
        }
        Insert: {
          color_insignia?: string | null
          id?: string
          nombre: string
          numero_nivel: number
          xp_minima: number
        }
        Update: {
          color_insignia?: string | null
          id?: string
          nombre?: string
          numero_nivel?: number
          xp_minima?: number
        }
        Relationships: []
      }
      reto_club: {
        Row: {
          club_id: string | null
          codigo_metrica: string
          creado_en: string
          creado_por: string | null
          descripcion: string | null
          fecha_fin: string
          fecha_inicio: string
          id: string
          nombre: string
          valor_objetivo: number
          xp_reto: number
        }
        Insert: {
          club_id?: string | null
          codigo_metrica: string
          creado_en?: string
          creado_por?: string | null
          descripcion?: string | null
          fecha_fin: string
          fecha_inicio: string
          id?: string
          nombre: string
          valor_objetivo: number
          xp_reto?: number
        }
        Update: {
          club_id?: string | null
          codigo_metrica?: string
          creado_en?: string
          creado_por?: string | null
          descripcion?: string | null
          fecha_fin?: string
          fecha_inicio?: string
          id?: string
          nombre?: string
          valor_objetivo?: number
          xp_reto?: number
        }
        Relationships: [
          {
            foreignKeyName: "reto_club_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "club"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reto_club_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "usuario_app"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reto_club_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "v_nivel_usuario"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "reto_club_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "v_xp_usuario"
            referencedColumns: ["usuario_id"]
          },
        ]
      }
      revision_contenido: {
        Row: {
          creado_en: string
          enviado_por: string | null
          estado: Database["public"]["Enums"]["estado_revision_contenido"]
          id: string
          notas: string | null
          notas_envio: string | null
          notas_revision: string | null
          revisado_en: string | null
          revisado_por: string | null
          tema_id: string
        }
        Insert: {
          creado_en?: string
          enviado_por?: string | null
          estado?: Database["public"]["Enums"]["estado_revision_contenido"]
          id?: string
          notas?: string | null
          notas_envio?: string | null
          notas_revision?: string | null
          revisado_en?: string | null
          revisado_por?: string | null
          tema_id: string
        }
        Update: {
          creado_en?: string
          enviado_por?: string | null
          estado?: Database["public"]["Enums"]["estado_revision_contenido"]
          id?: string
          notas?: string | null
          notas_envio?: string | null
          notas_revision?: string | null
          revisado_en?: string | null
          revisado_por?: string | null
          tema_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revision_contenido_enviado_por_fkey"
            columns: ["enviado_por"]
            isOneToOne: false
            referencedRelation: "usuario_app"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revision_contenido_enviado_por_fkey"
            columns: ["enviado_por"]
            isOneToOne: false
            referencedRelation: "v_nivel_usuario"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "revision_contenido_enviado_por_fkey"
            columns: ["enviado_por"]
            isOneToOne: false
            referencedRelation: "v_xp_usuario"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "revision_contenido_revisado_por_fkey"
            columns: ["revisado_por"]
            isOneToOne: false
            referencedRelation: "usuario_app"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revision_contenido_revisado_por_fkey"
            columns: ["revisado_por"]
            isOneToOne: false
            referencedRelation: "v_nivel_usuario"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "revision_contenido_revisado_por_fkey"
            columns: ["revisado_por"]
            isOneToOne: false
            referencedRelation: "v_xp_usuario"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "revision_contenido_tema_id_fkey"
            columns: ["tema_id"]
            isOneToOne: false
            referencedRelation: "tema"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revision_contenido_tema_id_fkey"
            columns: ["tema_id"]
            isOneToOne: false
            referencedRelation: "v_temas_publicos"
            referencedColumns: ["id"]
          },
        ]
      }
      senda: {
        Row: {
          activo: boolean
          codigo: string
          color_hex: string
          creado_en: string
          descripcion: string | null
          id: string
          imagen_recurso_id: string | null
          nombre: string
          nombre_icono: string | null
          orden: number
        }
        Insert: {
          activo?: boolean
          codigo: string
          color_hex: string
          creado_en?: string
          descripcion?: string | null
          id?: string
          imagen_recurso_id?: string | null
          nombre: string
          nombre_icono?: string | null
          orden: number
        }
        Update: {
          activo?: boolean
          codigo?: string
          color_hex?: string
          creado_en?: string
          descripcion?: string | null
          id?: string
          imagen_recurso_id?: string | null
          nombre?: string
          nombre_icono?: string | null
          orden?: number
        }
        Relationships: [
          {
            foreignKeyName: "senda_imagen_recurso_id_fkey"
            columns: ["imagen_recurso_id"]
            isOneToOne: false
            referencedRelation: "recurso_multimedia"
            referencedColumns: ["id"]
          },
        ]
      }
      tarjeta_compartida: {
        Row: {
          creado_en: string
          id: string
          logro_id: string | null
          tema_id: string | null
          url_imagen: string
          usuario_id: string
        }
        Insert: {
          creado_en?: string
          id?: string
          logro_id?: string | null
          tema_id?: string | null
          url_imagen: string
          usuario_id: string
        }
        Update: {
          creado_en?: string
          id?: string
          logro_id?: string | null
          tema_id?: string | null
          url_imagen?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarjeta_compartida_logro_id_fkey"
            columns: ["logro_id"]
            isOneToOne: false
            referencedRelation: "logro"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarjeta_compartida_tema_id_fkey"
            columns: ["tema_id"]
            isOneToOne: false
            referencedRelation: "tema"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarjeta_compartida_tema_id_fkey"
            columns: ["tema_id"]
            isOneToOne: false
            referencedRelation: "v_temas_publicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarjeta_compartida_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuario_app"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarjeta_compartida_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "v_nivel_usuario"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "tarjeta_compartida_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "v_xp_usuario"
            referencedColumns: ["usuario_id"]
          },
        ]
      }
      tema: {
        Row: {
          actualizado_en: string
          creado_en: string
          creado_por: string | null
          estado: Database["public"]["Enums"]["estado_publicacion"]
          id: string
          minutos_estimados: number
          objetivo: string
          portada_recurso_id: string | null
          publicado_en: string | null
          publicado_por: string | null
          resumen: string | null
          revisado_en: string | null
          revisado_por: string | null
          senda_id: string
          slug: string
          titulo: string
          version_biblica_id: string | null
          version_contenido: number
          xp_recompensa: number
        }
        Insert: {
          actualizado_en?: string
          creado_en?: string
          creado_por?: string | null
          estado?: Database["public"]["Enums"]["estado_publicacion"]
          id?: string
          minutos_estimados?: number
          objetivo: string
          portada_recurso_id?: string | null
          publicado_en?: string | null
          publicado_por?: string | null
          resumen?: string | null
          revisado_en?: string | null
          revisado_por?: string | null
          senda_id: string
          slug: string
          titulo: string
          version_biblica_id?: string | null
          version_contenido?: number
          xp_recompensa?: number
        }
        Update: {
          actualizado_en?: string
          creado_en?: string
          creado_por?: string | null
          estado?: Database["public"]["Enums"]["estado_publicacion"]
          id?: string
          minutos_estimados?: number
          objetivo?: string
          portada_recurso_id?: string | null
          publicado_en?: string | null
          publicado_por?: string | null
          resumen?: string | null
          revisado_en?: string | null
          revisado_por?: string | null
          senda_id?: string
          slug?: string
          titulo?: string
          version_biblica_id?: string | null
          version_contenido?: number
          xp_recompensa?: number
        }
        Relationships: [
          {
            foreignKeyName: "tema_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "usuario_app"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tema_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "v_nivel_usuario"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "tema_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "v_xp_usuario"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "tema_portada_recurso_id_fkey"
            columns: ["portada_recurso_id"]
            isOneToOne: false
            referencedRelation: "recurso_multimedia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tema_publicado_por_fkey"
            columns: ["publicado_por"]
            isOneToOne: false
            referencedRelation: "usuario_app"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tema_publicado_por_fkey"
            columns: ["publicado_por"]
            isOneToOne: false
            referencedRelation: "v_nivel_usuario"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "tema_publicado_por_fkey"
            columns: ["publicado_por"]
            isOneToOne: false
            referencedRelation: "v_xp_usuario"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "tema_revisado_por_fkey"
            columns: ["revisado_por"]
            isOneToOne: false
            referencedRelation: "usuario_app"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tema_revisado_por_fkey"
            columns: ["revisado_por"]
            isOneToOne: false
            referencedRelation: "v_nivel_usuario"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "tema_revisado_por_fkey"
            columns: ["revisado_por"]
            isOneToOne: false
            referencedRelation: "v_xp_usuario"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "tema_senda_id_fkey"
            columns: ["senda_id"]
            isOneToOne: false
            referencedRelation: "senda"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tema_version_biblica_id_fkey"
            columns: ["version_biblica_id"]
            isOneToOne: false
            referencedRelation: "version_biblica"
            referencedColumns: ["id"]
          },
        ]
      }
      tema_grupo_edad: {
        Row: {
          grupo_edad_id: string
          tema_id: string
        }
        Insert: {
          grupo_edad_id: string
          tema_id: string
        }
        Update: {
          grupo_edad_id?: string
          tema_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tema_grupo_edad_grupo_edad_id_fkey"
            columns: ["grupo_edad_id"]
            isOneToOne: false
            referencedRelation: "grupo_edad"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tema_grupo_edad_tema_id_fkey"
            columns: ["tema_id"]
            isOneToOne: false
            referencedRelation: "tema"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tema_grupo_edad_tema_id_fkey"
            columns: ["tema_id"]
            isOneToOne: false
            referencedRelation: "v_temas_publicos"
            referencedColumns: ["id"]
          },
        ]
      }
      testamento_biblico: {
        Row: {
          codigo: string
          id: number
          nombre: string
        }
        Insert: {
          codigo: string
          id?: never
          nombre: string
        }
        Update: {
          codigo?: string
          id?: never
          nombre?: string
        }
        Relationships: []
      }
      tipo_actividad: {
        Row: {
          activo: boolean
          codigo: string
          creado_en: string
          descripcion: string | null
          es_juego: boolean
          id: string
          nombre: string
        }
        Insert: {
          activo?: boolean
          codigo: string
          creado_en?: string
          descripcion?: string | null
          es_juego?: boolean
          id?: string
          nombre: string
        }
        Update: {
          activo?: boolean
          codigo?: string
          creado_en?: string
          descripcion?: string | null
          es_juego?: boolean
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      tipo_paso_crecer: {
        Row: {
          codigo: string
          color_hex: string | null
          descripcion: string | null
          id: string
          nombre: string
          orden: number
        }
        Insert: {
          codigo: string
          color_hex?: string | null
          descripcion?: string | null
          id?: string
          nombre: string
          orden: number
        }
        Update: {
          codigo?: string
          color_hex?: string | null
          descripcion?: string | null
          id?: string
          nombre?: string
          orden?: number
        }
        Relationships: []
      }
      usuario_app: {
        Row: {
          activo: boolean
          actualizado_en: string
          correo: string | null
          creado_en: string
          id: string
          id_externo: string | null
          nombre_visible: string
          proveedor: Database["public"]["Enums"]["proveedor_autenticacion"]
          rol: Database["public"]["Enums"]["rol_usuario"]
          token_invitado_hash: string | null
          ultimo_login_en: string | null
        }
        Insert: {
          activo?: boolean
          actualizado_en?: string
          correo?: string | null
          creado_en?: string
          id?: string
          id_externo?: string | null
          nombre_visible: string
          proveedor: Database["public"]["Enums"]["proveedor_autenticacion"]
          rol?: Database["public"]["Enums"]["rol_usuario"]
          token_invitado_hash?: string | null
          ultimo_login_en?: string | null
        }
        Update: {
          activo?: boolean
          actualizado_en?: string
          correo?: string | null
          creado_en?: string
          id?: string
          id_externo?: string | null
          nombre_visible?: string
          proveedor?: Database["public"]["Enums"]["proveedor_autenticacion"]
          rol?: Database["public"]["Enums"]["rol_usuario"]
          token_invitado_hash?: string | null
          ultimo_login_en?: string | null
        }
        Relationships: []
      }
      versiculo_clave: {
        Row: {
          capitulo: number
          id: string
          libro_id: number
          tema_id: string
          texto: string
          versiculo: number
        }
        Insert: {
          capitulo: number
          id?: string
          libro_id: number
          tema_id: string
          texto: string
          versiculo: number
        }
        Update: {
          capitulo?: number
          id?: string
          libro_id?: number
          tema_id?: string
          texto?: string
          versiculo?: number
        }
        Relationships: [
          {
            foreignKeyName: "versiculo_clave_libro_id_fkey"
            columns: ["libro_id"]
            isOneToOne: false
            referencedRelation: "libro_biblico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "versiculo_clave_tema_id_fkey"
            columns: ["tema_id"]
            isOneToOne: true
            referencedRelation: "tema"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "versiculo_clave_tema_id_fkey"
            columns: ["tema_id"]
            isOneToOne: true
            referencedRelation: "v_temas_publicos"
            referencedColumns: ["id"]
          },
        ]
      }
      version_biblica: {
        Row: {
          codigo: string
          creado_en: string
          dominio_publico: boolean
          id: string
          nombre: string
        }
        Insert: {
          codigo: string
          creado_en?: string
          dominio_publico?: boolean
          id?: string
          nombre: string
        }
        Update: {
          codigo?: string
          creado_en?: string
          dominio_publico?: boolean
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      vinculo_tutor_menor: {
        Row: {
          aceptado_en: string | null
          codigo_invitacion: string | null
          creado_en: string
          estado: string
          id: string
          menor_id: string
          relacion: string
          tutor_id: string
        }
        Insert: {
          aceptado_en?: string | null
          codigo_invitacion?: string | null
          creado_en?: string
          estado?: string
          id?: string
          menor_id: string
          relacion?: string
          tutor_id: string
        }
        Update: {
          aceptado_en?: string | null
          codigo_invitacion?: string | null
          creado_en?: string
          estado?: string
          id?: string
          menor_id?: string
          relacion?: string
          tutor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vinculo_tutor_menor_menor_id_fkey"
            columns: ["menor_id"]
            isOneToOne: false
            referencedRelation: "usuario_app"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vinculo_tutor_menor_menor_id_fkey"
            columns: ["menor_id"]
            isOneToOne: false
            referencedRelation: "v_nivel_usuario"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "vinculo_tutor_menor_menor_id_fkey"
            columns: ["menor_id"]
            isOneToOne: false
            referencedRelation: "v_xp_usuario"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "vinculo_tutor_menor_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "usuario_app"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vinculo_tutor_menor_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "v_nivel_usuario"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "vinculo_tutor_menor_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "v_xp_usuario"
            referencedColumns: ["usuario_id"]
          },
        ]
      }
    }
    Views: {
      v_admin_revisiones: {
        Row: {
          creado_en: string | null
          enviado_por: string | null
          estado:
            | Database["public"]["Enums"]["estado_revision_contenido"]
            | null
          id: string | null
          notas_envio: string | null
          notas_revision: string | null
          revisado_en: string | null
          revisado_por: string | null
          senda: string | null
          tema_id: string | null
          titulo: string | null
        }
        Relationships: [
          {
            foreignKeyName: "revision_contenido_tema_id_fkey"
            columns: ["tema_id"]
            isOneToOne: false
            referencedRelation: "tema"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revision_contenido_tema_id_fkey"
            columns: ["tema_id"]
            isOneToOne: false
            referencedRelation: "v_temas_publicos"
            referencedColumns: ["id"]
          },
        ]
      }
      v_nivel_usuario: {
        Row: {
          nombre_nivel: string | null
          numero_nivel: number | null
          usuario_id: string | null
          xp_total: number | null
        }
        Relationships: []
      }
      v_ranking_club: {
        Row: {
          apodo: string | null
          club_id: string | null
          numero_ranking: number | null
          usuario_id: string | null
          xp_total: number | null
        }
        Relationships: [
          {
            foreignKeyName: "miembro_club_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "club"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "miembro_club_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuario_app"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "miembro_club_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "v_nivel_usuario"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "miembro_club_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "v_xp_usuario"
            referencedColumns: ["usuario_id"]
          },
        ]
      }
      v_temas_publicos: {
        Row: {
          estado: Database["public"]["Enums"]["estado_publicacion"] | null
          id: string | null
          minutos_estimados: number | null
          objetivo: string | null
          portada_recurso_id: string | null
          publicado_en: string | null
          resumen: string | null
          senda_codigo: string | null
          senda_color_hex: string | null
          senda_id: string | null
          senda_nombre: string | null
          slug: string | null
          titulo: string | null
          version_contenido: number | null
          xp_recompensa: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tema_portada_recurso_id_fkey"
            columns: ["portada_recurso_id"]
            isOneToOne: false
            referencedRelation: "recurso_multimedia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tema_senda_id_fkey"
            columns: ["senda_id"]
            isOneToOne: false
            referencedRelation: "senda"
            referencedColumns: ["id"]
          },
        ]
      }
      v_xp_usuario: {
        Row: {
          usuario_id: string | null
          xp_total: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      publicar_tema_con_auditoria: {
        Args: {
          p_tema_id: string
          p_actor_id: string
          p_version_esperada: number
        }
        Returns: Database["public"]["Tables"]["tema"]["Row"][]
      }
    }
    Enums: {
      estado_publicacion:
        | "borrador"
        | "revision"
        | "aprobado"
        | "publicado"
        | "archivado"
      estado_revision_contenido:
        | "borrador"
        | "enviado"
        | "cambios_solicitados"
        | "aprobado"
        | "publicado"
        | "rechazado"
      proveedor_autenticacion: "google" | "facebook" | "invitado" | "correo"
      rol_usuario: "administrador" | "usuario" | "invitado" | "padre"
      tipo_evento_progreso:
        | "tema_iniciado"
        | "tema_completado"
        | "bloque_iniciado"
        | "bloque_completado"
        | "actividad_iniciada"
        | "actividad_respondida"
        | "actividad_completada"
        | "recompensa_reclamada"
        | "tema_descargado"
        | "marcador_sincronizacion"
      tipo_recurso_multimedia:
        | "imagen"
        | "audio"
        | "video"
        | "documento"
        | "icono"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      estado_publicacion: [
        "borrador",
        "revision",
        "aprobado",
        "publicado",
        "archivado",
      ],
      estado_revision_contenido: [
        "borrador",
        "enviado",
        "cambios_solicitados",
        "aprobado",
        "publicado",
        "rechazado",
      ],
      proveedor_autenticacion: ["google", "facebook", "invitado", "correo"],
      rol_usuario: ["administrador", "usuario", "invitado", "padre"],
      tipo_evento_progreso: [
        "tema_iniciado",
        "tema_completado",
        "bloque_iniciado",
        "bloque_completado",
        "actividad_iniciada",
        "actividad_respondida",
        "actividad_completada",
        "recompensa_reclamada",
        "tema_descargado",
        "marcador_sincronizacion",
      ],
      tipo_recurso_multimedia: [
        "imagen",
        "audio",
        "video",
        "documento",
        "icono",
      ],
    },
  },
} as const
