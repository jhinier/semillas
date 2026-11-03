import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, LoaderCircle, Lock, Save, UserRound } from "lucide-react";
import { toast } from "sonner";
import type { GrupoEdad, Perfil } from "@/shared/api/api";
import { MAPA_AVATARES } from "@/shared/constants/avatares";
import {
  estaActivoControlParental,
  obtenerPinParental,
} from "@/shared/accessibility/preferences";
import type { ActualizarPerfilDatos } from "../profile.api";

interface ProfileEditFormProps {
  perfil: Perfil;
  gruposEdad: GrupoEdad[];
  avatarClave: string;
  isSaving: boolean;
  onSave: (data: ActualizarPerfilDatos) => void;
  onCancel: () => void;
}

const GRUPOS_EDAD_FALLBACK: GrupoEdad[] = [
  {
    id: "10000000-0000-0000-0000-000000000001",
    codigo: "semillas",
    nombre: "Semillas",
    edad_minima: 6,
    edad_maxima: 8,
    descripcion: "Niños pequeños con apoyo visual y audio.",
    orden: 1,
  },
  {
    id: "10000000-0000-0000-0000-000000000002",
    codigo: "exploradores",
    nombre: "Exploradores",
    edad_minima: 9,
    edad_maxima: 11,
    descripcion: "Niños lectores con retos interactivos.",
    orden: 2,
  },
  {
    id: "10000000-0000-0000-0000-000000000003",
    codigo: "embajadores",
    nombre: "Embajadores",
    edad_minima: 12,
    edad_maxima: 14,
    descripcion: "Preadolescentes con reflexión aplicada.",
    orden: 3,
  },
];

export function ProfileEditForm({
  perfil,
  gruposEdad,
  avatarClave,
  isSaving,
  onSave,
  onCancel,
}: ProfileEditFormProps) {
  const listaGrupos = gruposEdad.length > 0 ? gruposEdad : GRUPOS_EDAD_FALLBACK;
  const [apodo, setApodo] = useState(perfil.apodo ?? "");
  const [avatar, setAvatar] = useState(avatarClave || "1");
  const [grupoEdadId, setGrupoEdadId] = useState(
    perfil.grupo_edad_id || listaGrupos[0]?.id || "",
  );
  const [submitted, setSubmitted] = useState(false);
  const [pinIngresado, setPinIngresado] = useState("");
  const controlParentalActivo = estaActivoControlParental();

  useEffect(() => {
    setApodo(perfil.apodo ?? "");
    setAvatar(avatarClave || "1");
    setGrupoEdadId(perfil.grupo_edad_id || listaGrupos[0]?.id || "");
  }, [avatarClave, perfil.apodo, perfil.grupo_edad_id, listaGrupos]);

  const apodoLimpio = apodo.trim();
  const apodoValido = apodoLimpio.length >= 2 && apodoLimpio.length <= 20;
  const formValido = apodoValido && Boolean(avatar) && Boolean(grupoEdadId);
  const hasChanges = useMemo(
    () =>
      apodoLimpio !== (perfil.apodo ?? "").trim() ||
      avatar !== avatarClave ||
      grupoEdadId !== (perfil.grupo_edad_id ?? ""),
    [apodoLimpio, avatar, avatarClave, grupoEdadId, perfil.apodo, perfil.grupo_edad_id],
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (!formValido) return;

    if (controlParentalActivo) {
      const pinCorrecto = obtenerPinParental();
      if (pinIngresado.trim() !== pinCorrecto) {
        toast.error(
          `Control parental activo: ingresa la clave de adulto correcta (por defecto ${pinCorrecto}) para guardar cambios.`,
        );
        return;
      }
    }

    onSave({
      apodo: apodoLimpio,
      clave_avatar: avatar,
      url_avatar: /^https?:\/\//i.test(avatar) ? avatar : null,
      grupo_edad_id: grupoEdadId,
    });
  }

  return (
    <form className="profile-form-card" onSubmit={handleSubmit}>
      <div className="profile-form-card__heading">
        <div>
          <p className="profile-eyebrow">Personalización</p>
          <h1>Edita tu perfil</h1>
          <p>Actualiza cómo quieres que te llamemos, tu avatar y la franja de contenido.</p>
        </div>
        <span className="profile-form-card__heading-icon" aria-hidden="true">
          <UserRound size={25} />
        </span>
      </div>

      <div className="profile-form-section">
        <label className="profile-field-label" htmlFor="profile-nickname">
          ¿Cómo quieres que te llamemos?
        </label>
        <div className={`profile-input-shell ${submitted && !apodoValido ? "is-error" : ""}`}>
          <input
            id="profile-nickname"
            type="text"
            value={apodo}
            onChange={(event) => setApodo(event.target.value.slice(0, 20))}
            autoComplete="nickname"
            placeholder="Tu apodo"
            aria-describedby="profile-nickname-help"
          />
          <span>{apodo.length}/20</span>
        </div>
        <p id="profile-nickname-help" className="profile-field-help">
          Usa entre 2 y 20 caracteres. Evita escribir nombres completos de menores.
        </p>
        {submitted && !apodoValido ? (
          <p className="profile-field-error">Escribe un apodo de al menos 2 caracteres.</p>
        ) : null}
      </div>

      <fieldset className="profile-form-section">
        <legend className="profile-field-label">Elige tu avatar</legend>
        <div className="profile-avatar-grid">
          {Object.entries(MAPA_AVATARES).map(([key, url]) => {
            const selected = avatar === key;
            return (
              <label key={key} className={`profile-avatar-option ${selected ? "is-selected" : ""}`}>
                <input
                  type="radio"
                  name="profile-avatar"
                  value={key}
                  checked={selected}
                  onChange={() => setAvatar(key)}
                />
                <img src={url} alt="" draggable="false" loading={Number(key) > 5 ? "lazy" : "eager"} />
                {selected ? (
                  <span className="profile-avatar-option__check" aria-hidden="true">
                    <Check size={16} strokeWidth={3} />
                  </span>
                ) : null}
                <span className="sr-only">Avatar {key}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="profile-form-section">
        <legend className="profile-field-label">Franja de edad</legend>
        <p className="profile-field-help">
          Esto adapta el lenguaje, las actividades y el contenido que se muestra en los temas.
        </p>
        <div className="profile-age-grid">
          {listaGrupos.map((grupo) => {
            const selected = grupoEdadId === grupo.id;
            return (
              <label key={grupo.id} className={`profile-age-option ${selected ? "is-selected" : ""}`}>
                <input
                  type="radio"
                  name="profile-age-group"
                  value={grupo.id}
                  checked={selected}
                  onChange={() => setGrupoEdadId(grupo.id)}
                />
                <span className="profile-age-option__check" aria-hidden="true">
                  {selected ? <Check size={15} strokeWidth={3} /> : null}
                </span>
                <strong>{grupo.nombre}</strong>
                <span>
                  {grupo.edad_minima}–{grupo.edad_maxima} años
                </span>
                {grupo.descripcion ? <small>{grupo.descripcion}</small> : null}
              </label>
            );
          })}
        </div>
        {submitted && !grupoEdadId ? (
          <p className="profile-field-error">Selecciona una franja de edad.</p>
        ) : null}
      </fieldset>

      {controlParentalActivo ? (
        <div className="profile-form-section rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
          <label className="profile-field-label flex items-center gap-2 text-amber-900" htmlFor="profile-parental-pin">
            <Lock size={16} />
            Clave de Control Parental
          </label>
          <p className="profile-field-help text-amber-800 mb-2">
            Los controles parentales están activos en Preferencias. Ingresa el PIN de adulto para autorizar cambios en el perfil.
          </p>
          <div className="profile-input-shell bg-white">
            <input
              id="profile-parental-pin"
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pinIngresado}
              onChange={(e) => setPinIngresado(e.target.value)}
              placeholder="Ingresa el PIN (ej. 1234)"
            />
          </div>
        </div>
      ) : null}

      <div className="profile-form-actions">
        <button type="button" className="profile-secondary-button" onClick={onCancel} disabled={isSaving}>
          <ArrowLeft size={18} aria-hidden="true" />
          Volver
        </button>
        <button
          type="submit"
          className="profile-primary-button"
          disabled={!formValido || isSaving}
        >
          {isSaving ? <LoaderCircle className="animate-spin" size={18} /> : <Save size={18} />}
          {isSaving ? "Guardando..." : hasChanges ? "Guardar cambios" : "Confirmar perfil"}
        </button>
      </div>
    </form>
  );
}
