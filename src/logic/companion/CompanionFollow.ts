// Seguimiento de la compañera. Lógica pura, sin Phaser.
// Va detrás del protagonista con un pequeño retraso (suavizado exponencial)
// y una oscilación leve para que se sienta flotando. No tiene cuerpo físico:
// no choca con las paredes.

export interface Point {
  x: number;
  y: number;
}

export interface FollowStats {
  /** Distancia horizontal por detrás del protagonista (px). */
  offsetX: number;
  /** Altura de la silla sobre los pies del protagonista (px). */
  offsetY: number;
  /** Rapidez con la que alcanza el destino (1/s). Más alto = menos retraso. */
  smoothing: number;
  /** Amplitud de la oscilación vertical (px). 0 la desactiva. */
  bobAmplitude: number;
  /** Frecuencia de la oscilación (Hz). */
  bobHz: number;
}

export interface FollowTargetInput {
  /** Centro horizontal de los pies del protagonista. */
  readonly feetX: number;
  /** Borde inferior de los pies del protagonista. */
  readonly feetY: number;
  /** Hacia dónde mira el protagonista: 1 derecha, -1 izquierda. */
  readonly facing: number;
}

/** Punto al que debe llegar la silla (parte superior central del asiento). */
export function followTarget(player: FollowTargetInput, stats: FollowStats, time: number): Point {
  const bob = stats.bobAmplitude * Math.sin(2 * Math.PI * stats.bobHz * time);
  return {
    x: player.feetX - player.facing * stats.offsetX,
    y: player.feetY - stats.offsetY + bob,
  };
}

/** Acerca `current` a `target`. Independiente de la tasa de cuadros. Modifica `current`. */
export function stepFollow(current: Point, target: Point, smoothing: number, dt: number): void {
  const alpha = 1 - Math.exp(-smoothing * dt);
  current.x += (target.x - current.x) * alpha;
  current.y += (target.y - current.y) * alpha;
}
