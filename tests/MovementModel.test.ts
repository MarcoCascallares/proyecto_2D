import { describe, expect, it } from 'vitest';
import { stepMovement } from '../src/logic/movement/MovementModel';
import type { MovementInput, MovementState } from '../src/logic/movement/MovementModel';
import playerStats from '../src/data/player_stats.json';

const stats = playerStats.movement;
const DT = 1 / 60;

const NONE: MovementInput = { moveX: 0, jumpPressed: false, jumpHeld: false };
const RIGHT: MovementInput = { moveX: 1, jumpPressed: false, jumpHeld: false };
const LEFT: MovementInput = { moveX: -1, jumpPressed: false, jumpHeld: false };

function grounded(vx = 0): MovementState {
  return { vx, vy: 0, onGround: true };
}

/**
 * Simula un salto en el vacío con suelo en y = 0 (hacia arriba es negativo).
 * El botón se mantiene `holdSteps` pasos y luego se suelta.
 * Devuelve la altura alcanzada (positiva) y los pasos en el aire.
 */
function simulateJump(holdSteps: number): { height: number; airSteps: number } {
  const state = grounded();
  let y = 0;
  let minY = 0;
  let airSteps = 0;
  for (let step = 0; step < 600; step++) {
    const input: MovementInput = {
      moveX: 0,
      jumpPressed: step === 0,
      jumpHeld: step < holdSteps,
    };
    stepMovement(stats, state, input, DT);
    y += state.vy * DT;
    if (y >= 0 && step > 0) {
      y = 0;
      state.vy = 0;
      state.onGround = true;
      break;
    }
    minY = Math.min(minY, y);
    airSteps++;
  }
  return { height: -minY, airSteps };
}

describe('movimiento horizontal', () => {
  it('acelera hacia la velocidad máxima sin superarla', () => {
    const state = grounded();
    let previous = 0;
    for (let i = 0; i < 60; i++) {
      stepMovement(stats, state, RIGHT, DT);
      expect(state.vx).toBeGreaterThanOrEqual(previous);
      expect(state.vx).toBeLessThanOrEqual(stats.maxSpeed);
      previous = state.vx;
    }
    expect(state.vx).toBe(stats.maxSpeed);
  });

  it('alcanza la velocidad máxima en el tiempo que dicen los datos', () => {
    const state = grounded();
    let steps = 0;
    while (state.vx < stats.maxSpeed && steps < 600) {
      stepMovement(stats, state, RIGHT, DT);
      steps++;
    }
    const expectedSteps = Math.ceil(stats.maxSpeed / stats.acceleration / DT);
    expect(steps).toBe(expectedSteps);
  });

  it('frena hasta detenerse sin entrada y no pasa a la dirección contraria', () => {
    const state = grounded(stats.maxSpeed);
    for (let i = 0; i < 60; i++) stepMovement(stats, state, NONE, DT);
    expect(state.vx).toBe(0);
  });

  it('al invertir la dirección frena con el valor de frenado, más fuerte que la aceleración', () => {
    const state = grounded(stats.maxSpeed);
    stepMovement(stats, state, LEFT, DT);
    expect(state.vx).toBeCloseTo(stats.maxSpeed - stats.braking * DT, 5);
  });

  it('en el aire acelera menos (control aéreo)', () => {
    const ground = grounded();
    const air: MovementState = { vx: 0, vy: 0, onGround: false };
    stepMovement(stats, ground, RIGHT, DT);
    stepMovement(stats, air, RIGHT, DT);
    expect(air.vx).toBeCloseTo(ground.vx * stats.airControl, 5);
  });

  it('sin entrada y quieto se queda quieto', () => {
    const state = grounded();
    stepMovement(stats, state, NONE, DT);
    expect(state.vx).toBe(0);
  });
});

describe('gravedad', () => {
  it('en el suelo sigue aplicando gravedad para que el motor detecte el contacto', () => {
    const state = grounded();
    stepMovement(stats, state, NONE, DT);
    expect(state.vy).toBeCloseTo(stats.gravity * DT, 5);
  });

  it('la caída está limitada a la velocidad máxima', () => {
    const state: MovementState = { vx: 0, vy: 0, onGround: false };
    for (let i = 0; i < 300; i++) stepMovement(stats, state, NONE, DT);
    expect(state.vy).toBe(stats.maxFallSpeed);
  });
});

describe('salto', () => {
  it('salta solo desde el suelo', () => {
    const air: MovementState = { vx: 0, vy: 0, onGround: false };
    const result = stepMovement(stats, air, { moveX: 0, jumpPressed: true, jumpHeld: true }, DT);
    expect(result.jumped).toBe(false);
    expect(air.vy).toBeGreaterThan(0);
  });

  it('al saltar da la velocidad inicial y deja de estar en el suelo', () => {
    const state = grounded();
    const result = stepMovement(stats, state, { moveX: 0, jumpPressed: true, jumpHeld: true }, DT);
    expect(result.jumped).toBe(true);
    expect(state.vy).toBe(stats.jumpVelocity);
    expect(state.onGround).toBe(false);
  });

  it('mantener el botón da el salto completo (~44-47 px con los valores iniciales)', () => {
    const { height } = simulateJump(600);
    expect(height).toBeGreaterThan(43);
    expect(height).toBeLessThan(47);
  });

  it('la altura completa alcanza para subir 2 tiles de 20 px', () => {
    expect(simulateJump(600).height).toBeGreaterThan(40);
  });

  it('soltar el botón enseguida da un salto corto', () => {
    const { height } = simulateJump(1);
    expect(height).toBeLessThan(15);
    expect(height).toBeGreaterThan(5);
  });

  it('soltar a mitad del ascenso da una altura intermedia', () => {
    const tap = simulateJump(1).height;
    const mid = simulateJump(8).height;
    const full = simulateJump(600).height;
    expect(mid).toBeGreaterThan(tap);
    expect(mid).toBeLessThan(full);
  });

  it('el corte al soltar no se aplica mientras se cae', () => {
    const state: MovementState = { vx: 0, vy: 50, onGround: false };
    stepMovement(stats, state, NONE, DT);
    expect(state.vy).toBeCloseTo(50 + stats.gravity * DT, 5);
  });

  it('no hay doble salto', () => {
    const state = grounded();
    stepMovement(stats, state, { moveX: 0, jumpPressed: true, jumpHeld: true }, DT);
    const vyAfterJump = state.vy;
    stepMovement(stats, state, { moveX: 0, jumpPressed: true, jumpHeld: true }, DT);
    expect(state.vy).toBeCloseTo(vyAfterJump + stats.gravity * DT, 5);
  });

  it('el salto dura lo esperado (~0,6 s) y cubre más de 40 px a velocidad máxima', () => {
    const { airSteps } = simulateJump(600);
    const seconds = airSteps * DT;
    expect(seconds).toBeGreaterThan(0.55);
    expect(seconds).toBeLessThan(0.7);
    // Un pozo de 2 tiles (40 px) se puede cruzar corriendo.
    expect(seconds * stats.maxSpeed).toBeGreaterThan(40);
  });
});
