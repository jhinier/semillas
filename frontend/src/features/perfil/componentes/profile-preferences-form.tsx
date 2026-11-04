import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Headphones,
  LoaderCircle,
  Save,
  Type,
  Bell,
  Wifi,
  Eye,
  ShieldAlert,
  UserMinus,
  KeyRound,
  SunMoon,
} from "lucide-react";
import type { Perfil, Usuario } from "@/shared/api/api";
import type { ActualizarPerfilDatos } from "../profile.api";
import { toast } from "sonner";
import {
  aplicarContraste,
  aplicarTamanoTexto,
  aplicarTemaVisual,
  guardarPreferenciaPerfil,
  leerPreferenciaPerfil,
  normalizarTamanoTexto,
  obtenerPinParental,
} from "@/shared/accessibility/preferences";

interface ProfilePreferencesFormProps {
  perfil: Perfil;
  usuario: Usuario | undefined;
  isSaving: boolean;
  onSave: (data: ActualizarPerfilDatos) => void;
  onCancel: () => void;
  onVincularGoogle: () => void;
  onVincularCorreo: () => void;
  onLogout: () => void;
}

const textSizes = [
  { value: "pequeno", label: "Pequeño", example: "Aa" },
  { value: "mediano", label: "Mediano", example: "Aa" },
  { value: "grande", label: "Grande", example: "Aa" },
] as const;

export function ProfilePreferencesForm({
  perfil,
  usuario,
  isSaving,
  onSave,
  onCancel,
  onVincularGoogle,
  onLogout,
}: ProfilePreferencesFormProps) {
  const scopeId = perfil.id || usuario?.id || "default";

  const [audio, setAudio] = useState(Boolean(perfil.prefiere_audio));
  const [textSize, setTextSize] = useState(normalizarTamanoTexto(perfil.tamano_texto_preferido));

  const [notificaciones, setNotificaciones] = useState(() => {
    return leerPreferenciaPerfil("semillas-pref-notificaciones", scopeId) !== "false";
  });
  const [wifiOnly, setWifiOnly] = useState(() => {
    return leerPreferenciaPerfil("semillas-pref-wifi-only", scopeId) === "true";
  });
  const [contraste, setContraste] = useState(() => {
    return leerPreferenciaPerfil("semillas-pref-contraste", scopeId) === "alto";
  });
  const [parental, setParental] = useState(() => {
    return leerPreferenciaPerfil("semillas-pref-parental", scopeId) === "true";
  });
  const [pinParental, setPinParental] = useState(() => obtenerPinParental(scopeId));
  const [tema, setTema] = useState<"sistema" | "claro" | "oscuro">(() => {
    return (leerPreferenciaPerfil("semillas-pref-tema", scopeId, "claro") || "claro") as "sistema" | "claro" | "oscuro";
  });
  const [savedSnapshot, setSavedSnapshot] = useState(0);

  useEffect(() => {
    setAudio(Boolean(perfil.prefiere_audio));
    setTextSize(normalizarTamanoTexto(perfil.tamano_texto_preferido));
  }, [perfil.prefiere_audio, perfil.tamano_texto_preferido]);

  const hasApiChanges = useMemo(
    () =>
      audio !== Boolean(perfil.prefiere_audio) ||
      textSize !== normalizarTamanoTexto(perfil.tamano_texto_preferido),
    [audio, perfil.prefiere_audio, perfil.tamano_texto_preferido, textSize],
  );

  const hasLocalChanges = useMemo(() => {
    void savedSnapshot;
    const prevNotif = leerPreferenciaPerfil("semillas-pref-notificaciones", scopeId) !== "false";
    const prevWifi = leerPreferenciaPerfil("semillas-pref-wifi-only", scopeId) === "true";
    const prevContraste = leerPreferenciaPerfil("semillas-pref-contraste", scopeId) === "alto";
    const prevParental = leerPreferenciaPerfil("semillas-pref-parental", scopeId) === "true";
    const prevPin = obtenerPinParental(scopeId);
    const prevTema = leerPreferenciaPerfil("semillas-pref-tema", scopeId, "claro") || "claro";

    return (
      notificaciones !== prevNotif ||
      wifiOnly !== prevWifi ||
      contraste !== prevContraste ||
      parental !== prevParental ||
      pinParental !== prevPin ||
      tema !== prevTema
    );
  }, [notificaciones, wifiOnly, contraste, parental, pinParental, tema, savedSnapshot, scopeId]);

  const hasChanges = hasApiChanges || hasLocalChanges;

  const handleToggleAudio = () => {
    const next = !audio;
    setAudio(next);
    guardarPreferenciaPerfil("semillas-prefiere-audio", String(next), scopeId);
  };

  const handleSelectTextSize = (size: "pequeno" | "mediano" | "grande") => {
    setTextSize(size);
    guardarPreferenciaPerfil("semillas-pref-text-size", size, scopeId);
    aplicarTamanoTexto(size);
  };

  const handleToggleNotificaciones = async () => {
    const next = !notificaciones;
    setNotificaciones(next);
    guardarPreferenciaPerfil("semillas-pref-notificaciones", String(next), scopeId);
    if (next && typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        try {
          const perm = await Notification.requestPermission();
          if (perm === "granted") {
            toast.success("Notificaciones del navegador activadas.");
          }
        } catch {
          // continuar
        }
      }
    }
  };

  const handleToggleWifiOnly = () => {
    const next = !wifiOnly;
    setWifiOnly(next);
    guardarPreferenciaPerfil("semillas-pref-wifi-only", String(next), scopeId);
  };

  const handleToggleContraste = () => {
    const next = !contraste;
    setContraste(next);
    guardarPreferenciaPerfil("semillas-pref-contraste", next ? "alto" : "normal", scopeId);
    aplicarContraste(next);
  };

  const handleToggleParental = () => {
    const next = !parental;
    setParental(next);
    guardarPreferenciaPerfil("semillas-pref-parental", String(next), scopeId);
    if (next && !leerPreferenciaPerfil("semillas-pref-parental-pin", scopeId)) {
      guardarPreferenciaPerfil("semillas-pref-parental-pin", pinParental || "1234", scopeId);
    }
  };

  const handleSelectTema = (nuevoTema: "sistema" | "claro" | "oscuro") => {
    setTema(nuevoTema);
    guardarPreferenciaPerfil("semillas-pref-tema", nuevoTema, scopeId);
    aplicarTemaVisual(nuevoTema);
  };

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    guardarPreferenciaPerfil("semillas-prefiere-audio", String(audio), scopeId);
    guardarPreferenciaPerfil("semillas-pref-notificaciones", String(notificaciones), scopeId);
    guardarPreferenciaPerfil("semillas-pref-wifi-only", String(wifiOnly), scopeId);
    guardarPreferenciaPerfil("semillas-pref-contraste", contraste ? "alto" : "normal", scopeId);
    guardarPreferenciaPerfil("semillas-pref-parental", String(parental), scopeId);
    guardarPreferenciaPerfil("semillas-pref-parental-pin", pinParental.trim() || "1234", scopeId);
    guardarPreferenciaPerfil("semillas-pref-tema", tema, scopeId);
    guardarPreferenciaPerfil("semillas-pref-text-size", textSize, scopeId);

    aplicarTamanoTexto(textSize);
    aplicarContraste(contraste);
    aplicarTemaVisual(tema);
    setSavedSnapshot((s) => s + 1);

    if (hasApiChanges) {
      onSave({ prefiere_audio: audio, tamano_texto_preferido: textSize });
    } else {
      toast.success("Preferencias guardadas y aplicadas correctamente.");
      onCancel();
    }
  }

  const handleDeleteAccount = () => {
    if (parental) {
      const pin = window.prompt("Control parental activo. Ingresa el PIN de adulto para continuar:");
      if (pin !== (pinParental.trim() || "1234")) {
        toast.error("PIN de control parental incorrecto.");
        return;
      }
    }

    const confirmText =
      usuario?.proveedor === "invitado"
        ? "¿Seguro que deseas eliminar tus datos locales? Perderás todo el progreso acumulado como invitado."
        : "¿Seguro que deseas desvincular tu cuenta? Esto eliminará tus datos locales del dispositivo y cerrará la sesión.";

    if (window.confirm(confirmText)) {
      onLogout();
      toast.success("Cuenta desvinculada y datos eliminados.");
    }
  };

  const esInvitado = usuario?.proveedor === "invitado";

  return (
    <form className="profile-form-card" onSubmit={handleSubmit}>
      <div className="profile-form-card__heading">
        <div>
          <p className="profile-eyebrow font-bold">Configuración</p>
          <h1 className="text-xl font-black text-green-950 dark:text-emerald-400">Ajustes del Usuario</h1>
          <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
            Personaliza el aprendizaje, el rendimiento de red y la accesibilidad de la plataforma.
          </p>
        </div>
      </div>

      {/* Sección 1: Aprendizaje (API) */}
      <fieldset className="flex flex-col gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <legend className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">
          Preferencias de Aprendizaje
        </legend>

        <div className="profile-setting-row">
          <span className="profile-setting-row__icon is-green" aria-hidden="true">
            <Headphones size={22} />
          </span>
          <div className="profile-setting-row__copy">
            <h2>Audio de apoyo</h2>
            <p>Permite narraciones en voz alta, sonidos y ayudas auditivas dentro de las actividades.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={audio}
            className={`profile-switch ${audio ? "is-on" : ""}`}
            onClick={handleToggleAudio}
          >
            <span aria-hidden="true" />
            <span className="sr-only">{audio ? "Desactivar audio" : "Activar audio"}</span>
          </button>
        </div>

        <div className="profile-text-setting">
          <div className="profile-text-setting__heading">
            <span className="profile-setting-row__icon is-purple" aria-hidden="true">
              <Type size={22} />
            </span>
            <div>
              <h2>Tamaño del texto</h2>
              <p>Ajusta el tamaño de la letra para facilitar la lectura en toda la plataforma.</p>
            </div>
          </div>

          <div className="profile-text-size-options" role="radiogroup" aria-label="Tamaño del texto">
            {textSizes.map((option) => {
              const selected = textSize === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={`profile-text-size-option is-${option.value} ${selected ? "is-selected" : ""}`}
                  onClick={() => handleSelectTextSize(option.value)}
                >
                  <span aria-hidden="true">{option.example}</span>
                  <strong>{option.label}</strong>
                </button>
              );
            })}
          </div>

          <div className={`profile-text-preview is-${textSize}`} aria-live="polite">
            <strong>Vista previa</strong>
            <p>Aprender la Palabra de Dios puede ser una aventura clara, alegre y fácil de seguir.</p>
          </div>
        </div>
      </fieldset>

      {/* Sección 2: Ajustes de la Aplicación (Local) */}
      <fieldset className="flex flex-col gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 pt-2">
        <legend className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Preferencias del Dispositivo
        </legend>

        {/* Notificaciones */}
        <div className="profile-setting-row">
          <span className="profile-setting-row__icon bg-blue-50 text-blue-500 rounded-xl" aria-hidden="true">
            <Bell size={22} />
          </span>
          <div className="profile-setting-row__copy">
            <h2>Notificaciones</h2>
            <p>Recibe recordatorios de racha diaria, nuevas lecciones y retos cooperativos.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={notificaciones}
            className={`profile-switch ${notificaciones ? "is-on" : ""}`}
            onClick={() => void handleToggleNotificaciones()}
          >
            <span aria-hidden="true" />
          </button>
        </div>

        {/* Wi-Fi descargas */}
        <div className="profile-setting-row">
          <span className="profile-setting-row__icon bg-indigo-50 text-indigo-500 rounded-xl" aria-hidden="true">
            <Wifi size={22} />
          </span>
          <div className="profile-setting-row__copy">
            <h2>Descargas solo con Wi-Fi</h2>
            <p>Evita descargar paquetes educativos o lecciones pesadas usando tus datos móviles.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={wifiOnly}
            className={`profile-switch ${wifiOnly ? "is-on" : ""}`}
            onClick={handleToggleWifiOnly}
          >
            <span aria-hidden="true" />
          </button>
        </div>

        {/* Contraste */}
        <div className="profile-setting-row">
          <span className="profile-setting-row__icon bg-slate-50 text-slate-600 rounded-xl" aria-hidden="true">
            <Eye size={22} />
          </span>
          <div className="profile-setting-row__copy">
            <h2>Alto contraste</h2>
            <p>Optimiza los colores de la interfaz para preadolescentes o niños con dificultades visuales.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={contraste}
            className={`profile-switch ${contraste ? "is-on" : ""}`}
            onClick={handleToggleContraste}
          >
            <span aria-hidden="true" />
          </button>
        </div>

        {/* Controles Parentales */}
        <div className="profile-setting-row">
          <span className="profile-setting-row__icon bg-amber-50 text-amber-500 rounded-xl" aria-hidden="true">
            <ShieldAlert size={22} />
          </span>
          <div className="profile-setting-row__copy">
            <h2>Controles parentales</h2>
            <p>Bloquea la edición de perfiles o desvinculación de cuenta mediante una clave de adulto.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={parental}
            className={`profile-switch ${parental ? "is-on" : ""}`}
            onClick={handleToggleParental}
          >
            <span aria-hidden="true" />
          </button>
        </div>

        {parental ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 dark:border-amber-900/60 dark:bg-amber-950/40">
            <div>
              <strong className="text-xs font-bold text-amber-900 dark:text-amber-200">PIN de Control Parental</strong>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Se solicitará esta clave al editar el perfil o desvincular la cuenta.
              </p>
            </div>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={pinParental}
              onChange={(e) => {
                const limpio = e.target.value.replace(/\D/g, "").slice(0, 6);
                setPinParental(limpio);
                guardarPreferenciaPerfil("semillas-pref-parental-pin", limpio || "1234", scopeId);
              }}
              placeholder="1234"
              aria-label="PIN de control parental"
              className="w-28 rounded-xl border border-amber-300 bg-white px-3 py-2 text-center font-bold text-slate-800 dark:border-amber-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
        ) : null}

        {/* Selección de Tema Visual */}
        <div className="profile-text-setting mt-2">
          <div className="profile-text-setting__heading">
            <span className="profile-setting-row__icon bg-sky-50 text-sky-600 rounded-xl" aria-hidden="true">
              <SunMoon size={22} />
            </span>
            <div>
              <h2>Tema visual (Modo Oscuro)</h2>
              <p>Elige si prefieres un fondo claro, oscuro o que se adapte al sistema.</p>
            </div>
          </div>

          <div className="profile-text-size-options" role="radiogroup" aria-label="Tema visual">
            {(["sistema", "claro", "oscuro"] as const).map((option) => {
              const selected = tema === option;
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={`profile-text-size-option is-mediano ${selected ? "is-selected" : ""}`}
                  onClick={() => handleSelectTema(option)}
                >
                  <strong className="capitalize">{option}</strong>
                </button>
              );
            })}
          </div>
        </div>
      </fieldset>

      {/* Sección 3: Seguridad y Métodos de Acceso */}
      <fieldset className="flex flex-col gap-4 border-b border-slate-100 pb-5 pt-2">
        <legend className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Seguridad y Métodos de Acceso
        </legend>

        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-3 dark:bg-slate-900/60 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Método de acceso actual:</span>
            <strong className="text-slate-700 dark:text-slate-200 capitalize font-bold">
              {usuario?.proveedor || "Invitado"}
            </strong>
          </div>

          {esInvitado ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-amber-600 leading-relaxed font-bold">
                ⚠️ Estás jugando como invitado. Tu progreso está guardado localmente en este dispositivo y podría perderse si borras los datos del navegador.
              </p>
              <button
                type="button"
                onClick={onVincularGoogle}
                className="profile-google-link-btn w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition"
              >
                <KeyRound size={14} /> Vincular cuenta de Google
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Nombre:</span>
                <strong className="text-slate-700 dark:text-slate-200">{usuario?.nombre_visible}</strong>
              </div>
              <div className="flex justify-between">
                <span>Correo:</span>
                <strong className="text-slate-700 dark:text-slate-200">{usuario?.correo}</strong>
              </div>
            </div>
          )}
        </div>
      </fieldset>

      {/* Botones de acción */}
      <div className="profile-form-actions justify-between items-center pt-2">
        <div>
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition"
          >
            <UserMinus size={16} />
            {esInvitado ? "Eliminar datos locales" : "Desvincular cuenta"}
          </button>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            className="profile-secondary-button"
            onClick={onCancel}
            disabled={isSaving}
          >
            <ArrowLeft size={18} aria-hidden="true" />
            Volver
          </button>
          <button
            type="submit"
            className="profile-primary-button bg-verde-brote text-white font-bold"
            disabled={isSaving}
          >
            {isSaving ? <LoaderCircle className="animate-spin" size={18} /> : <Save size={18} />}
            {isSaving ? "Guardando..." : hasChanges ? "Guardar preferencias" : "Guardar y aplicar"}
          </button>
        </div>
      </div>
    </form>
  );
}
