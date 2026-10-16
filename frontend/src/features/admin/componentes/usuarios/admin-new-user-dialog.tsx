import { useEffect, useState, type FormEvent } from "react";
import { Copy, MailPlus, UserRoundPlus, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  crearMenorAdmin,
  invitarUsuarioAdmin,
  type CatalogosUsuariosAdmin,
  type RolUsuarioAdmin,
} from "../../admin.api";

type Props = {
  open: boolean;
  mode: "invite" | "child";
  catalogos: CatalogosUsuariosAdmin;
  onClose: () => void;
};

export function AdminNewUserDialog({ open, mode, catalogos, onClose }: Props) {
  const queryClient = useQueryClient();
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [apodo, setApodo] = useState("");
  const [rol, setRol] = useState<Exclude<RolUsuarioAdmin, "invitado">>("usuario");
  const [grupoEdadId, setGrupoEdadId] = useState("");
  const [clubId, setClubId] = useState("");
  const [tutorId, setTutorId] = useState("");
  const [relacion, setRelacion] = useState("representante");
  const [credencial, setCredencial] = useState<{ usuario_id: string; token: string } | null>(null);

  useEffect(() => {
    if (!open) {
      setNombre("");
      setCorreo("");
      setApodo("");
      setRol("usuario");
      setGrupoEdadId("");
      setClubId("");
      setTutorId("");
      setRelacion("representante");
      setCredencial(null);
    }
  }, [open]);

  const inviteMutation = useMutation({
    mutationFn: () =>
      invitarUsuarioAdmin({
        nombre_visible: nombre.trim(),
        correo: correo.trim(),
        rol,
        apodo: apodo.trim() || undefined,
        grupo_edad_id: grupoEdadId || null,
        club_id: clubId || null,
        redirect_to: `${window.location.origin}/login`,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Invitación enviada");
      onClose();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "No se pudo enviar la invitación"),
  });

  const childMutation = useMutation({
    mutationFn: () =>
      crearMenorAdmin({
        nombre_visible: nombre.trim(),
        apodo: apodo.trim(),
        grupo_edad_id: grupoEdadId,
        tutor_id: tutorId || null,
        relacion,
        club_id: clubId || null,
      }),
    onSuccess: async (resultado) => {
      setCredencial(resultado.credencial_temporal);
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Perfil del menor creado");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "No se pudo crear el perfil"),
  });

  if (!open) return null;

  const esMenor = mode === "child";
  const enviando = inviteMutation.isPending || childMutation.isPending;
  const valido = esMenor
    ? nombre.trim().length >= 2 && apodo.trim().length >= 2 && Boolean(grupoEdadId)
    : nombre.trim().length >= 2 && correo.includes("@");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!valido || enviando) return;
    if (esMenor) childMutation.mutate();
    else inviteMutation.mutate();
  }

  async function copiarCredencial() {
    if (!credencial) return;
    await navigator.clipboard.writeText(
      `Usuario: ${credencial.usuario_id}\nToken: ${credencial.token}`
    );
    toast.success("Credencial copiada");
  }

  return (
    <div className="admin-users-dialog-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.currentTarget === event.target && !enviando) onClose();
    }}>
      <section className="admin-users-dialog" role="dialog" aria-modal="true" aria-labelledby="new-user-title">
        <header>
          <div className="admin-users-dialog__heading">
            <span>{esMenor ? <UserRoundPlus /> : <MailPlus />}</span>
            <div>
              <small>{esMenor ? "Cuenta sin correo" : "Invitación segura"}</small>
              <h2 id="new-user-title">{esMenor ? "Registrar menor" : "Invitar usuario"}</h2>
              <p>
                {esMenor
                  ? "Crea un perfil infantil y entrega su credencial una sola vez."
                  : "La persona recibirá un enlace para configurar su acceso."}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={enviando} aria-label="Cerrar">
            <X />
          </button>
        </header>

        {credencial ? (
          <div className="admin-users-credential">
            <strong>Guarda esta credencial ahora</strong>
            <p>El token no volverá a mostrarse. Entrégalo únicamente al tutor responsable.</p>
            <dl>
              <div><dt>ID de usuario</dt><dd>{credencial.usuario_id}</dd></div>
              <div><dt>Token temporal</dt><dd>{credencial.token}</dd></div>
            </dl>
            <button type="button" onClick={copiarCredencial}>
              <Copy size={16} /> Copiar credencial
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="admin-users-form-grid">
              <label className="is-wide">
                <span>Nombre visible</span>
                <input value={nombre} onChange={(event) => setNombre(event.target.value)} autoFocus />
              </label>

              {esMenor ? (
                <label>
                  <span>Apodo</span>
                  <input value={apodo} onChange={(event) => setApodo(event.target.value)} />
                </label>
              ) : (
                <label>
                  <span>Correo</span>
                  <input type="email" value={correo} onChange={(event) => setCorreo(event.target.value)} />
                </label>
              )}

              {!esMenor ? (
                <label>
                  <span>Rol</span>
                  <select value={rol} onChange={(event) => setRol(event.target.value as Exclude<RolUsuarioAdmin, "invitado">)}>
                    <option value="usuario">Estudiante</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </label>
              ) : null}

              <label>
                <span>Franja</span>
                <select value={grupoEdadId} onChange={(event) => setGrupoEdadId(event.target.value)} required={esMenor}>
                  <option value="">Sin franja</option>
                  {catalogos.grupos_edad.map((grupo) => (
                    <option key={grupo.id} value={grupo.id}>
                      {grupo.nombre} ({grupo.edad_minima}–{grupo.edad_maxima})
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Club</span>
                <select value={clubId} onChange={(event) => setClubId(event.target.value)}>
                  <option value="">Sin club</option>
                  {catalogos.clubes.map((club) => (
                    <option key={club.id} value={club.id}>{club.nombre}</option>
                  ))}
                </select>
              </label>

              {esMenor ? (
                <>
                  <label>
                    <span>Tutor responsable</span>
                    <select value={tutorId} onChange={(event) => setTutorId(event.target.value)}>
                      <option value="">Vincular después</option>
                      {catalogos.tutores.map((tutor) => (
                        <option key={tutor.id} value={tutor.id}>
                          {tutor.nombre_visible}{tutor.correo ? ` · ${tutor.correo}` : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Relación</span>
                    <select value={relacion} onChange={(event) => setRelacion(event.target.value)}>
                      <option value="representante">Representante</option>
                      <option value="madre">Madre</option>
                      <option value="padre">Padre</option>
                      <option value="tutor">Tutor</option>
                    </select>
                  </label>
                </>
              ) : (
                <label>
                  <span>Apodo opcional</span>
                  <input value={apodo} onChange={(event) => setApodo(event.target.value)} />
                </label>
              )}
            </div>

            <footer>
              <button type="button" className="secondary" onClick={onClose} disabled={enviando}>Cancelar</button>
              <button type="submit" className="primary" disabled={!valido || enviando}>
                {enviando ? "Guardando…" : esMenor ? "Crear perfil" : "Enviar invitación"}
              </button>
            </footer>
          </form>
        )}

        {credencial ? (
          <footer className="admin-users-dialog__standalone-footer">
            <button type="button" className="primary" onClick={onClose}>Terminar</button>
          </footer>
        ) : null}
      </section>
    </div>
  );
}
