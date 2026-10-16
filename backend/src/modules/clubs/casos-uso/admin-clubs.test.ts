import { describe, expect, test } from "bun:test";
import { crearClubsRepository, type ClubsRepository } from "../clubs.repository";
import type { DbClient } from "../../../db/client";
import { crearCasosUsoAdminClubs } from "./admin-clubs";

const ahora = new Date("2026-07-12T00:00:00.000Z");

function club(estado = true) {
  return {
    id: "club-1",
    nombre: "Club de aventura",
    descripcion: null,
    codigoInvitacion: "AVENTURA",
    creadoPor: "creador-1",
    activo: estado,
    creadoEn: ahora,
  };
}

function reto() {
  return {
    id: "reto-1",
    clubId: "club-1",
    nombre: "Reto de lectura",
    descripcion: null,
    codigoMetrica: "temas_completados",
    valorObjetivo: 10,
    xpReto: 100,
    fechaInicio: ahora,
    fechaFin: new Date("2026-07-19T00:00:00.000Z"),
    creadoPor: "creador-1",
    creadoEn: ahora,
  };
}

function crearRepositorioAdmin(overrides: Record<string, unknown> = {}) {
  const llamadas: Array<{ metodo: string; argumentos: unknown[] }> = [];
  const repositorio = {
    listarClubesAdministracion: async () => [],
    obtenerClub: async () => club(),
    listarMiembrosClub: async () => [],
    listarMiembrosClubAdministracion: async () => [],
    listarRetos: async () => [],
    desactivarClub: async (...argumentos: unknown[]) => {
      llamadas.push({ metodo: "desactivarClub", argumentos });
      return club(false);
    },
    reactivarClub: async (...argumentos: unknown[]) => {
      llamadas.push({ metodo: "reactivarClub", argumentos });
      return club();
    },
    obtenerMembresia: async () => ({ rolMiembro: "miembro" }),
    contarPropietariosClub: async () => 1,
    obtenerPropietarioClub: async () => ({ usuarioId: "lider-1" }),
    eliminarMiembro: async (...argumentos: unknown[]) => {
      llamadas.push({ metodo: "eliminarMiembro", argumentos });
    },
    actualizarRolMiembro: async (...argumentos: unknown[]) => {
      llamadas.push({ metodo: "actualizarRolMiembro", argumentos });
      return { usuarioId: argumentos[0], clubId: argumentos[1], rolMiembro: argumentos[2] };
    },
    quitarMiembroAdministracion: async (...argumentos: unknown[]) => {
      llamadas.push({ metodo: "quitarMiembroAdministracion", argumentos });
      return { resultado: "eliminado" } as const;
    },
    transferirResponsabilidadClub: async (...argumentos: unknown[]) => {
      llamadas.push({ metodo: "transferirResponsabilidadClub", argumentos });
      return { resultado: "transferido" } as const;
    },
    crearReto: async (...argumentos: unknown[]) => {
      llamadas.push({ metodo: "crearReto", argumentos });
      return reto();
    },
    cerrarReto: async (...argumentos: unknown[]) => {
      llamadas.push({ metodo: "cerrarReto", argumentos });
      return reto();
    },
    ...overrides,
  } as unknown as ClubsRepository;

  return { repositorio, llamadas };
}

function crearRepositorioTransaccional(miembros: Array<{ usuario_id: string; rol_miembro: string }>) {
  const llamadas: Array<{ metodo: string; argumentos: unknown[] }> = [];
  const tx = {
    execute: async () => miembros,
    delete: () => ({
      where: async () => {
        llamadas.push({ metodo: "eliminar", argumentos: [] });
      },
    }),
    update: () => ({
      set: (valores: unknown) => ({
        where: async () => {
          llamadas.push({ metodo: "actualizar", argumentos: [valores] });
        },
      }),
    }),
  };
  const db = {
    transaction: async (operacion: (transaccion: typeof tx) => Promise<unknown>) => {
      llamadas.push({ metodo: "transaccion", argumentos: [] });
      return operacion(tx);
    },
  } as unknown as DbClient;

  return { repositorio: crearClubsRepository(db), llamadas };
}

describe("casos de uso administrativos de clubes", () => {
  test("lista clubes incluyendo los filtros administrativos", async () => {
    const filtros = { q: "aventura", activo: false, orden: "miembros" as const, limit: 20, offset: 0 };
    const clubes = [{
      id: "club-1",
      nombre: "Club de aventura",
      descripcion: null,
      activo: true,
      creadoEn: ahora,
      miembros: 3,
      retosAbiertos: 1,
      liderUsuarioId: "lider-1",
      liderApodo: "Aventurero",
    }];
    const { repositorio } = crearRepositorioAdmin({
      listarClubesAdministracion: async (entrada: unknown) => {
        expect(entrada).toEqual(filtros);
        return { clubes, total: 1 };
      },
    });
    const casos = crearCasosUsoAdminClubs(repositorio);

    expect(await casos.listar(filtros)).toEqual({
      clubes: [{
        id: "club-1",
        nombre: "Club de aventura",
        descripcion: null,
        activo: true,
        creado_en: "2026-07-12T00:00:00.000Z",
        miembros: 3,
        retos_abiertos: 1,
        lider: { usuario_id: "lider-1", apodo: "Aventurero" },
      }],
      meta: { total: 1, limit: 20, offset: 0 },
    });
  });

  test("obtiene el detalle administrativo con miembros y retos", async () => {
    const { repositorio } = crearRepositorioAdmin({
      listarMiembrosClub: async () => {
        throw new Error("El detalle administrativo no debe usar el listado general");
      },
      listarMiembrosClubAdministracion: async () => [{ usuario_id: "miembro-1", apodo: "Semillero", rol_miembro: "miembro", unido_en: ahora }],
      listarRetos: async () => [reto()],
    });
    const casos = crearCasosUsoAdminClubs(repositorio);

    expect(await casos.obtenerDetalle("club-1")).toEqual({
      club: {
        id: "club-1",
        nombre: "Club de aventura",
        descripcion: null,
        codigo_invitacion: "AVENTURA",
        activo: true,
        creado_en: "2026-07-12T00:00:00.000Z",
      },
      miembros: [{
        usuario_id: "miembro-1",
        apodo: "Semillero",
        rol_miembro: "miembro",
        unido_en: "2026-07-12T00:00:00.000Z",
        url_avatar: null,
        xp_total: 0,
        xp_semana: 0,
        actividades_semana: 0,
      }],
      retos: [{
        id: "reto-1",
        nombre: "Reto de lectura",
        descripcion: null,
        codigo_metrica: "temas_completados",
        valor_objetivo: 10,
        xp_reto: 100,
        fecha_inicio: "2026-07-12T00:00:00.000Z",
        fecha_fin: "2026-07-19T00:00:00.000Z",
      }],
    });
  });

  test("serializa la fecha de unión recibida como cadena desde la consulta administrativa", async () => {
    const { repositorio } = crearRepositorioAdmin({
      listarMiembrosClubAdministracion: async () => [{
        usuario_id: "miembro-1",
        apodo: "Semillero",
        rol_miembro: "miembro",
        unido_en: "2026-07-12T00:00:00.000Z",
      }],
    });
    const casos = crearCasosUsoAdminClubs(repositorio);

    const resultado = await casos.obtenerDetalle("club-1");

    expect(resultado).toMatchObject({
      miembros: [{ unido_en: "2026-07-12T00:00:00.000Z" }],
    });
  });

  test("permite archivar un club con miembros sin exigir membresía al administrador", async () => {
    const { repositorio, llamadas } = crearRepositorioAdmin();
    const casos = crearCasosUsoAdminClubs(repositorio);

    const resultado = await casos.archivar("club-1", "admin-1");

    expect(resultado).toEqual({ archived: true });
    expect(llamadas).toContainEqual({ metodo: "desactivarClub", argumentos: ["club-1"] });
  });

  test("no expulsa al único propietario sin transferir el liderazgo", async () => {
    const { repositorio, llamadas } = crearRepositorioAdmin({
      obtenerMembresia: async () => ({ rolMiembro: "propietario" }),
      obtenerPropietarioClub: async () => ({ usuarioId: "lider-1" }),
      quitarMiembroAdministracion: async (...argumentos: unknown[]) => {
        llamadas.push({ metodo: "quitarMiembroAdministracion", argumentos });
        return { resultado: "RESPONSABLE_REQUERIDO" } as const;
      },
    });
    const casos = crearCasosUsoAdminClubs(repositorio);

    const resultado = await casos.quitarMiembro("club-1", "lider-1", "admin-1");

    expect(resultado).toMatchObject({ error: { codigo: "RESPONSABLE_REQUERIDO", estado: 400 } });
    expect(llamadas).not.toContainEqual({ metodo: "eliminarMiembro", argumentos: ["lider-1", "club-1"] });
  });

  test("no expulsa al ultimo lider sin transferir la responsabilidad", async () => {
    const { repositorio, llamadas } = crearRepositorioAdmin({
      obtenerMembresia: async () => ({ rolMiembro: "lider" }),
      quitarMiembroAdministracion: async (...argumentos: unknown[]) => {
        llamadas.push({ metodo: "quitarMiembroAdministracion", argumentos });
        return { resultado: "RESPONSABLE_REQUERIDO" } as const;
      },
    });
    const casos = crearCasosUsoAdminClubs(repositorio);

    const resultado = await casos.quitarMiembro("club-1", "lider-1", "admin-1");

    expect(resultado).toMatchObject({ error: { codigo: "RESPONSABLE_REQUERIDO", estado: 400 } });
    expect(llamadas).toContainEqual({ metodo: "quitarMiembroAdministracion", argumentos: ["club-1", "lider-1"] });
    expect(llamadas).not.toContainEqual({ metodo: "eliminarMiembro", argumentos: ["lider-1", "club-1"] });
  });

  test("reactiva un club archivado sin exigir membresía al administrador", async () => {
    const { repositorio, llamadas } = crearRepositorioAdmin();
    const casos = crearCasosUsoAdminClubs(repositorio);

    const resultado = await casos.reactivar("club-1", "admin-1");

    expect(resultado).toEqual({ reactivated: true });
    expect(llamadas).toContainEqual({ metodo: "reactivarClub", argumentos: ["club-1"] });
  });

  test("transfiere la responsabilidad desde un lider existente de forma atomica", async () => {
    const { repositorio, llamadas } = crearRepositorioAdmin({
      obtenerPropietarioClub: async () => null,
    });
    const casos = crearCasosUsoAdminClubs(repositorio);

    const resultado = await casos.transferirLiderazgo("club-1", "miembro-2", "admin-1");

    expect(resultado).toEqual({ transferred: true, usuario_id: "miembro-2" });
    expect(llamadas).toEqual([
      { metodo: "transferirResponsabilidadClub", argumentos: ["club-1", "miembro-2"] },
    ]);
  });

  test("cierra un reto evitando nuevos aportes sin borrar sus recompensas", async () => {
    const { repositorio, llamadas } = crearRepositorioAdmin();
    const casos = crearCasosUsoAdminClubs(repositorio);

    const resultado = await casos.cerrarReto("club-1", "reto-1", "admin-1");

    expect(resultado).toEqual({ closed: true });
    expect(llamadas).toContainEqual({ metodo: "cerrarReto", argumentos: ["club-1", "reto-1"] });
  });

  test("crea un reto administrativo con el creador indicado", async () => {
    const { repositorio, llamadas } = crearRepositorioAdmin();
    const casos = crearCasosUsoAdminClubs(repositorio);
    const reto = {
      nombre: "Reto de lectura",
      descripcion: null,
      codigoMetrica: "temas_completados",
      valorObjetivo: 10,
      xpReto: 100,
      fechaInicio: new Date("2026-07-12T00:00:00.000Z"),
      fechaFin: new Date("2026-07-19T00:00:00.000Z"),
    };

    expect(await casos.crearReto("club-1", reto, "admin-1")).toMatchObject({ id: "reto-1" });
    expect(llamadas).toContainEqual({
      metodo: "crearReto",
      argumentos: [{ ...reto, clubId: "club-1", creadoPor: "admin-1" }],
    });
  });

  test("el repositorio bloquea la expulsion del ultimo lider dentro de una transaccion", async () => {
    const { repositorio, llamadas } = crearRepositorioTransaccional([
      { usuario_id: "lider-1", rol_miembro: "lider" },
    ]);

    expect(await repositorio.quitarMiembroAdministracion("club-1", "lider-1")).toEqual({
      resultado: "RESPONSABLE_REQUERIDO",
    });
    expect(llamadas).toEqual([{ metodo: "transaccion", argumentos: [] }]);
  });

  test("el repositorio bloquea la expulsion del ultimo propietario dentro de una transaccion", async () => {
    const { repositorio, llamadas } = crearRepositorioTransaccional([
      { usuario_id: "propietario-1", rol_miembro: "propietario" },
    ]);

    expect(await repositorio.quitarMiembroAdministracion("club-1", "propietario-1")).toEqual({
      resultado: "RESPONSABLE_REQUERIDO",
    });
    expect(llamadas).toEqual([{ metodo: "transaccion", argumentos: [] }]);
  });

  test("el detalle administrativo no incluye nombre_visible en su contrato de consulta", async () => {
    const fuente = await Bun.file(new URL("../clubs.repository.ts", import.meta.url)).text();
    const inicio = fuente.indexOf("async listarMiembrosClubAdministracion");
    const fin = fuente.indexOf("async buscarCodigoInvitacion", inicio);
    const consultaAdministrativa = fuente.slice(inicio, fin);

    expect(consultaAdministrativa).toContain("coalesce(p.apodo, 'Semillero')");
    expect(consultaAdministrativa).not.toContain("nombre_visible");
    expect(consultaAdministrativa).not.toContain("usuario_app");
  });

  test("el listado administrativo selecciona el responsable UUID sin agregarlo", async () => {
    const fuente = await Bun.file(new URL("../clubs.repository.ts", import.meta.url)).text();
    const inicio = fuente.indexOf("async listarClubesAdministracion");
    const fin = fuente.indexOf("async contarMiembrosPorClub", inicio);
    const consultaAdministrativa = fuente.slice(inicio, fin);

    expect(consultaAdministrativa).toContain("select responsable.usuario_id");
    expect(consultaAdministrativa).toContain("where responsable.club_id =");
    expect(consultaAdministrativa).not.toContain("max(case when");
  });

  test("el repositorio transfiere el rol de lider dentro de una transaccion", async () => {
    const { repositorio, llamadas } = crearRepositorioTransaccional([
      { usuario_id: "lider-1", rol_miembro: "lider" },
      { usuario_id: "miembro-2", rol_miembro: "miembro" },
    ]);

    expect(await repositorio.transferirResponsabilidadClub("club-1", "miembro-2")).toEqual({
      resultado: "transferido",
    });
    expect(llamadas).toEqual([
      { metodo: "transaccion", argumentos: [] },
      { metodo: "actualizar", argumentos: [{ rolMiembro: "lider" }] },
      { metodo: "actualizar", argumentos: [{ rolMiembro: "miembro" }] },
    ]);
  });
  test("crea un club y asigna al responsable inicial", async () => {
    const { repositorio, llamadas } = crearRepositorioAdmin({
      obtenerCreadorClub: async () => ({ id: "lider-1", nombre_visible: "Luz" }),
      buscarCodigoInvitacion: async () => null,
      crearClub: async (datos: Record<string, unknown>) => {
        llamadas.push({ metodo: "crearClub", argumentos: [datos] });
        return { ...club(), codigoInvitacion: String(datos.codigoInvitacion), creadoPor: String(datos.creadoPor) };
      },
      agregarMiembro: async (datos: Record<string, unknown>) => {
        llamadas.push({ metodo: "agregarMiembro", argumentos: [datos] });
        return datos;
      },
      eliminarClub: async () => undefined,
    });
    const casos = crearCasosUsoAdminClubs(repositorio);

    const resultado = await casos.crear({
      nombre: "Club de aventura",
      descripcion: "Aprender juntos",
      liderUsuarioId: "lider-1",
    }, "admin-1");

    expect(resultado).toMatchObject({
      id: "club-1",
      lider: { usuario_id: "lider-1", apodo: "Luz" },
    });
    expect(llamadas.find((llamada) => llamada.metodo === "crearClub")?.argumentos[0]).toMatchObject({
      nombre: "Club de aventura",
      descripcion: "Aprender juntos",
      creadoPor: "admin-1",
    });
    expect(llamadas).toContainEqual({
      metodo: "agregarMiembro",
      argumentos: [{ clubId: "club-1", usuarioId: "lider-1", rolMiembro: "lider" }],
    });
  });

  test("agrega un usuario activo como miembro sin duplicar membresías", async () => {
    const { repositorio, llamadas } = crearRepositorioAdmin({
      obtenerCreadorClub: async () => ({ id: "miembro-2", nombre_visible: "Paz" }),
      obtenerMembresia: async () => null,
      agregarMiembro: async (...argumentos: unknown[]) => {
        llamadas.push({ metodo: "agregarMiembro", argumentos });
        return { clubId: "club-1", usuarioId: "miembro-2", rolMiembro: "miembro" };
      },
    });
    const casos = crearCasosUsoAdminClubs(repositorio);

    expect(await casos.agregarMiembro("club-1", "miembro-2")).toEqual({ added: true, usuario_id: "miembro-2" });
    expect(llamadas).toContainEqual({
      metodo: "agregarMiembro",
      argumentos: [{ clubId: "club-1", usuarioId: "miembro-2", rolMiembro: "miembro" }],
    });
  });

  test("actualiza nombre y descripción sin exigir membresía al administrador", async () => {
    const { repositorio, llamadas } = crearRepositorioAdmin({
      actualizarClub: async (...argumentos: unknown[]) => {
        llamadas.push({ metodo: "actualizarClub", argumentos });
        return { ...club(), nombre: "Nuevo nombre", descripcion: "Nueva descripción" };
      },
    });
    const casos = crearCasosUsoAdminClubs(repositorio);

    const resultado = await casos.actualizar("club-1", { nombre: "Nuevo nombre", descripcion: "Nueva descripción" });

    expect(resultado).toMatchObject({ nombre: "Nuevo nombre", descripcion: "Nueva descripción" });
    expect(llamadas).toContainEqual({
      metodo: "actualizarClub",
      argumentos: ["club-1", { nombre: "Nuevo nombre", descripcion: "Nueva descripción" }],
    });
  });

});
