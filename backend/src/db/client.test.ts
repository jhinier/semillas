import { expect, mock, test } from "bun:test";
import type { Env } from "../config/env";

const crearClientePostgres = mock(() => ({}) as never);
const crearClienteDrizzle = mock(() => ({}));

mock.module("postgres", () => ({
  default: crearClientePostgres
}));

mock.module("drizzle-orm/postgres-js", () => ({
  drizzle: crearClienteDrizzle
}));

const { crearDb, schema } = await import("./client");

test("crearDb usa el binding Hyperdrive sin prepared statements", () => {
  crearClientePostgres.mockClear();
  crearClienteDrizzle.mockClear();

  const connectionString = "postgres://usuario:contrasena@ejemplo.test:5432/semillas";

  const env: Env = {
    APP_ENV: "test",
    CORS_BASE_DOMAIN: "localhost",
    SUPABASE_URL: "https://ejemplo.supabase.co",
    SUPABASE_ANON_KEY: "anon-key-de-prueba",
    SUPABASE_SERVICE_ROLE_KEY: "service-key-de-prueba",
    HYPERDRIVE: {
      connectionString
    }
  };

  crearDb(env);

  expect(crearClientePostgres).toHaveBeenCalledWith(connectionString, {
    prepare: false
  });
  expect(crearClienteDrizzle).toHaveBeenCalledWith(expect.anything(), { schema });
});

test("crearDb rechaza un binding Hyperdrive ausente", () => {
  const envSinHyperdrive: Env = {
    APP_ENV: "test",
    CORS_BASE_DOMAIN: "localhost",
    SUPABASE_URL: "https://ejemplo.supabase.co",
    SUPABASE_ANON_KEY: "anon-key-de-prueba",
    SUPABASE_SERVICE_ROLE_KEY: "service-key-de-prueba"
  };

  expect(() => crearDb(envSinHyperdrive)).toThrow(
    "Configura HYPERDRIVE en Cloudflare o SUPABASE_DATABASE_URL para desarrollo local."
  );
});
