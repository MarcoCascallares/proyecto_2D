import Phaser from 'phaser';
import { COMPANION_STATUS_LABEL, cooldownLabel } from '../logic/companion/CompanionModel';
import type { Vitals } from './systems/SupportSystem';

export interface DebugInfo {
  state: string;
  vx: number;
  vy: number;
  onGround: boolean;
  lastTransition: string;
  /** Vida y estado de la compañera (v0.2). */
  support?: Readonly<Vitals>;
}

/** Herramienta de depuración: F3 muestra u oculta FPS, estado, velocidad, vida y compañera. */
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

    const lines = [
      `FPS ${Math.round(fps)}`,
      `estado ${info.state} (${info.lastTransition})`,
      `vx ${info.vx.toFixed(0)}  vy ${info.vy.toFixed(0)}`,
      `suelo ${info.onGround ? 'si' : 'no'}`,
    ];
    const s = info.support;
    if (s) {
      lines.push(
        `vida ${Math.ceil(s.health)}/${s.maxHealth}`,
        `compañera ${COMPANION_STATUS_LABEL[s.status]}`,
        `cura ${cooldownLabel(s.healSeconds)}  escudo ${cooldownLabel(s.shieldSeconds)}`,
      );
    }
    this.text.setText(lines);
  }
}
