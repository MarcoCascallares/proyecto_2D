# DOCUMENTO TÉCNICO — PROYECTO LUZ

**Versión:** borrador 0.5 · **Fecha:** 23/11/2026 · **Estado:** v0.1 funcionando; validador de recursos listo
**Destinatarios:** Claude (programación y lógica) y Gemini (recursos visuales). Lo lee y aprueba el usuario.
**Deriva de:** *Documento Maestro de Contexto*. Reemplaza a los borradores 0.1 y 0.2.

**Etiquetas**
- **[DECIDIDO]**: viene del Documento Maestro.
- **[DELEGADO]**: el usuario dejó la decisión en manos de Claude, con criterios que él fijó.
- **[PROPUESTA]**: necesita aprobación explícita del usuario antes de ser definitiva.
- **[PENDIENTE]**: decisión del usuario. Ni Claude ni Gemini la toman.

**Cómo usar este documento**
- **Claude:** secciones 2 a 5, 7 y 8. Es lo que construyo.
- **Gemini:** secciones 6, 7 y 9. Es lo que producís y cómo lo entregás.
- **Los dos:** la sección 6 (contrato visual) es el punto de encuentro. Si algo ahí cambia, se cambia en este documento y se avisa a ambos.
- **Usuario:** sección 0 (en qué fase estamos), sección 10 (qué hay que decidir) y sección 7 (qué avanza sin esperar).
- **Al retomar en otro chat:** leer primero la sección 0.

---

## 0. ESTADO DEL PROYECTO Y TRASPASO A OTRO CHAT

*Actualizá esta sección al final de cada sesión. Es lo primero que debe leer Claude al retomar.*

**Última actualización:** 23/11/2026

### 0.1 Fase actual
**v0.1 (movimiento y cámara): FUNCIONANDO.** Compila sin errores (`dist/index.html` de 1,38 MB; 361 KB comprimido) y el usuario confirmó en Brave que "lo hace todo": movimiento, salto, colisiones y cámara. Pendiente solo el ajuste fino de la sensación de control y confirmar el resultado de `npm run typecheck` y `npm test` en su PC.
Fases siguientes (plan del Documento Maestro): 0.2 Compañera → 0.3 Combate → 0.4 Habilidades → 0.5 Entrenamiento → 0.6 Mundo y revelación. Ninguna está empezada. Antes de implementar la 0.2, Claude presenta su diseño y espera aprobación (Documento Maestro, sección 15).

### 0.2 Qué está hecho
- Documento técnico 0.3 (este archivo), con el motor elegido, el contrato visual compartido con Gemini y el plan en paralelo.
- Proyecto `proyecto-luz` completo para la v0.1: movimiento lateral con aceleración y frenado, salto variable, gravedad, colisiones Arcade, cámara con límites, escalado entero, mapa de acciones remapeable (`keymap.json`), nivel de prueba, herramienta F3, rectángulo provisional con `PlayerPresenter`.
- Lógica pura (`core/`, `logic/`, `data/`): compila sin errores y pasa las pruebas (con un sustituto de Vitest). Simulación de saltos: todas las plataformas del nivel son alcanzables.
- **Validador de recursos** (sección 6.6): `npm run validate-assets`. Lee PNG de cualquier formato habitual, revisa hoja y manifiesto contra el contrato visual y, opcionalmente, la sincronización del golpe. Incluye una hoja de muestra válida (`npm run make-sample`). 84 pruebas en total; el lector de PNG se comprobó contra archivos reales en 10 formatos (RGBA, RGB, indexado de 2/4/8 bits con transparencia, grises, 16 bits).
- `README.md` (instalación y uso) y `documentation/checklist_v0.1.md` (lista para probar jugando).

### 0.3 Qué NO está verificado
- La sensación de control (velocidad, altura de salto, gravedad, frenado): solo la puede evaluar el usuario jugando. Los valores de `src/data/player_stats.json` siguen siendo provisionales hasta que dé su opinión.
- Salida de `npm run typecheck` y `npm test` en la PC del usuario (no se reportó todavía).
- Brave en Windows es el único entorno probado. Otros navegadores y Safari/iOS no.
- Resuelto: la parte de Phaser (`game/`, `view/`, `main.ts`) se escribió sin poder ejecutar Phaser, pero compiló a la primera con Phaser 4.2.1 y se ve y se mueve bien. El plan de bajar a Phaser 3.x ya no hace falta.
- Aviso para quien lo pruebe: se abre `dist\index.html` (el compilado), no el `index.html` de la raíz, que es el fuente y se ve en negro si se abre con doble clic.

### 0.4 Próximo paso inmediato
1. El usuario da su opinión sobre la sensación de control (velocidad, salto, gravedad, frenado) y Claude ajusta `player_stats.json`.
2. El usuario instala las dos herramientas del validador (`npm install --save-dev tsx @types/node`), agrega los dos scripts a su `package.json` (ver README) y prueba `npm run make-sample` y `npm run validate-assets -- assets/samples`. Claude ya lo dejó listo, pero no pudo ejecutarlo en la PC del usuario.
3. Claude presenta el diseño de la **v0.2 (compañera)** y espera aprobación. Antes conviene que el usuario cierre la decisión 12 (balance de curación y recargas) al menos en lo básico.
4. En paralelo, Gemini propone conceptos para las decisiones 1, 2 y 3 (9.3). Cuando el usuario cierre la 2, se pide la hoja `protagonist.png` para reemplazar el rectángulo.

### 0.5 Decisiones del usuario
- **Cerradas el 23/11/2026:** decisión 4 (320×180; personajes ~36 px en celda de 64×64; 1 m ≈ 20 px; tiles de 20×20); salto variable sin coyote time ni buffer; motor delegado a Claude (Phaser 4.2.1); el usuario instala los paquetes y compila en su PC.
- **Pendientes que más desbloquean a Gemini:** 2 (diseño físico de ambos personajes), 3 (paletas), 1 (poderes). Gemini puede proponer conceptos para esas tres sin esperar (9.3).
- **Pendientes técnicas:** G (pendientes y rampas, antes de la v0.5) y H (soporte de mando).

### 0.6 Cómo retomar en otro chat
Adjuntar: (1) este documento, (2) el Documento Maestro de Contexto, (3) el zip del proyecto o `src/` si cambió, y (4) lo que haya devuelto el usuario (errores, checklist). Después decir en una línea qué se quiere hacer.

Datos para Claude: el usuario escribe en español rioplatense y quiere que se responda siempre en español, directo y sin relleno. Prueba en el navegador Brave. Reparto fijo: Claude programa y define cómo funciona; Gemini produce los recursos visuales y define cómo se ven; ChatGPT coordina. Claude no decide ninguna de las decisiones pendientes del Documento Maestro (sección 10.1) sin aprobación.

---

## 1. Qué cambió

### 1.1 En el borrador 0.3 (respecto del 0.2)
1. **Aprobado por el usuario:** las medidas de sprites del contrato visual (6.2: personajes de ~36 px en celda de 64×64, 1 m ≈ 20 px, tiles de 20×20), que cierran la decisión pendiente 4, y el salto variable (decisión técnica D). Pasan a [DECIDIDO].
2. **Versión de Phaser:** 4.2.1, la estable según el README publicado.
3. **Corrección del peso:** los ~313 KB de `phaser-arcade.min.js` son comprimidos (gzip); sin comprimir pesa ~1,18 MB. La build completa pesa ~345 KB gzip / ~1,29 MB, así que la diferencia entre ambas es pequeña. El `index.html` que se abre con doble clic no va comprimido: pesa alrededor de 1,3 MB más los recursos. La conclusión no cambia: sigue siendo una fracción del peso de Godot en web.
4. **Instalación:** en el entorno de Claude no se pueden instalar paquetes, así que la v0.1 se escribió sin poder ejecutar Phaser allí. La lógica pura sí se verificó (ver 8.6). El usuario instala los paquetes en su PC y prueba.
5. **Carpetas nuevas:** `logic/movement` (modelo de movimiento) y `logic/world` (datos de nivel), más `src/config.ts`.

### 1.2 En el borrador 0.2 (respecto del 0.1)

1. **Motor:** el usuario pidió elegir el mejor motor para un juego 2D de este tipo, y aclaró que si la diferencia no es grande y se puede hacer como página HTML, le da igual. La elección ya no espera aprobación: queda [DELEGADO] (sección 2).
2. **Documento para dos:** se agregó un contrato visual compartido y un plan de trabajo en paralelo para que lógica y diseño avancen juntos (secciones 6 y 7).
3. **Correcciones al Documento Maestro:**
   - La resolución 320×180 pasa de [DECIDIDO] a [PROPUESTA]: el Maestro la lista como "configuración propuesta" y la decisión pendiente 4 sigue abierta.
   - La sincronización del golpe cambia: ya no se estira la animación para encajar con el daño (sección 6.4). El Maestro pide sincronizar la hitbox con el momento de impacto de la animación, y estirar cuadros puede arruinar un pixel art hecho cuadro por cuadro.
4. Se mantiene todo lo demás: concepto, personajes, combate, protocolo Claude↔Gemini y plan 0.1 a 0.6.

---

## 2. Motor [DELEGADO]

### 2.1 Criterios del usuario
1. Que sea el mejor para un 2D lateral con pixel art.
2. Que ande bien en cualquier PC y no pese mucho.
3. Si la diferencia no es grande, vale una versión en página HTML.

Criterio adicional de Claude: que yo pueda construirlo y probarlo sin depender de un editor que no puedo operar.

### 2.2 Comparación

| Opción | Peso | Se abre con doble clic | Editor visual | ¿Puedo construirlo y probarlo yo? | Veredicto |
|---|---|---|---|---|---|
| **Phaser 4.2.1 (build Arcade)** | ~313 KB gzip (~1,18 MB sin comprimir)* | Sí (un solo `index.html`) | No | Sí: lógica en Node y, si el entorno lo permite, navegador sin pantalla | **Elegido** |
| Godot 4 (exportación web) | `.wasm` de ~39,5 MB (~10 MB comprimido)* | No: exige servidor HTTP | Sí | Parcial: no puedo abrir el editor | Mejor si se priorizara el editor visual o exportar a .exe directo |
| PixiJS (solo render) | Liviano | Sí | No | Sí | Obliga a escribir a mano física, animaciones, cámara y entrada |
| Kaplay / Excalibur | Livianos | Sí | No | Sí | Válidos, pero con menos recorrido en proyectos largos que Phaser |
| Motor propio en Canvas | Mínimo | Sí | No | Sí | Más código propio y más errores a cambio de ~300 KB. Descartado |

\* Cifras publicadas por terceros (ver sección 12). Hay que volver a medirlas en este proyecto: el peso real del `index.html` se mide al compilar la v0.1.

### 2.3 Decisión
**Phaser 4 (versión 4.2.1), física Arcade, con TypeScript, Vite y Vitest.** Se importa `phaser` completo desde el empaquetador; la build solo-Arcade no se usa por ahora (ahorraría ~32 KB gzip).

Motivos:
- Resuelve de fábrica lo que necesitamos: hojas de sprites, animaciones, cámara, mapas de tiles, audio, entrada y física de plataformas.
- A 320×180 no hace falta más. Pesa una fracción de lo que pesaría Godot en web.
- Es un estándar muy extendido, así que cualquier IA o persona puede revisar el código sin conocimiento especial.
- Permite entregar el juego como una página HTML que se abre sin instalar nada.

### 2.4 Riesgos y límites conocidos
- **Phaser 4 es una versión mayor reciente.** Se fija la versión exacta. Si apareciera un problema bloqueante, se baja a Phaser 3.x sin rehacer la lógica, porque la lógica no depende de Phaser (sección 5).
- **Arcade Physics solo maneja cajas alineadas a los ejes.** No hay pendientes ni formas rotadas. Afecta a la decisión pendiente 11 (diseño de niveles) y debe resolverse antes de la v0.5.
- **Sin editor visual de escenas.** Los niveles se definen en archivos de datos y se verifican con herramientas de depuración propias.
- **No tiene exportación nativa a .exe.** Si se quisiera, se agrega un envoltorio (Tauri) más adelante.

---

## 3. Principios heredados del Documento Maestro [DECIDIDO]

1. Lógica y presentación visual separadas. Cambiar un sprite o una animación no obliga a reescribir movimiento, combate ni habilidades.
2. Los recursos provisionales son fácilmente reemplazables.
3. Sistemas modulares, sin un único script que lo contenga todo.
4. Nombres claros y consistentes, sin código duplicado.
5. No se desarrollan mecánicas no definidas ni se decide ningún punto pendiente.
6. Entregas pequeñas que siempre se pueden ejecutar.
7. **Gemini define cómo se ve. Claude define cómo funciona.**

---

## 4. Stack y configuración base

| Parámetro | Valor | Estado |
|---|---|---|
| Perspectiva y estilo | Lateral 2D, pixel art tradicional | [DECIDIDO] |
| Cámara | Seguimiento del protagonista | [DECIDIDO] |
| Entrada | Mapa de acciones remapeable, sin teclas fijas en el código | [DECIDIDO] |
| Motor | Phaser 4.2.1, física Arcade | [DELEGADO] |
| Lenguaje y herramientas | TypeScript estricto, Vite, Vitest | [DELEGADO] |
| Entrega | Un único `index.html` | [DELEGADO] |
| Resolución interna | 320 × 180 (16:9) | [DECIDIDO] (aprobada con la decisión 4, 23/11/2026) |
| Escalado | Entero con `Scale.MAX_ZOOM` (×1, ×2, ×3…, el máximo que entra en la ventana), `pixelArt: true`, `roundPixels`, `image-rendering: pixelated` | [PROPUESTA] |
| Física | Arcade con paso fijo de 60 Hz, independiente de la tasa de refresco del monitor | [PROPUESTA] |

---

## 5. Arquitectura por capas (Claude)

```text
proyecto-luz/
├── src/
│   ├── core/            ← sin Phaser: StateMachine, EventBus tipado, tipos, utilidades
│   ├── logic/           ← sin Phaser: reglas del juego
│   │   ├── movement/      modelo de movimiento (v0.1)
│   │   ├── world/         datos y validación de niveles (v0.1)
│   │   ├── assets/        reglas del validador de recursos (lógica pura)
│   │   ├── combat/        daño, combos, ventanas de impacto, DamageInfo
│   │   ├── abilities/     energía y habilidades
│   │   ├── companion/     decisiones de la compañera
│   │   └── enemies/       IA y comportamiento
│   ├── data/            ← JSON editables: stats, ataques, enemigos, keymap, niveles
│   ├── game/            ← Phaser: escenas, entidades, mundo, UI
│   ├── view/            ← Phaser: Presenters (los únicos que tocan sprites y efectos)
│   ├── config.ts        ← constantes globales (resolución, tiles, FPS)
│   └── main.ts
├── assets/
│   ├── provisional/     ← formas geométricas y recursos de prueba
│   ├── final/           ← entregas de Gemini (PNG + manifiesto .json con el mismo nombre)
│   └── samples/         ← hoja de muestra válida (la genera `npm run make-sample`)
├── tools/               ← validate-assets.ts (validador), png.ts (lector/escritor de PNG), sample-data.ts y make-sample-sheet.ts (muestra)
├── tests/
└── documentation/       ← game_design.md, technical_design.md, characters.md, asset_requirements.md
```

**Dependencias permitidas:** `view → game → logic → core`. Nada en `core` ni en `logic` importa Phaser. Eso permite probar la lógica en Node y cambiar toda la capa visual sin tocarla.

**Comunicación:** un `EventBus` tipado. Los datos bajan por llamadas directas y los avisos suben por eventos (`health:changed`, `energy:changed`, `damage:dealt`, `attack:started`, `player:stateChanged`). El jugador no conoce a la compañera; ella escucha eventos.

| Módulo del Maestro | Ubicación |
|---|---|
| Player | `game/entities/player/` + `logic/` |
| Companion | `logic/companion/` + `game/entities/companion/` |
| Combat | `logic/combat/` |
| Abilities | `logic/abilities/` |
| Enemies | `logic/enemies/` + `game/entities/enemies/` |
| World | `game/world/` |
| UI | `game/ui/` |
| Game Manager | `game/GameManager.ts` |

**Escenas:** `Boot`, `Preload`, `Level` (v0.1); `HUD` en paralelo a `Level` (v0.3); `Cutscene` y `Defeat` (v0.5).

**Estados globales:** `MENU`, `PLAYING`, `PAUSED`, `DEFEATED`, `CUTSCENE`. `DEFEATED` lleva un campo `reason`, porque según el Maestro (sección 4) la pantalla de muerte puede ser en realidad una inconsciencia con rescate. La lógica registra la causa real aunque el jugador vea una "muerte".

**Protagonista:** cuerpo Arcade + `StateMachine` (`Idle`, `Run`, `Jump`, `Fall` en 0.1; después `Dodge`, `Attack1-3`, `Hurt`, `Defeated`) + `PlayerStats` en datos + `HealthComponent` y `EnergyComponent` (0.3 y 0.4) + `PlayerPresenter`, la única pieza que conoce sprites y animaciones.

**Compañera:** `CompanionBrain` (lógica pura) decide; `Companion` (Phaser) la dibuja y mueve. La regla "inteligente y contextual, no aleatoria" depende de criterios de balance (pendiente 12), así que no se implementa antes de la v0.2.

**Mundo:** cada nivel tiene una capa lógica (colisiones, apariciones, disparadores) y capas visuales intercambiables (`WorldSkin`). Así el mundo percibido (rosas y violetas) y el real (consumido por la oscuridad) comparten geometría. Se implementa en la v0.6, no antes.

---

## 6. CONTRATO VISUAL COMPARTIDO (Claude + Gemini)

Esta sección es la que permite trabajar en paralelo. Gemini produce recursos que cumplan estas reglas; Claude los integra solo con leer el manifiesto, sin tocar la lógica.

### 6.1 Reglas generales de todos los recursos [PROPUESTA]
- Formato **PNG con transparencia**, sin antialiasing ni semitransparencias en los bordes de sprites (pixel art duro).
- **Una hoja por personaje o recurso**, con **celdas de tamaño fijo y uniforme** para todas sus animaciones.
- **Una animación por fila**, cuadros de izquierda a derecha, sin separación ni márgenes entre celdas. Las filas pueden tener distinta cantidad de cuadros; las celdas sobrantes quedan vacías.
- **Orientación base: mirando a la derecha.** Claude espeja por código para mirar a la izquierda. No se entregan versiones espejadas.
- **Punto de apoyo (pivote):** centro horizontal de la celda y borde inferior de los pies, en la misma posición en todos los cuadros de un personaje. Si un cuadro se desplaza, se hace dentro de la celda, nunca cambiando el pivote.
- Sin texto incrustado en los sprites.
- Nombres de archivo en minúsculas, con guion bajo: `protagonist.png`, `companion.png`, `fx_light_shot.png`.
- Paleta: **sin definir** (pendiente 3). Gemini propone y el usuario elige; no hay colores definitivos hasta entonces.

### 6.2 Medidas [DECIDIDO: aprobadas por el usuario el 23/11/2026; cierran la decisión pendiente 4]
Pensadas para 320×180 y para una escala de **1 m ≈ 20 px**, de modo que las alturas del Maestro (1,80 m y 1,70 m) se respeten en proporción:

| Recurso | Cuerpo visible | Celda de la hoja |
|---|---|---|
| Protagonista | ~36 px de alto | 64 × 64 |
| Compañera (con silla de luz) | ~34 px de alto el cuerpo | 64 × 64 (la silla puede ser una hoja aparte, ver pendiente 2) |
| Enemigo robótico estándar | a definir (pendiente 6) | a definir |
| Efectos (proyectil, impacto, escudo, curación) | según el efecto | 16×16, 32×32 o 64×64, siempre múltiplo de 16 |
| Tiles de escenario | 20 × 20 (16 columnas × 9 filas visibles exactas) | 20 × 20 |

El usuario eligió tiles de 20 px (16 × 9 tiles visibles exactos).

### 6.3 Manifiesto de animaciones [PROPUESTA]
Cada hoja viene con un manifiesto `.json` **con el mismo nombre que la hoja** (`protagonist.png` + `protagonist.json`), en la misma carpeta. El validador reconoce como manifiesto cualquier `.json` que tenga la clave `"sheet"`. El código solo usa **nombres lógicos**; si Gemini reorganiza una hoja, solo cambia el manifiesto.

```json
{
  "sheet": "protagonist.png",
  "frameWidth": 64,
  "frameHeight": 64,
  "facing": "right",
  "pivot": { "x": 32, "y": 64 },
  "animations": {
    "idle":   { "row": 0, "frames": 4, "fps": 6,  "loop": true },
    "run":    { "row": 1, "frames": 6, "fps": 10, "loop": true },
    "attack_1": {
      "row": 2, "frames": 5, "fps": 14, "loop": false,
      "impact": { "from": 2, "to": 3 }
    }
  }
}
```

- `impact` lo completa Gemini solo en animaciones de ataque: indica **en qué cuadros golpea visualmente** el ataque (numerados desde 0).
- Los valores del ejemplo son ilustrativos. Los reales llegan con la entrega.
- Un ejemplo completo y válido (hoja + manifiesto) se genera con `npm run make-sample` en `assets/samples/`. Es una figura geométrica, no arte del juego.

### 6.4 Sincronización de golpe [PROPUESTA]
1. Los datos del ataque (`AttackData`, en JSON de Claude) definen: daño, alcance, recuperación, ventana de encadenamiento y **la ventana de impacto en milisegundos**.
2. La animación se reproduce **a su velocidad natural**, sin estirarse.
3. Un **validador** (`tools/`, sección 6.6) compara la ventana de impacto de los datos con los cuadros `impact` del manifiesto. Si no coinciden dentro de una tolerancia (propuesta: ±1 cuadro), **avisa** y se resuelve por una de dos vías: Gemini ajusta los cuadros, o Claude ajusta los tiempos en los datos.
4. Solo se permite acelerar o frenar la reproducción hasta un límite que el propio ataque declare en sus datos (por ejemplo ±15 %). Más allá de eso, hay que corregir el recurso o los datos.

Resultado: cambiar un sprite no rompe el daño, y los tiempos del trabajo de Gemini no se deforman.

### 6.5 Nombres lógicos de animación (provisionales)
`idle`, `run`, `jump_up`, `fall`, `attack_1`, `attack_2`, `attack_3`, `ranged`, `dodge`, `hurt`, `defeated`.
Cada nombre nuevo se agrega primero a este documento y después a los manifiestos. Si falta una animación, el `Presenter` usa el recurso provisional.

### 6.6 Entrega y validación
Orden por recurso, siguiendo el protocolo de la sección 13 del Maestro:
1. Claude pide el recurso indicando nombre, celdas, cantidad de cuadros, pivote y animaciones (formato en 9.2).
2. Gemini entrega el PNG y el manifiesto.
3. Claude ejecuta el **validador** (`npm run validate-assets`, detalle abajo).
4. Si falla, se informa exactamente qué cuadro o fila y quién corrige (recurso o lógica).
5. Si pasa, se integra sin tocar la lógica.

**Qué comprueba el validador** (`ERROR` bloquea la integración; `AVISO` no):

| Código | Nivel | Qué detecta | Quién corrige |
|---|---|---|---|
| `MANIFEST_*`, `ANIM_DEF`, `ANIM_IMPACT` | error | Manifiesto mal formado: campos faltantes, `facing` distinto de `right`, pivote fuera de la celda, `impact` fuera de los cuadros | Gemini |
| `NO_ALPHA` | error | El PNG no tiene transparencia | Gemini |
| `SHEET_SIZE` | error | La hoja no es múltiplo de la celda (márgenes o separaciones) | Gemini |
| `ANIM_ROW`, `ANIM_FRAMES`, `ANIM_ROW_SHARED` | error | Fila o cuadros fuera de la hoja; dos animaciones en la misma fila | Gemini |
| `MISSING_IMPACT` | error | Un `attack_*` sin `impact` | Gemini |
| `FRAME_EMPTY` | error | Cuadro declarado pero vacío | Gemini |
| `FRAME_EXTRA` | error | Dibujo en cuadros que el manifiesto no declara | Gemini |
| `SEMI_ALPHA` | error | Píxeles semitransparentes (antialiasing); indica el primero | Gemini |
| `IMPACT_SYNC`, `IMPACT_OUTSIDE` | error | Los datos de ataque y el manifiesto no coinciden (±1 cuadro) o la ventana excede la animación | Gemini o Claude |
| `PIVOT_FEET` | aviso | Los pies no apoyan en el pivote (±1 px); no se exige en `jump_up` ni `fall` | Gemini |
| `PIVOT_X`, `FILE_NAME`, `ANIM_NAME`, `ROW_UNUSED` | aviso | Pivote no centrado, nombre de archivo fuera de convención, nombre de animación fuera de 6.5, fila con dibujo sin usar | Gemini o ambos |

**Cómo se usa**
- `npm run validate-assets` revisa todos los manifiestos de `assets/final/`.
- `npm run validate-assets -- ruta/protagonist.json` revisa uno.
- `--attacks archivo.json` suma la comprobación de sincronización (6.4). Formato provisional, hasta que la v0.3 defina `AttackData`: `{ "attack_1": { "impactStartMs": 150, "impactEndMs": 280 } }`, con los milisegundos contados desde el primer cuadro de la animación. El impacto de los datos se convierte en cuadros con los `fps` de la animación.
- Código de salida 0 si no hay errores y 1 si los hay.

**Para Gemini, antes de entregar:** PNG con transparencia, sin entrelazado, bordes duros (alfa 0 o 255); celdas exactas sin márgenes; una animación por fila; mirando a la derecha; pies en el borde inferior de la celda en todas las animaciones sobre el suelo; manifiesto con el mismo nombre; en cada `attack_*`, `impact` con los cuadros donde golpea (desde 0).

---

## 7. Trabajo en paralelo: qué avanza ya y qué espera

| Versión | Claude (lógica) | Gemini (visual) | Bloquea a Gemini |
|---|---|---|---|
| **Ya, sin esperar nada** | Proyecto base, `PlayerPresenter` provisional y validador de recursos (hechos) | **Propuestas de concepto** para las decisiones 1, 2 y 3 (poderes, diseño físico, paletas), a elección del usuario | Nada |
| 0.1 Movimiento y cámara | Movimiento, salto, gravedad, colisiones, cámara (con rectángulo provisional) | Hoja del protagonista: `idle`, `run`, `jump_up`, `fall` | Decisión 2 (diseño físico); la 4 ya está cerrada |
| 0.2 Compañera | Seguimiento, silla, curación, escudo, estados, recargas | Compañera, silla, efectos de protección y curación | Decisión 2; criterios de la 12 |
| 0.3 Combate | Ataques, combo de tres, proyectil, daño, esquiva, enemigo robótico | Sprites de ataque, proyectiles, impactos, enemigo | Decisiones 1 y 6 |
| 0.4 Habilidades | Energía, habilidades, combinaciones | Efectos de habilidades, luz, escudos | Decisión 1 |
| 0.5 Entrenamiento | Escenario, enfrentamiento con la compañera, derrota e inconsciencia | Recursos del escenario y de la compañera en combate | Decisiones 11 y 12 |
| 0.6 Mundo y revelación | Anomalías, transición, corrupción, cambio de escenario | Escenarios utópico y real, oscuridad, transición | Decisión 8 |

La v0.1 se entrega con recursos provisionales. Cuando llegue la hoja de Gemini, se reemplaza el rectángulo tocando solo `PlayerPresenter`, que es el criterio de aceptación 6 de la sección 8.

---

## 8. Parte de Claude: entrada, física, rendimiento, pruebas y v0.1

### 8.1 Entrada
Acciones y teclas provisionales del Maestro, en `data/keymap.json`, remapeables.

| Acción | Tecla |
|---|---|
| `move_left` / `move_right` | A / D |
| `jump` | Espacio |
| `dodge` | Shift |
| `attack_melee` | J |
| `attack_ranged` | K |
| `ability` | L |
| `heal_companion` | H |

Soporte de mando: [PENDIENTE], no definido en el Maestro.

### 8.2 Física y colisiones
- Paso fijo de 60 Hz: el juego se comporta igual en monitores de 60, 120 o 144 Hz.
- Grupos de colisión [PROPUESTA]: `world`, `player`, `playerHurtbox`, `playerAttack`, `enemy`, `enemyHurtbox`, `enemyAttack`, `projectile`.
- Posiciones alineadas a píxel para evitar vibraciones con la cámara.
- Limitación: sin pendientes ni formas rotadas (ver 2.4).

### 8.3 Rendimiento y peso [PROPUESTA]
Objetivos, a verificar en cada versión:
- 60 FPS estables en una PC de gama baja con gráficos integrados.
- Motor + código del juego por debajo de 1 MB comprimido.
- Presupuesto de recursos: se define con Gemini (las medidas ya están cerradas).

Técnicas desde el inicio: atlas (una textura por personaje), *pooling* para proyectiles y efectos, sin crear objetos nuevos en el bucle de actualización, límite de partículas simultáneas.

**Compromiso:** el `index.html` único incrusta los recursos y los agranda alrededor de un tercio, y lleva el motor sin comprimir (~1,3 MB). Sirve para desarrollo y para el primer juego jugable. Si el peso de los recursos finales lo justifica, se pasa a una carpeta con archivos separados, que necesita servidor local o alojamiento web.

### 8.4 Ejecución y distribución
- Cada versión se entrega como un `index.html` que se abre con doble clic en Brave (el navegador del usuario), Chrome, Edge o Firefox, sin internet.
- El audio del navegador empieza solo después de la primera interacción del jugador; el menú inicial debe pedir esa interacción.
- Safari e iOS no están garantizados hasta probarlos.
- A futuro, opcional: alojarlo en una página web (itch.io o GitHub Pages) o empaquetarlo como programa de escritorio (Tauri).

### 8.5 Pruebas
- **Automáticas (Vitest, en Node):** máquina de estados, combos, daño, energía, decisiones de la compañera y validador de recursos.
- **Navegador sin pantalla:** se intentará si el entorno lo permite; no está garantizado.
- **Revisión manual por versión:** lista de comprobación entregada con cada versión. La sensación de movimiento solo la puede evaluar quien juega.
- **Depuración (solo desarrollo):** F3 muestra FPS, estado y velocidad; F4 muestra cajas de colisión y de impacto.

### 8.6 Detalle de la versión 0.1

**Alcance:** movimiento lateral, salto, gravedad, colisiones y cámara de seguimiento, con recursos provisionales y salto variable (decisión D). Sin *coyote time* ni *jump buffer*. Nada más.

| Archivo | Función |
|---|---|
| `src/main.ts`, `src/config.ts` | Arranque de Phaser y constantes globales |
| `src/core/State.ts`, `StateMachine.ts` | Máquina de estados reutilizable |
| `src/core/EventBus.ts`, `GameEvents.ts` | Eventos tipados |
| `src/core/actions.ts` | Nombres de las acciones de entrada |
| `src/logic/movement/MovementModel.ts` | Movimiento, gravedad y salto variable (lógica pura) |
| `src/logic/world/LevelData.ts` | Datos de nivel y su validación (lógica pura) |
| `src/data/player_stats.json` | Valores de movimiento ajustables |
| `src/data/keymap.json` | Acciones y teclas |
| `src/data/levels/level_test.json` | Nivel de prueba (80 × 18 tiles = 1600 × 360 px) |
| `src/game/scenes/Boot.ts`, `Preload.ts`, `Level.ts` | Escenas |
| `src/game/input/InputMap.ts` | Entrada por acciones remapeables |
| `src/game/entities/player/Player.ts`, `PlayerStates.ts` | Protagonista y estados `idle`, `run`, `air` |
| `src/game/world/LevelBase.ts` | Construye el nivel y sus colisiones |
| `src/game/DebugOverlay.ts` | Herramienta F3 |
| `src/view/PlayerPresenter.ts` | Representación provisional |
| `tests/` | 84 pruebas: máquina de estados, eventos, movimiento, datos, validador de recursos y lector de PNG |

**Valores iniciales (provisionales, se ajustan jugando):**

| Parámetro | Valor |
|---|---|
| Velocidad máxima | 90 px/s |
| Aceleración / frenado | 700 / 900 px/s² |
| Gravedad | 900 px/s² |
| Velocidad de salto | −280 px/s |
| Caída máxima | 400 px/s |
| Control en el aire | 85 % |
| Corte del salto al soltar | −110 px/s (salto completo ≈ 46 px; toque rápido ≈ 11 px) |
| Recurso del protagonista | rectángulo de 16 × 32 px, solo para pruebas |

**Criterios de aceptación:**
1. El `index.html` se abre con doble clic y corre a 60 FPS.
2. A/D mueven al personaje; Espacio salta.
3. Colisiona con suelo, paredes y plataformas sin atravesarlas.
4. La cámara sigue al personaje, respeta los límites del nivel y no vibra.
5. El juego se ve nítido en cualquier tamaño de ventana, con escala entera.
6. El rectángulo se reemplaza por un sprite tocando solo `PlayerPresenter`.

**Limitaciones:** valores provisionales; no puedo evaluar la sensación de control; *coyote time* y *jump buffer* quedan fuera (solo se aprobó el salto variable).

**Estado de verificación (23/11/2026):**
- **Verificado en el entorno de Claude:** la lógica pura (`core/`, `logic/`, `data/`) compila sin errores y pasa las 84 pruebas, ejecutadas con un sustituto temporal de Vitest. Una simulación con el modelo de movimiento real y una colisión simple confirmó que todas las plataformas y escalones del nivel de prueba se pueden alcanzar (ventanas de despegue de 15 a 52 px) y que el techo detiene el salto.
- **Verificado por el usuario:** la parte de Phaser (`game/`, `view/`, `main.ts`) compila y funciona en su PC (Brave, Windows). Claude no pudo ejecutarla en su propio entorno.
- **Criterios de aceptación 1 a 5:** el usuario confirmó que el juego funciona completo en Brave; el detalle de cada punto de `documentation/checklist_v0.1.md` no se marcó uno por uno. El criterio 6 (cambiar el rectángulo por un sprite tocando solo `PlayerPresenter`) se cumple por diseño y se comprobará con la primera hoja de Gemini.

---

## 9. Parte de Gemini

### 9.1 Qué hacés y qué no
**Sí:** sprites, hojas, animaciones, diseños de enemigos y jefes, escenarios, efectos de luz, proyectiles, impactos, escudos, curación, elementos de interfaz.
**No:** programar comportamiento, decidir tiempos de combate, ni fijar por tu cuenta ninguna de las decisiones pendientes. Podés **proponer** alternativas visuales; el usuario aprueba.

### 9.2 Cómo te pide Claude un recurso
Cada pedido trae: nombre del archivo, tamaño de celda, cantidad de filas y cuadros por animación, pivote, orientación, fps sugerido y, en ataques, cuántos cuadros deben ser de impacto. Ejemplo para la primera entrega:

> **Pedido v0.1 — `protagonist.png`** (se envía recién cuando esté aprobada la decisión 2; la 4 ya está cerrada)
> Celda 64×64, pivote (32, 64), mirando a la derecha. Filas: `idle` (4 cuadros, 6 fps, bucle), `run` (6 cuadros, 10 fps, bucle), `jump_up` (2 cuadros, sin bucle), `fall` (2 cuadros, bucle). Más `protagonist.json` según 6.3.
> Cantidades de cuadros y fps son **sugeridos**; podés proponer otros si el diseño lo pide, y se actualiza el manifiesto.

### 9.3 Qué podés empezar ya
Mientras la lógica avanza, sin esperar:
- **Decisión 1:** 2 o 3 alternativas de cómo se ven los poderes del protagonista (luz corporal, armas de luz, construcciones de luz).
- **Decisión 2:** exploraciones del diseño físico de ambos personajes, respetando alturas (1,80 m y 1,70 m) y las descripciones del Maestro.
- **Decisión 3:** propuestas de paleta para la primera etapa (rosas y violetas) y la segunda (mundo consumido por oscuridad).

Todo esto sirve para que el usuario decida; nada se integra al juego hasta que lo apruebe.

### 9.4 Lo que no debés asumir
- Las medidas están cerradas (6.2); cualquier cambio lo pide el usuario.
- Ningún origen ni naturaleza de la sombra (decisión 8): su aspecto no debe explicarla.
- La apariencia utópica del primer mundo es la **percepción del protagonista**, no una simulación ni una dimensión artificial.

---

## 10. Decisiones

### 10.1 Pendientes del Documento Maestro (nadie las toma salvo el usuario)
1. Manifestación visual de los poderes del protagonista.
2. Diseño físico definitivo de ambos personajes.
3. Paletas de colores definitivas.
4. ~~Resolución y dimensiones definitivas de sprites.~~ **Cerrada el 23/11/2026** (320×180 y medidas de 6.2).
5. Sistema de progresión.
6. Diseño y variedad de enemigos.
7. Diseño de jefes.
8. Origen y naturaleza de la sombra.
9. Historia completa del pasado.
10. Desenlace definitivo.
11. Diseño de niveles.
12. Balance de vida, energía, daño y recargas.

**Las que más desbloquean el trabajo en paralelo ahora:** 2 (diseño físico), 3 (paletas) y 1 (poderes). La 4 ya está cerrada.

### 10.2 Técnicas
| # | Decisión | Estado |
|---|---|---|
| A | Motor: Phaser 4 (Arcade) | [DELEGADO] |
| B | TypeScript, Vite, Vitest | [DELEGADO] |
| C | Entrega en un único `index.html` | [DELEGADO] |
| D | Salto variable (soltar el botón corta el salto); sin coyote time ni buffer | [DECIDIDO] (aprobado 23/11/2026) |
| E | Movimiento horizontal con aceleración y frenado graduales | [PROPUESTA] (implementada en la v0.1, a ajustar jugando) |
| F | Niveles en JSON propios; evaluar Tiled más adelante | [PROPUESTA] |
| G | Pendientes y rampas: revisar antes de la v0.5 | [PENDIENTE] |
| H | Soporte de mando | [PENDIENTE] |
| I | Medidas del contrato visual (6.2) | [DECIDIDO] (aprobado 23/11/2026) |
| J | Tolerancia de sincronización de golpe (6.4) | [PROPUESTA] |

---

## 11. Riesgos

| Riesgo | Efecto | Mitigación |
|---|---|---|
| Phaser 4 es reciente | Errores o API distinta a la esperada | Versión fijada; vuelta a Phaser 3.x |
| Física Arcade sin pendientes | Limita el diseño de niveles | Decidir antes de la v0.5 |
| Sin editor visual | Más trabajo para crear niveles | Datos simples y herramientas de depuración |
| Archivo único con recursos incrustados | Aumenta el peso | Pasar a carpeta de archivos si hace falta |
| Recursos de Gemini fuera de contrato | Integración rota | Validador automático antes de integrar |
| No poder jugar el juego yo mismo | La sensación de control no se valida | Lista de comprobación y ajuste con el usuario |
| Safari e iOS sin probar | Posibles fallos en esos dispositivos | Probar antes de prometer compatibilidad |
| Phaser no se pudo ejecutar en el entorno de Claude | Errores de integración que no se vieron al escribir la v0.1 | El usuario compila y prueba; los mensajes de error vuelven a Claude |

---

## 12. Fuentes consultadas

- Phaser, README oficial (tamaños de las compilaciones): https://github.com/phaserjs/phaser
- Phaser 4.2.1, README publicado (versión estable y tamaños gzip): https://unpkg.com/phaser@4.2.1/README.md
- Godot, documentación de exportación web (WebGL 2.0 y Safari): https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html
- Medición del tamaño de una exportación web de Godot 4: https://dev.to/ziva/how-to-export-a-godot-game-to-the-web-and-share-a-playable-link-2g88

Los tamaños son valores publicados por esas fuentes y deben volver a medirse en este proyecto.

**FIN DEL DOCUMENTO TÉCNICO**
