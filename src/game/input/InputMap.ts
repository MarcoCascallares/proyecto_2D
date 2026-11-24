import Phaser from 'phaser';
import type { ActionName, Keymap } from '../../core/actions';

/**
 * Entrada por acciones. El juego pregunta por acciones ("jump"), nunca por teclas:
 * las teclas se leen de keymap.json y se pueden remapear.
 *
 * `poll()` se llama una vez por cuadro de pantalla y "recuerda" las pulsaciones nuevas.
 * `consumePressed()` las entrega al paso fijo de 60 Hz, de modo que ninguna pulsación
 * se pierde aunque el monitor refresque a 144 Hz.
 */
export class InputMap {
  private readonly keys = new Map<ActionName, Phaser.Input.Keyboard.Key[]>();
  private readonly wasDown = new Map<ActionName, boolean>();
  private readonly latched = new Set<ActionName>();

  constructor(scene: Phaser.Scene, keymap: Keymap, actions: readonly ActionName[]) {
    const keyboard = scene.input.keyboard;
    if (!keyboard) throw new Error('El teclado no está disponible en esta escena');
    for (const action of actions) {
      const names = keymap[action];
      this.keys.set(
        action,
        names.map((name) => keyboard.addKey(name)),
      );
      this.wasDown.set(action, false);
    }
  }

  /** Detecta pulsaciones nuevas. Llamar una vez por cuadro. */
  poll(): void {
    for (const action of this.keys.keys()) {
      const down = this.isDown(action);
      if (down && !this.wasDown.get(action)) this.latched.add(action);
      this.wasDown.set(action, down);
    }
  }

  isDown(action: ActionName): boolean {
    return this.keys.get(action)?.some((key) => key.isDown) ?? false;
  }

  /** true una sola vez por cada pulsación nueva. */
  consumePressed(action: ActionName): boolean {
    return this.latched.delete(action);
  }

  /** -1, 0 o 1 según qué acciones de un par estén activas. */
  axis(negative: ActionName, positive: ActionName): -1 | 0 | 1 {
    const value = (this.isDown(positive) ? 1 : 0) - (this.isDown(negative) ? 1 : 0);
    return value as -1 | 0 | 1;
  }
}
