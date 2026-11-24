// Modelo de movimiento del protagonista. Lógica pura, sin Phaser:
// se prueba en Node y no cambia si cambia el motor ni los sprites.
//
// Convención: eje Y hacia abajo. Subir = velocidad Y negativa.

export interface MovementStats {
  /** Velocidad horizontal máxima (px/s). */
  maxSpeed: number;
  /** Aceleración al avanzar en la dirección actual (px/s²). */
  acceleration: number;
  /** Frenado sin entrada o al invertir la dirección (px/s²). */
  braking: number;
  /** Gravedad (px/s²). */
  gravity: number;
  /** Velocidad inicial del salto (px/s, negativa = hacia arriba). */
  jumpVelocity: number;
  /** Si se suelta el salto mientras sube más rápido que esto, se corta a esta velocidad (negativa). */
  jumpCutVelocity: number;
  /** Velocidad máxima de caída (px/s). */
  maxFallSpeed: number;
  /** Multiplicador de control horizontal en el aire (0 a 1). */
  airControl: number;
}

export interface MovementInput {
  /** -1 izquierda, 0 nada, 1 derecha. */
  readonly moveX: number;
  /** El salto se acaba de pulsar (un solo paso). */
  readonly jumpPressed: boolean;
  /** El botón de salto sigue mantenido. */
  readonly jumpHeld: boolean;
}

/** Estado mutable que el modelo lee y actualiza en cada paso. */
export interface MovementState {
  vx: number;
  vy: number;
  onGround: boolean;
}

export interface MovementResult {
  readonly jumped: boolean;
}

function approach(value: number, target: number, maxDelta: number): number {
  if (value < target) return Math.min(value + maxDelta, target);
  return Math.max(value - maxDelta, target);
}

/**
 * Avanza un paso fijo (dt en segundos). Actualiza `state` y devuelve qué ocurrió.
 * Salto fijo con corte al soltar (salto variable). Sin coyote time ni buffer.
 */
export function stepMovement(
  stats: MovementStats,
  state: MovementState,
  input: MovementInput,
  dt: number,
): MovementResult {
  // Horizontal
  const control = state.onGround ? 1 : stats.airControl;
  const dir = Math.sign(input.moveX);
  if (dir !== 0) {
    const reversing = state.vx !== 0 && Math.sign(state.vx) !== dir;
    const rate = (reversing ? stats.braking : stats.acceleration) * control;
    state.vx = approach(state.vx, dir * stats.maxSpeed, rate * dt);
  } else {
    state.vx = approach(state.vx, 0, stats.braking * control * dt);
  }

  // Vertical
  let jumped = false;
  if (state.onGround && input.jumpPressed) {
    state.vy = stats.jumpVelocity;
    state.onGround = false;
    jumped = true;
  } else {
    // La gravedad se aplica siempre, también en el suelo, para que el motor
    // de física siga detectando el contacto con el piso.
    state.vy = Math.min(state.vy + stats.gravity * dt, stats.maxFallSpeed);
  }

  // Salto variable: soltar el botón mientras se sube corta el impulso.
  if (!jumped && !state.onGround && !input.jumpHeld && state.vy < stats.jumpCutVelocity) {
    state.vy = stats.jumpCutVelocity;
  }

  return { jumped };
}
