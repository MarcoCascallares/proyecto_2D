import type { State } from '../../../core/State';
import type { Player } from './Player';

// Estados del protagonista en la v0.1: Idle, Run y Air.
// Air cubre salto y caída; si es subida o bajada se deduce de la velocidad vertical
// (vy < 0 sube, vy >= 0 cae) y lo usa el Presenter para elegir jump_up o fall.
// Los estados solo deciden transiciones: el movimiento lo calcula MovementModel.

export const IdleState: State<Player> = {
  name: 'idle',
  update(player) {
    if (!player.onGround) return 'air';
    if (player.moveX !== 0) return 'run';
  },
};

export const RunState: State<Player> = {
  name: 'run',
  update(player) {
    if (!player.onGround) return 'air';
    if (player.moveX === 0 && Math.abs(player.vx) < 1) return 'idle';
  },
};

export const AirState: State<Player> = {
  name: 'air',
  update(player) {
    if (player.onGround) return player.moveX !== 0 ? 'run' : 'idle';
  },
};
