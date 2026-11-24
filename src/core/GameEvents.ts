// Catálogo de eventos del juego. Se amplía versión a versión
// (health:changed, energy:changed, damage:dealt, attack:started...).

export interface GameEvents {
  'player:stateChanged': { from: string | null; to: string };
}
