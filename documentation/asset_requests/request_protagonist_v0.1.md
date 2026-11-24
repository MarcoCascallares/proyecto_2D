# Pedido formal a Gemini — `protagonist.png` (v0.1)

Este pedido es autocontenido: no hace falta leer nada más para producir la hoja. Si algo no está claro, preguntá antes de dibujar. No decidas por tu cuenta nada que figure como pendiente.

## 1. Qué se pide
Una hoja de sprites del **protagonista** y su manifiesto, con cuatro animaciones: `idle`, `run`, `jump_up` y `fall`. Reemplaza al rectángulo provisional que hoy usa el juego.

Entrega: `protagonist.png` + `protagonist.json` (mismo nombre, misma carpeta).

## 2. Quién es y cómo se ve (decisiones del usuario, cerradas el 24/11/2026)
- **Juego:** plataformas 2D lateral, pixel art duro, resolución interna 320 × 180.
- **Estilo del personaje:** atuendo estilizado estilo Genshin Impact, en **blanco y dorado**, propio de un ser muy poderoso. El protagonista mide 1,80 m.
- **Poderes (para tenerlos en mente; no se dibujan en estas cuatro animaciones):** armas de luz forjadas al instante, como hojas, filos o arcos de luz pura, con lectura clara al estilo del combate de League of Legends.
- **Dirección artística:** mezcla de steampunk con LoL, en pixel art duro, con paletas vivas y un fuerte juego de luces y sombras para que el personaje destaque siempre sobre el fondo.
  - Etapa 1: violetas y magentas vivos, con contraste luz/sombra y bordes iluminados.
  - Etapa 2: oscuridad densa con focos luminosos intensos. No se explica de dónde viene la sombra.
- El primer fondo en el que se lo va a ver es el de la Etapa 1. Probá que el blanco y dorado se lea bien sobre violetas y magentas.

## 3. Medidas
- Celda de la hoja: **64 × 64 px**, igual para todas las animaciones.
- Cuerpo visible: **~36 px de alto** (escala 1 m ≈ 20 px).
- Mirando a la **derecha**. El código espeja para mirar a la izquierda: no entregues versiones espejadas.
- **Pivote en (32, 64):** centro horizontal de la celda y borde inferior de los pies. Tiene que estar en el mismo lugar en todos los cuadros. Si un cuadro se desplaza, hacelo dentro de la celda, sin cambiar el pivote.

## 4. Animaciones
Una animación por fila, cuadros de izquierda a derecha, sin separación ni márgenes. Las celdas sobrantes de una fila quedan vacías.

| Fila | Nombre | Cuadros | fps | Bucle | Nota |
|---|---|---|---|---|---|
| 0 | `idle` | 4 | 6 | sí | Quieto, respirando. Pies en el borde inferior. |
| 1 | `run` | 6 | 10 | sí | Carrera lateral. Pies en el borde inferior al apoyar. |
| 2 | `jump_up` | 2 | 8 | no | Subiendo. |
| 3 | `fall` | 2 | 8 | sí | Cayendo. |

Cantidades de cuadros y fps son **sugeridos** (el de `jump_up` y `fall` es una propuesta de partida, no una decisión del usuario). Podés proponer otros si el diseño lo pide, y se actualiza el manifiesto.

Con 6 cuadros como máximo por fila y 4 filas, la hoja mide **384 × 256 px**.

## 5. Formato de la hoja
- PNG con transparencia, sin entrelazado.
- **Bordes duros:** cada píxel tiene alfa 0 o 255. Sin antialiasing ni semitransparencias.
- Sin texto incrustado.
- Nombres de archivo en minúsculas con guion bajo.

## 6. Manifiesto `protagonist.json`
```json
{
  "sheet": "protagonist.png",
  "frameWidth": 64,
  "frameHeight": 64,
  "facing": "right",
  "pivot": { "x": 32, "y": 64 },
  "animations": {
    "idle":    { "row": 0, "frames": 4, "fps": 6,  "loop": true },
    "run":     { "row": 1, "frames": 6, "fps": 10, "loop": true },
    "jump_up": { "row": 2, "frames": 2, "fps": 8,  "loop": false },
    "fall":    { "row": 3, "frames": 2, "fps": 8,  "loop": true }
  }
}
```
Las filas se numeran desde 0. Si reorganizás la hoja, solo cambia el manifiesto. Los nombres de animación son esos cuatro; no inventes otros sin avisar.

## 7. Qué comprueba el validador antes de integrar
Si falla un **ERROR**, no se integra. Los **AVISO** no bloquean.
- **ERROR:** manifiesto mal formado; `facing` distinto de `right`; pivote fuera de la celda; PNG sin transparencia; hoja que no es múltiplo de la celda; fila o cuadros fuera de la hoja; dos animaciones en la misma fila; cuadro declarado pero vacío; dibujo en cuadros no declarados; píxeles semitransparentes.
- **AVISO:** pies que no apoyan en el pivote (±1 px; no se exige en `jump_up` ni `fall`); pivote no centrado; nombre de archivo o de animación fuera de convención; fila con dibujo sin usar.

## 8. Antes de entregar, revisá
1. PNG con transparencia, sin entrelazado, alfa solo 0 o 255.
2. Celdas exactas de 64 × 64, sin márgenes.
3. Una animación por fila, mirando a la derecha.
4. Pies en el borde inferior de la celda en `idle` y `run`.
5. `protagonist.json` con el mismo nombre que la hoja.

## 9. Qué podés proponer y qué no
- **Sí:** variantes de diseño para que el usuario elija, otra cantidad de cuadros o de fps, mejoras de lectura sobre el fondo.
- **No:** cambiar las medidas, la orientación, el pivote ni el estilo decidido. Si creés que hay que cambiar algo de eso, avisá y decide el usuario.
