import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginSchema,
  registerSchema,
  type LoginFormData,
  type RegisterFormData,
} from "../schemas/auth.schemas";
import { obtenerMensajeError } from "../utils/auth-errors.utils";
import { registrarConCorreo, iniciarSesionConCorreo } from "../auth.api";

type Modo = "iniciar-sesion" | "registrarse";

export interface UseEmailAuthOptions {
  onSuccess: () => void;
}

export interface UseEmailAuthReturn {
  modo: Modo;
  setModo: (modo: Modo) => void;
  error: string | null;
  pending: boolean;
  cuentaCreada: boolean;
  isLogin: boolean;
  schema: typeof loginSchema | typeof registerSchema;
  errors: Record<string, { message?: string } | undefined>;
  register: ReturnType<typeof useForm<LoginFormData | RegisterFormData>>["register"];
  handleSubmit: ReturnType<typeof useForm<LoginFormData | RegisterFormData>>["handleSubmit"];
  onSubmit: (data: LoginFormData | RegisterFormData) => Promise<void>;
  toggleModo: () => void;
  resetCuentaCreada: () => void;
}

export function useEmailAuth({ onSuccess }: UseEmailAuthOptions): UseEmailAuthReturn {
  const [modo, setModo] = useState<Modo>("iniciar-sesion");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [cuentaCreada, setCuentaCreada] = useState(false);

  const isLogin = modo === "iniciar-sesion";
  const schema = isLogin ? loginSchema : registerSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData | RegisterFormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: LoginFormData | RegisterFormData) => {
    setError(null);
    setPending(true);

    try {
      if (isLogin) {
        const { error: err } = await iniciarSesionConCorreo(data.email, data.password);
        if (err) {
          setError(obtenerMensajeError(err.message));
          return;
        }
        onSuccess();
      } else {
        const registerData = data as RegisterFormData;
        const { error: err } = await registrarConCorreo(registerData.email, registerData.password);
        if (err) {
          setError(obtenerMensajeError(err.message));
          return;
        }
        setCuentaCreada(true);
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setPending(false);
    }
  };

  const toggleModo = () => {
    setModo(isLogin ? "registrarse" : "iniciar-sesion");
    setError(null);
  };

  const resetCuentaCreada = () => {
    setCuentaCreada(false);
    setModo("iniciar-sesion");
  };

  return {
    modo,
    setModo,
    error,
    pending,
    cuentaCreada,
    isLogin,
    schema,
    errors,
    register,
    handleSubmit,
    onSubmit,
    toggleModo,
    resetCuentaCreada,
  };
}
