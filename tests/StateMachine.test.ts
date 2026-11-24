import { describe, expect, it } from 'vitest';
import type { State } from '../src/core/State';
import { StateMachine } from '../src/core/StateMachine';

interface Owner {
  log: string[];
  goTo: string | null;
}

function makeState(name: string): State<Owner> {
  return {
    name,
    enter: (o, prev) => o.log.push(`enter:${name}<-${prev ?? '-'}`),
    exit: (o, next) => o.log.push(`exit:${name}->${next}`),
    update: (o) => {
      if (o.goTo) {
        const target = o.goTo;
        o.goTo = null;
        return target;
      }
    },
  };
}

function build() {
  const owner: Owner = { log: [], goTo: null };
  const changes: string[] = [];
  const machine = new StateMachine<Owner>(owner, (from, to) => changes.push(`${from ?? '-'}>${to}`))
    .add(makeState('a'))
    .add(makeState('b'));
  return { owner, changes, machine };
}

describe('StateMachine', () => {
  it('entra al estado inicial', () => {
    const { owner, machine, changes } = build();
    machine.start('a');
    expect(machine.currentName).toBe('a');
    expect(owner.log).toEqual(['enter:a<--']);
    expect(changes).toEqual(['->a']);
  });

  it('no se puede iniciar dos veces', () => {
    const { machine } = build();
    machine.start('a');
    expect(() => machine.start('b')).toThrow();
  });

  it('change sale del estado anterior y entra al nuevo, en ese orden', () => {
    const { owner, machine } = build();
    machine.start('a');
    owner.log.length = 0;
    machine.change('b');
    expect(owner.log).toEqual(['exit:a->b', 'enter:b<-a']);
    expect(machine.currentName).toBe('b');
  });

  it('change al mismo estado no hace nada', () => {
    const { owner, machine, changes } = build();
    machine.start('a');
    owner.log.length = 0;
    machine.change('a');
    expect(owner.log).toEqual([]);
    expect(changes).toEqual(['->a']);
  });

  it('un estado desconocido lanza un error claro', () => {
    const { machine } = build();
    machine.start('a');
    expect(() => machine.change('zzz')).toThrow('Estado desconocido: zzz');
  });

  it('update transiciona cuando el estado devuelve otro nombre', () => {
    const { owner, machine } = build();
    machine.start('a');
    owner.goTo = 'b';
    machine.update(1 / 60);
    expect(machine.currentName).toBe('b');
  });

  it('update sin estado iniciado no falla', () => {
    const { machine } = build();
    expect(() => machine.update(1 / 60)).not.toThrow();
    expect(machine.currentName).toBe(null);
  });
});
