import { followTarget, stepFollow } from '../../../logic/companion/CompanionFollow';
import type { FollowStats, FollowTargetInput, Point } from '../../../logic/companion/CompanionFollow';

/** Lo único que el Presenter necesita saber de la compañera. */
export interface CompanionSnapshot {
  /** Centro horizontal de la silla. */
  x: number;
  /** Parte superior del asiento (donde se sienta). */
  y: number;
  /** Mira hacia donde mira el protagonista. */
  facing: 1 | -1;
}

/**
 * Posición de la compañera: va detrás del protagonista con retraso, sentada en su
 * silla de luz. No tiene cuerpo de física, así que no choca con nada. Sin Phaser.
 * Sus habilidades (curación y escudo) viven en SupportSystem.
 */
export class Companion {
  private readonly follow: FollowStats;
  private readonly position: Point = { x: 0, y: 0 };
  private facing: 1 | -1 = 1;
  private time = 0;
  private placed = false;

  constructor(follow: FollowStats) {
    this.follow = follow;
  }

  /** dt en segundos. La primera vez se coloca directamente en su sitio. */
  update(dt: number, player: FollowTargetInput): void {
    this.time += dt;
    this.facing = player.facing >= 0 ? 1 : -1;
    const target = followTarget(player, this.follow, this.time);
    if (!this.placed) {
      this.position.x = target.x;
      this.position.y = target.y;
      this.placed = true;
      return;
    }
    stepFollow(this.position, target, this.follow.smoothing, dt);
  }

  snapshot(): CompanionSnapshot {
    return { x: this.position.x, y: this.position.y, facing: this.facing };
  }
}
