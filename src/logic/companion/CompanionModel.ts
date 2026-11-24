// Modelo de la compañera (v0.2): curación, escudo, recargas y estado.
// Lógica pura, sin Phaser. Todos los valores salen de src/data/companion_stats.json.
//
// Estados que se muestran (F3 y HUD):
//   reposo          nada activo y todo listo
//   curando         efecto breve tras una curación
//   escudo activo   efecto breve tras absorber un golpe
//   recargando      alguna habilidad espera su recarga
//
// Queda para la v0.3 y la v0.4: interceptar ataques, estabilizar, potenciar
// y habilidades combinadas.

import { applyHeal } from '../health/HealthModel';
import type { HealthState } from '../health/HealthModel';
import type { FollowStats } from './CompanionFollow';

export interface CompanionStats {
  heal: {
    /** Vida que recupera cada curación. */
    amount: number;
    cooldownSeconds: number;
  };
  shield: {
    /** Cantidad de golpes que absorbe antes de recargar. */
    hitsAbsorbed: number;
    cooldownSeconds: number;
  };
  /** Duración del efecto visible de curación o de escudo. No afecta al balance. */
  effectSeconds: number;
}

/** Contenido completo de companion_stats.json. */
export interface CompanionData extends CompanionStats {
  playerMaxHealth: number;
  /** Daño de la tecla de depuración T. */
  debugDamage: number;
  follow: FollowStats;
}

export type CompanionStatus = 'idle' | 'healing' | 'shielding' | 'recharging';
type EffectKind = 'healing' | 'shielding';

export interface CompanionState {
  /** Segundos que faltan para poder curar otra vez (0 = lista). */
  healCooldown: number;
  /** Segundos que faltan para recuperar el escudo (0 = listo). */
  shieldCooldown: number;
  /** Golpes que el escudo todavía puede absorber. */
  shieldCharges: number;
  effectTimer: number;
  effectKind: EffectKind | null;
}

export type HealResult =
  | { readonly ok: true; readonly healed: number }
  | { readonly ok: false; readonly reason: 'cooldown' | 'full_health' };

export const COMPANION_STATUS_LABEL: Record<CompanionStatus, string> = {
  idle: 'reposo',
  healing: 'curando',
  shielding: 'escudo activo',
  recharging: 'recargando',
};

export function createCompanionState(stats: CompanionStats): CompanionState {
  return {
    healCooldown: 0,
    shieldCooldown: 0,
    shieldCharges: stats.shield.hitsAbsorbed,
    effectTimer: 0,
    effectKind: null,
  };
}

function startEffect(state: CompanionState, stats: CompanionStats, kind: EffectKind): void {
  state.effectKind = kind;
  state.effectTimer = stats.effectSeconds;
}

/** Avanza recargas y efectos (dt en segundos). */
export function tickCompanion(state: CompanionState, stats: CompanionStats, dt: number): void {
  state.healCooldown = Math.max(0, state.healCooldown - dt);

  if (state.shieldCooldown > 0) {
    state.shieldCooldown = Math.max(0, state.shieldCooldown - dt);
    if (state.shieldCooldown === 0) state.shieldCharges = stats.shield.hitsAbsorbed;
  }

  if (state.effectKind !== null) {
    state.effectTimer -= dt;
    if (state.effectTimer <= 0) {
      state.effectTimer = 0;
      state.effectKind = null;
    }
  }
}

/**
 * Curación (la activa el jugador). No se gasta si está en recarga ni si la vida
 * ya está completa. Puede curar aunque la vida esté en 0.
 */
export function tryHeal(state: CompanionState, stats: CompanionStats, health: HealthState): HealResult {
  if (state.healCooldown > 0) return { ok: false, reason: 'cooldown' };
  if (health.current >= health.max) return { ok: false, reason: 'full_health' };

  const healed = applyHeal(health, stats.heal.amount);
  state.healCooldown = stats.heal.cooldownSeconds;
  startEffect(state, stats, 'healing');
  return { ok: true, healed };
}

/**
 * Escudo automático: si hay un golpe disponible lo absorbe. Al agotar los golpes
 * empieza la recarga. Devuelve true si absorbió el golpe.
 */
export function absorbHit(state: CompanionState, stats: CompanionStats): boolean {
  if (state.shieldCharges <= 0) return false;
  state.shieldCharges -= 1;
  if (state.shieldCharges === 0) state.shieldCooldown = stats.shield.cooldownSeconds;
  startEffect(state, stats, 'shielding');
  return true;
}

export function companionStatus(state: CompanionState): CompanionStatus {
  if (state.effectKind !== null) return state.effectKind;
  if (state.healCooldown > 0 || state.shieldCooldown > 0) return 'recharging';
  return 'idle';
}

/** Fracción de recarga cumplida: 1 = lista, 0 = recién usada. */
export function cooldownReadyRatio(remaining: number, total: number): number {
  if (remaining <= 0 || total <= 0) return 1;
  return Math.min(1, Math.max(0, 1 - remaining / total));
}

/** Texto para la interfaz: "lista" o los segundos que faltan, redondeados hacia arriba. */
export function cooldownLabel(remaining: number): string {
  return remaining <= 0 ? 'lista' : `${Math.ceil(remaining)} s`;
}

/** Revisa companion_stats.json. Devuelve la lista de problemas (vacía si está bien). */
export function validateCompanionData(data: CompanionData): string[] {
  const errors: string[] = [];
  const positive = (name: string, value: number): void => {
    if (!Number.isFinite(value) || value <= 0) errors.push(`${name} debe ser un número mayor que 0`);
  };
  const nonNegative = (name: string, value: number): void => {
    if (!Number.isFinite(value) || value < 0) errors.push(`${name} debe ser un número de 0 o más`);
  };

  positive('playerMaxHealth', data.playerMaxHealth);
  positive('debugDamage', data.debugDamage);
  positive('heal.amount', data.heal.amount);
  nonNegative('heal.cooldownSeconds', data.heal.cooldownSeconds);
  if (!Number.isInteger(data.shield.hitsAbsorbed) || data.shield.hitsAbsorbed < 1) {
    errors.push('shield.hitsAbsorbed debe ser un entero de 1 o más');
  }
  nonNegative('shield.cooldownSeconds', data.shield.cooldownSeconds);
  nonNegative('effectSeconds', data.effectSeconds);

  nonNegative('follow.offsetX', data.follow.offsetX);
  nonNegative('follow.offsetY', data.follow.offsetY);
  positive('follow.smoothing', data.follow.smoothing);
  nonNegative('follow.bobAmplitude', data.follow.bobAmplitude);
  nonNegative('follow.bobHz', data.follow.bobHz);
  return errors;
}
