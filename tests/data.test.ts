import { describe, expect, it } from 'vitest';
import { ACTION_NAMES } from '../src/core/actions';
import keymap from '../src/data/keymap.json';
import level from '../src/data/levels/level_test.json';
import playerStats from '../src/data/player_stats.json';
import {
  isSolidTile,
  levelSizePx,
  spawnPositionPx,
  tileRectToPixels,
  validateLevel,
} from '../src/logic/world/LevelData';
import type { LevelData } from '../src/logic/world/LevelData';

describe('keymap.json', () => {
  it('define todas las acciones y ninguna de más', () => {
    expect(Object.keys(keymap).sort()).toEqual([...ACTION_NAMES].sort());
  });

  it('cada acción tiene al menos una tecla con nombre', () => {
    for (const action of ACTION_NAMES) {
      const keys = keymap[action];
      expect(keys.length).toBeGreaterThan(0);
      for (const key of keys) expect(key.length).toBeGreaterThan(0);
    }
  });

  it('ninguna tecla está asignada a dos acciones', () => {
    const all = ACTION_NAMES.flatMap((action) => keymap[action]);
    expect(new Set(all).size).toBe(all.length);
  });
});

describe('player_stats.json', () => {
  it('todos los valores son números finitos', () => {
    for (const value of Object.values(playerStats.movement)) {
      expect(Number.isFinite(value)).toBe(true);
    }
  });

  it('los valores tienen el signo y rango correctos', () => {
    const m = playerStats.movement;
    expect(m.maxSpeed).toBeGreaterThan(0);
    expect(m.acceleration).toBeGreaterThan(0);
    expect(m.braking).toBeGreaterThan(0);
    expect(m.gravity).toBeGreaterThan(0);
    expect(m.jumpVelocity).toBeLessThan(0);
    expect(m.jumpCutVelocity).toBeLessThan(0);
    expect(m.jumpCutVelocity).toBeGreaterThan(m.jumpVelocity);
    expect(m.maxFallSpeed).toBeGreaterThan(0);
    expect(m.airControl).toBeGreaterThan(0);
    expect(m.airControl).toBeLessThanOrEqual(1);
  });

  it('el cuerpo de prueba es el rectángulo de 16 × 32', () => {
    expect(playerStats.body).toEqual({ width: 16, height: 32 });
  });
});

describe('level_test.json', () => {
  const data = level as LevelData;

  it('es un nivel válido', () => {
    expect(validateLevel(data)).toEqual([]);
  });

  it('usa tiles de 20 px y mide 1600 × 360', () => {
    expect(data.tileSize).toBe(20);
    expect(levelSizePx(data)).toEqual({ width: 1600, height: 360 });
  });

  it('el protagonista aparece con los pies sobre el suelo', () => {
    const spawn = spawnPositionPx(data);
    expect(spawn).toEqual({ x: 70, feetY: 320 });
    expect(isSolidTile(data, data.spawn.col, data.spawn.row + 1)).toBe(true);
  });

  it('convierte tiles a píxeles', () => {
    expect(tileRectToPixels({ col: 2, row: 3, w: 4, h: 5 }, 20)).toEqual({
      x: 40,
      y: 60,
      width: 80,
      height: 100,
    });
  });
});

describe('validateLevel', () => {
  const base: LevelData = {
    name: 'x',
    tileSize: 20,
    cols: 10,
    rows: 10,
    spawn: { col: 2, row: 7 },
    solids: [{ col: 0, row: 8, w: 10, h: 2 }],
  };

  it('acepta un nivel mínimo correcto', () => {
    expect(validateLevel(base)).toEqual([]);
  });

  it('detecta un sólido fuera del nivel', () => {
    const errors = validateLevel({ ...base, solids: [{ col: 8, row: 8, w: 5, h: 2 }] });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('detecta un spawn sin suelo debajo', () => {
    const errors = validateLevel({ ...base, spawn: { col: 2, row: 4 } });
    expect(errors.some((e) => e.includes('suelo'))).toBe(true);
  });

  it('detecta un spawn dentro de un sólido', () => {
    const errors = validateLevel({
      ...base,
      solids: [...base.solids, { col: 2, row: 6, w: 1, h: 2 }],
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('detecta medidas no enteras', () => {
    const errors = validateLevel({ ...base, solids: [{ col: 0.5, row: 8, w: 3, h: 2 }] });
    expect(errors.length).toBeGreaterThan(0);
  });
});
