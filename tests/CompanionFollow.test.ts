import { describe, expect, it } from 'vitest';
import { followTarget, stepFollow } from '../src/logic/companion/CompanionFollow';
import type { FollowStats } from '../src/logic/companion/CompanionFollow';
import companion from '../src/data/companion_stats.json';

const flat: FollowStats = { ...companion.follow, bobAmplitude: 0 };

describe('followTarget', () => {
  it('queda detrás del protagonista según hacia dónde mira', () => {
    const right = followTarget({ feetX: 100, feetY: 200, facing: 1 }, flat, 0);
    const left = followTarget({ feetX: 100, feetY: 200, facing: -1 }, flat, 0);
    expect(right.x).toBe(100 - flat.offsetX);
    expect(left.x).toBe(100 + flat.offsetX);
  });

  it('la silla flota sobre el nivel de los pies', () => {
    const t = followTarget({ feetX: 100, feetY: 200, facing: 1 }, flat, 0);
    expect(t.y).toBe(200 - flat.offsetY);
  });

  it('la oscilación nunca pasa de su amplitud', () => {
    const stats: FollowStats = { ...flat, bobAmplitude: 1.5 };
    for (let t = 0; t < 5; t += 0.05) {
      const target = followTarget({ feetX: 0, feetY: 100, facing: 1 }, stats, t);
      expect(Math.abs(target.y - (100 - stats.offsetY))).toBeLessThanOrEqual(1.5 + 1e-9);
    }
  });
});

describe('stepFollow', () => {
  it('se acerca al destino sin pasarse', () => {
    const pos = { x: 0, y: 0 };
    const target = { x: 100, y: 50 };
    let previous = 0;
    for (let i = 0; i < 120; i++) {
      stepFollow(pos, target, 6, 1 / 60);
      expect(pos.x).toBeGreaterThan(previous);
      expect(pos.x).toBeLessThan(100.0001);
      previous = pos.x;
    }
    expect(pos.x).toBeCloseTo(100, 1);
    expect(pos.y).toBeCloseTo(50, 1);
  });

  it('tiene retraso: en un solo paso no llega', () => {
    const pos = { x: 0, y: 0 };
    stepFollow(pos, { x: 100, y: 0 }, 6, 1 / 60);
    expect(pos.x).toBeGreaterThan(0);
    expect(pos.x).toBeLessThan(20);
  });

  it('da el mismo resultado a 60 y a 144 cuadros por segundo', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 0, y: 0 };
    for (let i = 0; i < 60; i++) stepFollow(a, { x: 100, y: 0 }, 6, 1 / 60);
    for (let i = 0; i < 144; i++) stepFollow(b, { x: 100, y: 0 }, 6, 1 / 144);
    expect(a.x).toBeCloseTo(b.x, 6);
  });

  it('sin diferencia, no se mueve', () => {
    const pos = { x: 10, y: 20 };
    stepFollow(pos, { x: 10, y: 20 }, 6, 1 / 60);
    expect(pos).toEqual({ x: 10, y: 20 });
  });
});
