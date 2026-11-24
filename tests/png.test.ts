import { describe, expect, it } from 'vitest';
import { decodePng, encodePng } from '../tools/png';
import type { RgbaImage } from '../src/logic/assets/AssetValidator';

function gradient(width: number, height: number): RgbaImage {
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      data[o] = (x * 37) & 255;
      data[o + 1] = (y * 91) & 255;
      data[o + 2] = (x * y) & 255;
      data[o + 3] = (x + y) % 3 === 0 ? 0 : (x + y) % 3 === 1 ? 255 : 128;
    }
  }
  return { width, height, data, hasAlphaChannel: true };
}

describe('png', () => {
  it('escribir y leer devuelve exactamente la misma imagen', () => {
    const original = gradient(37, 23);
    const decoded = decodePng(encodePng(original));
    expect(decoded.width).toBe(37);
    expect(decoded.height).toBe(23);
    expect(decoded.hasAlphaChannel).toBe(true);
    expect(Array.from(decoded.data)).toEqual(Array.from(original.data));
  });

  it('rechaza un archivo que no es PNG', () => {
    expect(() => decodePng(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9]))).toThrow('No es un archivo PNG');
  });

  it('rechaza un PNG truncado', () => {
    const bytes = encodePng(gradient(8, 8));
    expect(() => decodePng(bytes.subarray(0, bytes.length - 20))).toThrow();
  });

  it('rechaza un PNG entrelazado con un mensaje claro', () => {
    const bytes = encodePng(gradient(4, 4));
    bytes[8 + 8 + 12] = 1; // byte "interlace" de la cabecera IHDR
    expect(() => decodePng(bytes)).toThrow('entrelazado');
  });
});
