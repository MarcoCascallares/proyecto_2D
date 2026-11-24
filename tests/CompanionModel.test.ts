import { describe, expect, it } from 'vitest';
import companionJson from '../src/data/companion_stats.json';
import {
  absorbHit,
  companionStatus,
  cooldownLabel,
  cooldownReadyRatio,
  createCompanionState,
  tickCompanion,
  tryHeal,
  validateCompanionData,
} from '../src/logic/companion/CompanionModel';
import type { CompanionStats } from '../src/logic/companion/CompanionModel';
import { createHealth } from '../src/logic/health/HealthModel';

// Valores de prueba aprobados el 24/11/2026 (documento técnico, 8.7).
const stats: CompanionStats = companionJson;
const DT = 1 / 60;

function run(seconds: number, state: ReturnType<typeof createCompanionState>): void {
  const steps = Math.round(seconds / DT);
  for (let i = 0; i < steps; i++) tickCompanion(state, stats, DT);
}

describe('valores de prueba', () => {
  it('son los aprobados', () => {
    expect(companionJson.playerMaxHealth).toBe(100);
    expect(companionJson.heal).toEqual({ amount: 40, cooldownSeconds: 12 });
    expect(companionJson.shield).toEqual({ hitsAbsorbed: 1, cooldownSeconds: 8 });
    expect(companionJson.debugDamage).toBe(25);
  });

  it('companion_stats.json es válido', () => {
    expect(validateCompanionData(companionJson)).toEqual([]);
  });
});

describe('curación', () => {
  it('recupera vida y entra en recarga', () => {
    const state = createCompanionState(stats);
    const h = createHealth(100);
    h.current = 30;
    expect(tryHeal(state, stats, h)).toEqual({ ok: true, healed: 40 });
    expect(h.current).toBe(70);
    expect(state.healCooldown).toBe(12);
  });

  it('no se puede curar durante la recarga', () => {
    const state = createCompanionState(stats);
    const h = createHealth(100);
    h.current = 10;
    tryHeal(state, stats, h);
    expect(tryHeal(state, stats, h)).toEqual({ ok: false, reason: 'cooldown' });
    expect(h.current).toBe(50);
  });

  it('con la vida completa no se gasta', () => {
    const state = createCompanionState(stats);
    const h = createHealth(100);
    expect(tryHeal(state, stats, h)).toEqual({ ok: false, reason: 'full_health' });
    expect(state.healCooldown).toBe(0);
  });

  it('solo cura lo que falta', () => {
    const state = createCompanionState(stats);
    const h = createHealth(100);
    h.current = 90;
    expect(tryHeal(state, stats, h)).toEqual({ ok: true, healed: 10 });
  });

  it('puede curar con la vida en 0', () => {
    const state = createCompanionState(stats);
    const h = createHealth(100);
    h.current = 0;
    expect(tryHeal(state, stats, h)).toEqual({ ok: true, healed: 40 });
  });

  it('vuelve a estar lista a los 12 segundos', () => {
    const state = createCompanionState(stats);
    const h = createHealth(100);
    h.current = 10;
    tryHeal(state, stats, h);
    run(11.9, state);
    expect(state.healCooldown).toBeGreaterThan(0);
    run(0.2, state);
    expect(state.healCooldown).toBe(0);
    expect(tryHeal(state, stats, h).ok).toBe(true);
  });
});

describe('escudo', () => {
  it('absorbe un golpe y entra en recarga', () => {
    const state = createCompanionState(stats);
    expect(absorbHit(state, stats)).toBe(true);
    expect(state.shieldCooldown).toBe(8);
  });

  it('un segundo golpe durante la recarga no se absorbe', () => {
    const state = createCompanionState(stats);
    absorbHit(state, stats);
    expect(absorbHit(state, stats)).toBe(false);
  });

  it('se recupera a los 8 segundos', () => {
    const state = createCompanionState(stats);
    absorbHit(state, stats);
    run(7.9, state);
    expect(absorbHit(state, stats)).toBe(false);
    run(0.2, state);
    expect(state.shieldCooldown).toBe(0);
    expect(absorbHit(state, stats)).toBe(true);
  });

  it('con más golpes, la recarga empieza al agotarlos', () => {
    const triple: CompanionStats = { ...stats, shield: { hitsAbsorbed: 3, cooldownSeconds: 8 } };
    const state = createCompanionState(triple);
    expect(absorbHit(state, triple)).toBe(true);
    expect(state.shieldCooldown).toBe(0);
    expect(absorbHit(state, triple)).toBe(true);
    expect(absorbHit(state, triple)).toBe(true);
    expect(state.shieldCooldown).toBe(8);
    expect(absorbHit(state, triple)).toBe(false);
  });
});

describe('estados', () => {
  it('en reposo cuando todo está listo', () => {
    expect(companionStatus(createCompanionState(stats))).toBe('idle');
  });

  it('curando durante el efecto y luego recargando', () => {
    const state = createCompanionState(stats);
    const h = createHealth(100);
    h.current = 10;
    tryHeal(state, stats, h);
    expect(companionStatus(state)).toBe('healing');
    run(0.6, state);
    expect(companionStatus(state)).toBe('recharging');
    run(12, state);
    expect(companionStatus(state)).toBe('idle');
  });

  it('escudo activo durante el efecto y luego recargando', () => {
    const state = createCompanionState(stats);
    absorbHit(state, stats);
    expect(companionStatus(state)).toBe('shielding');
    run(0.6, state);
    expect(companionStatus(state)).toBe('recharging');
    run(8, state);
    expect(companionStatus(state)).toBe('idle');
  });
});

describe('textos y proporciones de recarga', () => {
  it('cooldownReadyRatio va de 0 a 1', () => {
    expect(cooldownReadyRatio(12, 12)).toBe(0);
    expect(cooldownReadyRatio(6, 12)).toBe(0.5);
    expect(cooldownReadyRatio(0, 12)).toBe(1);
  });

  it('cooldownLabel dice "lista" o los segundos que faltan', () => {
    expect(cooldownLabel(0)).toBe('lista');
    expect(cooldownLabel(0.2)).toBe('1 s');
    expect(cooldownLabel(11.1)).toBe('12 s');
  });
});

describe('validateCompanionData', () => {
  it('detecta valores inválidos', () => {
    const bad = {
      ...companionJson,
      playerMaxHealth: 0,
      heal: { amount: -1, cooldownSeconds: 12 },
      shield: { hitsAbsorbed: 1.5, cooldownSeconds: -2 },
    };
    const errors = validateCompanionData(bad);
    expect(errors.length).toBe(4);
  });
});
