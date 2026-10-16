import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Ban,
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  KeyRound,
  Link2,
  Save,
  Shield,
  UserRound,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import {
  actualizarUsuarioAdmin,
  desactivarUsuarioAdmin,
  obtenerUsuarioAdmin,
  obtenerUsuariosAdmin,
  type ActualizarUsuarioAdminSolicitud,
  type RolUsuarioAdmin,
} from "@/features/admin/admin.api";
import {
  avatarUsuario,
  etiquetaRol,
  etiquetaUltimoAcceso,
} from "@/features/admin/hooks/use-admin-users";
import "./admin-users-studio.css";

export const Route = createFileRoute("/admin/usuarios/$userId")({
  component: AdminUserDetailPage,
});

type Tab = "resumen" | "perfil" | "vinculos" | "actividad";

function AdminUserDetailPage() {
  const { userId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("resumen");

  const userQuery = useQuery({
    queryKey: ["admin", "users", userId],
    queryFn: () => obtenerUsuarioAdmin(userId),
  });
  const catalogsQuery = useQuery({
    queryKey: ["admin", "users", "catalogs"],
    queryFn: () => obtenerUsuariosAdmin({ limit: 1, offset: 0 }),
  });

  const usuario = userQuery.data;
  const catalogos = catalogsQuery.data?.catalogos;

  const [nombre, setNombre] = useState("");
  const [apodo, setApodo] = useState("");
  const [rol, setRol] = useState<RolUsuarioAdmin>("usuario");
  const [activo, setActivo] = useState(true);
  const [grupoEdadId, setGrupoEdadId] = useState("");
  const [clubIds, setClubIds] = useState<Set<string>>(new Set());
  const [prefiereAudio, setPrefiereAudio] = useState(false);
  const [tamanoTexto, setTamanoTexto] = useState<"pequeno" | "mediano" | "grande">("mediano");

  useEffect(() => {
    if (!usuario) return;
    setNombre(usuario.nombre_visible);
    setApodo(usuario.perfil?.apodo ?? "");
    setRol(usuario.rol);
    setActivo(usuario.activo);
    setGrupoEdadId(usuario.perfil?.grupo_edad_id ?? "");
    setClubIds(new Set(usuario.clubes.map((club) => club.id)));
    setPrefiereAudio(usuario.perfil?.prefiere_audio ?? false);
    setTamanoTexto(
      usuario.perfil?.tamano_texto_preferido === "pequeno" ||
        usuario.perfil?.tamano_texto_preferido === "grande"
        ? usuario.perfil.tamano_texto_preferido
        : "mediano"
    );
  }, [usuario]);

  const updateMutation = useMutation({
    mutationFn: (body: ActualizarUsuarioAdminSolicitud) =>
      actualizarUsuarioAdmin(userId, body),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "users", userId] }),
      ]);
      toast.success("Usuario actualizado");
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar"),
  });

  const deactivateMutation = useMutation({
    mutationFn: () => desactivarUsuarioAdmin(userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Acceso desactivado");
      navigate({ to: "/admin/usuarios" });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "No se pudo desactivar"),
  });

  const cambios = useMemo(() => {
    if (!usuario) return false;
    return (
      nombre.trim() !== usuario.nombre_visible ||
      apodo.trim() !== (usuario.perfil?.apodo ?? "") ||
      rol !== usuario.rol ||
      activo !== usuario.activo ||
      grupoEdadId !== (usuario.perfil?.grupo_edad_id ?? "") ||
      prefiereAudio !== (usuario.perfil?.prefiere_audio ?? false) ||
      tamanoTexto !== (usuario.perfil?.tamano_texto_preferido ?? "mediano") ||
      [...clubIds].sort().join(",") !== usuario.clubes.map((club) => club.id).sort().join(",")
    );
  }, [usuario, nombre, apodo, rol, activo, grupoEdadId, prefiereAudio, tamanoTexto, clubIds]);

  if (userQuery.isLoading) {
    return <div className="admin-user-detail-loading">Cargando usuario…</div>;
  }

  if (userQuery.isError || !usuario) {
    return (
      <div className="admin-user-detail-error">
        <strong>No se pudo abrir el usuario</strong>
        <p>{(userQuery.error as Error)?.message ?? "El usuario no existe o no tienes permisos."}</p>
        <button type="button" onClick={() => navigate({ to: "/admin/usuarios" })}>
          Volver al directorio
        </button>
      </div>
    );
  }

  function guardar() {
    updateMutation.mutate({
      nombre_visible: nombre.trim(),
      apodo: apodo.trim() || nombre.trim(),
      rol,
      activo,
      grupo_edad_id: grupoEdadId || null,
      club_ids: [...clubIds],
      prefiere_audio: prefiereAudio,
      tamano_texto_preferido: tamanoTexto,
    });
  }

  function toggleClub(clubId: string) {
    setClubIds((actuales) => {
      const siguientes = new Set(actuales);
      if (siguientes.has(clubId)) siguientes.delete(clubId);
      else siguientes.add(clubId);
      return siguientes;
    });
  }

  return (
    <div className="admin-user-detail-page">
      <header className="admin-user-detail-header">
        <button
          type="button"
          className="admin-user-back"
          onClick={() => navigate({ to: "/admin/usuarios" })}
        >
          <ArrowLeft size={18} /> Usuarios
        </button>

        <div className="admin-user-identity">
          <img src={avatarUsuario(usuario)} alt="" />
          <div>
            <span className={`admin-users-status admin-users-status--${usuario.estado}`}>
              <i /> {usuario.estado === "activo" ? "Activo" : usuario.estado === "pendiente" ? "Pendiente" : "Bloqueado"}
            </span>
            <h1>{usuario.nombre_visible}</h1>
            <p>{usuario.correo ?? "Cuenta sin correo"} · {etiquetaRol(usuario.rol)}</p>
          </div>
        </div>

        <div className="admin-user-detail-actions">
          <button
            type="button"
            className="secondary"
            onClick={() => {
              if (window.confirm("¿Desactivar el acceso de este usuario?")) {
                deactivateMutation.mutate();
              }
            }}
            disabled={deactivateMutation.isPending}
          >
            <Ban size={16} /> Desactivar
          </button>
          <button
            type="button"
            className="primary"
            onClick={guardar}
            disabled={!cambios || updateMutation.isPending}
          >
            <Save size={16} /> {updateMutation.isPending ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </header>

      <nav className="admin-user-tabs" aria-label="Secciones del usuario">
        {([
          ["resumen", "Resumen"],
          ["perfil", "Perfil y acceso"],
          ["vinculos", "Clubes y vínculos"],
          ["actividad", "Actividad y auditoría"],
        ] as Array<[Tab, string]>).map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={tab === value ? "is-active" : undefined}
            onClick={() => setTab(value)}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === "resumen" ? (
        <main className="admin-user-detail-grid">
          <section className="admin-user-panel admin-user-overview">
            <h2><UserRound size={18} /> Información de cuenta</h2>
            <dl className="admin-user-detail-list">
              <div><dt>Proveedor</dt><dd>{usuario.proveedor}</dd></div>
              <div><dt>Rol</dt><dd>{etiquetaRol(usuario.rol)}</dd></div>
              <div><dt>Franja</dt><dd>{usuario.grupo_edad?.nombre ?? "Sin asignar"}</dd></div>
              <div><dt>Clubes</dt><dd>{usuario.clubes.map((club) => club.nombre).join(", ") || "Sin club"}</dd></div>
              <div><dt>Último acceso</dt><dd>{etiquetaUltimoAcceso(usuario.ultimo_login_en)}</dd></div>
              <div><dt>Registrado</dt><dd>{new Date(usuario.creado_en).toLocaleDateString("es-EC")}</dd></div>
            </dl>
          </section>

          <section className="admin-user-stats-grid">
            <article><BookOpenCheck /><strong>{usuario.estadisticas.temas_completados}</strong><span>Temas completados</span><small>de {usuario.estadisticas.temas_total}</small></article>
            <article><CheckCircle2 /><strong>{usuario.estadisticas.actividades_completadas}</strong><span>Actividades completadas</span><small>{usuario.estadisticas.intentos} intentos</small></article>
            <article><KeyRound /><strong>{usuario.estadisticas.xp_total.toLocaleString("es-EC")}</strong><span>XP acumulada</span><small>{usuario.progreso.eventos} eventos</small></article>
            <article><Link2 /><strong>{usuario.vinculos.length}</strong><span>Vínculos familiares</span><small>{usuario.clubes.length} clubes</small></article>
          </section>
        </main>
      ) : null}

      {tab === "perfil" ? (
        <main className="admin-user-panel admin-user-form-panel">
          <header><h2><Shield size={18} /> Perfil y control de acceso</h2><p>Los cambios sensibles quedan registrados en auditoría.</p></header>
          <div className="admin-users-form-grid">
            <label><span>Nombre visible</span><input value={nombre} onChange={(event) => setNombre(event.target.value)} /></label>
            <label><span>Apodo</span><input value={apodo} onChange={(event) => setApodo(event.target.value)} /></label>
            <label><span>Rol</span><select value={rol} onChange={(event) => setRol(event.target.value as RolUsuarioAdmin)}><option value="usuario">Estudiante</option><option value="padre">Padre o tutor</option><option value="invitado">Invitado</option><option value="administrador">Administrador</option></select></label>
            <label><span>Franja</span><select value={grupoEdadId} onChange={(event) => setGrupoEdadId(event.target.value)}><option value="">Sin franja</option>{catalogos?.grupos_edad.map((grupo) => <option key={grupo.id} value={grupo.id}>{grupo.nombre} ({grupo.edad_minima}–{grupo.edad_maxima})</option>)}</select></label>
            <label><span>Tamaño de texto</span><select value={tamanoTexto} onChange={(event) => setTamanoTexto(event.target.value as typeof tamanoTexto)}><option value="pequeno">Pequeño</option><option value="mediano">Mediano</option><option value="grande">Grande</option></select></label>
            <label className="admin-user-switch"><input type="checkbox" checked={prefiereAudio} onChange={(event) => setPrefiereAudio(event.target.checked)} /><span>Prefiere contenido con audio</span></label>
            <label className="admin-user-switch"><input type="checkbox" checked={activo} onChange={(event) => setActivo(event.target.checked)} /><span>Permitir acceso a la plataforma</span></label>
          </div>
        </main>
      ) : null}

      {tab === "vinculos" ? (
        <main className="admin-user-detail-grid">
          <section className="admin-user-panel">
            <h2><Users size={18} /> Clubes</h2>
            <div className="admin-user-check-list">
              {catalogos?.clubes.map((club) => (
                <label key={club.id}>
                  <input type="checkbox" checked={clubIds.has(club.id)} onChange={() => toggleClub(club.id)} />
                  <span><strong>{club.nombre}</strong><small>{clubIds.has(club.id) ? "Miembro actual" : "No asignado"}</small></span>
                </label>
              ))}
              {!catalogos?.clubes.length ? <p>No hay clubes activos.</p> : null}
            </div>
          </section>
          <section className="admin-user-panel">
            <h2><Link2 size={18} /> Vínculos familiares</h2>
            <div className="admin-user-links">
              {usuario.vinculos.map((vinculo) => (
                <article key={vinculo.id}>
                  <div><strong>{vinculo.usuario.nombre_visible}</strong><small>{vinculo.usuario.correo ?? "Sin correo"}</small></div>
                  <span>{vinculo.tipo === "tutor" ? "Tutor" : "Menor"} · {vinculo.relacion}</span>
                </article>
              ))}
              {!usuario.vinculos.length ? <p>No existen vínculos familiares.</p> : null}
            </div>
          </section>
        </main>
      ) : null}

      {tab === "actividad" ? (
        <main className="admin-user-detail-grid">
          <section className="admin-user-panel">
            <h2><CalendarClock size={18} /> Actividad reciente</h2>
            <div className="admin-user-timeline">
              {usuario.actividad_reciente.map((evento) => (
                <article key={evento.id}>
                  <i />
                  <div><strong>{evento.tipo.replaceAll("_", " ")}</strong><span>{new Date(evento.ocurrido_en).toLocaleString("es-EC")}</span></div>
                  <small>{evento.xp_otorgada ? `+${evento.xp_otorgada} XP` : evento.correcta === false ? "Incorrecta" : "Registrada"}</small>
                </article>
              ))}
              {!usuario.actividad_reciente.length ? <p>Sin actividad registrada.</p> : null}
            </div>
          </section>
          <section className="admin-user-panel">
            <h2><Shield size={18} /> Auditoría administrativa</h2>
            <div className="admin-user-timeline">
              {usuario.auditoria.map((evento) => (
                <article key={evento.id}>
                  <i />
                  <div><strong>{evento.accion.replaceAll("_", " ")}</strong><span>{new Date(evento.creado_en).toLocaleString("es-EC")}</span></div>
                </article>
              ))}
              {!usuario.auditoria.length ? <p>Sin cambios administrativos registrados.</p> : null}
            </div>
          </section>
        </main>
      ) : null}
    </div>
  );
}
