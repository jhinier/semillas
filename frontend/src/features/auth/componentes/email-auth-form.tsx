import { LoaderCircle, Lock, Mail } from "lucide-react";
import { useEmailAuth } from "../hooks/use-email-auth";

export interface EmailAuthFormProps {
  onSuccess: () => void;
}

export const EmailAuthForm: React.FC<EmailAuthFormProps> = ({ onSuccess }) => {
  const {
    error,
    pending,
    cuentaCreada,
    isLogin,
    errors,
    register,
    handleSubmit,
    onSubmit,
    toggleModo,
    resetCuentaCreada,
  } = useEmailAuth({ onSuccess });

  if (cuentaCreada) {
    return (
      <div className="login-success-state">
        <div className="login-success-state__badge">¡Cuenta creada!</div>
        <p>
          Hemos enviado un correo de confirmación a tu dirección. Revisa tu bandeja de
          entrada y sigue las instrucciones.
        </p>
        <button onClick={resetCuentaCreada} className="login-switch-link" type="button">
          Volver a inicio de sesión
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="login-email-form">
      <div className="login-field-group">
        <label htmlFor="email" className="sr-only">
          Correo electrónico
        </label>
        <div className="login-field">
          <Mail size={18} className="login-field__icon" aria-hidden="true" />
          <input
            id="email"
            type="email"
            placeholder="Correo electrónico"
            {...register("email")}
            className="login-field__input"
          />
        </div>
        {errors.email && <p className="login-feedback login-feedback--error">{errors.email.message}</p>}
      </div>

      <div className="login-field-group">
        <label htmlFor="password" className="sr-only">
          Contraseña
        </label>
        <div className="login-field">
          <Lock size={18} className="login-field__icon" aria-hidden="true" />
          <input
            id="password"
            type="password"
            placeholder="Contraseña"
            {...register("password")}
            className="login-field__input"
          />
        </div>
        {errors.password && (
          <p className="login-feedback login-feedback--error">{errors.password.message}</p>
        )}
      </div>

      {isLogin && (
        <div className="flex justify-end -mt-2 mb-2 pr-1">
          <a
            href="/recuperar-contrasena"
            className="text-[11px] font-bold text-slate-400 hover:text-green-950 transition"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      )}

      {!isLogin && (
        <div className="login-field-group">
          <label htmlFor="confirmarPassword" className="sr-only">
            Confirmar contraseña
          </label>
          <div className="login-field">
            <Lock size={18} className="login-field__icon" aria-hidden="true" />
            <input
              id="confirmarPassword"
              type="password"
              placeholder="Confirmar contraseña"
              {...register("confirmarPassword")}
              className="login-field__input"
            />
          </div>
          {(errors as Record<string, { message?: string } | undefined>)["confirmarPassword"] && (
            <p className="login-feedback login-feedback--error">
              {
                (errors as Record<string, { message?: string } | undefined>)["confirmarPassword"]
                  ?.message
              }
            </p>
          )}
        </div>
      )}

      {error && <p className="login-feedback login-feedback--error login-feedback--center">{error}</p>}

      <button type="submit" disabled={pending} className="login-submit">
        {pending && <LoaderCircle size={18} className="animate-spin" />}
        <span>{isLogin ? "Iniciar sesión" : "Crear cuenta"}</span>
      </button>

      <button type="button" onClick={toggleModo} className="login-switch-link">
        {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
      </button>
    </form>
  );
};
