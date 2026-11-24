import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, PHYSICS_FPS } from './config';
import { Boot } from './game/scenes/Boot';
import { Level } from './game/scenes/Level';
import { Preload } from './game/scenes/Preload';

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#14151f',
  // Pixel art nítido: sin suavizado y con posiciones redondeadas al píxel.
  pixelArt: true,
  roundPixels: true,
  scale: {
    // Escala entera: el lienzo se amplía ×1, ×2, ×3... al máximo que entra en la ventana.
    mode: Phaser.Scale.NONE,
    zoom: Phaser.Scale.MAX_ZOOM,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 }, // la gravedad la aplica MovementModel
      fps: PHYSICS_FPS, // paso fijo de la física
      debug: false,
    },
  },
  scene: [Boot, Preload, Level],
});
