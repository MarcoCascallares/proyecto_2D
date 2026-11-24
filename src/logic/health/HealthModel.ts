// Vida mínima de un personaje. Lógica pura, sin Phaser.
// En la v0.2 solo la usa el protagonista; la v0.3 la reutilizará para los enemigos.

export interface HealthState {
  current: number;
  max: number;
}

/** Los valores no válidos (negativos, NaN, infinitos) cuentan como 0. */
function sanitize(amount: number): number {
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

export function createHealth(max: number): HealthState {
  if (!Number.isFinite(max) || max <= 0) {
    throw new Error(`La vida máxima debe ser un número mayor que 0 (recibido: ${max})`);
  }
  return { current: max, max };
}

/** Resta vida sin bajar de 0. Devuelve cuánta vida se perdió de verdad. */
export function applyDamage(health: HealthState, amount: number): number {
  const taken = Math.min(sanitize(amount), health.current);
  health.current -= taken;
  return taken;
}

/** Suma vida sin pasar del máximo. Devuelve cuánta vida se recuperó de verdad. */
export function applyHeal(health: HealthState, amount: number): number {
  const healed = Math.min(sanitize(amount), health.max - health.current);
  health.current += healed;
  return healed;
}

export function isDepleted(health: HealthState): boolean {
  return health.current <= 0;
}

/** Vida actual como fracción de 0 a 1. */
export function healthRatio(health: HealthState): number {
  return health.current / health.max;
}
