import { describe, expect, it } from 'vitest';
import {
  hasErrors,
  impactFramesFromTiming,
  parseAttackTimings,
  parseManifest,
  validateAttackTimings,
  validateSheet,
} from '../src/logic/assets/AssetValidator';
import type { Issue, Manifest, RgbaImage } from '../src/logic/assets/AssetValidator';
import { buildSample } from '../tools/sample-data';

const codes = (issues: Issue[]): string[] => issues.map((i) => i.code);
const errorCodes = (issues: Issue[]): string[] => issues.filter((i) => i.severity === 'error').map((i) => i.code);
const warningCodes = (issues: Issue[]): string[] => issues.filter((i) => i.severity === 'warning').map((i) => i.code);

function clone(image: RgbaImage): RgbaImage {
  return { ...image, data: new Uint8Array(image.data) };
}

function setAlpha(image: RgbaImage, x: number, y: number, alpha: number): void {
  image.data[(y * image.width + x) * 4 + 3] = alpha;
}

function clearCell(image: RgbaImage, col: number, row: number, size = 64): void {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) setAlpha(image, col * size + x, row * size + y, 0);
  }
}

function paintPixel(image: RgbaImage, x: number, y: number): void {
  const o = (y * image.width + x) * 4;
  image.data[o] = 255;
  image.data[o + 1] = 255;
  image.data[o + 2] = 255;
  image.data[o + 3] = 255;
}

function manifestWith(patch: (m: Manifest) => void): Manifest {
  const m = structuredClone(buildSample().manifest);
  patch(m);
  return m;
}

describe('hoja de muestra', () => {
  it('es válida por construcción: sin errores ni avisos', () => {
    const { manifest, image } = buildSample();
    expect(validateSheet(manifest, image)).toEqual([]);
  });

  it('su manifiesto pasa parseManifest sin problemas', () => {
    const { manifest } = buildSample();
    const result = parseManifest(JSON.parse(JSON.stringify(manifest)));
    expect(result.issues).toEqual([]);
    expect(result.manifest).toEqual(manifest);
  });
});

describe('parseManifest', () => {
  it('rechaza algo que no es un objeto', () => {
    const { manifest, issues } = parseManifest([1, 2]);
    expect(manifest).toBe(null);
    expect(errorCodes(issues)).toEqual(['MANIFEST_TYPE']);
  });

  it('exige orientación a la derecha', () => {
    const raw = { ...buildSample().manifest, facing: 'left' };
    expect(errorCodes(parseManifest(raw).issues)).toEqual(['MANIFEST_FACING']);
  });

  it('exige que sheet sea un .png', () => {
    const raw = { ...buildSample().manifest, sheet: 'protagonist.jpg' };
    expect(errorCodes(parseManifest(raw).issues)).toEqual(['MANIFEST_SHEET']);
  });

  it('avisa si el nombre del archivo no sigue la convención', () => {
    const raw = { ...buildSample().manifest, sheet: 'Protagonist Final.png' };
    const result = parseManifest(raw);
    expect(warningCodes(result.issues)).toEqual(['FILE_NAME']);
    expect(result.manifest === null).toBe(false);
  });

  it('rechaza un pivote fuera de la celda', () => {
    const raw = { ...buildSample().manifest, pivot: { x: 32, y: 99 } };
    expect(errorCodes(parseManifest(raw).issues)).toEqual(['MANIFEST_PIVOT']);
  });

  it('avisa si el pivote no está centrado en horizontal', () => {
    const raw = { ...buildSample().manifest, pivot: { x: 20, y: 64 } };
    expect(warningCodes(parseManifest(raw).issues)).toEqual(['PIVOT_X']);
  });

  it('rechaza un impact fuera de los cuadros de la animación', () => {
    const raw = structuredClone(buildSample().manifest);
    raw.animations.attack_1.impact = { from: 3, to: 5 }; // la animación tiene 5 cuadros: 0 a 4
    expect(errorCodes(parseManifest(raw).issues)).toEqual(['ANIM_IMPACT']);
  });

  it('rechaza un impact con from mayor que to', () => {
    const raw = structuredClone(buildSample().manifest);
    raw.animations.attack_1.impact = { from: 3, to: 2 };
    expect(errorCodes(parseManifest(raw).issues)).toEqual(['ANIM_IMPACT']);
  });

  it('rechaza fps y frames inválidos', () => {
    const raw = structuredClone(buildSample().manifest);
    raw.animations.run.fps = 0;
    raw.animations.idle.frames = 2.5;
    const result = parseManifest(raw);
    expect(result.manifest).toBe(null);
    expect(errorCodes(result.issues)).toEqual(['ANIM_DEF', 'ANIM_DEF']);
  });

  it('avisa de nombres de animación fuera de la lista', () => {
    const raw = structuredClone(buildSample().manifest);
    raw.animations.salto_raro = { row: 0, frames: 1, fps: 1, loop: false };
    const result = parseManifest(raw);
    expect(warningCodes(result.issues)).toEqual(['ANIM_NAME']);
    expect(result.manifest === null).toBe(false);
  });

  it('exige al menos una animación', () => {
    const raw = { ...buildSample().manifest, animations: {} };
    expect(errorCodes(parseManifest(raw).issues)).toEqual(['MANIFEST_ANIMATIONS']);
  });
});

describe('validateSheet', () => {
  it('detecta un PNG sin canal alfa', () => {
    const { manifest, image } = buildSample();
    expect(errorCodes(validateSheet(manifest, { ...image, hasAlphaChannel: false }))).toEqual(['NO_ALPHA']);
  });

  it('detecta una hoja que no es múltiplo de la celda', () => {
    const { manifest } = buildSample();
    const bad: RgbaImage = { width: 385, height: 320, data: new Uint8Array(385 * 320 * 4), hasAlphaChannel: true };
    expect(errorCodes(validateSheet(manifest, bad))).toEqual(['SHEET_SIZE']);
  });

  it('detecta una animación en una fila que no existe', () => {
    const { image } = buildSample();
    const manifest = manifestWith((m) => {
      m.animations.fall.row = 9;
    });
    expect(errorCodes(validateSheet(manifest, image))).toEqual(['ANIM_ROW']);
  });

  it('detecta más cuadros que columnas', () => {
    const { image } = buildSample();
    const manifest = manifestWith((m) => {
      m.animations.run.frames = 7; // la hoja tiene 6 columnas
    });
    expect(errorCodes(validateSheet(manifest, image))).toEqual(['ANIM_FRAMES']);
  });

  it('detecta dos animaciones en la misma fila', () => {
    const { image } = buildSample();
    const manifest = manifestWith((m) => {
      m.animations.fall.row = m.animations.jump_up.row;
    });
    expect(errorCodes(validateSheet(manifest, image))).toEqual(['ANIM_ROW_SHARED']);
  });

  it('exige impact en los ataques', () => {
    const { image } = buildSample();
    const manifest = manifestWith((m) => {
      delete m.animations.attack_1.impact;
    });
    expect(errorCodes(validateSheet(manifest, image))).toEqual(['MISSING_IMPACT']);
  });

  it('detecta un cuadro vacío dentro de los declarados', () => {
    const { manifest, image } = buildSample();
    const broken = clone(image);
    clearCell(broken, 1, 0); // idle, cuadro 1
    const issues = validateSheet(manifest, broken);
    expect(errorCodes(issues)).toEqual(['FRAME_EMPTY']);
    expect(issues[0].message.includes('1')).toBe(true);
  });

  it('detecta dibujo en cuadros que el manifiesto no declara', () => {
    const { manifest, image } = buildSample();
    const broken = clone(image);
    paintPixel(broken, 5 * 64 + 10, 0 * 64 + 10); // idle declara 4 cuadros; esto cae en el cuadro 5
    expect(errorCodes(validateSheet(manifest, broken))).toEqual(['FRAME_EXTRA']);
  });

  it('avisa de filas con dibujo que nadie usa', () => {
    const { image } = buildSample();
    const manifest = manifestWith((m) => {
      delete m.animations.fall; // la fila 4 queda con dibujo y sin animación
    });
    expect(warningCodes(validateSheet(manifest, image))).toEqual(['ROW_UNUSED']);
  });

  it('detecta píxeles semitransparentes y dice dónde está el primero', () => {
    const { manifest, image } = buildSample();
    const broken = clone(image);
    setAlpha(broken, 2 * 64 + 30, 1 * 64 + 40, 128); // fila 1 (run), cuadro 2, píxel (30,40): está en el cuerpo
    const issues = validateSheet(manifest, broken);
    expect(errorCodes(issues)).toEqual(['SEMI_ALPHA']);
    expect(issues[0].message.includes('fila 1, cuadro 2, píxel (30, 40)')).toBe(true);
  });

  it('avisa si los pies no apoyan en el pivote', () => {
    const { manifest, image } = buildSample();
    const broken = clone(image);
    // idle, cuadro 0: borrar las 4 filas inferiores del cuerpo → los pies quedan 4 px por encima.
    for (let y = 60; y < 64; y++) for (let x = 0; x < 64; x++) setAlpha(broken, x, y, 0);
    const issues = validateSheet(manifest, broken);
    expect(errorCodes(issues)).toEqual([]);
    expect(warningCodes(issues)).toEqual(['PIVOT_FEET']);
  });

  it('no exige apoyo en el suelo a las animaciones en el aire', () => {
    const { manifest, image } = buildSample();
    // jump_up y fall de la muestra levantan el cuerpo 6 y 4 px y no deben avisar.
    expect(warningCodes(validateSheet(manifest, image))).toEqual([]);
  });

  it('tolera 1 px de diferencia en los pies', () => {
    const { manifest, image } = buildSample();
    const slightly = clone(image);
    for (let x = 0; x < 64; x++) setAlpha(slightly, x, 63, 0); // idle, cuadro 0: borra la última fila → 1 px
    expect(warningCodes(validateSheet(manifest, slightly))).toEqual([]);
  });

  it('un cuadro vacío no genera además un aviso de pivote', () => {
    const { manifest, image } = buildSample();
    const broken = clone(image);
    clearCell(broken, 0, 1);
    expect(codes(validateSheet(manifest, broken))).toEqual(['FRAME_EMPTY']);
  });
});

describe('sincronización de golpe', () => {
  const { manifest } = buildSample(); // attack_1: 14 fps, impact 2 a 3

  it('convierte milisegundos en cuadros', () => {
    expect(impactFramesFromTiming({ impactStartMs: 150, impactEndMs: 280 }, 14)).toEqual({ from: 2, to: 3 });
    expect(impactFramesFromTiming({ impactStartMs: 0, impactEndMs: 10 }, 14)).toEqual({ from: 0, to: 0 });
  });

  it('acepta datos que coinciden con el manifiesto', () => {
    expect(validateAttackTimings(manifest, buildSample().attacks)).toEqual([]);
  });

  it('acepta una diferencia de un cuadro', () => {
    // 220–350 ms a 14 fps → cuadros 3 a 4: ambos a 1 de distancia de 2 a 3.
    const issues = validateAttackTimings(manifest, { attack_1: { impactStartMs: 220, impactEndMs: 350 } });
    expect(issues).toEqual([]);
  });

  it('rechaza una diferencia de más de un cuadro', () => {
    // 0–60 ms a 14 fps → cuadro 0 a 0: el inicio está a 2 cuadros de distancia (tolerancia: 1).
    const issues = validateAttackTimings(manifest, { attack_1: { impactStartMs: 0, impactEndMs: 60 } });
    expect(errorCodes(issues)).toEqual(['IMPACT_SYNC']);
    expect(issues[0].owner).toBe('ambos');
  });

  it('detecta una ventana que termina después de la animación', () => {
    // attack_1 dura 5/14 s ≈ 357 ms
    const issues = validateAttackTimings(manifest, { attack_1: { impactStartMs: 150, impactEndMs: 500 } });
    expect(errorCodes(issues)).toEqual(['IMPACT_OUTSIDE']);
  });

  it('ignora ataques que no están en la hoja', () => {
    expect(validateAttackTimings(manifest, { attack_9: { impactStartMs: 0, impactEndMs: 50 } })).toEqual([]);
  });
});

describe('parseAttackTimings', () => {
  it('acepta tiempos válidos', () => {
    const result = parseAttackTimings({ attack_1: { impactStartMs: 150, impactEndMs: 280 } });
    expect(result.issues).toEqual([]);
    expect(result.timings).toEqual({ attack_1: { impactStartMs: 150, impactEndMs: 280 } });
  });

  it('rechaza inicio mayor o igual al fin y valores no numéricos', () => {
    const result = parseAttackTimings({
      attack_1: { impactStartMs: 300, impactEndMs: 300 },
      attack_2: { impactStartMs: 'x', impactEndMs: 10 },
    });
    expect(errorCodes(result.issues)).toEqual(['ATTACKS_DEF', 'ATTACKS_DEF']);
    expect(result.timings).toEqual({});
  });

  it('rechaza algo que no es un objeto', () => {
    expect(hasErrors(parseAttackTimings(null).issues)).toBe(true);
  });
});
