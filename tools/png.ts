// Lectura y escritura de PNG sin dependencias (solo node:zlib). Solo para herramientas de
// desarrollo; el juego no usa este archivo.
//
// Lee PNG de todos los tipos habituales: gris, gris+alfa, RGB, RGBA e indexado (paleta, con o
// sin tRNS), de 1 a 16 bits, sin entrelazado. Escribe siempre RGBA de 8 bits.

import { deflateSync, inflateSync } from 'node:zlib';
import type { RgbaImage } from '../src/logic/assets/AssetValidator';

const SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

const CHANNELS: Record<number, number> = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };

function paeth(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  return pb <= pc ? b : c;
}

export function decodePng(bytes: Uint8Array): RgbaImage {
  for (let i = 0; i < SIGNATURE.length; i++) {
    if (bytes[i] !== SIGNATURE[i]) throw new Error('No es un archivo PNG válido.');
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = -1;
  let interlace = 0;
  let palette: Uint8Array | null = null;
  let trns: Uint8Array | null = null;
  const idat: Uint8Array[] = [];

  let pos = SIGNATURE.length;
  while (pos + 8 <= bytes.length) {
    const length = view.getUint32(pos);
    const type = String.fromCharCode(bytes[pos + 4], bytes[pos + 5], bytes[pos + 6], bytes[pos + 7]);
    const start = pos + 8;
    if (start + length > bytes.length) throw new Error('El PNG está truncado (archivo incompleto).');
    const data = bytes.subarray(start, start + length);
    pos = start + length + 4; // datos + CRC

    if (type === 'IHDR') {
      width = view.getUint32(start);
      height = view.getUint32(start + 4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === 'PLTE') {
      palette = data;
    } else if (type === 'tRNS') {
      trns = data;
    } else if (type === 'IDAT') {
      idat.push(data);
    } else if (type === 'IEND') {
      break;
    }
  }

  const channels = CHANNELS[colorType];
  if (width === 0 || height === 0 || channels === undefined) throw new Error('El PNG tiene una cabecera inválida.');
  if (![1, 2, 4, 8, 16].includes(bitDepth)) throw new Error(`Profundidad de bits no soportada: ${bitDepth}.`);
  if (interlace !== 0) {
    throw new Error('El PNG está entrelazado (Adam7). Exportalo sin entrelazado.');
  }
  if (colorType === 3 && !palette) throw new Error('El PNG indexado no tiene paleta.');

  const bitsPerPixel = channels * bitDepth;
  const bytesPerPixel = Math.max(1, bitsPerPixel >> 3);
  const rowBytes = Math.ceil((width * bitsPerPixel) / 8);

  const raw = new Uint8Array(inflateSync(Buffer.concat(idat)));
  if (raw.length < (rowBytes + 1) * height) throw new Error('El PNG tiene los datos de imagen incompletos.');

  // Deshacer los filtros de cada fila.
  const pixels = new Uint8Array(rowBytes * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (rowBytes + 1)];
    const src = y * (rowBytes + 1) + 1;
    const out = y * rowBytes;
    for (let i = 0; i < rowBytes; i++) {
      const x = raw[src + i];
      const a = i >= bytesPerPixel ? pixels[out + i - bytesPerPixel] : 0;
      const b = y > 0 ? pixels[out - rowBytes + i] : 0;
      const c = y > 0 && i >= bytesPerPixel ? pixels[out - rowBytes + i - bytesPerPixel] : 0;
      let value: number;
      switch (filter) {
        case 0:
          value = x;
          break;
        case 1:
          value = x + a;
          break;
        case 2:
          value = x + b;
          break;
        case 3:
          value = x + ((a + b) >> 1);
          break;
        case 4:
          value = x + paeth(a, b, c);
          break;
        default:
          throw new Error(`Filtro PNG desconocido (${filter}) en la fila ${y}.`);
      }
      pixels[out + i] = value & 255;
    }
  }

  const maxValue = (1 << bitDepth) - 1;
  const sample = (rowStart: number, index: number): number => {
    if (bitDepth === 8) return pixels[rowStart + index];
    if (bitDepth === 16) return (pixels[rowStart + 2 * index] << 8) | pixels[rowStart + 2 * index + 1];
    const bit = index * bitDepth;
    const shift = 8 - bitDepth - (bit & 7);
    return (pixels[rowStart + (bit >> 3)] >> shift) & maxValue;
  };
  const to8 = (v: number): number => (bitDepth === 16 ? v >> 8 : bitDepth === 8 ? v : Math.round((v * 255) / maxValue));
  const trns16 = (i: number): number => (trns && trns.length >= 2 * i + 2 ? (trns[2 * i] << 8) | trns[2 * i + 1] : -1);

  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    const rowStart = y * rowBytes;
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      let r: number;
      let g: number;
      let b: number;
      let a = 255;
      switch (colorType) {
        case 0: {
          const v = sample(rowStart, x);
          r = g = b = to8(v);
          if (v === trns16(0)) a = 0;
          break;
        }
        case 2: {
          const rv = sample(rowStart, x * 3);
          const gv = sample(rowStart, x * 3 + 1);
          const bv = sample(rowStart, x * 3 + 2);
          r = to8(rv);
          g = to8(gv);
          b = to8(bv);
          if (rv === trns16(0) && gv === trns16(1) && bv === trns16(2)) a = 0;
          break;
        }
        case 3: {
          const index = sample(rowStart, x);
          if (index * 3 + 2 >= palette!.length) throw new Error('El PNG usa un color que no está en la paleta.');
          r = palette![index * 3];
          g = palette![index * 3 + 1];
          b = palette![index * 3 + 2];
          if (trns && index < trns.length) a = trns[index];
          break;
        }
        case 4: {
          r = g = b = to8(sample(rowStart, x * 2));
          a = to8(sample(rowStart, x * 2 + 1));
          break;
        }
        default: {
          r = to8(sample(rowStart, x * 4));
          g = to8(sample(rowStart, x * 4 + 1));
          b = to8(sample(rowStart, x * 4 + 2));
          a = to8(sample(rowStart, x * 4 + 3));
        }
      }
      data[o] = r;
      data[o + 1] = g;
      data[o + 2] = b;
      data[o + 3] = a;
    }
  }

  return { width, height, data, hasAlphaChannel: colorType === 4 || colorType === 6 || trns !== null };
}

// ---------------------------------------------------------------------------
// Escritura (RGBA de 8 bits, sin filtro)
// ---------------------------------------------------------------------------

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (const byte of bytes) c = CRC_TABLE[(c ^ byte) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
  return out;
}

export function encodePng(image: RgbaImage): Uint8Array {
  const { width, height, data } = image;
  const rowBytes = width * 4;
  const raw = new Uint8Array((rowBytes + 1) * height);
  for (let y = 0; y < height; y++) {
    raw.set(data.subarray(y * rowBytes, (y + 1) * rowBytes), y * (rowBytes + 1) + 1);
  }

  const ihdr = new Uint8Array(13);
  const view = new DataView(ihdr.buffer);
  view.setUint32(0, width);
  view.setUint32(4, height);
  ihdr[8] = 8; // 8 bits por canal
  ihdr[9] = 6; // RGBA

  const parts = [
    new Uint8Array(SIGNATURE),
    chunk('IHDR', ihdr),
    chunk('IDAT', new Uint8Array(deflateSync(raw))),
    chunk('IEND', new Uint8Array(0)),
  ];
  const out = new Uint8Array(parts.reduce((sum, p) => sum + p.length, 0));
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}
