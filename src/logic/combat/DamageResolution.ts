// Resolución de un golpe recibido. Lógica pura, sin Phaser.
// Orden: primero el escudo (si hay uno listo, absorbe el golpe entero);
// si no, el daño llega a la vida.

import { applyDamage, isDepleted } from '../health/HealthModel';
import type { HealthState } from '../health/HealthModel';

/** Intenta absorber un golpe. Devuelve true si lo absorbió (y consumió el escudo). */
export type HitAbsorber = () => boolean;

export interface DamageResult {
  /** El escudo absorbió el golpe: no se perdió vida. */
  readonly absorbed: boolean;
  /** Vida que se perdió de verdad (nunca más que la vida que quedaba). */
  readonly dealt: number;
  /** La vida llegó a 0. */
  readonly depleted: boolean;
}

export function resolveDamage(
  target: HealthState,
  amount: number,
  absorber?: HitAbsorber,
): DamageResult {
  // Un golpe sin daño no gasta el escudo.
  if (!(amount > 0)) {
    return { absorbed: false, dealt: 0, depleted: isDepleted(target) };
  }
  if (absorber?.()) {
    return { absorbed: true, dealt: 0, depleted: isDepleted(target) };
  }
  const dealt = applyDamage(target, amount);
  return { absorbed: false, dealt, depleted: isDepleted(target) };
}
