import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../db/database.types";
import type { DbClient } from "../db/client";

export type UserRole = "administrador" | "usuario" | "invitado" | "padre";
export type AuthProvider = Database["public"]["Enums"]["proveedor_autenticacion"];

export type AuthUser = {
  id: string;
  role: UserRole;
  displayName: string;
  email: string | null;
  provider: AuthProvider;
};

export type AuthSessionUser = {
  id: string;
  displayName: string;
  email: string | null;
  provider: AuthProvider;
};

export type Env = {
  APP_ENV: string;
  CORS_BASE_DOMAIN: string;

  HYPERDRIVE?: {
    connectionString: string;
  };

  SUPABASE_DATABASE_URL?: string;

  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SUPABASE_PROJECT_REF?: string;

  // Bootstrap administrativo exclusivamente local. Debe permanecer desactivado
  // en producción y requiere un secreto independiente para invocar la ruta.
  ENABLE_DEV_ADMIN_SETUP?: string;
  DEV_ADMIN_EMAIL?: string;
  DEV_ADMIN_PASSWORD?: string;
  DEV_ADMIN_SETUP_TOKEN?: string;
  RATE_LIMITER?: { limit: (entrada: { key: string }) => Promise<{ success: boolean }> };
};

export type Variables = {
  db: SupabaseClient<Database>;
  drizzle?: DbClient;
  user: AuthUser;
  authSessionUser?: AuthSessionUser;
  guestUserId?: string | null;
  requestId: string;
};

export type AppBindings = {
  Bindings: Env;
  Variables: Variables;
};
