# Pedido formal a Gemini — `companion_corrupt.png` (Etapa 1)

Este pedido es autocontenido: no hace falta leer nada más para producir la hoja. Si algo no está claro, preguntá antes de dibujar. No decidas por tu cuenta nada que figure como pendiente.

## 1. Qué se pide
Una hoja de sprites de la **compañera en su apariencia corrupta (rojo y negro)**, tal como se la ve en la **Etapa 1**, donde es la **rival / enemiga** del protagonista, y su manifiesto.

Entrega: `companion_corrupt.png` + `companion_corrupt.json` (mismo nombre, misma carpeta).

**Qué no se pide ahora:** la apariencia en blanco y dorado, que se usa en la Etapa 2 cuando ella pasa a ser aliada, ni su silla de luz. Van en pedidos posteriores. En esta hoja el cuerpo va **de pie, sin silla**; si la Etapa 1 la usa o no, todavía no está decidido.

## 2. Quién es y cómo se ve (decisiones del usuario, cerradas el 24/11/2026)
- **Juego:** plataformas 2D lateral, pixel art duro, resolución interna 320 × 180.
- **Quién es:** la misma persona que más adelante será la compañera del protagonista. En la Etapa 1 es su enemiga.
- **Estilo del personaje:** atuendo estilizado estilo Genshin Impact, propio de un ser muy poderoso. Mide 1,70 m (el protagonista, 1,80 m).
- **Esta apariencia es rojo y negro y representa corrupción, sin estética demoníaca.** Nada de cuernos, alas, garras, colmillos ni rasgos monstruosos. Tiene que seguir viéndose como una persona poderosa.
- **Tiene que poder reconocerse en su otra versión (blanco y dorado).** Pensá la silueta, el peinado y el corte del atuendo para que, al cambiar la paleta, se vea que es la misma persona. No dibujes la otra versión ahora.
- **Tiene que distinguirse del protagonista de un vistazo,** incluso en silueta. Él va de blanco y dorado.
- **No expliques de dónde viene la sombra.** El origen de la sombra es una decisión pendiente del usuario: el diseño no debe sugerir ninguno.
- **Dirección artística:** mezcla de steampunk con LoL, en pixel art duro, con paletas vivas y un fuerte juego de luces y sombras para que el personaje destaque siempre sobre el fondo.
- **Fondo de la Etapa 1:** violetas y magentas vivos, con contraste luz/sombra y bordes iluminados. El rojo y el negro pueden perderse sobre el magenta: probalo y resolvelo con bordes iluminados y valores claros que la despeguen del fondo.

## 3. Medidas
- Celda de la hoja: **64 × 64 px**, igual para todas las animaciones.
- Cuerpo visible: **~34 px de alto** en `idle` (escala 1 m ≈ 20 px).
- **Una sola escala para todos los cuadros.** No reescales cuadro por cuadro: si una pose es más baja o más ancha, el cuadro es más bajo o más ancho dentro de la celda.
- Mirando a la **derecha**. El código espeja para mirar a la izquierda: no entregues versiones espejadas.
- **Pivote en (32, 64):** centro horizontal de la celda y borde inferior de los pies. Tiene que estar en el mismo lugar en todos los cuadros. Si un cuadro se desplaza, hacelo dentro de la celda, sin cambiar el pivote.

## 4. Animaciones (propuesta de partida)
Una animación por fila, cuadros de izquierda a derecha, sin separación ni márgenes. Las celdas sobrantes de una fila quedan vacías.

| Fila | Nombre | Cuadros | fps | Bucle | Nota |
|---|---|---|---|---|---|
| 0 | `idle` | 4 | 6 | sí | Quieta, en guardia. Pies en el borde inferior. |
| 1 | `run` | 6 | 10 | sí | Desplazamiento lateral. Pies en el borde inferior al apoyar. |
| 2 | `attack_1` | 5 | 14 | no | Un único ataque base. Ver `impact` abajo. |
| 3 | `hurt` | 2 | 10 | no | Recibe un golpe. |
| 4 | `defeated` | 4 | 8 | no | Cae y queda en el suelo. Pose neutra: **no está decidido si muere, queda inconsciente o se retira**; no lo sugieras con el dibujo. El último cuadro es el que se queda. |

- **`attack_1`:** el arma o poder concreto lo proponés vos y lo aprueba el usuario. No definas habilidades extra: su repertorio de combate todavía no está decidido. En el manifiesto, `impact` indica **en qué cuadros golpea visualmente** (numerados desde 0), por ejemplo `{ "from": 2, "to": 3 }`.
- Cantidades de cuadros y fps son **sugeridos**. Podés proponer otros si el diseño lo pide, y se actualiza el manifiesto.
- No se piden `jump_up` ni `fall` por ahora.

Con 6 cuadros como máximo por fila y 5 filas, la hoja mide **384 × 320 px**.

## 5. Formato de la hoja
- PNG con transparencia, sin entrelazado.
- **Bordes duros:** cada píxel tiene alfa 0 o 255. Sin antialiasing ni semitransparencias.
- Sin texto incrustado.
- Nombres de archivo en minúsculas con guion bajo.

## 6. Cómo entregar
Lo ideal es un PNG exacto con las medidas de arriba. Si tu herramienta no lo permite, usá este camino (el mismo que se usó con el protagonista):
1. Dibujá cada cuadro en una **cuadrícula lógica de 64 × 64 píxeles** y ampliá todo por un **factor entero** (por ejemplo ×8) **sin suavizar** (cada píxel lógico pasa a ser un bloque de ×8 por ×8). Así se puede volver al tamaño exacto sin pérdida.
2. Entregá los cuadros en filas, sobre **fondo transparente**, en el orden del manifiesto, más el `.json`.
3. Claude convierte la imagen a la hoja del contrato y corre el validador. Si no hay errores, se integra como versión inicial provisional.

Problemas que tuvieron las entregas anteriores del protagonista, para no repetirlos: personaje de 58 px en vez de 36; pies a 3 px del borde inferior; todos los cuadros con la misma altura aunque la pose cambie (reescalado cuadro por cuadro); manchas grises detrás del personaje; un cuadro con el cuerpo borrado.

## 7. Manifiesto `companion_corrupt.json`
```json
{
  "sheet": "companion_corrupt.png",
  "frameWidth": 64,
  "frameHeight": 64,
  "facing": "right",
  "pivot": { "x": 32, "y": 64 },
  "animations": {
    "idle":     { "row": 0, "frames": 4, "fps": 6,  "loop": true },
    "run":      { "row": 1, "frames": 6, "fps": 10, "loop": true },
    "attack_1": { "row": 2, "frames": 5, "fps": 14, "loop": false, "impact": { "from": 2, "to": 3 } },
    "hurt":     { "row": 3, "frames": 2, "fps": 10, "loop": false },
    "defeated": { "row": 4, "frames": 4, "fps": 8,  "loop": false }
  }
}
```
Las filas se numeran desde 0. Los valores de `impact` son ilustrativos: los reales los completás vos. Los nombres de animación son esos cinco; no inventes otros sin avisar.

## 8. Qué comprueba el validador antes de integrar
Si falla un **ERROR**, no se integra. Los **AVISO** no bloquean.
- **ERROR:** manifiesto mal formado; `facing` distinto de `right`; pivote fuera de la celda; PNG sin transparencia; hoja que no es múltiplo de la celda; fila o cuadros fuera de la hoja; dos animaciones en la misma fila; cuadro declarado pero vacío; dibujo en cuadros no declarados; píxeles semitransparentes; `attack_1` sin `impact`.
- **AVISO:** pies que no apoyan en el pivote (±1 px; en `defeated`, el punto más bajo del cuerpo caído tiene que quedar en el borde inferior); pivote no centrado; nombre de archivo o de animación fuera de convención; fila con dibujo sin usar.

## 9. Además de la hoja, incluí
1. **La paleta usada** en hexadecimal (los valores de color exactos todavía no están fijados en el proyecto; los aprueba el usuario).
2. **Una imagen de referencia** de 320 × 180 con ella y el protagonista parados sobre un fondo de la Etapa 1 (violetas y magentas), para que el usuario juzgue la lectura. No se integra al juego.

## 10. Antes de entregar, revisá
1. PNG con transparencia, sin entrelazado, alfa solo 0 o 255.
2. Celdas exactas de 64 × 64, sin márgenes; una sola escala para todos los cuadros.
3. Una animación por fila, mirando a la derecha.
4. Cuerpo de ~34 px en `idle`; pies en el borde inferior en `idle`, `run`, `attack_1` y `hurt`.
5. `attack_1` con `impact`.
6. `companion_corrupt.json` con el mismo nombre que la hoja.
7. Sin estética demoníaca y sin sugerir el origen de la sombra.

## 11. Qué podés proponer y qué no
- **Sí:** variantes de diseño para que el usuario elija, el arma o poder del ataque, otra cantidad de cuadros o de fps, mejoras de lectura sobre el fondo.
- **No:** cambiar las medidas, la orientación, el pivote ni el estilo decidido; decidir el origen de la sombra, el destino de la derrota ni su repertorio de combate. Si creés que hay que cambiar algo de eso, avisá y decide el usuario.
