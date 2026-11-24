// Validador del contrato visual (documento técnico, sección 6). Lógica pura, sin Phaser
// ni acceso a archivos: recibe el manifiesto y la imagen ya decodificada.
// Lo usa tools/validate-assets.ts antes de integrar una hoja de Gemini.

export type Severity = 'error' | 'warning';
/** Quién debe corregir: el recurso (Gemini), la lógica/los datos (Claude) o cualquiera de los dos. */
export type Owner = 'gemini' | 'claude' | 'ambos';

export interface Issue {
  severity: Severity;
  owner: Owner;
  code: string;
  message: string;
}

/** Imagen decodificada. `data` son píxeles RGBA de 8 bits (4 bytes por píxel). */
export interface RgbaImage {
  width: number;
  height: number;
  data: Uint8Array;
  /** false si el PNG no tiene canal alfa ni tabla de transparencia. */
  hasAlphaChannel: boolean;
}

export interface ImpactFrames {
  from: number;
  to: number;
}

export interface AnimationDef {
  row: number;
  frames: number;
  fps: number;
  loop: boolean;
  impact?: ImpactFrames;
}

export interface Manifest {
  sheet: string;
  frameWidth: number;
  frameHeight: number;
  facing: 'right';
  pivot: { x: number; y: number };
  animations: Record<string, AnimationDef>;
}

/** Ventana de impacto de un ataque, en milisegundos desde que empieza la animación. */
export interface AttackTiming {
  impactStartMs: number;
  impactEndMs: number;
}
export type AttackTimings = Record<string, AttackTiming>;

/** Nombres lógicos de animación provisionales (documento técnico, 6.5). */
export const KNOWN_ANIMATIONS: readonly string[] = [
  'idle',
  'run',
  'jump_up',
  'fall',
  'attack_1',
  'attack_2',
  'attack_3',
  'ranged',
  'dodge',
  'hurt',
  'defeated',
];

/** Animaciones en el aire: no se exige que los pies toquen el pivote. */
const AIRBORNE: ReadonlySet<string> = new Set(['jump_up', 'fall']);

/** Diferencia máxima, en cuadros, entre la ventana de impacto de los datos y la del manifiesto (6.4). */
export const SYNC_TOLERANCE_FRAMES = 1;
/** Diferencia máxima, en píxeles, entre el punto más bajo del sprite y el pivote. */
export const FEET_TOLERANCE_PX = 1;

const FILE_NAME = /^[a-z0-9_]+\.png$/;
const EPS = 1e-9;

function issue(severity: Severity, owner: Owner, code: string, message: string): Issue {
  return { severity, owner, code, message };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const isInt = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value);
const isPositiveInt = (value: unknown): value is number => isInt(value) && value > 0;

export function hasErrors(issues: readonly Issue[]): boolean {
  return issues.some((i) => i.severity === 'error');
}

// ---------------------------------------------------------------------------
// Manifiesto
// ---------------------------------------------------------------------------

/** Comprueba la estructura del manifiesto. Si hay errores, `manifest` es null. */
export function parseManifest(raw: unknown): { manifest: Manifest | null; issues: Issue[] } {
  const issues: Issue[] = [];
  const err = (code: string, message: string) => issues.push(issue('error', 'gemini', code, message));

  if (!isRecord(raw)) {
    err('MANIFEST_TYPE', 'El manifiesto debe ser un objeto JSON.');
    return { manifest: null, issues };
  }

  const { sheet, frameWidth, frameHeight, facing, pivot, animations } = raw;

  if (typeof sheet !== 'string' || sheet.length === 0) {
    err('MANIFEST_SHEET', '"sheet" debe ser el nombre del archivo PNG (por ejemplo "protagonist.png").');
  } else if (!sheet.toLowerCase().endsWith('.png')) {
    err('MANIFEST_SHEET', `"sheet" debe ser un archivo .png (dice "${sheet}").`);
  } else if (!FILE_NAME.test(sheet)) {
    issues.push(
      issue('warning', 'gemini', 'FILE_NAME', `El nombre "${sheet}" debería ir en minúsculas, con guion bajo y sin espacios.`),
    );
  }

  if (!isPositiveInt(frameWidth)) err('MANIFEST_FRAME', '"frameWidth" debe ser un entero mayor que 0.');
  if (!isPositiveInt(frameHeight)) err('MANIFEST_FRAME', '"frameHeight" debe ser un entero mayor que 0.');

  if (facing !== 'right') err('MANIFEST_FACING', '"facing" debe ser "right": las hojas se entregan mirando a la derecha.');

  if (!isRecord(pivot) || !isInt(pivot.x) || !isInt(pivot.y)) {
    err('MANIFEST_PIVOT', '"pivot" debe tener "x" e "y" enteros.');
  } else if (isPositiveInt(frameWidth) && isPositiveInt(frameHeight)) {
    if (pivot.x < 0 || pivot.x > frameWidth || pivot.y < 0 || pivot.y > frameHeight) {
      err('MANIFEST_PIVOT', `El pivote (${pivot.x}, ${pivot.y}) queda fuera de la celda de ${frameWidth}×${frameHeight}.`);
    } else if (pivot.x !== frameWidth / 2) {
      issues.push(
        issue('warning', 'gemini', 'PIVOT_X', `El pivote debería estar en el centro horizontal (x = ${frameWidth / 2}); dice x = ${pivot.x}.`),
      );
    }
  }

  const parsedAnimations: Record<string, AnimationDef> = {};
  if (!isRecord(animations) || Object.keys(animations).length === 0) {
    err('MANIFEST_ANIMATIONS', '"animations" debe tener al menos una animación.');
  } else {
    for (const [name, value] of Object.entries(animations)) {
      if (!isRecord(value)) {
        err('ANIM_DEF', `"${name}": la definición debe ser un objeto.`);
        continue;
      }
      const { row, frames, fps, loop, impact } = value;
      let ok = true;
      if (!isInt(row) || row < 0) {
        err('ANIM_DEF', `"${name}": "row" debe ser un entero desde 0.`);
        ok = false;
      }
      if (!isPositiveInt(frames)) {
        err('ANIM_DEF', `"${name}": "frames" debe ser un entero mayor que 0.`);
        ok = false;
      }
      if (typeof fps !== 'number' || !Number.isFinite(fps) || fps <= 0) {
        err('ANIM_DEF', `"${name}": "fps" debe ser un número mayor que 0.`);
        ok = false;
      }
      if (typeof loop !== 'boolean') {
        err('ANIM_DEF', `"${name}": "loop" debe ser true o false.`);
        ok = false;
      }
      let parsedImpact: ImpactFrames | undefined;
      if (impact !== undefined) {
        if (!isRecord(impact) || !isInt(impact.from) || !isInt(impact.to)) {
          err('ANIM_IMPACT', `"${name}": "impact" debe tener "from" y "to" enteros.`);
          ok = false;
        } else if (impact.from < 0 || impact.from > impact.to || (isPositiveInt(frames) && impact.to >= frames)) {
          err(
            'ANIM_IMPACT',
            `"${name}": "impact" (${impact.from} a ${impact.to}) debe cumplir 0 ≤ from ≤ to < frames. Los cuadros se numeran desde 0.`,
          );
          ok = false;
        } else {
          parsedImpact = { from: impact.from, to: impact.to };
        }
      }
      if (ok) {
        parsedAnimations[name] = {
          row: row as number,
          frames: frames as number,
          fps: fps as number,
          loop: loop as boolean,
          ...(parsedImpact ? { impact: parsedImpact } : {}),
        };
      }
      if (!KNOWN_ANIMATIONS.includes(name)) {
        issues.push(
          issue(
            'warning',
            'ambos',
            'ANIM_NAME',
            `"${name}" no está en la lista de nombres del documento técnico (6.5). Agregalo ahí primero si es una animación nueva.`,
          ),
        );
      }
    }
  }

  if (hasErrors(issues)) return { manifest: null, issues };

  return {
    manifest: {
      sheet: sheet as string,
      frameWidth: frameWidth as number,
      frameHeight: frameHeight as number,
      facing: 'right',
      pivot: { x: (pivot as { x: number; y: number }).x, y: (pivot as { x: number; y: number }).y },
      animations: parsedAnimations,
    },
    issues,
  };
}

/** Comprueba el archivo de tiempos de ataque (datos de Claude). */
export function parseAttackTimings(raw: unknown): { timings: AttackTimings; issues: Issue[] } {
  const issues: Issue[] = [];
  const timings: AttackTimings = {};
  if (!isRecord(raw)) {
    issues.push(issue('error', 'claude', 'ATTACKS_TYPE', 'El archivo de ataques debe ser un objeto JSON {"attack_1": {...}}.'));
    return { timings, issues };
  }
  for (const [name, value] of Object.entries(raw)) {
    if (!isRecord(value)) {
      issues.push(issue('error', 'claude', 'ATTACKS_DEF', `"${name}": debe ser un objeto con impactStartMs e impactEndMs.`));
      continue;
    }
    const { impactStartMs, impactEndMs } = value;
    const finite = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n);
    if (!finite(impactStartMs) || !finite(impactEndMs) || impactStartMs < 0 || impactEndMs <= impactStartMs) {
      issues.push(
        issue('error', 'claude', 'ATTACKS_DEF', `"${name}": impactStartMs e impactEndMs deben ser números con 0 ≤ inicio < fin.`),
      );
      continue;
    }
    timings[name] = { impactStartMs, impactEndMs };
  }
  return { timings, issues };
}

// ---------------------------------------------------------------------------
// Hoja de sprites
// ---------------------------------------------------------------------------

interface CellStats {
  /** Píxeles con alfa > 0. */
  opaque: number;
  /** Píxeles con alfa entre 1 y 254. */
  semi: number;
  firstSemi: { x: number; y: number } | null;
  /** Fila local más baja con algún píxel visible (-1 si la celda está vacía). */
  lowestY: number;
}

function scanCell(image: RgbaImage, col: number, row: number, fw: number, fh: number): CellStats {
  const stats: CellStats = { opaque: 0, semi: 0, firstSemi: null, lowestY: -1 };
  const x0 = col * fw;
  const y0 = row * fh;
  for (let y = 0; y < fh; y++) {
    for (let x = 0; x < fw; x++) {
      const alpha = image.data[((y0 + y) * image.width + (x0 + x)) * 4 + 3];
      if (alpha === 0) continue;
      stats.opaque++;
      stats.lowestY = y;
      if (alpha < 255) {
        stats.semi++;
        stats.firstSemi ??= { x, y };
      }
    }
  }
  return stats;
}

const list = (numbers: number[]) => numbers.join(', ');
/** "el cuadro 3" o "los cuadros 1, 2". */
const framesText = (numbers: number[]) => (numbers.length === 1 ? `el cuadro ${numbers[0]}` : `los cuadros ${list(numbers)}`);

/** Comprueba la hoja contra su manifiesto (reglas de las secciones 6.1, 6.3 y 6.6). */
export function validateSheet(manifest: Manifest, image: RgbaImage): Issue[] {
  const issues: Issue[] = [];
  const err = (code: string, message: string, owner: Owner = 'gemini') => issues.push(issue('error', owner, code, message));
  const warn = (code: string, message: string, owner: Owner = 'gemini') => issues.push(issue('warning', owner, code, message));
  const { frameWidth: fw, frameHeight: fh, pivot } = manifest;

  // 1. Transparencia: el PNG debe tener canal alfa.
  if (!image.hasAlphaChannel) {
    err('NO_ALPHA', 'El PNG no tiene transparencia (sin canal alfa). Exportalo como PNG con transparencia.');
  }

  // 2. Dimensiones: múltiplos de la celda.
  if (image.width % fw !== 0 || image.height % fh !== 0) {
    err(
      'SHEET_SIZE',
      `La hoja mide ${image.width}×${image.height} y no es múltiplo de la celda ${fw}×${fh}. Revisá márgenes o separaciones entre cuadros.`,
    );
    return issues; // sin una grilla exacta, el resto de las comprobaciones no tiene sentido
  }
  const cols = image.width / fw;
  const rows = image.height / fh;

  // 3. Animaciones dentro de la grilla.
  const rowOwner = new Map<number, string>();
  let gridOk = true;
  for (const [name, anim] of Object.entries(manifest.animations)) {
    if (anim.row >= rows) {
      err('ANIM_ROW', `"${name}" usa la fila ${anim.row} pero la hoja solo tiene ${rows} filas (0 a ${rows - 1}).`);
      gridOk = false;
    }
    if (anim.frames > cols) {
      err('ANIM_FRAMES', `"${name}" declara ${anim.frames} cuadros pero la hoja solo tiene ${cols} columnas.`);
      gridOk = false;
    }
    const previous = rowOwner.get(anim.row);
    if (previous !== undefined) {
      err('ANIM_ROW_SHARED', `"${name}" y "${previous}" usan la misma fila (${anim.row}). Cada animación va en su propia fila.`);
    } else {
      rowOwner.set(anim.row, name);
    }
    if (name.startsWith('attack_') && !anim.impact) {
      err('MISSING_IMPACT', `"${name}" es un ataque y necesita "impact" (cuadros en los que golpea, desde 0).`);
    }
  }
  if (!gridOk) return issues;

  // 4. Contenido de cada celda.
  const stats = new Map<number, CellStats>();
  const cell = (col: number, row: number): CellStats => {
    const key = row * cols + col;
    let s = stats.get(key);
    if (!s) {
      s = scanCell(image, col, row, fw, fh);
      stats.set(key, s);
    }
    return s;
  };

  for (const [name, anim] of Object.entries(manifest.animations)) {
    const emptyFrames: number[] = [];
    for (let col = 0; col < anim.frames; col++) {
      if (cell(col, anim.row).opaque === 0) emptyFrames.push(col);
    }
    if (emptyFrames.length > 0) {
      err(
        'FRAME_EMPTY',
        `"${name}": ${framesText(emptyFrames)} ${emptyFrames.length === 1 ? 'está vacío' : 'están vacíos'} (fila ${anim.row}). O el manifiesto declara de más, o falta dibujar${emptyFrames.length === 1 ? 'lo' : 'los'}.`,
      );
    }

    const extra: number[] = [];
    for (let col = anim.frames; col < cols; col++) {
      if (cell(col, anim.row).opaque > 0) extra.push(col);
    }
    if (extra.length > 0) {
      err(
        'FRAME_EXTRA',
        `"${name}": hay dibujo en ${framesText(extra)} pero el manifiesto declara solo ${anim.frames}. Se perdería.`,
      );
    }
  }

  const unused: number[] = [];
  for (let row = 0; row < rows; row++) {
    if (rowOwner.has(row)) continue;
    for (let col = 0; col < cols; col++) {
      if (cell(col, row).opaque > 0) {
        unused.push(row);
        break;
      }
    }
  }
  if (unused.length > 0) {
    warn('ROW_UNUSED', `${unused.length === 1 ? `La fila ${unused[0]} tiene dibujo pero ninguna animación del manifiesto la usa` : `Las filas ${list(unused)} tienen dibujo pero ninguna animación del manifiesto las usa`}.`);
  }

  // 5. Bordes duros: sin semitransparencias (pixel art tradicional).
  let semiTotal = 0;
  let firstSemi: { row: number; col: number; x: number; y: number } | null = null;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const s = cell(col, row);
      semiTotal += s.semi;
      if (!firstSemi && s.firstSemi) firstSemi = { row, col, ...s.firstSemi };
    }
  }
  if (semiTotal > 0 && firstSemi) {
    err(
      'SEMI_ALPHA',
      `${semiTotal} ${semiTotal === 1 ? 'píxel semitransparente' : 'píxeles semitransparentes'} (antialiasing o sombras suaves). ${semiTotal === 1 ? 'Está' : 'El primero está'} en la fila ${firstSemi.row}, cuadro ${firstSemi.col}, píxel (${firstSemi.x}, ${firstSemi.y}). El pixel art lleva bordes duros: alfa 0 o 255.`,
    );
  }

  // 6. Pivote: en animaciones sobre el suelo, el punto más bajo del sprite está en el pivote.
  const expectedBottom = pivot.y - 1;
  for (const [name, anim] of Object.entries(manifest.animations)) {
    if (AIRBORNE.has(name)) continue;
    const off: number[] = [];
    let firstDiff = 0;
    for (let col = 0; col < anim.frames; col++) {
      const lowest = cell(col, anim.row).lowestY;
      if (lowest < 0) continue; // ya informado como vacío
      if (Math.abs(lowest - expectedBottom) > FEET_TOLERANCE_PX) {
        if (off.length === 0) firstDiff = expectedBottom - lowest;
        off.push(col);
      }
    }
    if (off.length > 0) {
      const direction = firstDiff > 0 ? 'por encima' : 'por debajo';
      warn(
        'PIVOT_FEET',
        `"${name}": en ${framesText(off)} los pies no apoyan en el pivote (y = ${pivot.y}); ${off.length === 1 ? 'queda' : 'el primero queda'} ${Math.abs(firstDiff)} px ${direction}. El personaje saltaría o se hundiría al cambiar de animación.`,
      );
    }
  }

  return issues;
}

// ---------------------------------------------------------------------------
// Sincronización de golpe (documento técnico, 6.4)
// ---------------------------------------------------------------------------

/** Cuadros que cubre la ventana de impacto de los datos a la velocidad natural de la animación. */
export function impactFramesFromTiming(timing: AttackTiming, fps: number): ImpactFrames {
  const from = Math.floor((timing.impactStartMs * fps) / 1000 + EPS);
  const to = Math.max(from, Math.ceil((timing.impactEndMs * fps) / 1000 - EPS) - 1);
  return { from, to };
}

/** Compara la ventana de impacto de los datos con los cuadros `impact` del manifiesto. */
export function validateAttackTimings(manifest: Manifest, timings: AttackTimings): Issue[] {
  const issues: Issue[] = [];
  for (const [name, timing] of Object.entries(timings)) {
    const anim = manifest.animations[name];
    if (!anim || !anim.impact) continue; // otra hoja, o ya informado como MISSING_IMPACT

    const durationMs = (anim.frames / anim.fps) * 1000;
    if (timing.impactEndMs > durationMs + EPS) {
      issues.push(
        issue(
          'error',
          'ambos',
          'IMPACT_OUTSIDE',
          `"${name}": la ventana de impacto de los datos termina a los ${timing.impactEndMs} ms pero la animación dura ${durationMs.toFixed(0)} ms (${anim.frames} cuadros a ${anim.fps} fps).`,
        ),
      );
      continue;
    }

    const expected = impactFramesFromTiming(timing, anim.fps);
    const dFrom = Math.abs(expected.from - anim.impact.from);
    const dTo = Math.abs(expected.to - anim.impact.to);
    if (dFrom > SYNC_TOLERANCE_FRAMES || dTo > SYNC_TOLERANCE_FRAMES) {
      issues.push(
        issue(
          'error',
          'ambos',
          'IMPACT_SYNC',
          `"${name}": los datos de Claude golpean en los cuadros ${expected.from} a ${expected.to} (${timing.impactStartMs}–${timing.impactEndMs} ms a ${anim.fps} fps) pero el manifiesto de Gemini marca ${anim.impact.from} a ${anim.impact.to}. Tolerancia: ±${SYNC_TOLERANCE_FRAMES} cuadro. Gemini ajusta los cuadros de impacto, o Claude ajusta los tiempos.`,
        ),
      );
    }
  }
  return issues;
}
