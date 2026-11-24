import type { EventBus } from '../../core/EventBus';
import type { GameEvents } from '../../core/GameEvents';
import { resolveDamage } from '../../logic/combat/DamageResolution';
import type { DamageResult } from '../../logic/combat/DamageResolution';
import {
  absorbHit,
  companionStatus,
  cooldownReadyRatio,
  createCompanionState,
  tickCompanion,
  tryHeal,
} from '../../logic/companion/CompanionModel';
import type {
  CompanionState,
  CompanionStats,
  CompanionStatus,
  HealResult,
} from '../../logic/companion/CompanionModel';
import { healthRatio } from '../../logic/health/HealthModel';
import type { HealthState } from '../../logic/health/HealthModel';

/** Lo que la interfaz necesita saber (HUD y F3). */
export interface Vitals {
  health: number;
  maxHealth: number;
  healthRatio: number;
  /** 1 = curación lista, 0 = recién usada. */
  healReadyRatio: number;
  healSeconds: number;
  /** 1 = escudo listo, 0 = recién consumido. */
  shieldReadyRatio: number;
  shieldSeconds: number;
  status: CompanionStatus;
}

/**
 * Une la vida del protagonista con la compañera: aplica los golpes pasando primero
 * por el escudo, ejecuta la curación y avisa por eventos. No usa Phaser (se prueba
 * en Node). El protagonista no conoce a la compañera: solo este sistema los junta.
 */
export class SupportSystem {
  private readonly stats: CompanionStats;
  private readonly health: HealthState;
  private readonly bus: EventBus<GameEvents>;
  private readonly state: CompanionState;
  private lastStatus: CompanionStatus | null = null;
  private readonly vitalsCache: Vitals = {
    health: 0,
    maxHealth: 0,
    healthRatio: 0,
    healReadyRatio: 1,
    healSeconds: 0,
    shieldReadyRatio: 1,
    shieldSeconds: 0,
    status: 'idle',
  };

  constructor(stats: CompanionStats, health: HealthState, bus: EventBus<GameEvents>) {
    this.stats = stats;
    this.health = health;
    this.bus = bus;
    this.state = createCompanionState(stats);
    this.syncStatus();
  }

  /** Un paso de lógica a 60 Hz (dt en segundos). */
  update(dt: number): void {
    tickCompanion(this.state, this.stats, dt);
    this.syncStatus();
  }

  /** El jugador pide curar (tecla H). */
  requestHeal(): HealResult {
    const result = tryHeal(this.state, this.stats, this.health);
    if (result.ok) {
      this.bus.emit('health:changed', {
        current: this.health.current,
        max: this.health.max,
        delta: result.healed,
      });
      this.bus.emit('companion:healed', { amount: result.healed });
      this.syncStatus();
    }
    return result;
  }

  /** Llega un golpe al protagonista: lo absorbe el escudo o baja la vida. */
  damagePlayer(amount: number): DamageResult {
    const result = resolveDamage(this.health, amount, () => absorbHit(this.state, this.stats));
    this.bus.emit('damage:dealt', { incoming: amount, dealt: result.dealt, absorbed: result.absorbed });
    if (result.absorbed) this.bus.emit('companion:shieldAbsorbed', { incoming: amount });
    if (result.dealt > 0) {
      this.bus.emit('health:changed', {
        current: this.health.current,
        max: this.health.max,
        delta: -result.dealt,
      });
    }
    this.syncStatus();
    return result;
  }

  status(): CompanionStatus {
    return companionStatus(this.state);
  }

  /** Valores para la interfaz. Devuelve siempre el mismo objeto, actualizado. */
  vitals(): Readonly<Vitals> {
    const v = this.vitalsCache;
    v.health = this.health.current;
    v.maxHealth = this.health.max;
    v.healthRatio = healthRatio(this.health);
    v.healSeconds = this.state.healCooldown;
    v.healReadyRatio = cooldownReadyRatio(this.state.healCooldown, this.stats.heal.cooldownSeconds);
    v.shieldSeconds = this.state.shieldCooldown;
    v.shieldReadyRatio =
      this.state.shieldCharges > 0
        ? 1
        : cooldownReadyRatio(this.state.shieldCooldown, this.stats.shield.cooldownSeconds);
    v.status = companionStatus(this.state);
    return v;
  }

  private syncStatus(): void {
    const status = companionStatus(this.state);
    if (status === this.lastStatus) return;
    this.bus.emit('companion:stateChanged', { from: this.lastStatus, to: status });
    this.lastStatus = status;
  }
}
