// Elección de animación del protagonista y cálculo de cuadros de la hoja.
// Lógica pura, sin Phaser: la usan Preload (registra las animaciones) y
// PlayerPresenter (elige cuál reproducir). Nombres lógicos: documento técnico, 6.5.

/** Clave de la textura del protagonista en Phaser. */
export const PROTAGONIST_SHEET_KEY = 'protagonist';

export type PlayerAnimationName = 'idle' | 'run' | 'jump_up' | 'fall';

/** Clave de una animación en Phaser: una por hoja y nombre lógico. */
export function animationKey(sheetKey: string, name: string): string {
  return `${sheetKey}:${name}`;
}

/**
 * Animación que corresponde al estado del protagonista.
 * "air" se reparte por la velocidad vertical: subiendo (vy < 0) es jump_up;
 * en el punto más alto (vy = 0) y bajando es fall. Un estado desconocido usa idle.
 */
export function playerAnimationName(state: string, vy: number): PlayerAnimationName {
  if (state === 'run') return 'run';
  if (state === 'air') return vy < 0 ? 'jump_up' : 'fall';
  return 'idle';
}

/**
 * Rango de cuadros (numerados de izquierda a derecha y de arriba abajo, desde 0)
 * de una animación que ocupa una fila de la hoja. Es lo que espera
 * generateFrameNumbers de Phaser.
 */
export function frameRange(row: number, frames: number, columns: number): { start: number; end: number } {
  if (!Number.isInteger(row) || row < 0) throw new RangeError(`fila inválida: ${row}`);
  if (!Number.isInteger(frames) || frames < 1) throw new RangeError(`cantidad de cuadros inválida: ${frames}`);
  if (!Number.isInteger(columns) || columns < frames) {
    throw new RangeError(`la hoja tiene ${columns} columnas y la animación pide ${frames} cuadros`);
  }
  const start = row * columns;
  return { start, end: start + frames - 1 };
}
