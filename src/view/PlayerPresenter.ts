import Phaser from 'phaser';
import type { PlayerSnapshot } from '../game/entities/player/Player';

// PRESENTER DEL PROTAGONISTA — la única pieza que conoce cómo se dibuja.
//
// En la v0.1 dibuja un rectángulo provisional. Para pasar al sprite de Gemini
// solo hay que cambiar este archivo: crear un Sprite en el constructor y, en update(),
// reproducir la animación según snapshot.state ("idle", "run", "air" → "jump_up" si
// vy < 0, "fall" si vy >= 0) y espejar con setFlipX(snapshot.facing < 0).
// El pivote del sprite es el centro de los pies: setOrigin(0.5, 1) en la posición
// (feetX, feetY). Nada de movimiento, física ni estados cambia.
//
// Colores provisionales y neutros: la paleta definitiva es una decisión pendiente (3).

const COLOR_BY_STATE: Record<string, number> = {
  idle: 0xe6e8f2,
  run: 0xb9c7ff,
  air: 0xffd9a0,
};

export class PlayerPresenter {
  private readonly bodyRect: Phaser.GameObjects.Rectangle;
  private readonly faceRect: Phaser.GameObjects.Rectangle;
  private readonly width: number;
  private readonly height: number;

  constructor(scene: Phaser.Scene, width: number, height: number) {
    this.width = width;
    this.height = height;
    this.bodyRect = scene.add.rectangle(0, 0, width, height, COLOR_BY_STATE.idle).setOrigin(0.5, 1);
    // Marca de orientación: muestra hacia dónde mira.
    this.faceRect = scene.add.rectangle(0, 0, 4, 4, 0x20233a).setOrigin(0.5, 0.5);
    this.bodyRect.setDepth(10);
    this.faceRect.setDepth(11);
  }

  update(snapshot: PlayerSnapshot): void {
    const x = Math.round(snapshot.feetX);
    const y = Math.round(snapshot.feetY);
    this.bodyRect.setPosition(x, y);
    this.bodyRect.setFillStyle(COLOR_BY_STATE[snapshot.state] ?? 0xffffff);
    this.faceRect.setPosition(x + snapshot.facing * (this.width / 2 - 3), y - this.height + 6);
  }
}
