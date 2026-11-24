import Phaser from 'phaser';
import { GAME_WIDTH } from '../../config';
import { cooldownLabel } from '../../logic/companion/CompanionModel';
import type { Vitals } from '../systems/SupportSystem';

/** Datos que Level le pasa al lanzar la escena. */
export interface HudData {
  vitals: () => Readonly<Vitals>;
}

const MARGIN = 4;
const BAR_WIDTH = 56;
const BAR_X = GAME_WIDTH - MARGIN - BAR_WIDTH;
const LABEL_X = BAR_X - 3;
const BAR_BACK = 0x14151f;
const BAR_FRAME = 0x7077a0;
// Centros verticales de las tres filas: 11-13 px entre una y otra para que el texto
// de 8 px no se pise (antes estaban a 7 px).
const ROW_LIFE = 8;
const ROW_HEAL = 21;
const ROW_SHIELD = 32;
// Fondo detrás de las barras y los textos, para leerlos aunque haya una plataforma debajo.
const PANEL_X = BAR_X - 3 - 72;
const PANEL_Y = 2;
const PANEL_HEIGHT = 38;

interface Bar {
  readonly fill: Phaser.GameObjects.Rectangle;
  readonly label: Phaser.GameObjects.Text;
  lastText: string;
}

/**
 * Interfaz simple de la v0.2: barra de vida y recargas de curación (H) y escudo.
 * Corre en paralelo a Level, con su propia cámara fija. Solo lee datos.
 */
export class HUD extends Phaser.Scene {
  private vitals!: () => Readonly<Vitals>;
  private life!: Bar;
  private heal!: Bar;
  private shield!: Bar;

  constructor() {
    super('HUD');
  }

  init(data: HudData): void {
    this.vitals = data.vitals;
  }

  create(): void {
    this.add
      .rectangle(PANEL_X, PANEL_Y, GAME_WIDTH - 2 - PANEL_X, PANEL_HEIGHT, BAR_BACK, 0.85)
      .setOrigin(0, 0)
      .setStrokeStyle(1, BAR_FRAME);
    this.life = this.makeBar(ROW_LIFE, 6, 0xe05a6a);
    this.heal = this.makeBar(ROW_HEAL, 4, 0x7be39a);
    this.shield = this.makeBar(ROW_SHIELD, 4, 0x8fd0ff);
  }

  override update(): void {
    const v = this.vitals();
    this.setBar(this.life, v.healthRatio, 1, `VIDA ${Math.ceil(v.health)}/${v.maxHealth}`);
    this.setBar(this.heal, v.healReadyRatio, v.healReadyRatio, `CURA (H) ${cooldownLabel(v.healSeconds)}`);
    this.setBar(this.shield, v.shieldReadyRatio, v.shieldReadyRatio, `ESCUDO ${cooldownLabel(v.shieldSeconds)}`);
  }

  private makeBar(centerY: number, height: number, color: number): Bar {
    this.add
      .rectangle(BAR_X, centerY, BAR_WIDTH, height, BAR_BACK)
      .setOrigin(0, 0.5)
      .setStrokeStyle(1, BAR_FRAME);
    const fill = this.add.rectangle(BAR_X, centerY, BAR_WIDTH, height, color).setOrigin(0, 0.5);
    const label = this.add
      .text(LABEL_X, centerY, '', { fontFamily: 'monospace', fontSize: '8px', fontStyle: 'bold', color: '#ffffff' })
      .setOrigin(1, 0.5);
    return { fill, label, lastText: '' };
  }

  /** `ratio` llena la barra; `alpha` la apaga mientras recarga. */
  private setBar(bar: Bar, ratio: number, alpha: number, text: string): void {
    const clamped = Math.min(1, Math.max(0, ratio));
    // Escala en vez de cambiar el tamaño; el mínimo evita una escala de 0.
    bar.fill.setScale(Math.max(clamped, 0.001), 1).setVisible(clamped > 0);
    bar.fill.setAlpha(alpha >= 1 ? 1 : 0.55);
    if (text !== bar.lastText) {
      bar.label.setText(text);
      bar.lastText = text;
    }
  }
}
