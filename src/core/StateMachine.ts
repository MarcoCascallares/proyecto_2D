import type { State } from './State';

export type ChangeListener = (from: string | null, to: string) => void;

/** Máquina de estados reutilizable (protagonista, enemigos, compañera...). */
export class StateMachine<TOwner> {
  private readonly owner: TOwner;
  private readonly onChange: ChangeListener | undefined;
  private readonly states = new Map<string, State<TOwner>>();
  private current: State<TOwner> | null = null;

  constructor(owner: TOwner, onChange?: ChangeListener) {
    this.owner = owner;
    this.onChange = onChange;
  }

  add(state: State<TOwner>): this {
    this.states.set(state.name, state);
    return this;
  }

  get currentName(): string | null {
    return this.current?.name ?? null;
  }

  /** Entra al estado inicial. Solo se puede llamar una vez. */
  start(name: string): void {
    if (this.current) throw new Error('La máquina de estados ya fue iniciada');
    this.transition(name);
  }

  /** Cambia de estado. Si ya está en él, no hace nada. */
  change(name: string): void {
    if (this.current?.name === name) return;
    this.transition(name);
  }

  update(dt: number): void {
    if (!this.current) return;
    const next = this.current.update?.(this.owner, dt);
    if (typeof next === 'string') this.change(next);
  }

  private transition(name: string): void {
    const next = this.states.get(name);
    if (!next) throw new Error(`Estado desconocido: ${name}`);
    const previous = this.current;
    previous?.exit?.(this.owner, name);
    this.current = next;
    next.enter?.(this.owner, previous?.name ?? null);
    this.onChange?.(previous?.name ?? null, name);
  }
}
