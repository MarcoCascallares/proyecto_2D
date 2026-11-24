import Phaser from 'phaser';

/** Configuración inicial. En la v0.1 solo pasa a Preload. */
export class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    this.scene.start('Preload');
  }
}
