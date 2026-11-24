// Datos de un nivel y su validación. Lógica pura, sin Phaser.
// Todo se expresa en tiles; la conversión a píxeles se hace al construir el nivel.

export interface SolidRect {
  col: number;
  row: number;
  /** Ancho en tiles. */
  w: number;
  /** Alto en tiles. */
  h: number;
}

export interface LevelData {
  name: string;
  /** Lado de un tile en píxeles. */
  tileSize: number;
  cols: number;
  rows: number;
  /** Tile donde se apoyan los pies al aparecer (el suelo está en row + 1). */
  spawn: { col: number; row: number };
  solids: SolidRect[];
}

export interface PixelRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function tileRectToPixels(rect: SolidRect, tileSize: number): PixelRect {
  return {
    x: rect.col * tileSize,
    y: rect.row * tileSize,
    width: rect.w * tileSize,
    height: rect.h * tileSize,
  };
}

export function levelSizePx(level: LevelData): { width: number; height: number } {
  return { width: level.cols * level.tileSize, height: level.rows * level.tileSize };
}

/** Posición de los pies (centro del tile, borde inferior) al aparecer. */
export function spawnPositionPx(level: LevelData): { x: number; feetY: number } {
  return {
    x: level.spawn.col * level.tileSize + level.tileSize / 2,
    feetY: (level.spawn.row + 1) * level.tileSize,
  };
}

export function isSolidTile(level: LevelData, col: number, row: number): boolean {
  return level.solids.some(
    (s) => col >= s.col && col < s.col + s.w && row >= s.row && row < s.row + s.h,
  );
}

/** Devuelve la lista de errores del nivel (vacía si es válido). */
export function validateLevel(level: LevelData): string[] {
  const errors: string[] = [];
  const isPositiveInt = (n: number) => Number.isInteger(n) && n > 0;

  if (!(level.tileSize > 0)) errors.push('tileSize debe ser mayor que 0');
  if (!isPositiveInt(level.cols) || !isPositiveInt(level.rows)) {
    errors.push('cols y rows deben ser enteros positivos');
    return errors;
  }

  level.solids.forEach((s, i) => {
    const label = `solids[${i}]`;
    if (![s.col, s.row, s.w, s.h].every(Number.isInteger)) {
      errors.push(`${label}: col, row, w y h deben ser enteros`);
      return;
    }
    if (s.w <= 0 || s.h <= 0) errors.push(`${label}: w y h deben ser mayores que 0`);
    if (s.col < 0 || s.row < 0 || s.col + s.w > level.cols || s.row + s.h > level.rows) {
      errors.push(`${label}: queda fuera del nivel`);
    }
  });

  const { col, row } = level.spawn;
  if (col < 0 || col >= level.cols || row < 1 || row + 1 >= level.rows) {
    errors.push('spawn queda fuera del nivel');
  } else {
    // El protagonista de prueba ocupa 2 tiles de alto y necesita suelo debajo.
    if (isSolidTile(level, col, row)) errors.push('spawn: el tile de los pies es sólido');
    if (isSolidTile(level, col, row - 1)) errors.push('spawn: el tile de la cabeza es sólido');
    if (!isSolidTile(level, col, row + 1)) errors.push('spawn: no hay suelo debajo de los pies');
  }

  return errors;
}
