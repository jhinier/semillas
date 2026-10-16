import { describe, expect, it, mock, beforeEach } from "bun:test";

import {
  cerrarSesionAutenticadaConCliente,
  escucharCambiosAutenticacionConCliente,
  iniciarSesionConCorreoConCliente,
  iniciarSesionGoogleConCliente,
  registrarConCorreoConCliente,
  vincularGoogleConCliente,
  sincronizarSesionAutenticadaConCliente,
} from "./supabase.helpers";

beforeEach(() => {
  const storage = new Map<string, string>();

  Object.defineProperty(globalThis, "localStorage", {
    value: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value);
      },
      removeItem: (key: string) => {
        storage.delete(key);
      },
      clear: () => storage.clear(),
    },
    configurable: true,
  });
});

describe("supabase auth helper", () => {
  it("inicia sesión con Google usando redirectTo", async () => {
    const signInWithOAuthMock = mock(async () => ({
      data: { url: "https://supabase.example/auth/v1/authorize" },
      error: null,
    }));

    const cliente = {
      auth: {
        signInWithOAuth: signInWithOAuthMock,
        getSession: mock(async () => ({ data: { session: null }, error: null })),
        onAuthStateChange: mock(() => ({ data: { subscription: { unsubscribe: mock(() => undefined) } } })),
        signOut: mock(async () => ({ error: null })),
      },
    } as never;

    const url = await iniciarSesionGoogleConCliente(cliente, "https://semillas.org/auth/callback");

    expect(signInWithOAuthMock).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: "https://semillas.org/auth/callback",
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    expect(url).toBe("https://supabase.example/auth/v1/authorize");
  });

  it("sincroniza el access token de la sesión al storage local", async () => {
    const getSessionMock = mock(async () => ({
      data: { session: { access_token: "token-123" } },
      error: null,
    }));

    const cliente = {
      auth: {
        signInWithOAuth: mock(async () => ({ data: { url: "" }, error: null })),
        getSession: getSessionMock,
        onAuthStateChange: mock(() => ({ data: { subscription: { unsubscribe: mock(() => undefined) } } })),
        signOut: mock(async () => ({ error: null })),
      },
    } as never;

    const session = await sincronizarSesionAutenticadaConCliente(cliente);

    expect(getSessionMock).toHaveBeenCalledTimes(1);
    expect(globalThis.localStorage.getItem("semillas_access_token")).toBe("token-123");
    expect(session?.access_token).toBe("token-123");
  });

  it("cierra la sesión y borra el token local", async () => {
    const signOutMock = mock(async () => ({ error: null }));

    const cliente = {
      auth: {
        signInWithOAuth: mock(async () => ({ data: { url: "" }, error: null })),
        getSession: mock(async () => ({ data: { session: null }, error: null })),
        onAuthStateChange: mock(() => ({ data: { subscription: { unsubscribe: mock(() => undefined) } } })),
        signOut: signOutMock,
      },
    } as never;

    globalThis.localStorage.setItem("semillas_access_token", "token-123");

    await cerrarSesionAutenticadaConCliente(cliente);

    expect(signOutMock).toHaveBeenCalledTimes(1);
    expect(globalThis.localStorage.getItem("semillas_access_token")).toBeNull();
  });

  it("registra con correo usando signUp", async () => {
    const signUpMock = mock(async () => ({
      data: { user: { id: "user-1" }, session: { access_token: "token-abc", user: { id: "user-1" } } },
      error: null,
    }));

    const cliente = {
      auth: {
        signInWithOAuth: mock(async () => ({ data: { url: "" }, error: null })),
        signUp: signUpMock,
        signInWithPassword: mock(async () => ({ data: { user: null, session: null }, error: null })),
        getSession: mock(async () => ({ data: { session: null }, error: null })),
        onAuthStateChange: mock(() => ({ data: { subscription: { unsubscribe: mock(() => undefined) } } })),
        signOut: mock(async () => ({ error: null })),
      },
    } as never;

    const { data } = await registrarConCorreoConCliente(cliente, "test@ejemplo.com", "password123");

    expect(signUpMock).toHaveBeenCalledWith({
      email: "test@ejemplo.com",
      password: "password123",
    });
    expect(data?.user?.id).toBe("user-1");
  });

  it("inicia sesión con correo usando signInWithPassword", async () => {
    const signInMock = mock(async () => ({
      data: { user: { id: "user-1" }, session: { access_token: "token-abc", user: { id: "user-1" } } },
      error: null,
    }));

    const cliente = {
      auth: {
        signInWithOAuth: mock(async () => ({ data: { url: "" }, error: null })),
        signUp: mock(async () => ({ data: { user: null, session: null }, error: null })),
        signInWithPassword: signInMock,
        getSession: mock(async () => ({ data: { session: null }, error: null })),
        onAuthStateChange: mock(() => ({ data: { subscription: { unsubscribe: mock(() => undefined) } } })),
        signOut: mock(async () => ({ error: null })),
      },
    } as never;

    const { data } = await iniciarSesionConCorreoConCliente(cliente, "test@ejemplo.com", "password123");

    expect(signInMock).toHaveBeenCalledWith({
      email: "test@ejemplo.com",
      password: "password123",
    });
    expect(data?.session?.access_token).toBe("token-abc");
  });

  it("maneja error de registro con correo", async () => {
    const signUpMock = mock(async () => ({
      data: { user: null, session: null },
      error: new Error("Email ya registrado"),
    }));

    const cliente = {
      auth: {
        signInWithOAuth: mock(async () => ({ data: { url: "" }, error: null })),
        signUp: signUpMock,
        signInWithPassword: mock(async () => ({ data: { user: null, session: null }, error: null })),
        getSession: mock(async () => ({ data: { session: null }, error: null })),
        onAuthStateChange: mock(() => ({ data: { subscription: { unsubscribe: mock(() => undefined) } } })),
        signOut: mock(async () => ({ error: null })),
      },
    } as never;

    const { error } = await registrarConCorreoConCliente(cliente, "existente@ejemplo.com", "password123");
    expect(error).toBeTruthy();
    expect(error?.message).toBe("Email ya registrado");
  });

  it("escucha cambios de autenticacion y sincroniza el token", async () => {
    const unsubscribeMock = mock(() => undefined);
    const callbackMock = mock(async () => undefined);
    const cliente = {
      auth: {
        signInWithOAuth: mock(async () => ({ data: { url: "" }, error: null })),
        getSession: mock(async () => ({ data: { session: null }, error: null })),
        onAuthStateChange: mock((callback: (_event: string, session: { access_token?: string } | null) => void) => {
          callback("SIGNED_IN", { access_token: "token-456" });
          return { data: { subscription: { unsubscribe: unsubscribeMock } } };
        }),
        signOut: mock(async () => ({ error: null })),
        linkIdentity: mock(async () => ({ data: { url: "" }, error: null })),
      },
    } as never;

    const detener = escucharCambiosAutenticacionConCliente(cliente, callbackMock);
    detener();

    expect(globalThis.localStorage.getItem("semillas_access_token")).toBe("token-456");
    expect(unsubscribeMock).toHaveBeenCalledTimes(1);
    expect(callbackMock).toHaveBeenCalledTimes(1);
  });

  it("vincula Google usando linkIdentity", async () => {
    const linkIdentityMock = mock(async () => ({
      data: { url: "https://supabase.example/auth/v1/authorize?provider=google" },
      error: null,
    }));

    const cliente = {
      auth: {
        signInWithOAuth: mock(async () => ({ data: { url: "" }, error: null })),
        linkIdentity: linkIdentityMock,
        signUp: mock(async () => ({ data: { user: null, session: null }, error: null })),
        signInWithPassword: mock(async () => ({ data: { user: null, session: null }, error: null })),
        getSession: mock(async () => ({ data: { session: null }, error: null })),
        onAuthStateChange: mock(() => ({ data: { subscription: { unsubscribe: mock(() => undefined) } } })),
        signOut: mock(async () => ({ error: null })),
      },
    } as never;

    const url = await vincularGoogleConCliente(cliente);

    expect(linkIdentityMock).toHaveBeenCalledWith({ provider: "google" });
    expect(url).toContain("provider=google");
  });
});
