import Phaser from 'phaser';
import type { ActionName, Keymap } from '../../core/actions';
import { EventBus } from '../../core/EventBus';
import type { GameEvents } from '../../core/GameEvents';
import { DEBUG_TOOLS, FIXED_DT } from '../../config';
import companionJson from '../../data/companion_stats.json';
import keymapJson from '../../data/keymap.json';
import levelJson from '../../data/levels/level_test.json';
import statsJson from '../../data/player_stats.json';
import { validateCompanionData } from '../../logic/companion/CompanionModel';
import type { CompanionData } from '../../logic/companion/CompanionModel';
import { createHealth } from '../../logic/health/HealthModel';
import type { LevelData } from '../../logic/world/LevelData';
import { CompanionPresenter } from '../../view/CompanionPresenter';
import { PlayerPresenter } from '../../view/PlayerPresenter';
import { DebugOverlay } from '../DebugOverlay';
import { Companion } from '../entities/companion/Companion';
import { Player } from '../entities/player/Player';
import type { PlayerStats } from '../entities/player/Player';
import { InputMap } from '../input/InputMap';
import { SupportSystem } from '../systems/SupportSystem';
import { LevelBase } from '../world/LevelBase';
import type { HudData } from './HUD';

/** Si los pies caen más de esto por debajo del nivel, el protagonista reaparece. */
const FALL_RESPAWN_MARGIN = 60;
/** Evita una avalancha de pasos si la pestaña se pausa (en segundos). */
const MAX_FRAME_TIME = 0.1;

export class Level extends Phaser.Scene {
  private level!: LevelBase;
  private actions!: InputMap;
  private player!: Player;
  private presenter!: PlayerPresenter;
  private companion!: Companion;
  private companionPresenter!: CompanionPresenter;
  private support!: SupportSystem;
  private debugDamage = 0;
  private overlay: DebugOverlay | null = null;
  private lastTransition = '-';
  private accumulator = 0;

  constructor() {
    super('Level');
  }

  create(): void {
    const bus = new EventBus<GameEvents>();
    bus.on('player:stateChanged', ({ from, to }) => {
      this.lastTransition = `${from ?? '-'}>${to}`;
    });

    this.level = new LevelBase(this, levelJson as LevelData);
    // La tecla T (daño de prueba) solo existe con las herramientas de depuración.
    const actionList: ActionName[] = ['move_left', 'move_right', 'jump', 'heal_companion'];
    if (DEBUG_TOOLS) actionList.push('debug_damage');
    this.actions = new InputMap(this, keymapJson as Keymap, actionList);

    const stats = statsJson as PlayerStats;
    this.player = new Player(this, this.level.spawn.x, this.level.spawn.feetY, stats, this.actions, bus);
    this.physics.add.collider(this.player.zone, this.level.solids);

    this.presenter = new PlayerPresenter(this, stats.body.width, stats.body.height);

    // Compañera (v0.2): la vida del protagonista y las habilidades las junta SupportSystem.
    const companionData = companionJson as CompanionData;
    const problems = validateCompanionData(companionData);
    if (problems.length > 0) console.warn('companion_stats.json tiene valores inválidos:', problems);
    this.debugDamage = companionData.debugDamage;
    this.support = new SupportSystem(companionData, createHealth(companionData.playerMaxHealth), bus);
    this.companion = new Companion(companionData.follow);
    this.companion.update(0, this.player.snapshot()); // la coloca en su sitio desde el primer cuadro
    this.companionPresenter = new CompanionPresenter(this, stats.body.width, stats.body.height);

    // La interfaz corre en paralelo, con su propia cámara fija, y solo lee datos.
    const hud: HudData = { vitals: () => this.support.vitals() };
    this.scene.launch('HUD', hud);

    const camera = this.cameras.main;
    camera.setBounds(0, 0, this.level.widthPx, this.level.heightPx);
    camera.startFollow(this.player.zone, true, 1, 1);

    if (DEBUG_TOOLS) this.overlay = new DebugOverlay(this);
  }

  override update(_time: number, delta: number): void {
    this.actions.poll();

    // Paso fijo de 60 Hz, independiente de la tasa de refresco del monitor.
    this.accumulator += Math.min(delta / 1000, MAX_FRAME_TIME);
    while (this.accumulator >= FIXED_DT) {
      this.player.fixedUpdate(FIXED_DT);
      this.stepSupport(FIXED_DT);
      this.accumulator -= FIXED_DT;
    }

    const snapshot = this.player.snapshot();
    if (snapshot.feetY > this.level.heightPx + FALL_RESPAWN_MARGIN) {
      this.player.respawn(this.level.spawn.x, this.level.spawn.feetY);
    }

    this.presenter.update(snapshot);
    this.companionPresenter.update(this.companion.snapshot(), snapshot, this.support.status());
    this.companionPresenter.followPlayer(snapshot);
    this.overlay?.update(this.game.loop.actualFps, {
      state: snapshot.state,
      vx: snapshot.vx,
      vy: snapshot.vy,
      onGround: snapshot.onGround,
      lastTransition: this.lastTransition,
      support: this.support.vitals(),
    });
  }

  /** Un paso de 60 Hz de la compañera: pedidos de curación y de daño de prueba, recargas y seguimiento. */
  private stepSupport(dt: number): void {
    if (this.actions.consumePressed('heal_companion')) this.support.requestHeal();
    if (this.actions.consumePressed('debug_damage')) this.support.damagePlayer(this.debugDamage);
    this.support.update(dt);
    this.companion.update(dt, this.player.snapshot());
  }
}
