import { describe, expect, it } from 'vitest';
import { resolveDamage } from '../src/logic/combat/DamageResolution';
import { createHealth } from '../src/logic/health/HealthModel';

describe('resolveDamage', () => {
  it('sin escudo, el golpe baja la vida', () => {
    const h = createHealth(100);
    const r = resolveDamage(h, 25);
    expect(r).toEqual({ absorbed: false, dealt: 25, depleted: false });
    expect(h.current).toBe(75);
  });

  it('si el escudo absorbe, la vida no cambia', () => {
    const h = createHealth(100);
    const r = resolveDamage(h, 25, () => true);
    expect(r).toEqual({ absorbed: true, dealt: 0, depleted: false });
    expect(h.current).toBe(100);
  });

  it('si el escudo no puede absorber, el golpe llega a la vida', () => {
    const h = createHealth(100);
    const r = resolveDamage(h, 25, () => false);
    expect(r.absorbed).toBe(false);
    expect(h.current).toBe(75);
  });

  it('un golpe sin daño no gasta el escudo', () => {
    const h = createHealth(100);
    let calls = 0;
    const r = resolveDamage(h, 0, () => {
      calls++;
      return true;
    });
    expect(calls).toBe(0);
    expect(r).toEqual({ absorbed: false, dealt: 0, depleted: false });
  });

  it('avisa cuando la vida llega a 0 y no cuenta más daño del que había', () => {
    const h = createHealth(100);
    h.current = 20;
    const r = resolveDamage(h, 25);
    expect(r).toEqual({ absorbed: false, dealt: 20, depleted: true });
    expect(h.current).toBe(0);
  });
});
