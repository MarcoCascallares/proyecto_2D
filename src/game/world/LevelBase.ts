import Phaser from 'phaser';
import {
  levelSizePx,
  spawnPositionPx,
  tileRectToPixels,
  validateLevel,
} from '../../logic/world/LevelData';
import type { LevelData } from '../../logic/world/LevelData';

const SOLID_FILL = 0x4a4f66;
const SOLID_STROKE = 0x7077a0;

/**
 * Construye un nivel a partir de sus datos: sólidos con colisión (y su aspecto
 * provisional). Más adelante la capa visual pasará a WorldSkin (v0.6) y quedará
 * aquí solo la geometría lógica.
 */
export class LevelBase {
  readonly solids: Phaser.Physics.Arcade.StaticGroup;
  readonly widthPx: number;
  readonly heightPx: number;
  readonly spawn: { x: number; feetY: number };

  constructor(scene: Phaser.Scene, data: LevelData) {
    const errors = validateLevel(data);
    if (errors.length > 0) {
      throw new Error(`Nivel inválido (${data.name}):\n- ${errors.join('\n- ')}`);
    }

    const size = levelSizePx(data);
    this.widthPx = size.width;
    this.heightPx = size.height;
    this.spawn = spawnPositionPx(data);

    this.solids = scene.physics.add.staticGroup();
    for (const solid of data.solids) {
      const r = tileRectToPixels(solid, data.tileSize);
      const rect = scene.add
        .rectangle(r.x, r.y, r.width, r.height, SOLID_FILL)
        .setOrigin(0, 0)
        .setStrokeStyle(1, SOLID_STROKE);
      this.solids.add(rect);
    }
  }
}
