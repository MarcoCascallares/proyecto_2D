import Phaser from 'phaser';
import type { EventBus } from '../../../core/EventBus';
import type { GameEvents } from '../../../core/GameEvents';
import { StateMachine } from '../../../core/StateMachine';
import { stepMovement } from '../../../logic/movement/MovementModel';
import type { MovementState, MovementStats } from '../../../logic/movement/MovementModel';
import type { InputMap } from '../../input/InputMap';
import { AirState, IdleState, RunState } from './PlayerStates';

export interface PlayerStats {
  movement: MovementStats;
  body: { width: number; height: number };
}

/** Lo único que el Presenter necesita saber del protagonista. */
export interface PlayerSnapshot {
  /** Centro horizontal de los pies (el pivote del sprite). */
  feetX: number;
  /** Borde inferior de los pies. */
  feetY: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  onGround: boolean;
  state: string;
}

/**
 * Protagonista: cuerpo de física (una zona invisible), modelo de movimiento y
 * máquina de estados. No dibuja nada: de eso se encarga PlayerPresenter.
 */
export class Player {
  readonly zone: Phaser.GameObjects.Zone;
  private readonly body: Phaser.Physics.Arcade.Body;
  private readonly stats: PlayerStats;
  private readonly actions: InputMap;
  private readonly model: MovementState = { vx: 0, vy: 0, onGround: false };
  private readonly machine: StateMachine<Player>;
  private moveXValue: -1 | 0 | 1 = 0;
  private facingValue: 1 | -1 = 1;

  constructor(
    scene: Phaser.Scene,
    feetX: number,
    feetY: number,
    stats: PlayerStats,
    actions: InputMap,
    bus: EventBus<GameEvents>,
  ) {
    this.stats = stats;
    this.actions = actions;

    const { width, height } = stats.body;
    this.zone = scene.add.zone(feetX, feetY - height / 2, width, height);
    scene.physics.add.existing(this.zone);
    this.body = this.zone.body as Phaser.Physics.Arcade.Body;
    // La gravedad la calcula MovementModel, no el motor.
    this.body.setAllowGravity(false);

    this.machine = new StateMachine<Player>(this, (from, to) => {
      bus.emit('player:stateChanged', { from, to });
    })
      .add(IdleState)
      .add(RunState)
      .add(AirState);
    this.machine.start('air');
  }

  get onGround(): boolean {
    return this.model.onGround;
  }
  get moveX(): -1 | 0 | 1 {
    return this.moveXValue;
  }
  get vx(): number {
    return this.model.vx;
  }
  get vy(): number {
    return this.model.vy;
  }
  get facing(): 1 | -1 {
    return this.facingValue;
  }
  get stateName(): string {
    return this.machine.currentName ?? 'none';
  }

  /** Un paso de lógica a 60 Hz (dt en segundos). */
  fixedUpdate(dt: number): void {
    // 1. Leer el estado real del cuerpo tras el último paso de física.
    this.model.vx = this.body.velocity.x;
    this.model.vy = this.body.velocity.y;
    this.model.onGround = this.body.blocked.down || this.body.touching.down;

    // 2. Entrada.
    this.moveXValue = this.actions.axis('move_left', 'move_right');
    if (this.moveXValue !== 0) this.facingValue = this.moveXValue > 0 ? 1 : -1;

    // 3. Movimiento (lógica pura) y aplicación al cuerpo.
    stepMovement(
      this.stats.movement,
      this.model,
      {
        moveX: this.moveXValue,
        jumpPressed: this.actions.consumePressed('jump'),
        jumpHeld: this.actions.isDown('jump'),
      },
      dt,
    );
    this.body.setVelocity(this.model.vx, this.model.vy);

    // 4. Transiciones de estado.
    this.machine.update(dt);
  }

  /** Vuelve a aparecer con los pies en (feetX, feetY). */
  respawn(feetX: number, feetY: number): void {
    this.body.reset(feetX, feetY - this.stats.body.height / 2);
    this.model.vx = 0;
    this.model.vy = 0;
    this.model.onGround = false;
  }

  snapshot(): PlayerSnapshot {
    return {
      feetX: this.body.center.x,
      feetY: this.body.bottom,
      vx: this.model.vx,
      vy: this.model.vy,
      facing: this.facingValue,
      onGround: this.model.onGround,
      state: this.stateName,
    };
  }
}
