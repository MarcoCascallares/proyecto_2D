# Pedido formal a Gemini — `fx_shield.png` (Etapa 2)

Este pedido es autocontenido: no hace falta leer nada más para producir la hoja. Si algo no está claro, preguntá antes de dibujar. No decidas por tu cuenta nada que figure como pendiente.

## 1. Qué se pide
Una hoja con el **efecto visual del escudo** de la compañera y su manifiesto, con una animación: `absorb`. Reemplaza al contorno celeste provisional que hoy usa el juego.

Entrega: `fx_shield.png` + `fx_shield.json` (mismo nombre, misma carpeta).

## 2. Para qué sirve (contexto)
- **Juego:** plataformas 2D lateral, pixel art duro, resolución interna 320 × 180.
- En la **Etapa 2** la compañera es aliada del protagonista y lo protege con un **escudo automático**: cuando llega un golpe, el escudo lo **absorbe entero** (la vida no baja) y después queda en recarga unos segundos.
- Este efecto se muestra **un instante, en el momento en que el escudo absorbe un golpe**. Dura **0,5 segundos** en pantalla.
- El golpe puede venir de cualquier lado, así que el efecto es **simétrico**: no depende de la dirección.
- **Qué no se pide:** una versión "escudo listo" que se vea todo el tiempo (todavía no está decidido si el escudo es visible mientras espera), ni el efecto de curación (pedido aparte).

## 3. Cómo se ve (decisiones del usuario, cerradas el 24/11/2026)
- **Los poderes son luz pura** (decisión 1: armas de luz forjadas al instante). El escudo es de luz, con lectura clara al estilo del combate de League of Legends.
- **Dirección artística:** mezcla de steampunk con LoL, en pixel art duro. Etapa 2: **oscuridad densa con focos luminosos intensos**; el efecto tiene que leerse muy bien sobre fondo oscuro.
- **El color lo proponés vos** y lo aprueba el usuario. Tiene que distinguirse del blanco y dorado del protagonista, del rojo y negro de la apariencia corrupta de la compañera y de los focos de luz del escenario. El celeste actual es solo un marcador provisional.
- **Translucidez:** el validador rechaza los píxeles semitransparentes también en los efectos. Para dar sensación de energía o de vidrio usá **tramado** (patrón de píxeles alternados) o colores claros opacos, no alfa parcial.

## 4. Medidas
- Celda de la hoja: **64 × 64 px**.
- **Mismo tamaño y mismo pivote que la hoja del protagonista: (32, 64).** Así el código coloca el efecto en el mismo punto que su sprite.
- El protagonista mide ~36 px de alto, con los pies en el borde inferior de su celda (y = 64) y el centro del cuerpo cerca de (32, 46). El escudo **lo rodea con margen**, sin salirse de la celda.
- Todo el dibujo tiene que quedar **dentro de la celda de 64 × 64**.

## 5. Animación

| Fila | Nombre | Cuadros | fps | Bucle | Nota |
|---|---|---|---|---|---|
| 0 | `absorb` | 5 | 10 | no | Se forma, destella en el momento de absorber el golpe y se disipa. 5 cuadros a 10 fps = 0,5 s. |

- Cuadros y fps son **sugeridos**; si proponés otros, que la animación siga durando cerca de 0,5 s, y se actualiza el manifiesto.
- La hoja mide **320 × 64 px**.

## 6. Formato de la hoja
- PNG con transparencia, sin entrelazado.
- **Bordes duros:** cada píxel tiene alfa 0 o 255.
- Sin texto incrustado.
- Nombres de archivo en minúsculas con guion bajo.

## 7. Cómo entregar
Lo ideal es un PNG exacto. Si tu herramienta no lo permite:
1. Dibujá cada cuadro en una **cuadrícula lógica de 64 × 64 píxeles** y ampliá todo por un **factor entero** (por ejemplo ×8) **sin suavizar**.
2. Entregá los cuadros en una fila, sobre **fondo transparente**, más el `.json`.
3. Claude convierte la imagen a la hoja del contrato, corre el validador e integra el resultado como versión inicial provisional.

## 8. Manifiesto `fx_shield.json`
```json
{
  "sheet": "fx_shield.png",
  "frameWidth": 64,
  "frameHeight": 64,
  "facing": "right",
  "pivot": { "x": 32, "y": 64 },
  "animations": {
    "absorb": { "row": 0, "frames": 5, "fps": 10, "loop": false }
  }
}
```
El nombre de animación es `absorb`; no inventes otros sin avisar.

## 9. Qué comprueba el validador
- **ERROR (bloquea):** manifiesto mal formado; `facing` distinto de `right`; pivote fuera de la celda; PNG sin transparencia; hoja que no es múltiplo de la celda; fila o cuadros fuera de la hoja; cuadro declarado pero vacío; dibujo en cuadros no declarados; píxeles semitransparentes.
- **AVISO (no bloquea):** `PIVOT_FEET` (un efecto no tiene pies) y `ANIM_NAME` (`absorb` todavía no está en la lista del validador). **Son esperables en esta entrega.** Claude va a agregar un tipo de recurso "efecto" al validador para que no aparezcan.

## 10. Además de la hoja, incluí
1. **La paleta usada** en hexadecimal.
2. **Una imagen de referencia** de 320 × 180 con el efecto sobre el protagonista en un fondo oscuro de la Etapa 2. No se integra al juego.

## 11. Qué podés proponer y qué no
- **Sí:** el color y la forma del escudo, variantes para que el usuario elija, otra cantidad de cuadros o de fps, una versión "escudo listo" como propuesta aparte (sin hoja).
- **No:** cambiar las medidas, el pivote ni el estilo decidido; decidir cómo funciona el escudo (cuántos golpes absorbe, recargas). Si creés que hay que cambiar algo de eso, avisá y decide el usuario.
