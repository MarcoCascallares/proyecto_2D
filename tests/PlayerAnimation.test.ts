import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { decodePng } from '../tools/png';
import { hasErrors, parseManifest, validateSheet } from '../src/logic/assets/AssetValidator';
import { animationKey, frameRange, playerAnimationName } from '../src/logic/assets/PlayerAnimation';

describe('playerAnimationName', () => {
  it('quieto y corriendo usan su animación', () => {
    expect(playerAnimationName('idle', 0)).toBe('idle');
    expect(playerAnimationName('run', 0)).toBe('run');
  });

  it('en el aire se reparte por la velocidad vertical', () => {
    expect(playerAnimationName('air', -120)).toBe('jump_up');
    expect(playerAnimationName('air', 0)).toBe('fall');
    expect(playerAnimationName('air', 250)).toBe('fall');
  });

  it('un estado desconocido usa idle', () => {
    expect(playerAnimationName('otra_cosa', -50)).toBe('idle');
  });
});

describe('frameRange', () => {
  it('numera los cuadros por fila, de izquierda a derecha', () => {
    expect(frameRange(0, 4, 6)).toEqual({ start: 0, end: 3 });
    expect(frameRange(1, 6, 6)).toEqual({ start: 6, end: 11 });
    expect(frameRange(2, 2, 6)).toEqual({ start: 12, end: 13 });
    expect(frameRange(3, 2, 6)).toEqual({ start: 18, end: 19 });
  });

  it('rechaza datos imposibles', () => {
    expect(() => frameRange(-1, 2, 6)).toThrow();
    expect(() => frameRange(0, 0, 6)).toThrow();
    expect(() => frameRange(0, 7, 6)).toThrow();
  });
});

describe('animationKey', () => {
  it('combina hoja y nombre lógico', () => {
    expect(animationKey('protagonist', 'run')).toBe('protagonist:run');
  });
});

describe('hoja del protagonista (assets/final)', () => {
  const manifestRaw: unknown = JSON.parse(readFileSync(new URL('../assets/final/protagonist.json', import.meta.url), 'utf-8'));
  const { manifest, issues: manifestIssues } = parseManifest(manifestRaw);

  it('el manifiesto es válido y trae las cuatro animaciones que usa el presenter', () => {
    expect(manifestIssues.filter((i) => i.severity === 'error')).toHaveLength(0);
    expect(manifest).not.toBeNull();
    const names = Object.keys(manifest?.animations ?? {});
    for (const n of ['idle', 'run', 'jump_up', 'fall']) expect(names).toContain(n);
  });

  it('la hoja cumple el contrato visual (sin errores del validador)', () => {
    if (manifest === null) throw new Error('manifiesto inválido');
    const image = decodePng(new Uint8Array(readFileSync(new URL('../assets/final/protagonist.png', import.meta.url))));
    expect(image.width).toBe(384);
    expect(image.height).toBe(256);
    expect(hasErrors(validateSheet(manifest, image))).toBe(false);
  });
});
