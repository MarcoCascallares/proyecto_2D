// Catálogo de eventos del juego. Se amplía versión a versión
// (energy:changed, attack:started...).

export interface GameEvents {
  'player:stateChanged': { from: string | null; to: string };
  /** La vida del protagonista cambió (delta < 0: daño; delta > 0: curación). */
  'health:changed': { current: number; max: number; delta: number };
  /** Resultado de un golpe: lo que llegaba, lo que bajó la vida y si lo absorbió el escudo. */
  'damage:dealt': { incoming: number; dealt: number; absorbed: boolean };
  /** La compañera curó al protagonista. */
  'companion:healed': { amount: number };
  /** El escudo de la compañera absorbió un golpe. */
  'companion:shieldAbsorbed': { incoming: number };
  /** Cambió el estado que se muestra de la compañera (reposo, curando, escudo activo, recargando). */
  'companion:stateChanged': { from: string | null; to: string };
}
