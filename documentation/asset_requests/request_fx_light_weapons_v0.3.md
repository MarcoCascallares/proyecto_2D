# Pedido formal a Gemini — armas de luz: `fx_light_slash.png` y `fx_light_shot.png` (v0.3)

Este pedido es autocontenido: no hace falta leer nada más para producir las hojas. Si algo no está claro, preguntá antes de dibujar. No decidas por tu cuenta nada que figure como pendiente.

## 1. Qué se pide
Dos hojas de efectos y sus manifiestos:
1. **`fx_light_slash.png`:** el arma de luz que el protagonista forja en cada uno de los **tres golpes de su combo cuerpo a cuerpo**.
2. **`fx_light_shot.png`:** el **proyectil de luz** de su ataque a distancia y su impacto.

Entrega: cada PNG con su `.json` (mismo nombre, misma carpeta): `fx_light_slash.png` + `fx_light_slash.json` y `fx_light_shot.png` + `fx_light_shot.json`.

## 2. Para qué sirven (contexto)
- **Juego:** plataformas 2D lateral, pixel art duro, resolución interna 320 × 180.
- **Decisión 1 (usuario, 24/11/2026):** los poderes del protagonista son **armas de luz forjadas al instante**: hojas, filos o arcos de luz pura, con lectura clara al estilo del combate de League of Legends.
- En la v0.3 (combate) el protagonista tiene un combo de tres golpes y un ataque a distancia. Estos efectos se dibujan **encima** del sprite del protagonista.
- **Habilidades (v0.4):** todavía no hay habilidades definidas, así que **no se pide ninguna hoja de habilidades**. Podés mandar, como extra opcional, bocetos de dirección para habilidades de luz, sin hoja ni manifiesto.
- **Qué falta y se pide aparte:** las animaciones del cuerpo del protagonista para atacar (`attack_1` a `attack_3`, `ranged`, `dodge`, `hurt`, `defeated`). Estos efectos se van a sincronizar con ellas cuando lleguen.

## 3. Cómo se ven
- **El color lo proponés vos** y lo aprueba el usuario. La luz tiene que ser coherente con el protagonista (blanco y dorado) y leerse bien sobre **dos fondos**: Etapa 1 (violetas y magentas vivos) y Etapa 2 (oscuridad densa con focos luminosos intensos).
- Tiene que distinguirse de los ataques de la compañera corrupta (rojo y negro).
- **Translucidez:** el validador rechaza los píxeles semitransparentes. Para dar sensación de brillo o energía usá **tramado** o colores claros opacos, no alfa parcial.
- Pixel art duro, bordes iluminados y fuerte contraste luz/sombra.

## 4. Hoja A — `fx_light_slash.png`
**Medidas**
- Celda: **96 × 64 px**, igual para las tres animaciones.
- **Pivote en (48, 64):** el punto donde el protagonista apoya los pies. Dibujá como si el protagonista estuviera parado en x = 48, con el cuerpo de ~36 px entre y = 28 y y = 64 y mirando a la **derecha**. El efecto va **delante**, sobre todo en la mitad derecha de la celda; el código espeja para mirar a la izquierda.
- Alcance visual máximo hacia adelante: **~44 px desde el centro del cuerpo** (hasta cerca de x = 92). El alcance real del golpe lo define el combate; no lo sugieras con el dibujo más allá de este límite.
- Todo el dibujo tiene que quedar dentro de la celda.

**Animaciones**

| Fila | Nombre | Cuadros | fps | Bucle | Nota |
|---|---|---|---|---|---|
| 0 | `slash_1` | 5 | 14 | no | Primer golpe del combo. |
| 1 | `slash_2` | 5 | 14 | no | Segundo golpe. Que se distinga del primero. |
| 2 | `slash_3` | 5 | 14 | no | Tercer golpe: el remate, más grande o más marcado. |

- La forma de cada golpe (tajo horizontal, ascendente, arco, etc.) la proponés vos.
- **Momento de mayor brillo del filo: cuadros 2 y 3** (desde 0). Más adelante coincidirá con los cuadros de impacto del cuerpo del protagonista. Cuadros y fps son sugeridos y se ajustan cuando llegue esa animación.
- La hoja mide **480 × 192 px** (5 cuadros × 96, 3 filas × 64).

**Manifiesto `fx_light_slash.json`**
```json
{
  "sheet": "fx_light_slash.png",
  "frameWidth": 96,
  "frameHeight": 64,
  "facing": "right",
  "pivot": { "x": 48, "y": 64 },
  "animations": {
    "slash_1": { "row": 0, "frames": 5, "fps": 14, "loop": false },
    "slash_2": { "row": 1, "frames": 5, "fps": 14, "loop": false },
    "slash_3": { "row": 2, "frames": 5, "fps": 14, "loop": false }
  }
}
```

## 5. Hoja B — `fx_light_shot.png`
**Medidas**
- Celda: **32 × 32 px**, igual para las dos animaciones.
- **Pivote en (16, 16):** el centro del efecto. Mirando a la **derecha**; el código lo espeja y lo mueve.
- Tamaño del proyectil: **hasta ~28 × 20 px**, centrado en la celda.

**Animaciones**

| Fila | Nombre | Cuadros | fps | Bucle | Nota |
|---|---|---|---|---|---|
| 0 | `fly` | 4 | 12 | sí | El proyectil en vuelo: un filo o arco de luz lanzado. |
| 1 | `hit` | 4 | 14 | no | Estallido al tocar un enemigo o una pared. |

- La hoja mide **128 × 64 px** (4 cuadros × 32, 2 filas × 32).

**Manifiesto `fx_light_shot.json`**
```json
{
  "sheet": "fx_light_shot.png",
  "frameWidth": 32,
  "frameHeight": 32,
  "facing": "right",
  "pivot": { "x": 16, "y": 16 },
  "animations": {
    "fly": { "row": 0, "frames": 4, "fps": 12, "loop": true },
    "hit": { "row": 1, "frames": 4, "fps": 14, "loop": false }
  }
}
```

## 6. Formato de las hojas
- PNG con transparencia, sin entrelazado.
- **Bordes duros:** cada píxel tiene alfa 0 o 255.
- Sin texto incrustado.
- Nombres de archivo en minúsculas con guion bajo.
- Una animación por fila, cuadros de izquierda a derecha, sin separación ni márgenes. Las filas pueden tener distinta cantidad de cuadros.

## 7. Cómo entregar
Lo ideal son PNG exactos. Si tu herramienta no lo permite:
1. Dibujá cada cuadro en una **cuadrícula lógica** del tamaño de su celda (96 × 64 y 32 × 32) y ampliá todo por un **factor entero** (por ejemplo ×8) **sin suavizar**.
2. Entregá los cuadros en filas, sobre **fondo transparente**, en el orden del manifiesto, más los `.json`.
3. Claude convierte las imágenes a las hojas del contrato, corre el validador e integra el resultado como versión inicial provisional.

## 8. Qué comprueba el validador
- **ERROR (bloquea):** manifiesto mal formado; `facing` distinto de `right`; pivote fuera de la celda; PNG sin transparencia; hoja que no es múltiplo de la celda; fila o cuadros fuera de la hoja; dos animaciones en la misma fila; cuadro declarado pero vacío; dibujo en cuadros no declarados; píxeles semitransparentes.
- **AVISO (no bloquea):** `PIVOT_FEET` (un efecto no tiene pies) y `ANIM_NAME` (`slash_1`, `slash_2`, `slash_3`, `fly` y `hit` todavía no están en la lista del validador). **Son esperables en esta entrega.** Claude va a agregar un tipo de recurso "efecto" al validador para que no aparezcan.

## 9. Además de las hojas, incluí
1. **La paleta usada** en hexadecimal.
2. **Una imagen de referencia** de 320 × 180 con los tres golpes y el proyectil sobre el protagonista, una vez sobre un fondo de la Etapa 1 y otra sobre uno de la Etapa 2. No se integra al juego.

## 10. Antes de entregar, revisá
1. PNG con transparencia, sin entrelazado, alfa solo 0 o 255.
2. Celdas exactas (96 × 64 y 32 × 32), sin márgenes.
3. Una animación por fila, mirando a la derecha.
4. El filo de `slash_N` nace delante del protagonista (pivote (48, 64)) y no pasa de ~44 px desde el centro del cuerpo.
5. Brillo máximo de `slash_N` en los cuadros 2 y 3.
6. Cada `.json` con el mismo nombre que su hoja.
7. Se lee sobre violetas/magentas y sobre oscuridad.

## 11. Qué podés proponer y qué no
- **Sí:** el color y la forma de cada arma, variantes para que el usuario elija, otra cantidad de cuadros o de fps, bocetos de habilidades de luz (sin hoja).
- **No:** cambiar las medidas, el pivote ni el estilo decidido; decidir daño, alcance real, tiempos de combate ni qué habilidades existen. Si creés que hay que cambiar algo de eso, avisá y decide el usuario.
