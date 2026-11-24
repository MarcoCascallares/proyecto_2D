import Phaser from 'phaser';
import type { CompanionSnapshot } from '../game/entities/companion/Companion';
import type { PlayerSnapshot } from '../game/entities/player/Player';
import type { CompanionStatus } from '../logic/companion/CompanionModel';

// PRESENTER DE LA COMPAÑERA — la única pieza que conoce cómo se dibuja.
//
// En la v0.2 dibuja formas provisionales: un rectángulo para ella, otro para la
// silla de luz y un contorno alrededor del protagonista que se enciende al curar
// o al absorber un golpe. Cuando lleguen las hojas de Gemini (dos apariencias:
// rojo y negro, y blanco y dorado) solo cambia este archivo.
//
// Pivote: el centro de la silla, arriba del asiento. Ella se apoya en ese punto.
// Colores provisionales: la paleta definitiva todavía no está fijada.

const BODY_WIDTH = 12;
const BODY_HEIGHT = 26;
const CHAIR_WIDTH = 18;
const CHAIR_HEIGHT = 4;

const BODY_COLOR = 0x7a2432;
const FACE_COLOR = 0x20233a;

const CHAIR_COLOR_BY_STATUS: Record<CompanionStatus, number> = {
  idle: 0xf0d890,
  healing: 0x9cffb0,
  shielding: 0x8fd0ff,
  recharging: 0x8a7f5a,
};

/** Contorno alrededor del protagonista. Solo se ve con un efecto activo. */
const EFFECT_COLOR_BY_STATUS: Partial<Record<CompanionStatus, number>> = {
  healing: 0x9cffb0,
  shielding: 0x8fd0ff,
};

export class CompanionPresenter {
  private readonly bodyRect: Phaser.GameObjects.Rectangle;
  private readonly faceRect: Phaser.GameObjects.Rectangle;
  private readonly chairRect: Phaser.GameObjects.Rectangle;
  private readonly effectRect: Phaser.GameObjects.Rectangle;
  private readonly playerHeight: number;
  private lastStatus: CompanionStatus | null = null;

  constructor(scene: Phaser.Scene, playerWidth: number, playerHeight: number) {
    this.playerHeight = playerHeight;
    this.chairRect = scene.add
      .rectangle(0, 0, CHAIR_WIDTH, CHAIR_HEIGHT, CHAIR_COLOR_BY_STATUS.idle)
      .setOrigin(0.5, 0)
      .setDepth(8);
    this.bodyRect = scene.add
      .rectangle(0, 0, BODY_WIDTH, BODY_HEIGHT, BODY_COLOR)
      .setOrigin(0.5, 1)
      .setDepth(8);
    this.faceRect = scene.add.rectangle(0, 0, 3, 3, FACE_COLOR).setOrigin(0.5, 0.5).setDepth(9);
    // Contorno sin relleno, un poco más grande que el protagonista.
    this.effectRect = scene.add
      .rectangle(0, 0, playerWidth + 6, playerHeight + 6, 0x000000, 0)
      .setOrigin(0.5, 0.5)
      .setDepth(12)
      .setVisible(false);
  }

  update(companion: CompanionSnapshot, player: PlayerSnapshot, status: CompanionStatus): void {
    const x = Math.round(companion.x);
    const y = Math.round(companion.y);
    this.chairRect.setPosition(x, y);
    this.bodyRect.setPosition(x, y);
    this.faceRect.setPosition(x + companion.facing * (BODY_WIDTH / 2 - 2), y - BODY_HEIGHT + 5);

    if (status === this.lastStatus) return;
    this.lastStatus = status;
    this.chairRect.setFillStyle(CHAIR_COLOR_BY_STATUS[status]);
    const effectColor = EFFECT_COLOR_BY_STATUS[status];
    if (effectColor === undefined) {
      this.effectRect.setVisible(false);
    } else {
      this.effectRect.setStrokeStyle(1, effectColor).setVisible(true);
    }
    this.syncEffect(player);
  }

  /** El contorno acompaña al protagonista mientras dura el efecto. */
  followPlayer(player: PlayerSnapshot): void {
    if (this.effectRect.visible) this.syncEffect(player);
  }

  private syncEffect(player: PlayerSnapshot): void {
    this.effectRect.setPosition(Math.round(player.feetX), Math.round(player.feetY - this.playerHeight / 2));
  }
}
