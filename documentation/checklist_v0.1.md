# Lista de comprobación — v0.1

Marcá cada punto jugando en Brave. Si algo falla, anotá qué hiciste y qué pasó.

## Arranque
- [ ] `npm run build` termina sin errores y crea `dist/index.html`.
- [ ] `dist/index.html` se abre con doble clic y se ve el nivel (sin internet).
- [ ] Pesa menos de ~2 MB (anotá el tamaño real: ______ MB).

## Criterio 1 — Rendimiento
- [ ] F3 muestra FPS cerca de 60 de forma estable.

## Criterio 2 — Controles
- [ ] A mueve a la izquierda y D a la derecha.
- [ ] Espacio salta.
- [ ] Mantener Espacio salta más alto que un toque rápido.
- [ ] No se puede saltar en el aire (sin doble salto).

## Criterio 3 — Colisiones
- [ ] No atraviesa el suelo, las paredes ni las plataformas.
- [ ] Se puede subir a las tres plataformas flotantes de la izquierda.
- [ ] Se puede cruzar el pozo del medio saltando mientras se corre.
- [ ] Se puede subir la escalera de bloques.
- [ ] Si cae al vacío, reaparece al inicio.
- [ ] Al saltar debajo de la plataforma de la derecha, la cabeza se frena contra ella.

## Criterio 4 — Cámara
- [ ] La cámara sigue al personaje.
- [ ] Se detiene en los bordes del nivel y no muestra vacío.
- [ ] No vibra ni tiembla.

## Criterio 5 — Nitidez
- [ ] Los bordes de los rectángulos se ven nítidos, sin borrosidad.
- [ ] Al cambiar el tamaño de la ventana, la imagen se agranda en saltos enteros y se mantiene centrada.

## Criterio 6 — Preparado para los sprites
- [ ] (Lo revisa Claude) El rectángulo se reemplaza por un sprite tocando solo `src/view/PlayerPresenter.ts`.

## Sensación de control (lo más importante)
Anotá lo que sientas, para ajustar `src/data/player_stats.json`:
- Velocidad al correr: [ ] justa  [ ] lenta  [ ] rápida
- Altura del salto: [ ] justa  [ ] baja  [ ] alta
- Peso/gravedad: [ ] justa  [ ] flotante  [ ] pesada
- Frenado al soltar la tecla: [ ] justo  [ ] resbala  [ ] brusco
- Control en el aire: [ ] justo  [ ] poco  [ ] mucho
