// Configuración global de la v0.1.
// Resolución y tiles: [PROPUESTA] aprobada por el usuario (documento técnico 6.2).

export const GAME_WIDTH = 320;
export const GAME_HEIGHT = 180;
export const TILE_SIZE = 20; // 1 m ≈ 20 px

export const PHYSICS_FPS = 60;
export const FIXED_DT = 1 / PHYSICS_FPS;

// Herramientas de depuración (F3). En la v0.1 quedan activas también en la
// versión compilada para poder comprobar los 60 FPS. Se desactivan al cerrar el juego.
export const DEBUG_TOOLS = true;
