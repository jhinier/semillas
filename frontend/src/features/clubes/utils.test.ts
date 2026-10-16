import { describe, it, expect } from 'bun:test';
import { formatMonth, daysRemaining, roleName, metricDescription, toDateInput } from './utils';
import { LOCALE, METRICAS } from './constants';

describe('formatMonth', () => {
  it('formatea fecha correctamente', () => {
    const result = formatMonth('2026-01-15');
    expect(result).toBe('ene 2026');
  });

  it('formatea fecha de medio de año', () => {
    const result = formatMonth('2026-07-20');
    expect(result).toBe('jul 2026');
  });

  it('usa el LOCALE correcto', () => {
    const result = formatMonth('2026-03-01');
    expect(result).toBe('mar 2026');
  });
});

describe('daysRemaining', () => {
  it('calcula días restantes para fecha futura', () => {
    const future = new Date();
    future.setDate(future.getDate() + 5);
    expect(daysRemaining(future.toISOString())).toBe('5 días');
  });

  it('retorna "1 día" cuando queda un día', () => {
    const future = new Date();
    future.setDate(future.getDate() + 1);
    expect(daysRemaining(future.toISOString())).toBe('1 día');
  });

  it('retorna "Finalizado" cuando la fecha pasó', () => {
    const past = new Date();
    past.setDate(past.getDate() - 1);
    expect(daysRemaining(past.toISOString())).toBe('Finalizado');
  });

  it('retorna "Finalizado" cuando la fecha es hoy', () => {
    const today = new Date();
    expect(daysRemaining(today.toISOString())).toBe('Finalizado');
  });
});

describe('roleName', () => {
  it('retorna "Líder" para rol lider', () => {
    expect(roleName('lider')).toBe('Líder');
  });

  it('retorna "Líder" para rol propietario', () => {
    expect(roleName('propietario')).toBe('Líder');
  });

  it('retorna "Miembro" para otros roles', () => {
    expect(roleName('miembro')).toBe('Miembro');
  });

  it('retorna "Miembro" para rol desconocido', () => {
    expect(roleName('algo')).toBe('Miembro');
  });
});

describe('metricDescription', () => {
  it('retorna descripción para XP_GRUPAL', () => {
    expect(metricDescription(METRICAS.XP_GRUPAL)).toBe('Sumen XP entre todos los miembros del club.');
  });

  it('retorna descripción para TEMAS_COMPLETADOS', () => {
    expect(metricDescription(METRICAS.TEMAS_COMPLETADOS)).toBe('Completen temas entre todos para alcanzar la meta.');
  });

  it('retorna descripción por defecto', () => {
    expect(metricDescription(METRICAS.ACTIVIDADES_COMPLETADAS)).toBe('Completen actividades y aporten al objetivo común.');
  });

  it('retorna descripción por defecto para métrica desconocida', () => {
    expect(metricDescription('desconocida')).toBe('Completen actividades y aporten al objetivo común.');
  });
});

describe('toDateInput', () => {
  it('convierte fecha a string ISO para input date', () => {
    const date = new Date('2026-07-15T10:30:00.000Z');
    expect(toDateInput(date)).toBe('2026-07-15');
  });

  it('maneja fechas con hora midnight', () => {
    const date = new Date('2026-12-25T00:00:00.000Z');
    expect(toDateInput(date)).toBe('2026-12-25');
  });
});
