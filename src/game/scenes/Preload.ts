import Phaser from 'phaser';

/**
 * Carga de recursos y manifiestos. En la v0.1 no hay recursos: el juego usa formas
 * geométricas provisionales. Cuando lleguen las hojas de Gemini se cargarán aquí,
 * junto con su animations.json (documento técnico, sección 6).
 */
export class Preload extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  create(): void {
    this.scene.start('Level');
  }
}
