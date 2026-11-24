# Lista de comprobación — v0.2 (compañera)

Marcá cada punto jugando en Brave. Si algo falla, anotá qué hiciste y qué pasó.
Los valores de curación, escudo y recargas son **de prueba** (decisión 12 abierta): lo que importa acá es que el comportamiento sea el correcto y cómo se siente.

## Arranque
- [ ] `npm run typecheck` termina sin errores.
- [ ] `npm test` pasa (deberían ser 142 pruebas).
- [ ] `npm run build` termina sin errores y `dist/index.html` se abre con doble clic.
- [ ] Arriba a la derecha se ven tres barras: VIDA, CURA (H) y ESCUDO, sobre un panel oscuro.
- [ ] Las tres filas no se pisan y los textos se leen (por ejemplo "lista" no se confunde con "liste").
- [ ] F3 muestra, además de lo de la v0.1, tres líneas: vida, estado de la compañera y recargas.

## Seguimiento
- [ ] La compañera aparece detrás del protagonista, sobre una silla.
- [ ] Al correr, la sigue con un pequeño retraso y se siente flotando.
- [ ] Al darse vuelta el protagonista, ella pasa al otro lado.
- [ ] Atraviesa paredes y plataformas sin chocar ni trabarse (es lo esperado: no tiene colisiones).
- [ ] Si el protagonista cae al vacío y reaparece, ella lo alcanza sin quedarse perdida.

## Escudo (tecla T = daño de prueba de 25)
- [ ] Primer toque de T: el golpe se absorbe. La vida sigue en 100/100 y el contorno celeste aparece un momento.
- [ ] Segundo toque de T enseguida: la vida baja a 75/100.
- [ ] La barra ESCUDO se vacía al absorber y se llena sola.
- [ ] A los 8 segundos el escudo vuelve a absorber un golpe.

## Curación (tecla H)
- [ ] Con la vida baja, H recupera 40 (por ejemplo, de 50 a 90). Aparece el contorno verde un momento.
- [ ] H sin que haya pasado la recarga (12 s) no hace nada.
- [ ] La barra CURA (H) se llena durante los 12 s y el texto cuenta los segundos.
- [ ] Con la vida completa, H no gasta la curación (la barra no se vacía).
- [ ] La vida nunca pasa de 100 ni baja de 0.

## Estados (F3)
- [ ] "reposo" cuando todo está listo.
- [ ] "curando" y "escudo activo" duran un instante (medio segundo) después de usarlos.
- [ ] "recargando" mientras alguna habilidad espera.
- [ ] Vuelve a "reposo" cuando las dos están listas.

## No se rompió lo de la v0.1
- [ ] Mover, saltar, colisiones y cámara se sienten igual que antes.
- [ ] F3 sigue mostrando FPS cerca de 60.

## Criterio de aceptación: preparado para los sprites
- [ ] (Lo revisa Claude) La compañera se reemplaza por un sprite tocando solo `src/view/CompanionPresenter.ts`.

## Sensación de los valores de prueba
Anotá lo que sientas, para ajustar `src/data/companion_stats.json` (no hace falta tocar código):
- Curación (+40, recarga 12 s): [ ] justa  [ ] poca  [ ] mucha  |  recarga: [ ] justa  [ ] corta  [ ] larga
- Escudo (1 golpe, recarga 8 s): [ ] justo  [ ] flojo  [ ] fuerte  |  recarga: [ ] justa  [ ] corta  [ ] larga
- Retraso y distancia de la compañera: [ ] bien  [ ] muy pegada  [ ] muy lejos  [ ] muy lenta  [ ] muy rápida
- Si preferís cambiar la regla (por ejemplo, escudo con cantidad fija de daño, o curación que consuma energía), decilo: eso es una decisión tuya, no se cambia solo.
