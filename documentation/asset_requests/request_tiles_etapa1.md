# Pedido formal a Gemini — `tiles_stage1.png` y `props_stage1.png` (Etapa 1)

Este pedido es autocontenido: no hace falta leer nada más para producir las hojas. Si algo no está claro, preguntá antes de dibujar. No decidas por tu cuenta nada que figure como pendiente.

## 1. Qué se pide
1. **`tiles_stage1.png`** (obligatoria): el **tileset sólido** del escenario de la Etapa 1, es decir, suelos, paredes y plataformas.
2. **`props_stage1.png`** (opcional, no bloquea): **decorado no sólido** en piezas de 20 × 20.

Entrega: cada PNG con su `.json` (mismo nombre, misma carpeta). **Estos manifiestos son de otro tipo que los de personajes** (ver sección 5): llevan la clave `"tileset"` y no `"sheet"`.

**Qué no se pide ahora:** fondos con profundidad (capas de parallax a 320 × 180), que dependen del diseño de niveles (decisión pendiente) y se piden después. Los tiles tienen que quedar bien sobre un fondo violeta o magenta que todavía no existe.

## 2. Cómo se ve (decisiones del usuario, cerradas el 24/11/2026)
- **Juego:** plataformas 2D lateral, pixel art duro, resolución interna 320 × 180.
- **Dirección artística:** mezcla de steampunk con LoL, en pixel art duro, con paletas vivas y un fuerte juego de luces y sombras para que el personaje destaque siempre sobre el fondo.
- **Etapa 1:** **violetas y magentas vivos**, con contraste luz/sombra y **bordes iluminados**.
- **Los personajes tienen que destacar sobre el escenario:** el protagonista va de blanco y dorado y la enemiga de rojo y negro. El cuerpo del suelo, las paredes y las plataformas va en valores medios y oscuros, y los bordes iluminados se limitan a la superficie y a los cantos, sin llegar al blanco ni al dorado. Que los pies del protagonista no se pierdan contra el borde de la plataforma.
- Detalles steampunk (remaches, tuberías, engranajes) bienvenidos, sin ensuciar la lectura de la superficie donde se pisa.
- **No expliques de dónde viene la sombra** (decisión pendiente del usuario). Es el mundo tal como lo percibe el protagonista: no lo muestres como simulación ni como dimensión artificial.

## 3. Medidas
- **Pieza: 20 × 20 px** (1 m ≈ 20 px). La pantalla muestra 16 × 9 piezas exactas.
- **La superficie donde se pisa es el borde superior de la pieza (y = 0).** En las piezas que se pisan no dejes aire transparente por encima de la superficie; la colisión del juego ocupa la pieza completa y el personaje apoya sobre ese borde.
- **Las piezas se repiten sin costuras:** las piezas de borde superior e inferior se repiten en horizontal; las de borde izquierdo y derecho, en vertical; el relleno, en los dos sentidos.

## 4. Qué piezas, y cómo se arman las formas
El mapa del juego se define con rectángulos sólidos de cualquier tamaño en piezas. Claude arma cada rectángulo con estas piezas:
- Rectángulo de 2 × 2 piezas o más: **bloque** (esquinas, bordes y relleno).
- Rectángulo de 1 pieza de alto: **plataforma fina** (extremo izquierdo, centro, extremo derecho, o pieza suelta).
- Rectángulo de 1 pieza de ancho y 2 o más de alto: **columna** (arriba, medio, abajo).

**Hoja `tiles_stage1.png`: 16 columnas de 20 px de ancho (320 px). Fila 0 obligatoria; fila 1 opcional.**

| Columna | Fila 0 (obligatoria) | Columna | Fila 1 (opcional: variantes) |
|---|---|---|---|
| 0 | `block_tl` | 0 | `block_fill_2` |
| 1 | `block_t` | 1 | `block_fill_3` |
| 2 | `block_tr` | 2 | `block_t_2` |
| 3 | `block_l` | 3 | `block_t_3` |
| 4 | `block_fill` | 4 | `plat_m_2` |
| 5 | `block_r` | 5 | `plat_m_3` |
| 6 | `block_bl` | | |
| 7 | `block_b` | | |
| 8 | `block_br` | | |
| 9 | `plat_l` | | |
| 10 | `plat_m` | | |
| 11 | `plat_r` | | |
| 12 | `plat_single` | | |
| 13 | `col_top` | | |
| 14 | `col_mid` | | |
| 15 | `col_bottom` | | |

- Las piezas de bloque van **opacas** (sin transparencia) salvo detalles que sobresalgan de la esquina. En `plat_*` y `col_*` se permite transparencia donde la forma no llena la pieza, pero la superficie va en y = 0.
- Las variantes (fila 1) tienen el **mismo borde** que su pieza base, para poder alternarlas y que no se note la repetición.
- La hoja mide **320 × 20 px** (solo fila 0) o **320 × 40 px** (con fila 1).

**Hoja `props_stage1.png` (opcional):** piezas de **20 × 20**, hasta 16 columnas y las filas que necesites, **no sólidas** (el personaje las atraviesa). Cada pieza apoya sobre el borde inferior de su celda. Sugerencias, que podés cambiar: `lamp` (lámpara que da luz), `gear`, `pipe_h`, `pipe_v`, `pipe_corner`, `vent`, `chain`, `crystal`. Nombres en minúsculas con guion bajo. Los elementos más grandes se arman combinando piezas.

## 5. Manifiestos
`tiles_stage1.json` (la clave `"tileset"` indica que no es una hoja de personaje y que el validador de personajes lo deja pasar):
```json
{
  "tileset": "tiles_stage1.png",
  "tileWidth": 20,
  "tileHeight": 20,
  "columns": 16,
  "tiles": {
    "block_tl":    { "col": 0,  "row": 0 },
    "block_t":     { "col": 1,  "row": 0 },
    "block_tr":    { "col": 2,  "row": 0 },
    "block_l":     { "col": 3,  "row": 0 },
    "block_fill":  { "col": 4,  "row": 0 },
    "block_r":     { "col": 5,  "row": 0 },
    "block_bl":    { "col": 6,  "row": 0 },
    "block_b":     { "col": 7,  "row": 0 },
    "block_br":    { "col": 8,  "row": 0 },
    "plat_l":      { "col": 9,  "row": 0 },
    "plat_m":      { "col": 10, "row": 0 },
    "plat_r":      { "col": 11, "row": 0 },
    "plat_single": { "col": 12, "row": 0 },
    "col_top":     { "col": 13, "row": 0 },
    "col_mid":     { "col": 14, "row": 0 },
    "col_bottom":  { "col": 15, "row": 0 }
  }
}
```
Si entregás la fila 1, sumá sus piezas con `"row": 1`. `props_stage1.json` lleva el mismo formato (`"tileset": "props_stage1.png"`) con tus nombres de pieza.

## 6. Formato de las hojas
- PNG con transparencia, sin entrelazado.
- **Bordes duros:** cada píxel tiene alfa 0 o 255. Sin antialiasing ni semitransparencias.
- Sin texto incrustado.
- Nombres de archivo en minúsculas con guion bajo.

## 7. Cómo entregar
Lo ideal es un PNG exacto de 20 × 20 por pieza. Si tu herramienta no lo permite:
1. Dibujá cada pieza en una **cuadrícula lógica de 20 × 20 píxeles** y ampliá todo por un **factor entero** (por ejemplo ×10, o sea 200 × 200 por pieza) **sin suavizar**, con las piezas en la posición de la tabla y sin márgenes ni separaciones.
2. Entregá la imagen sobre **fondo transparente** más los `.json`.
3. Claude reduce por el factor exacto, verifica que las piezas repetidas no tengan costura y corre el validador. Si no hay errores, se integra como versión inicial provisional.

## 8. Qué comprueba el validador
El validador actual solo revisa hojas de personajes y efectos. **Para tilesets se está extendiendo** (Claude lo hace antes de la primera entrega): comprobará que el PNG tenga transparencia y alfa 0 o 255, que la hoja sea múltiplo de 20, que cada pieza declarada exista y no esté vacía y que las piezas de borde se repitan sin costura. Hasta entonces, Claude revisa las piezas a mano.

## 9. Además de las hojas, incluí
1. **La paleta usada** en hexadecimal (los valores exactos todavía no están fijados en el proyecto; los aprueba el usuario).
2. **Una imagen de referencia** de 320 × 180 con un tramo de escenario armado con tus piezas (un suelo, dos plataformas y una pared), un fondo violeta o magenta provisional y el protagonista parado encima, para que el usuario juzgue la lectura. No se integra al juego.

## 10. Antes de entregar, revisá
1. PNG con transparencia, sin entrelazado, alfa solo 0 o 255.
2. Piezas exactas de 20 × 20, en las columnas y filas de la tabla, sin márgenes.
3. La superficie donde se pisa está en el borde superior (y = 0).
4. Bordes y relleno se repiten sin costura.
5. Los personajes (blanco y dorado, rojo y negro) se leen sobre el escenario.
6. Cada `.json` con el mismo nombre que su hoja y la clave `"tileset"`.

## 11. Qué podés proponer y qué no
- **Sí:** variantes de diseño para que el usuario elija, más variantes de piezas, el decorado que te parezca, mejoras de lectura.
- **No:** cambiar el tamaño de pieza, la escala ni el estilo decidido; fijar el diseño de niveles; explicar el origen de la sombra. Si creés que hay que cambiar algo de eso, avisá y decide el usuario.
