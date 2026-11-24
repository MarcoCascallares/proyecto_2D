import Phaser from 'phaser';
import protagonistManifestJson from '../../../assets/final/protagonist.json';
import protagonistSheetUrl from '../../../assets/final/protagonist.png';
import { parseManifest } from '../../logic/assets/AssetValidator';
import type { Manifest } from '../../logic/assets/AssetValidator';
import { PROTAGONIST_SHEET_KEY, animationKey, frameRange } from '../../logic/assets/PlayerAnimation';

/**
 * Carga de recursos. Hoja del protagonista: assets/final/protagonist.png más su
 * manifiesto (documento técnico, 6.3). El manifiesto se lee con el mismo parser
 * que usa el validador; si está mal formado, el juego sigue con el rectángulo
 * provisional y avisa por consola.
 */
function readProtagonistManifest(): Manifest | null {
  const { manifest, issues } = parseManifest(protagonistManifestJson);
  if (manifest === null) {
    console.warn('protagonist.json no es válido; se usa el recurso provisional.', issues);
  }
  return manifest;
}

export class Preload extends Phaser.Scene {
  private protagonist: Manifest | null = null;

  constructor() {
    super('Preload');
  }

  preload(): void {
    this.protagonist = readProtagonistManifest();
    if (this.protagonist === null) return;
    this.load.spritesheet(PROTAGONIST_SHEET_KEY, protagonistSheetUrl, {
      frameWidth: this.protagonist.frameWidth,
      frameHeight: this.protagonist.frameHeight,
    });
  }

  create(): void {
    this.registerAnimations(PROTAGONIST_SHEET_KEY, this.protagonist);
    this.scene.start('Level');
  }

  /** Crea una animación de Phaser por cada entrada del manifiesto. */
  private registerAnimations(sheetKey: string, manifest: Manifest | null): void {
    if (manifest === null || !this.textures.exists(sheetKey)) return;
    const columns = Math.floor(this.textures.get(sheetKey).getSourceImage().width / manifest.frameWidth);
    for (const [name, def] of Object.entries(manifest.animations)) {
      const { start, end } = frameRange(def.row, def.frames, columns);
      this.anims.create({
        key: animationKey(sheetKey, name),
        frames: this.anims.generateFrameNumbers(sheetKey, { start, end }),
        frameRate: def.fps,
        repeat: def.loop ? -1 : 0,
      });
    }
  }
}
