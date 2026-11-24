import { describe, expect, it } from 'vitest';
import {
  applyDamage,
  applyHeal,
  createHealth,
  healthRatio,
  isDepleted,
} from '../src/logic/health/HealthModel';

describe('HealthModel', () => {
  it('empieza con la vida completa', () => {
    expect(createHealth(100)).toEqual({ current: 100, max: 100 });
  });

  it('rechaza una vida máxima inválida', () => {
    expect(() => createHealth(0)).toThrow();
    expect(() => createHealth(-5)).toThrow();
    expect(() => createHealth(Number.NaN)).toThrow();
  });

  it('el daño resta vida y devuelve lo que se perdió', () => {
    const h = createHealth(100);
    expect(applyDamage(h, 25)).toBe(25);
    expect(h.current).toBe(75);
  });

  it('el daño no baja de 0 y devuelve solo la vida que había', () => {
    const h = createHealth(100);
    h.current = 10;
    expect(applyDamage(h, 25)).toBe(10);
    expect(h.current).toBe(0);
    expect(isDepleted(h)).toBe(true);
  });

  it('la curación suma vida y devuelve lo que se recuperó', () => {
    const h = createHealth(100);
    h.current = 30;
    expect(applyHeal(h, 40)).toBe(40);
    expect(h.current).toBe(70);
  });

  it('la curación no pasa del máximo', () => {
    const h = createHealth(100);
    h.current = 90;
    expect(applyHeal(h, 40)).toBe(10);
    expect(h.current).toBe(100);
  });

  it('los valores no válidos no hacen nada', () => {
    const h = createHealth(100);
    expect(applyDamage(h, -10)).toBe(0);
    expect(applyDamage(h, Number.NaN)).toBe(0);
    expect(applyHeal(h, Number.POSITIVE_INFINITY)).toBe(0);
    expect(h.current).toBe(100);
  });

  it('healthRatio devuelve la fracción de vida', () => {
    const h = createHealth(100);
    h.current = 25;
    expect(healthRatio(h)).toBe(0.25);
    expect(isDepleted(h)).toBe(false);
  });
});
