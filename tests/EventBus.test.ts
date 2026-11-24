import { describe, expect, it } from 'vitest';
import { EventBus } from '../src/core/EventBus';
import type { GameEvents } from '../src/core/GameEvents';

describe('EventBus', () => {
  it('entrega el evento a los suscriptores', () => {
    const bus = new EventBus<GameEvents>();
    const received: string[] = [];
    bus.on('player:stateChanged', ({ from, to }) => received.push(`${from}>${to}`));
    bus.emit('player:stateChanged', { from: 'idle', to: 'run' });
    expect(received).toEqual(['idle>run']);
  });

  it('la función devuelta por on() da de baja al suscriptor', () => {
    const bus = new EventBus<GameEvents>();
    let count = 0;
    const off = bus.on('player:stateChanged', () => count++);
    bus.emit('player:stateChanged', { from: null, to: 'idle' });
    off();
    bus.emit('player:stateChanged', { from: 'idle', to: 'run' });
    expect(count).toBe(1);
  });

  it('un suscriptor puede darse de baja durante la emisión sin afectar a los demás', () => {
    const bus = new EventBus<GameEvents>();
    const calls: string[] = [];
    const offFirst = bus.on('player:stateChanged', () => {
      calls.push('first');
      offFirst();
    });
    bus.on('player:stateChanged', () => calls.push('second'));
    bus.emit('player:stateChanged', { from: null, to: 'idle' });
    bus.emit('player:stateChanged', { from: 'idle', to: 'run' });
    expect(calls).toEqual(['first', 'second', 'second']);
  });

  it('emitir sin suscriptores no falla', () => {
    const bus = new EventBus<GameEvents>();
    expect(() => bus.emit('player:stateChanged', { from: null, to: 'idle' })).not.toThrow();
  });

  it('clear() elimina todos los suscriptores', () => {
    const bus = new EventBus<GameEvents>();
    let count = 0;
    bus.on('player:stateChanged', () => count++);
    bus.clear();
    bus.emit('player:stateChanged', { from: null, to: 'idle' });
    expect(count).toBe(0);
  });
});
