import Phaser from 'phaser';
import type { PlayerSnapshot } from '../game/entities/player/Player';
import { PROTAGONIST_SHEET_KEY, animationKey, playerAnimationName } from '../logic/assets/PlayerAnimation';

// PRESENTER DEL PROTAGONISTA — la única pieza que conoce cómo se dibuja.
//
// Si Preload cargó la hoja de Gemini (assets/final/protagonist.png), dibuja un Sprite
// y reproduce la animación según snapshot.state ("idle", "run"; "air" → "jump_up" si
// vy < 0, "fall" si no) y espeja con setFlipX(snapshot.facing < 0). El pivote es el
// centro de los pies: setOrigin(0.5, 1) en (feetX, feetY), que coincide con el pivote
// (32, 64) del contrato visual. Si la hoja no está, dibuja el rectángulo provisional
// de la v0.1 (documento técnico, 6.5). Nada de movimiento, física ni estados cambia.
//
// Colores del rectángulo provisional: neutros, solo para ver las transiciones.

const COLOR_BY_STATE: Record<string, number> = {
  idle: 0xe6e8f2,
  run: 0xb9c7ff,
  air: 0xffd9a0,
};

export class PlayerPresenter {
  private readonly sprite: Phaser.GameObjects.Sprite | null;
  private readonly scene: Phaser.Scene;
  private readonly bodyRect: Phaser.GameObjects.Rectangle | null;
  private readonly faceRect: Phaser.GameObjects.Rectangle | null;
  private readonly width: number;
  private readonly height: number;

  constructor(scene: Phaser.Scene, width: number, height: number) {
    this.scene = scene;
    this.width = width;
    this.height = height;

    if (scene.textures.exists(PROTAGONIST_SHEET_KEY)) {
      this.sprite = scene.add.sprite(0, 0, PROTAGONIST_SHEET_KEY, 0).setOrigin(0.5, 1).setDepth(10);
      this.bodyRect = null;
      this.faceRect = null;
      return;
    }

    this.sprite = null;
    this.bodyRect = scene.add.rectangle(0, 0, width, height, COLOR_BY_STATE.idle).setOrigin(0.5, 1);
    // Marca de orientación: muestra hacia dónde mira.
    this.faceRect = scene.add.rectangle(0, 0, 4, 4, 0x20233a).setOrigin(0.5, 0.5);
    this.bodyRect.setDepth(10);
    this.faceRect.setDepth(11);
  }

  update(snapshot: PlayerSnapshot): void {
    const x = Math.round(snapshot.feetX);
    const y = Math.round(snapshot.feetY);

    if (this.sprite !== null) {
      this.sprite.setPosition(x, y);
      this.sprite.setFlipX(snapshot.facing < 0);
      const key = animationKey(PROTAGONIST_SHEET_KEY, playerAnimationName(snapshot.state, snapshot.vy));
      // Si el manifiesto no trae esa animación, el sprite se queda en el cuadro actual.
      if (this.scene.anims.exists(key)) this.sprite.play(key, true);
      return;
    }

    this.bodyRect?.setPosition(x, y);
    this.bodyRect?.setFillStyle(COLOR_BY_STATE[snapshot.state] ?? 0xffffff);
    this.faceRect?.setPosition(x + snapshot.facing * (this.width / 2 - 3), y - this.height + 6);
  }
}
