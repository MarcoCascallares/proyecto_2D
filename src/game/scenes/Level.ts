import Phaser from 'phaser';
import type { Keymap } from '../../core/actions';
import { EventBus } from '../../core/EventBus';
import type { GameEvents } from '../../core/GameEvents';
import { DEBUG_TOOLS, FIXED_DT } from '../../config';
import keymapJson from '../../data/keymap.json';
import levelJson from '../../data/levels/level_test.json';
import statsJson from '../../data/player_stats.json';
import type { LevelData } from '../../logic/world/LevelData';
import { PlayerPresenter } from '../../view/PlayerPresenter';
import { DebugOverlay } from '../DebugOverlay';
import { Player } from '../entities/player/Player';
import type { PlayerStats } from '../entities/player/Player';
import { InputMap } from '../input/InputMap';
import { LevelBase } from '../world/LevelBase';

/** Si los pies caen más de esto por debajo del nivel, el protagonista reaparece. */
const FALL_RESPAWN_MARGIN = 60;
/** Evita una avalancha de pasos si la pestaña se pausa (en segundos). */
const MAX_FRAME_TIME = 0.1;

export class Level extends Phaser.Scene {
  private level!: LevelBase;
  private actions!: InputMap;
  private player!: Player;
  private presenter!: PlayerPresenter;
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
    this.actions = new InputMap(this, keymapJson as Keymap, ['move_left', 'move_right', 'jump']);

    const stats = statsJson as PlayerStats;
    this.player = new Player(this, this.level.spawn.x, this.level.spawn.feetY, stats, this.actions, bus);
    this.physics.add.collider(this.player.zone, this.level.solids);

    this.presenter = new PlayerPresenter(this, stats.body.width, stats.body.height);

    const camera = this.cameras.main;
    camera.setBounds(0, 0, this.level.widthPx, this.level.heightPx);
    camera.startFollow(this.player.zone, true, 1, 1);

    if (DEBUG_TOOLS) this.overlay = new DebugOverlay(this);
  }

  update(_time: number, delta: number): void {
    this.actions.poll();

    // Paso fijo de 60 Hz, independiente de la tasa de refresco del monitor.
    this.accumulator += Math.min(delta / 1000, MAX_FRAME_TIME);
    while (this.accumulator >= FIXED_DT) {
      this.player.fixedUpdate(FIXED_DT);
      this.accumulator -= FIXED_DT;
    }

    const snapshot = this.player.snapshot();
    if (snapshot.feetY > this.level.heightPx + FALL_RESPAWN_MARGIN) {
      this.player.respawn(this.level.spawn.x, this.level.spawn.feetY);
    }

    this.presenter.update(snapshot);
    this.overlay?.update(this.game.loop.actualFps, {
      state: snapshot.state,
      vx: snapshot.vx,
      vy: snapshot.vy,
      onGround: snapshot.onGround,
      lastTransition: this.lastTransition,
    });
  }
}
