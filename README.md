# Proyecto Luz — v0.1 (movimiento y cámara) + validador de recursos

Necesitás **Node.js 20 o más nuevo** (https://nodejs.org, versión LTS). Los comandos van en una terminal abierta dentro de esta carpeta.

## 1. Instalar (una sola vez)

```bash
npm install phaser@4.2.1
npm install --save-dev vite vite-plugin-singlefile vitest typescript tsx @types/node
```

Estos comandos descargan los paquetes y los anotan en `package.json`. `tsx` y `@types/node` son para el validador de recursos.

> **Si ya habías instalado la v0.1 antes** (sin `tsx`): corré solo
> `npm install --save-dev tsx @types/node` y agregá a mano estas dos líneas dentro de `"scripts"` en tu `package.json`
> (no reemplaces el archivo entero, perderías los paquetes ya anotados):
>
> ```json
> "validate-assets": "tsx tools/validate-assets.ts",
> "make-sample": "tsx tools/make-sample-sheet.ts"
> ```
>
> Acordate de la coma al final de la línea anterior.

## 2. Probar el juego mientras se desarrolla

```bash
npm run dev
```

Abre la dirección que muestra la terminal (normalmente http://localhost:5173) en Brave.

## 3. Generar el `index.html` único

```bash
npm run build
```

Queda en `dist/index.html`. **Abrí ese**, no el `index.html` de la raíz (el de la raíz es el fuente y se ve en negro). Funciona con doble clic, sin internet y sin servidor.

## 4. Comprobar el código (opcional)

```bash
npm run typecheck   # tipos de TypeScript
npm test            # 84 pruebas de la lógica y del validador
```

## 5. Validador de recursos (para las hojas de Gemini)

Comprueba que una hoja de sprites cumpla el contrato visual (sección 6 de `documentation/technical_design.md`) antes de integrarla.

```bash
npm run make-sample
npm run validate-assets -- assets/samples --attacks assets/samples/attacks.json
```

El primer comando crea una hoja de muestra válida en `assets/samples/` (un muñeco geométrico, no es arte del juego). El segundo la valida y debería decir `Se puede integrar`.

Para validar lo que entregue Gemini, dejá la hoja y su manifiesto en `assets/final/` (`protagonist.png` + `protagonist.json`) y corré:

```bash
npm run validate-assets
```

Cada problema dice qué es, dónde está (fila, cuadro, píxel) y quién lo corrige. Los `ERROR` bloquean la integración; los `AVISO`, no.

`assets/final/` ya trae la hoja provisional del protagonista (`protagonist.png` + `protagonist.json`) y el juego la usa: `Preload` la carga y `PlayerPresenter` reproduce `idle`, `run`, `jump_up` y `fall`. Para cambiarla por otra versión, reemplazá esos dos archivos, corré `npm run validate-assets` y `npm run build`; no hace falta tocar código. Si el manifiesto no es válido, el juego avisa por consola y vuelve al rectángulo provisional; si borrás los archivos, el build falla.

## Controles (provisionales, se cambian en `src/data/keymap.json`)

| Acción | Tecla |
|---|---|
| Mover | A / D |
| Saltar (mantené para saltar más alto) | Espacio |
| Curar con la compañera (recarga de 12 s) | H |
| Daño de prueba de 25 al protagonista (solo desarrollo) | T |
| Mostrar/ocultar FPS, estado, vida y compañera | F3 |

Las demás acciones del archivo (esquiva, ataques, habilidad) están reservadas para versiones futuras y todavía no hacen nada.

## Si algo falla

Copiá el mensaje de error completo de la terminal o de la consola del navegador (F12 → Consola) y pegalo en el chat.

## Estructura

Ver `documentation/technical_design.md`, secciones 5 y 8.6. La sección 0 de ese documento dice en qué fase está el proyecto.
