// Hoja de muestra, válida por construcción, para probar el validador y para que Gemini
// vea un ejemplo exacto del contrato visual. Es una figura geométrica, NO es arte del juego.

import type { AttackTimings, Manifest, RgbaImage } from '../src/logic/assets/AssetValidator';

const CELL = 64;
const COLS = 6;
const ROWS = 5;

const BODY: [number, number, number, number] = [220, 224, 240, 255];
const DARK: [number, number, number, number] = [32, 35, 58, 255];

function fillRect(
  image: RgbaImage,
  x: number,
  y: number,
  w: number,
  h: number,
  color: [number, number, number, number],
): void {
  for (let py = y; py < y + h; py++) {
    for (let px = x; px < x + w; px++) {
      const o = (py * image.width + px) * 4;
      image.data[o] = color[0];
      image.data[o + 1] = color[1];
      image.data[o + 2] = color[2];
      image.data[o + 3] = color[3];
    }
  }
}

/** Dibuja un muñeco con los pies en el borde inferior de la celda (o `lift` px más arriba). */
function drawFigure(image: RgbaImage, col: number, row: number, lift: number, armLength: number, bob: number): void {
  const x0 = col * CELL;
  const y0 = row * CELL;
  const feet = y0 + CELL - lift; // primera fila fuera del cuerpo
  fillRect(image, x0 + 26, feet - 30, 12, 30, BODY); // cuerpo
  fillRect(image, x0 + 28, feet - 38 + bob, 8, 8, BODY); // cabeza (se mueve un píxel)
  fillRect(image, x0 + 33, feet - 35 + bob, 2, 2, DARK); // ojo: marca hacia dónde mira
  if (armLength > 0) fillRect(image, x0 + 38, feet - 22, armLength, 4, BODY); // brazo extendido
}

export interface Sample {
  image: RgbaImage;
  manifest: Manifest;
  attacks: AttackTimings;
}

export function buildSample(): Sample {
  const image: RgbaImage = {
    width: COLS * CELL,
    height: ROWS * CELL,
    data: new Uint8Array(COLS * CELL * ROWS * CELL * 4),
    hasAlphaChannel: true,
  };

  for (let f = 0; f < 4; f++) drawFigure(image, f, 0, 0, 0, f % 2); // idle
  for (let f = 0; f < 6; f++) drawFigure(image, f, 1, 0, 0, f % 2); // run
  for (let f = 0; f < 5; f++) drawFigure(image, f, 2, 0, f === 2 || f === 3 ? 14 : 0, 0); // attack_1 (impacto 2 a 3)
  for (let f = 0; f < 2; f++) drawFigure(image, f, 3, 6, 0, 0); // jump_up (en el aire)
  for (let f = 0; f < 2; f++) drawFigure(image, f, 4, 4, 0, 0); // fall (en el aire)

  const manifest: Manifest = {
    sheet: 'protagonist_sample.png',
    frameWidth: CELL,
    frameHeight: CELL,
    facing: 'right',
    pivot: { x: CELL / 2, y: CELL },
    animations: {
      idle: { row: 0, frames: 4, fps: 6, loop: true },
      run: { row: 1, frames: 6, fps: 10, loop: true },
      attack_1: { row: 2, frames: 5, fps: 14, loop: false, impact: { from: 2, to: 3 } },
      jump_up: { row: 3, frames: 2, fps: 8, loop: false },
      fall: { row: 4, frames: 2, fps: 8, loop: true },
    },
  };

  // 150–280 ms a 14 fps cubre los cuadros 2 y 3, igual que "impact" del manifiesto.
  const attacks: AttackTimings = { attack_1: { impactStartMs: 150, impactEndMs: 280 } };

  return { image, manifest, attacks };
}
