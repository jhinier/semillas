import { existsSync, readFileSync } from 'node:fs';

type Servicio = {
  nombre: string;
  cwd: string;
  comando: string[];
  env?: Record<string, string>;
};

async function cargarVarsLocal(cwd: string) {
  const ruta = `${cwd}/.dev.vars`;
  if (!existsSync(ruta)) return {};

  const contenido = readFileSync(ruta, 'utf8');
  return Object.fromEntries(
    contenido
      .split(/\r?\n/)
      .map((linea) => linea.trim())
      .filter((linea) => linea.length > 0 && !linea.startsWith("#"))
      .map((linea) => {
        const indice = linea.indexOf("=");
        if (indice === -1) return [linea, ""];
        return [linea.slice(0, indice), linea.slice(indice + 1)];
      })
  );
}

const servicios: Servicio[] = [
  {
    nombre: 'api',
    cwd: 'backend',
    comando: ['bun', 'run', 'dev'],
    env: { PORT: '8787' },
  },
  {
    nombre: 'web',
    cwd: 'frontend',
    comando: ['bun', 'run', 'dev'],
    env: { PORT: '5173' },
  },
];

const procesos = await Promise.all(
  servicios.map(async (servicio) => {
    const varsLocales = servicio.cwd === "backend" ? await cargarVarsLocal(servicio.cwd) : {};

  console.log(`[${servicio.nombre}] iniciando en ${servicio.cwd}`);

  const proceso = Bun.spawn(servicio.comando, {
    cwd: servicio.cwd,
    env: {
      ...Bun.env,
      ...varsLocales,
      ...servicio.env,
    },
    stdout: 'inherit',
    stderr: 'inherit',
    stdin: 'inherit',
  });

    return { servicio, proceso };
  })
);

const detenerTodos = () => {
  for (const { proceso } of procesos) {
    proceso.kill();
  }
};

process.on('SIGINT', () => {
  detenerTodos();
  process.exit(0);
});

process.on('SIGTERM', () => {
  detenerTodos();
  process.exit(0);
});

const resultado = await Promise.race(
  procesos.map(async ({ servicio, proceso }) => ({
    servicio,
    codigo: await proceso.exited,
  })),
);

detenerTodos();

if (resultado.codigo !== 0) {
  console.error(`[${resultado.servicio.nombre}] terminó con código ${resultado.codigo}`);
}

process.exit(resultado.codigo ?? 1);
