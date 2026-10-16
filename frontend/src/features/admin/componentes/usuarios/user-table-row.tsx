import { ChevronRight, Mail, MoreHorizontal } from "lucide-react";

import type { UsuarioAdmin } from "../../admin.api";
import { avatarUsuario, etiquetaRol, etiquetaUltimoAcceso } from "../../hooks/use-admin-users";

type Props = {
  usuario: UsuarioAdmin;
  selected: boolean;
  onToggle: () => void;
  onView: () => void;
  onEdit: () => void;
};

function estadoLabel(estado: UsuarioAdmin["estado"]) {
  return {
    activo: "Activo",
    pendiente: "Pendiente",
    bloqueado: "Bloqueado",
  }[estado];
}

export type UserTableRow = UsuarioAdmin;

export function FilaUsuario({ usuario, selected, onToggle, onView, onEdit }: Props) {
  const clubes = usuario.clubes.map((club) => club.nombre).join(", ");
  const franja = usuario.grupo_edad
    ? `${usuario.grupo_edad.nombre} · ${usuario.grupo_edad.edad_minima}–${usuario.grupo_edad.edad_maxima}`
    : "Sin franja";

  return (
    <tr className={selected ? "is-selected" : undefined}>
      <td className="admin-users-table__check">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          aria-label={`Seleccionar a ${usuario.nombre_visible}`}
        />
      </td>
      <td>
        <button type="button" className="admin-users-person" onClick={onView}>
          <img src={avatarUsuario(usuario)} alt="" />
          <span>
            <strong>{usuario.nombre_visible}</strong>
            <small>
              {usuario.correo ? (
                <>
                  <Mail size={12} />
                  {usuario.correo}
                </>
              ) : (
                "Cuenta sin correo"
              )}
            </small>
          </span>
        </button>
      </td>
      <td>
        <span className={`admin-users-role admin-users-role--${usuario.rol}`}>
          {etiquetaRol(usuario.rol)}
        </span>
      </td>
      <td>
        <span className="admin-users-cell-main">{franja}</span>
      </td>
      <td>
        <span className="admin-users-cell-main">{clubes || "Sin club"}</span>
        {usuario.vinculos_familiares > 0 ? (
          <small className="admin-users-cell-helper">
            {usuario.vinculos_familiares} vínculo{usuario.vinculos_familiares === 1 ? "" : "s"}
          </small>
        ) : null}
      </td>
      <td>
        <span className="admin-users-xp">{usuario.progreso.xp_total.toLocaleString("es-EC")} XP</span>
        <small className="admin-users-cell-helper">{usuario.progreso.eventos} eventos</small>
      </td>
      <td>
        <span className={`admin-users-status admin-users-status--${usuario.estado}`}>
          <i aria-hidden="true" />
          {estadoLabel(usuario.estado)}
        </span>
      </td>
      <td>
        <span className="admin-users-cell-main">{etiquetaUltimoAcceso(usuario.ultimo_login_en)}</span>
      </td>
      <td className="admin-users-table__actions">
        <button type="button" onClick={onEdit} aria-label={`Editar ${usuario.nombre_visible}`}>
          <MoreHorizontal size={18} />
        </button>
        <button type="button" onClick={onView} aria-label={`Ver detalle de ${usuario.nombre_visible}`}>
          <ChevronRight size={18} />
        </button>
      </td>
    </tr>
  );
}
