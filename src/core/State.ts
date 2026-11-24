// Un estado de una máquina de estados. Sin dependencias de Phaser.

export interface State<TOwner> {
  readonly name: string;
  enter?(owner: TOwner, previous: string | null): void;
  /** Si devuelve el nombre de otro estado, la máquina transiciona a él. */
  update?(owner: TOwner, dt: number): string | void;
  exit?(owner: TOwner, next: string): void;
}
