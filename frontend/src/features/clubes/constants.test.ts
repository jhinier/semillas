import { describe, it, expect } from 'bun:test';
import { ROLES, METRICAS, LOCALE } from './constants';

describe('ROLES', () => {
  it('tiene el rol MIEMBRO', () => {
    expect(ROLES.MIEMBRO).toBe('miembro');
  });

  it('tiene el rol LIDER', () => {
    expect(ROLES.LIDER).toBe('lider');
  });

  it('tiene el rol PROPIETARIO', () => {
    expect(ROLES.PROPIETARIO).toBe('propietario');
  });

  it('los roles son strings literales', () => {
    type ROLES = typeof ROLES;
    const miembro: ROLES['MIEMBRO'] = 'miembro';
    const lider: ROLES['LIDER'] = 'lider';
    const propietario: ROLES['PROPIETARIO'] = 'propietario';
    expect(miembro).toBe('miembro');
    expect(lider).toBe('lider');
    expect(propietario).toBe('propietario');
  });
});

describe('METRICAS', () => {
  it('tiene la métrica ACTIVIDADES_COMPLETADAS', () => {
    expect(METRICAS.ACTIVIDADES_COMPLETADAS).toBe('actividades_completadas');
  });

  it('tiene la métrica TEMAS_COMPLETADOS', () => {
    expect(METRICAS.TEMAS_COMPLETADOS).toBe('temas_completados');
  });

  it('tiene la métrica XP_GRUPAL', () => {
    expect(METRICAS.XP_GRUPAL).toBe('xp_grupal');
  });

  it('las métricas son strings literales', () => {
    type METRICAS = typeof METRICAS;
    const metric1: METRICAS['ACTIVIDADES_COMPLETADAS'] = 'actividades_completadas';
    const metric2: METRICAS['TEMAS_COMPLETADOS'] = 'temas_completados';
    const metric3: METRICAS['XP_GRUPAL'] = 'xp_grupal';
    expect(metric1).toBe('actividades_completadas');
    expect(metric2).toBe('temas_completados');
    expect(metric3).toBe('xp_grupal');
  });
});

describe('LOCALE', () => {
  it('es es-EC', () => {
    expect(LOCALE).toBe('es-EC');
  });

  it('es string literal', () => {
    const locale: typeof LOCALE = 'es-EC';
    expect(locale).toBe('es-EC');
  });
});

describe('exportados', () => {
  it('exporta ROLES, METRICAS y LOCALE', () => {
    expect(ROLES).toBeDefined();
    expect(METRICAS).toBeDefined();
    expect(LOCALE).toBeDefined();
  });

  it('ROLES tiene 3 propiedades', () => {
    expect(Object.keys(ROLES)).toHaveLength(3);
  });

  it('METRICAS tiene 3 propiedades', () => {
    expect(Object.keys(METRICAS)).toHaveLength(3);
  });
});
