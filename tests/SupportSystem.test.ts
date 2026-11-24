import { describe, expect, it } from 'vitest';
import { EventBus } from '../src/core/EventBus';
import type { GameEvents } from '../src/core/GameEvents';
import companionJson from '../src/data/companion_stats.json';
import { Companion } from '../src/game/entities/companion/Companion';
import { SupportSystem } from '../src/game/systems/SupportSystem';
import { createHealth } from '../src/logic/health/HealthModel';

const DT = 1 / 60;
const HIT = companionJson.debugDamage;

function setup() {
  const bus = new EventBus<GameEvents>();
  const log: string[] = [];
  bus.on('health:changed', (e) => log.push(`health ${e.current}/${e.max} (${e.delta})`));
  bus.on('damage:dealt', (e) => log.push(`damage ${e.incoming}->${e.dealt} ${e.absorbed ? 'absorbido' : 'recibido'}`));
  bus.on('companion:healed', (e) => log.push(`healed ${e.amount}`));
  bus.on('companion:shieldAbsorbed', () => log.push('shield'));
  bus.on('companion:stateChanged', (e) => log.push(`state ${e.from}>${e.to}`));
  const health = createHealth(companionJson.playerMaxHealth);
  const support = new SupportSystem(companionJson, health, bus);
  return { support, health, log };
}

function tick(support: SupportSystem, seconds: number): void {
  for (let i = 0; i < Math.round(seconds / DT); i++) support.update(DT);
}

describe('SupportSystem', () => {
  it('el primer golpe lo absorbe el escudo y no baja la vida', () => {
    const { support, health } = setup();
    const r = support.damagePlayer(HIT);
    expect(r.absorbed).toBe(true);
    expect(health.current).toBe(100);
    expect(support.status()).toBe('shielding');
  });

  it('el segundo golpe seguido sí baja la vida', () => {
    const { support, health } = setup();
    support.damagePlayer(HIT);
    support.damagePlayer(HIT);
    expect(health.current).toBe(75);
  });

  it('la curación recupera 40 y luego hay que esperar 12 s', () => {
    const { support, health } = setup();
    support.damagePlayer(HIT);
    support.damagePlayer(HIT);
    support.damagePlayer(HIT);
    support.damagePlayer(HIT);
    expect(health.current).toBe(25);
    expect(support.requestHeal()).toEqual({ ok: true, healed: 40 });
    expect(health.current).toBe(65);
    expect(support.requestHeal()).toEqual({ ok: false, reason: 'cooldown' });
    tick(support, 12.1);
    expect(support.requestHeal()).toEqual({ ok: true, healed: 35 });
    expect(health.current).toBe(100);
  });

  it('con la vida completa, H no gasta la curación', () => {
    const { support } = setup();
    expect(support.requestHeal()).toEqual({ ok: false, reason: 'full_health' });
    expect(support.vitals().healSeconds).toBe(0);
  });

  it('el escudo vuelve a estar listo a los 8 s', () => {
    const { support, health } = setup();
    support.damagePlayer(HIT);
    tick(support, 8.1);
    const r = support.damagePlayer(HIT);
    expect(r.absorbed).toBe(true);
    expect(health.current).toBe(100);
  });

  it('la vida nunca baja de 0 y el protagonista no se rompe', () => {
    const { support, health } = setup();
    for (let i = 0; i < 20; i++) support.damagePlayer(HIT);
    expect(health.current).toBe(0);
    expect(support.vitals().healthRatio).toBe(0);
  });

  it('avisa por eventos, en orden', () => {
    const { support, log } = setup();
    support.damagePlayer(HIT);
    support.damagePlayer(HIT);
    expect(log).toEqual([
      'state null>idle',
      'damage 25->0 absorbido',
      'shield',
      'state idle>shielding',
      'damage 25->25 recibido',
      'health 75/100 (-25)',
    ]);
  });

  it('el estado pasa de escudo activo a recargando y a reposo', () => {
    const { support, log } = setup();
    support.damagePlayer(HIT);
    tick(support, 8.2);
    expect(log.filter((l) => l.startsWith('state'))).toEqual([
      'state null>idle',
      'state idle>shielding',
      'state shielding>recharging',
      'state recharging>idle',
    ]);
  });

  it('vitals refleja las recargas para la interfaz', () => {
    const { support } = setup();
    support.damagePlayer(HIT);
    support.damagePlayer(HIT);
    support.requestHeal();
    let v = support.vitals();
    expect(v.healReadyRatio).toBe(0);
    expect(v.shieldReadyRatio).toBe(0);
    expect(v.healSeconds).toBe(12);
    expect(v.shieldSeconds).toBe(8);
    tick(support, 4);
    v = support.vitals();
    expect(v.shieldReadyRatio).toBeCloseTo(0.5, 1);
    expect(v.healReadyRatio).toBeCloseTo(1 / 3, 1);
  });
});

describe('Companion', () => {
  const follow = { ...companionJson.follow, bobAmplitude: 0 };

  it('aparece directamente detrás del protagonista', () => {
    const c = new Companion(follow);
    c.update(DT, { feetX: 100, feetY: 200, facing: 1 });
    const s = c.snapshot();
    expect(s.x).toBe(100 - follow.offsetX);
    expect(s.y).toBe(200 - follow.offsetY);
    expect(s.facing).toBe(1);
  });

  it('sigue al protagonista con retraso', () => {
    const c = new Companion(follow);
    c.update(DT, { feetX: 100, feetY: 200, facing: 1 });
    c.update(DT, { feetX: 200, feetY: 200, facing: 1 });
    const s = c.snapshot();
    expect(s.x).toBeGreaterThan(80);
    expect(s.x).toBeLessThan(180);
  });

  it('al darse vuelta el protagonista, pasa al otro lado', () => {
    const c = new Companion(follow);
    c.update(DT, { feetX: 100, feetY: 200, facing: 1 });
    for (let i = 0; i < 180; i++) c.update(DT, { feetX: 100, feetY: 200, facing: -1 });
    const s = c.snapshot();
    expect(s.x).toBeCloseTo(100 + follow.offsetX, 0);
    expect(s.facing).toBe(-1);
  });
});
