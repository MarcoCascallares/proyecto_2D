import Phaser from 'phaser';

export interface DebugInfo {
  state: string;
  vx: number;
  vy: number;
  onGround: boolean;
  lastTransition: string;
}

/** Herramienta de depuración: F3 muestra u oculta FPS, estado y velocidad. */
export class DebugOverlay {
  private readonly text: Phaser.GameObjects.Text;
  private readonly key: Phaser.Input.Keyboard.Key | null;
  private wasDown = false;
  private visible = false;

  constructor(scene: Phaser.Scene) {
    this.key = scene.input.keyboard?.addKey('F3') ?? null;
    this.text = scene.add
      .text(4, 4, '', {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#ffffff',
        backgroundColor: 'rgba(0,0,0,0.6)',
      })
      .setScrollFactor(0)
      .setDepth(1000)
      .setVisible(false);
  }

  update(fps: number, info: DebugInfo): void {
    const down = this.key?.isDown ?? false;
    if (down && !this.wasDown) {
      this.visible = !this.visible;
      this.text.setVisible(this.visible);
    }
    this.wasDown = down;
    if (!this.visible) return;

    this.text.setText([
      `FPS ${Math.round(fps)}`,
      `estado ${info.state} (${info.lastTransition})`,
      `vx ${info.vx.toFixed(0)}  vy ${info.vy.toFixed(0)}`,
      `suelo ${info.onGround ? 'si' : 'no'}`,
    ]);
  }
}
