// Acciones de entrada del juego. Las teclas NO están en el código:
// viven en src/data/keymap.json y se pueden remapear.

export const ACTION_NAMES = [
  'move_left',
  'move_right',
  'jump',
  'dodge',
  'attack_melee',
  'attack_ranged',
  'ability',
  'heal_companion',
  /** Solo desarrollo (v0.2): hace daño al protagonista para probar curación y escudo. */
  'debug_damage',
] as const;

export type ActionName = (typeof ACTION_NAMES)[number];

/** Acción → nombres de tecla (por ejemplo "A", "SPACE", "SHIFT"). */
export type Keymap = Record<ActionName, string[]>;
