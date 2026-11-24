# DOCUMENTO TÉCNICO — PROYECTO LUZ

**Versión:** borrador 0.11 · **Fecha:** 24/11/2026 · **Estado:** v0.1 y v0.2 funcionando y verificadas (`typecheck` en 0, 142 pruebas, build y validador en verde). La compañera pasa a aparecer solo desde la Etapa 2. Escritos los pedidos formales a Gemini para cuatro recursos (0.5). Falta ajustar los valores de prueba y definir el combate (v0.3).
**Destinatarios:** Claude (programación y lógica) y Gemini (recursos visuales). Lo lee y aprueba el usuario.
**Deriva de:** *Documento Maestro de Contexto*. Reemplaza a los borradores anteriores.

**Etiquetas**
- **[DECIDIDO]**: viene del Documento Maestro o lo cerró el usuario.
- **[DELEGADO]**: el usuario dejó la decisión en manos de Claude, con criterios que él fijó.
- **[PROPUESTA]**: necesita aprobación explícita del usuario antes de ser definitiva.
- **[PENDIENTE]**: decisión del usuario. Ni Claude ni Gemini la toman.

**Cómo usar este documento**
- **Claude:** secciones 0.1 a 0.4, y 2 a 5, 7 y 8. Es lo que construyo.
- **Gemini:** sección 0.5, y 6, 7 y 9, más los pedidos formales de `documentation/asset_requests/`. Es lo que producís y cómo lo entregás.
- **Los dos:** la sección 6 (contrato visual) es el punto de encuentro. Si algo ahí cambia, se cambia en este documento y se avisa a ambos.
- **Usuario:** sección 0.3 (dónde estamos), sección 10 (qué hay que decidir) y sección 7 (qué avanza sin esperar).
- **Al retomar en otro chat:** leer primero la sección 0 completa (0.6 dice qué adjuntar).

---

## 0. LECTURA RÁPIDA: RESUMEN, REGLAS, FASE ACTUAL Y TRABAJO PENDIENTE

*Actualizá esta sección al final de cada sesión. Es lo primero que debe leer Claude al retomar. El detalle técnico está en las secciones 2 a 12.*

**Última actualización:** 24/11/2026

### 0.1 Resumen del proyecto

**Proyecto Luz** es un juego de plataformas y combate 2D lateral, en pixel art duro, que se abre como una página HTML. El protagonista pelea con **armas de luz forjadas al instante**. La **compañera/antagonista** es la misma persona vista en dos momentos: rival en la Etapa 1 y aliada en la Etapa 2. El mundo de la Etapa 1 es la **percepción** del protagonista; el mundo real, consumido por la oscuridad, se revela más adelante (v0.6).

| Tema | Valor |
|---|---|
| Motor y herramientas | Phaser 4.2.1 (física Arcade), TypeScript estricto, Vite, Vitest [DELEGADO] |
| Entrega | Un único `index.html` (se abre `dist\index.html`, no el de la raíz). Brave en Windows es el único entorno probado |
| Resolución interna | **320 × 180**, escalado entero, `pixelArt` |
| Escala | **1 m ≈ 20 px** |
| Tiles | **20 × 20** (16 × 9 visibles exactos) |
| Personajes | Protagonista ~36 px (1,80 m). Compañera/antagonista ~34 px (1,70 m). Celdas de hoja de 64 × 64 |
| Dirección artística | **Steampunk + LoL** en pixel art duro, con paletas vivas y fuerte juego de luces y sombras. **Etapa 1:** violetas y magentas vivos, contraste luz/sombra, bordes iluminados. **Etapa 2:** oscuridad densa con focos luminosos intensos, sin explicar el origen de la sombra |
| Estilo de los personajes | Estilo Genshin Impact, para seres muy poderosos: protagonista en blanco y dorado. Compañera con dos apariencias: rojo y negro (corrupción, sin estética demoníaca) y blanco y dorado (cuando él la reconoce) |
| Movimiento y entrada | Paso fijo de 60 Hz, salto variable sin *coyote time* ni *jump buffer*, mapa de acciones remapeable |

**Decisiones cerradas** (el detalle y la lista de pendientes están en la sección 10):

| Decisión | Contenido | Fecha |
|---|---|---|
| 1. Poderes del protagonista | Armas de luz forjadas al instante (hojas, filos o arcos de luz pura), con lectura clara al estilo del combate de LoL | 24/11/2026 |
| 2. Diseño físico | Estilo Genshin Impact, blanco y dorado; la compañera con dos apariencias (arriba) | 24/11/2026 |
| 3. Paletas y dirección artística | Steampunk con LoL; Etapa 1 Opción A, Etapa 2 Opción B | 24/11/2026 |
| 4. Resolución y dimensiones | 320 × 180; personajes ~36 px en celda de 64 × 64; 1 m ≈ 20 px; tiles de 20 × 20 | 23/11/2026 |
| Técnicas | Motor Phaser 4.2.1; salto variable (D); medidas del contrato (I); hoja provisional del protagonista aceptada si pasa el validador (M) | 23 y 24/11/2026 |
| Reglas de entrega de Gemini | No se modifica el contrato visual ni la escala para acomodar un recurso; una hoja se acepta como versión inicial si pasa el validador oficial sin errores | 24/11/2026 |

**Pendientes que más desbloquean ahora:** 12 (balance, que se divide en dos: 10.1) y 6 (enemigos, para la v0.3). Técnicas: G (pendientes y rampas, antes de la v0.5) y H (soporte de mando).

### 0.2 Reglas de oro

1. **Los cambios a este documento se entregan como archivo `.patch`** contra `documentation/technical_design.md`. El usuario pega el texto de la sesión y Claude actualiza el documento para los futuros chats.
2. **Gemini entrega siempre cada hoja con su `.json`** (mismo nombre, misma carpeta) y cumple el contrato visual (sección 6) y el validador (6.6). Nada se integra si el validador da errores ni sin aprobación del usuario.
3. **Gemini define cómo se ve; Claude define cómo funciona.** Claude no decide ningún pendiente (10.1) sin aprobación del usuario. Gemini puede proponer, no fijar.
4. **No se cambia el contrato visual ni la escala del mundo para acomodar un recurso.** Si un recurso no encaja, se corrige el recurso.
5. **La compañera/antagonista aparece primero como rival/enemiga en la Etapa 1** (apariencia rojo y negro) y **entra como compañera/aliada en la Etapa 2**, con su silla de luz (apariencia blanco y dorado). En la Etapa 1 no existen su curación (H), su escudo ni sus barras. El código la activa por nivel con `companionEnabled` (8.7).
6. **Lógica y presentación separadas.** Cambiar un sprite o una animación no obliga a tocar movimiento, combate ni habilidades.
7. **Entregas pequeñas que siempre se pueden ejecutar.** Cada versión se presenta y se aprueba antes de programarse (sección 15 del Documento Maestro).
8. **Lo no verificado se dice como no verificado.** Claude no puede ejecutar Phaser ni ver la pantalla; la sensación de juego y lo visual los confirma el usuario.

### 0.3 Fase actual

**v0.1 (movimiento y cámara): funcionando.** El usuario confirmó en Brave movimiento, salto, colisiones y cámara.
**Sprite del protagonista: aprobado en pantalla** como versión provisional (conversión hecha por Claude del arte de Gemini; 6.7 y 8.8). El usuario confirmó `run`, salto, caída y espejado.
**v0.2 (compañera): integrada y probada.** Seguimiento con silla, vida mínima del protagonista, curación (H), escudo automático, estados y recargas, tecla de depuración T y `HUD` con barras (8.7). El usuario confirmó en pantalla el seguimiento, el escudo, la curación y el `HUD`.

**Revisión del repositorio (24/11/2026, commit `35fdb37` «changes_2»):** Claude clonó `https://github.com/MarcoCascallares/proyecto_2D` y corrió todo.

| Comprobación | Resultado |
|---|---|
| `npm run typecheck` | 0 errores |
| `npm test` (Vitest real) | **142 pruebas pasan** (12 archivos) |
| `npm run build` | Compila: `dist/index.html` de 1,41 MB (382 KB comprimido) |
| `npm run validate-assets` | `protagonist.json`: 0 errores y 0 avisos |
| Integración de la v0.2 en GitHub | Completa (`Level`, `main`, `actions`, `keymap`, `GameEvents`, `HUD`). El problema del commit `fa7b622` está resuelto |

**Aparición por etapa: cambio de diseño del 24/11/2026.** Hoy el código muestra a la compañera en todos los niveles, porque la v0.2 se hizo para probarla. Con la regla 5, `companionEnabled` (por nivel) ocultará compañera, curación, escudo y sus barras en la Etapa 1. Hasta que se implemente (0.4, fase B), el nivel de prueba la muestra siempre.

**Pendiente de verificar o de decidir**
- **Sensación de control** (velocidad, salto, gravedad, frenado) y **valores de la compañera** (curación +40 con recarga de 12 s, escudo de 1 golpe con recarga de 8 s, distancia detrás del protagonista): solo los puede evaluar el usuario jugando. Los valores de `player_stats.json` y `companion_stats.json` siguen siendo provisionales.
- **Hoja nativa a 36 px del protagonista:** el usuario indicó que ya está implementada, pero en GitHub (`35fdb37`) sigue la conversión de 15 colores y celdas de 64 × 64. Falta subirla (`git add -A`, commit y push) o confirmar cuál es la versión vigente. No requiere cambios de código: solo reemplaza `assets/final/protagonist.png` y `.json`.
- **Calidad visual (24/11/2026):** a este aumento la conversión muestra ruido de píxeles oscuros en la ropa y la capa, y la ropa casi negra contrasta poco con los violetas de la Etapa 1 (6.7). En el `HUD`, la letra de 8 px en negrita pega los trazos y los marcos de las barras se dibujan con borde doble; es una decisión estética del usuario (`src/game/scenes/HUD.ts`).
- **«Escudo activo» y «curando»** se muestran medio segundo (`effectSeconds`, 0,5 s) tras absorber un golpe o curar. Es interpretación de Claude, a confirmar con el usuario.
- **Entornos:** solo se probó Brave en Windows. Otros navegadores y Safari/iOS no.

### 0.4 Fases a completar para Claude

| Fase | Qué incluye | Depende de | Estado |
|---|---|---|---|
| **A. Ajustes de control y balance** | Cambiar `player_stats.json` y `companion_stats.json` según lo que cuente el usuario. Decisión 12 dividida en dos: Etapa 1 (solo protagonista: vida, daño, energía) y Etapa 2 (con compañera: curación y escudo) | Opinión del usuario jugando | Esperando al usuario |
| **B. `companionEnabled` por nivel** | Campo en los datos de nivel. En `false`: sin compañera, presenter, curación, escudo ni sus barras; H no hace nada; el daño llega directo a la vida. `level_test.json` en `true`. Detalle en 8.7 | Aprobación de 10.2, fila N | Por hacer |
| **C. Validador ampliado** | Tipos de recurso «efecto» (`fx_*`: sin avisos de pies ni de nombre) y «tileset» (piezas de 20 × 20, existencia, repetición sin costura). Nombres nuevos de 6.5. Detalle en 6.8 | Antes de la primera entrega de Gemini | Por hacer |
| **D. v0.3 Combate** | Ataques cuerpo a cuerpo (combo de tres), ataque a distancia, daño, esquiva y recibir golpe; `AttackData`; **dos enemigos provisionales de prueba**: uno cuerpo a cuerpo que patrulla y uno a distancia que dispara, ambos rectángulos de color y descartables. El protagonista pelea solo (sin compañera) | Aprobación del diseño (se presenta antes de programar) y de 10.2, fila Q | Por diseñar |
| **E. v0.4 Habilidades** | Energía, habilidades y combinaciones | v0.3; qué habilidades existen (pendiente del usuario) | No empezada |
| **F. v0.5 Entrenamiento** | Escenario, enfrentamiento con la compañera (en la Etapa 1 es la enemiga), derrota e inconsciencia | Decisiones 7, 11 y 12; pendiente G | No empezada |
| **G. v0.6 Mundo y revelación** | Anomalías, transición, corrupción y cambio de escenario | Decisión 8 | No empezada |

**Pedidos formales por escribir** (cuando el usuario apruebe el diseño correspondiente): ampliación de `protagonist.png` con `attack_1` a `attack_3`, `ranged`, `dodge`, `hurt` y `defeated` (v0.3); compañera en blanco y dorado con su silla de luz y la animación de curación (Etapa 2).

### 0.5 Fases a completar para Gemini

Los cuatro pedidos formales están escritos, son autocontenidos y están en `documentation/asset_requests/`. El orden es una **[PROPUESTA]** según lo que desbloquea cada uno:

| Prioridad | Recurso | Pedido | Medidas | Para qué fase |
|---|---|---|---|---|
| 1 | **Armas de luz:** `fx_light_slash.png` (tres golpes del combo) y `fx_light_shot.png` (proyectil e impacto) | `request_fx_light_weapons_v0.3.md` | Tajos: celda 96 × 64, pivote (48, 64). Proyectil: celda 32 × 32, pivote (16, 16) | v0.3 combate |
| 2 | **Escenario de la Etapa 1:** `tiles_stage1.png` (suelos, paredes, plataformas) y, opcional, `props_stage1.png` (decorado) | `request_tiles_etapa1.md` | Piezas de 20 × 20 sobre violetas y magentas | Niveles de la Etapa 1 (v0.3 en adelante) |
| 3 | **Compañera corrupta:** `companion_corrupt.png` (rojo y negro, de pie, sin silla) | `request_companion_corrupt_etapa1.md` | Celda 64 × 64, cuerpo ~34 px, pivote (32, 64) | v0.5 entrenamiento |
| 4 | **Escudo:** `fx_shield.png` | `request_fx_shield_etapa2.md` | Celda 64 × 64, pivote (32, 64), animación `absorb` de 0,5 s | Etapa 2 (v0.2 ya lo usa provisional) |

**Aún no pedido** (se pide cuando corresponda): animaciones de combate del protagonista; compañera en blanco y dorado, silla de luz y efecto de curación; diseños de enemigos y jefes (decisiones 6 y 7); fondos con profundidad; sprites de interfaz; versión nativa del protagonista a 36 px (opcional).

**Cómo entregar** (6.6 y 6.7): PNG con alfa 0 o 255, celdas exactas, una animación por fila, mirando a la derecha, más el `.json` con el mismo nombre. Si Gemini no puede exportar un PNG exacto, entrega los cuadros dibujados en una cuadrícula lógica ampliada por un factor entero, sin suavizar y sobre fondo transparente; Claude convierte, valida e integra como versión inicial. Cada entrega lleva su paleta en hexadecimal y una imagen de referencia que no se integra.

### 0.6 Cómo retomar en otro chat
Adjuntar: (1) este documento, (2) el Documento Maestro de Contexto, (3) el repositorio o el zip del proyecto si cambió y (4) lo que haya devuelto el usuario (errores, checklist). Después decir en una línea qué se quiere hacer.

**Repositorio:** https://github.com/MarcoCascallares/proyecto_2D. El 24/11/2026 Claude pudo clonarlo con `git clone` desde su entorno (leer la página de GitHub con la herramienta web sigue bloqueado). Si el clon fallara en otra sesión, subir el ZIP (en GitHub, **Code → Download ZIP**), **sin `node_modules` ni `dist`**. Con el clon, `npm ci` instala todo y `typecheck`, `test`, `build` y `validate-assets` corren en el entorno de Claude. Phaser no se puede ejecutar allí: lo visual y la sensación de juego los prueba el usuario.

**Parches:** si `git apply` protesta por espacios, usar `--ignore-whitespace`. Después de aplicar un parche, hacer commit de **todo** (`git add -A`): en la sesión del 24/11 el commit solo tenía los archivos nuevos y por eso faltaba la integración de la v0.2.

**Datos para Claude:** el usuario escribe en español rioplatense y quiere que se responda siempre en español, directo y sin relleno. Prueba en el navegador Brave. Reparto fijo: Claude programa y define cómo funciona; Gemini produce los recursos visuales y define cómo se ven; ChatGPT coordina. Claude no decide ninguna de las decisiones pendientes del Documento Maestro (sección 10.1) sin aprobación.

---

## 1. Qué cambió

### 1.0 En el borrador 0.11 (respecto del 0.10)
*Las referencias a «0.x» de las entradas más antiguas de esta sección usan la numeración de la sección 0 de esos borradores.*
1. **Sección 0 reestructurada** en seis bloques: resumen, reglas de oro, fase actual, fases para Claude, fases para Gemini y cómo retomar. Las decisiones del usuario (antes 0.5) pasaron al resumen (0.1).
2. **Regla nueva: la compañera aparece desde la Etapa 2.** En la Etapa 1 es la enemiga. Se propone `companionEnabled` por nivel (8.7; decisión 10.2, fila N).
3. **Revisión del repositorio de GitHub** (commit `35fdb37`): `typecheck` en 0, 142 pruebas en Vitest real, build y validador en verde. La integración de la v0.2 está completa.
4. **Decisión 12 dividida** en Etapa 1 (protagonista solo) y Etapa 2 (con compañera) (10.1).
5. **Cuatro pedidos formales a Gemini** escritos: armas de luz, escenario de la Etapa 1, compañera corrupta y escudo (0.5, 9.3).
6. **Formatos nuevos para efectos y tilesets** [PROPUESTA] (nueva sección 6.8) y entrega de las dos apariencias de la compañera en hojas separadas [PROPUESTA] (6.2). Filas N a Q en 10.2.
7. **Hoja nativa del protagonista:** el usuario dice que está implementada, pero GitHub aún tiene la conversión (0.3).

### 1.0a En el borrador 0.10 (respecto del 0.9)
1. **Puntos pendientes de prueba resueltos** según el usuario (F3, cambio de lado, caída, H con vida completa, animaciones del sprite, `typecheck` y pruebas), sin detalle.
2. **Nueva sección 7.1:** qué cubre hoy el contrato visual para que Gemini trabaje en paralelo y qué falta definir.

### 1.0b En el borrador 0.9 (respecto del 0.8)
1. **v0.2 vista funcionando en pantalla** (dos capturas): compañera, silla, escudo, curación, recargas, contornos y `HUD`.
2. **Observaciones estéticas registradas** (0.3): letra y marcos del `HUD`, y ruido de píxeles en el sprite.
3. **Próximo paso** reordenado: terminar la prueba (0.4).

### 1.0c En el borrador 0.8 (respecto del 0.7)
1. **Sprite del protagonista visto en pantalla** (captura del usuario): escala, pies y nitidez bien (8.8).
2. **Integración de la v0.2 reconstruida:** eventos, tecla T, `Level`, `main`, `DebugOverlay` (8.7). `typecheck` pasa de 20 errores a 0.
3. **`HUD` corregido:** filas separadas, panel de fondo y texto en negrita (0.3).
4. **Pruebas:** 142 (sin cambios respecto de 0.7); el checklist de la v0.2 se actualizó a ese número.

### 1.0d En el borrador 0.7 (respecto del 0.6)
1. **Hoja del protagonista integrada como provisional** (8.8): carga de la hoja y de sus animaciones, y sprite en lugar del rectángulo. Pasa el validador oficial.
2. **Nueva sección 6.7:** cómo se tratan las entregas que llegan como imagen grande, y la historia de las entregas del protagonista.
3. **Hallazgo sobre el repositorio:** falta parte de la v0.2 (0.3). Los cambios al documento se entregan como `.patch` contra el documento que está en el repositorio.
4. **Reglas para entregas de Gemini** fijadas por el usuario (0.5).

### 1.0e En el borrador 0.6 (respecto del 0.5)
1. **Decisiones visuales cerradas (24/11/2026):** la 1 (poderes), la 2 (diseño físico) y la 3 (paletas y dirección artística). Se asientan en 0.5, 6.1, 6.2, 9 y 10.1.
2. **v0.2 (compañera) aprobada e implementada** con valores de prueba (8.7). Pendiente de probar en Brave. La decisión 12 (balance) sigue abierta.
3. **Rectángulo provisional con color por estado** (8.6).
4. **Tecla de depuración T** para dañar al protagonista (8.1 y 8.5).
5. **Pedido formal de `protagonist.png`** escrito, autocontenido, en `documentation/asset_requests/request_protagonist_v0.1.md` (9.2).

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
│   │   ├── health/        vida (v0.2)
│   │   ├── combat/        daño, combos, ventanas de impacto, DamageInfo (v0.2: DamageResolution)
│   │   ├── abilities/     energía y habilidades
│   │   ├── companion/     modelo y seguimiento de la compañera (v0.2)
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

**Escenas:** `Boot`, `Preload`, `Level` (v0.1); `HUD` en paralelo a `Level` (v0.2, barra simple de vida y recargas); `Cutscene` y `Defeat` (v0.5).

**Estados globales:** `MENU`, `PLAYING`, `PAUSED`, `DEFEATED`, `CUTSCENE`. `DEFEATED` lleva un campo `reason`, porque según el Maestro (sección 4) la pantalla de muerte puede ser en realidad una inconsciencia con rescate. La lógica registra la causa real aunque el jugador vea una "muerte".

**Protagonista:** cuerpo Arcade + `StateMachine` (`Idle`, `Run`, `Jump`, `Fall` en 0.1; después `Dodge`, `Attack1-3`, `Hurt`, `Defeated`) + `PlayerStats` en datos + `HealthComponent` y `EnergyComponent` (0.3 y 0.4) + `PlayerPresenter`, la única pieza que conoce sprites y animaciones.

**Compañera:** solo existe en los niveles con `companionEnabled` (8.7): aparece desde la Etapa 2, y en la Etapa 1 es la enemiga. En la v0.2 no decide por sí sola: la curación la activa el jugador (H) y el escudo es automático, con reglas fijas (`CompanionModel`, `CompanionFollow` y `SupportSystem`, que la une con la vida del protagonista). `Companion` calcula su posición (sin Phaser y sin cuerpo de física) y `CompanionPresenter` la dibuja. `CompanionBrain` queda para cuando haya decisiones "inteligentes y contextuales, no aleatorias", que dependen de criterios de balance (pendiente 12).

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
- Dirección artística y paletas [DECIDIDO: decisión 3, 24/11/2026]: steampunk con LoL en pixel art duro (320×180), paletas vivas y fuerte juego de luces y sombras para que el personaje destaque siempre sobre el fondo. Etapa 1: Opción A (violetas y magentas vivos, contraste luz/sombra, bordes iluminados). Etapa 2: Opción B (oscuridad densa con focos luminosos intensos, sin explicar el origen de la sombra). Los valores exactos de color todavía no están fijados en este documento.

### 6.2 Medidas [DECIDIDO: aprobadas por el usuario el 23/11/2026; cierran la decisión pendiente 4]
Pensadas para 320×180 y para una escala de **1 m ≈ 20 px**, de modo que las alturas del Maestro (1,80 m y 1,70 m) se respeten en proporción:

| Recurso | Cuerpo visible | Celda de la hoja |
|---|---|---|
| Protagonista | ~36 px de alto | 64 × 64 |
| Compañera (con silla de luz) | ~34 px de alto el cuerpo | 64 × 64 (la silla puede ser una hoja aparte) |
| Enemigo robótico estándar | a definir (pendiente 6) | a definir |
| Efectos (proyectil, impacto, escudo, curación) | según el efecto | Múltiplo de 16: 16×16, 32×32, 64×64 o 96×64 (6.8). Escudo: 64×64. Tajos de luz: 96×64. Proyectil de luz: 32×32 |
| Tiles de escenario | 20 × 20 (16 columnas × 9 filas visibles exactas) | 20 × 20 (formato de tileset en 6.8) |

El usuario eligió tiles de 20 px (16 × 9 tiles visibles exactos).

**Estilo de los personajes [DECIDIDO: decisión 2, 24/11/2026]:** atuendos estilizados estilo Genshin Impact en blanco y dorado, para seres muy poderosos. La compañera/antagonista tiene **dos apariencias**: rojo y negro (corrupción, sin estética demoníaca) y blanco y dorado (más parecida al protagonista, cuando él la reconoce).

**Entrega de las dos apariencias [PROPUESTA, 24/11/2026]:** una hoja por apariencia, con la misma celda (64 × 64), el mismo pivote (32, 64) y las mismas medidas: `companion_corrupt.png` (rojo y negro, Etapa 1, enemiga, de pie y sin silla) y `companion_light.png` (blanco y dorado, Etapa 2, aliada). La silla de luz va en una hoja aparte (`companion_chair.png`). Motivo: cada apariencia tiene sus propias animaciones y `CompanionPresenter` cambia de hoja por clave sin tocar la lógica. Solo `companion_corrupt.png` está pedida (0.5). Decisión 10.2, fila O.

**Poderes [DECIDIDO: decisión 1, 24/11/2026]:** armas de luz forjadas al instante (hojas, filos o arcos de luz pura), con lectura clara al estilo del combate de LoL.

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
**Efectos (hojas `fx_*`) [PROPUESTA]:** `slash_1`, `slash_2`, `slash_3` (`fx_light_slash`), `fly` y `hit` (`fx_light_shot`), `absorb` (`fx_shield`).
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


### 6.7 Entregas que llegan como imagen grande, e historia del protagonista
Gemini genera imágenes raster escaladas, no PNG exactos con alfa píxel a píxel, así que una hoja que cumpla el contrato casi nunca sale directa de él. Camino acordado:

1. Gemini entrega los cuadros dibujados en filas sobre fondo transparente (una animación por fila, en el orden del manifiesto) y el manifiesto `.json`.
2. Claude convierte la imagen a la hoja del contrato con **una sola escala para todos los cuadros** (el cuerpo más alto, `idle`, a 36 px), pies pegados al borde inferior de la celda, cuadro centrado en x = 32, alfa binario (0 o 255) y una paleta pequeña calculada sobre el arte original.
3. Se corre `npm run validate-assets`; si no hay errores, la hoja se integra como **versión inicial provisional**.
4. Cuando haya una versión dibujada nativamente a 36 px, reemplaza a la conversión sin tocar código.

**Historia de las entregas del protagonista (24/11/2026):**

| Entrega | Resultado |
|---|---|
| Concept art y guía de animaciones (imagen grande) | Sirve como referencia de estilo; `idle` traía 3 cuadros en vez de 4 |
| Hoja 1 | Formato correcto, pero personaje de 58 px (contrato: ~36), pies a 3 px del borde y todos los cuadros con la misma altura aunque la pose cambie (probable reescalado cuadro por cuadro) |
| Hoja 2 | Medidas correctas (36 px, 24 colores), pero `run` cuadro 5 roto (cuerpo borrado) y manchas grises detrás del personaje |
| Arte 3 (imagen grande, 14 cuadros completos) | Arte bien resuelto, blanco y dorado recuperados; convertido por Claude a la hoja actual (8.8) |

La imagen original (1536×1024) no está en el repositorio. Si hay que rehacer la conversión, hay que volver a subirla.

### 6.8 Formatos nuevos: efectos y tilesets [PROPUESTA, 24/11/2026]
Los cuatro pedidos de 0.5 necesitan dos formatos que el contrato de 6.1 a 6.7 no cubría. Hasta que el usuario los apruebe (10.2, fila P) son propuestas.

**Hojas de efectos (`fx_*.png`).** Mismo manifiesto que 6.3 (clave `sheet`), con estas diferencias:
- **Anclaje:** las hojas que se dibujan sobre el protagonista (escudo, tajos) usan **el mismo punto de anclaje que su sprite**: pies en el borde inferior y centro horizontal. El escudo usa celda 64 × 64 y pivote (32, 64), igual que el protagonista. Los tajos usan celda 96 × 64 y pivote (48, 64): se dibujan como si el protagonista estuviera en x = 48, con el efecto delante. El proyectil usa celda 32 × 32 y pivote en el centro (16, 16).
- **Sin semitransparencias:** rige `SEMI_ALPHA` también para efectos (pixel art duro, decisión 3). La sensación de brillo o translucidez se logra con tramado o colores claros opacos.
- **Validador:** un efecto no tiene pies ni usa los nombres de 6.5 de personajes, así que hoy dispararía `PIVOT_FEET` y `ANIM_NAME` (avisos, no bloquean). La fase C de 0.4 agrega el tipo «efecto» (se reconoce por el prefijo `fx_` del archivo) para que no aparezcan.

**Tilesets (`tiles_*.png`, `props_*.png`).** Manifiesto propio, que usa la clave `"tileset"` en vez de `"sheet"`, para que el validador actual lo ignore hasta que se lo extienda:
```json
{ "tileset": "tiles_stage1.png", "tileWidth": 20, "tileHeight": 20, "columns": 16,
  "tiles": { "block_fill": { "col": 4, "row": 0 } } }
```
- **Piezas** de 20 × 20. Cada rectángulo sólido de los datos de nivel se arma con: bloque (`block_*`, 9 piezas) si mide 2 × 2 piezas o más; plataforma fina (`plat_*`) si mide 1 de alto; columna (`col_*`) si mide 1 de ancho y 2 o más de alto. Nombres y posiciones en `documentation/asset_requests/request_tiles_etapa1.md`.
- **Superficie:** la que se pisa es el borde superior de la pieza (y = 0), porque la colisión ocupa la pieza completa.
- **Validador (fase C):** comprobará transparencia, alfa 0 o 255, hoja múltiplo de 20, piezas declaradas existentes y no vacías, y bordes que se repiten sin costura.
- `props_*` (decorado no sólido) usa el mismo formato, con piezas de 20 × 20 que apoyan en el borde inferior de la celda.

---

## 7. Trabajo en paralelo: qué avanza ya y qué espera

| Versión | Claude (lógica) | Gemini (visual) | Bloquea a Gemini |
|---|---|---|---|
| **Ya, sin esperar nada** | Proyecto base, `PlayerPresenter` provisional y validador de recursos (hechos) | Decisiones 1, 2 y 3 (poderes, diseño físico, paletas): **cerradas el 24/11/2026** | Nada |
| 0.1 Movimiento y cámara | Movimiento, salto, gravedad, colisiones, cámara; sprite provisional integrado (8.8) | Hoja del protagonista: entregada como arte; Claude la convirtió (6.7). Opcional: versión nativa a 36 px | Nada |
| 0.2 Compañera | Seguimiento, silla, curación, escudo, estados, recargas (implementada, integrada y probada; 8.7). Desde la Etapa 2; en la Etapa 1 es la enemiga (`companionEnabled`) | Compañera corrupta (Etapa 1, pedido escrito), compañera blanco y dorado y silla (Etapa 2), escudo (pedido escrito) y curación | Decisión 12 (balance, parte Etapa 2): sigue abierta; la v0.2 usa valores de prueba |
| 0.3 Combate | Ataques, combo de tres, proyectil, daño, esquiva y dos enemigos provisionales de prueba (0.4, fase D) | Armas de luz y proyectil (pedido escrito), animaciones de ataque del protagonista (por pedir), escenario de la Etapa 1 (pedido escrito) | Decisión 6 solo para el diseño final de enemigos (la 1 ya está cerrada) |
| 0.4 Habilidades | Energía, habilidades, combinaciones | Efectos de habilidades, luz, escudos | Nada visual (la 1 ya está cerrada) |
| 0.5 Entrenamiento | Escenario, enfrentamiento con la compañera, derrota e inconsciencia | Recursos del escenario y de la compañera en combate | Decisiones 11 y 12 |
| 0.6 Mundo y revelación | Anomalías, transición, corrupción, cambio de escenario | Escenarios utópico y real, oscuridad, transición | Decisión 8 |

La v0.1 se entregó con un rectángulo provisional que cambia de color según el estado. La hoja del protagonista ya lo reemplaza (8.8): el cambio tocó `PlayerPresenter` y la carga en `Preload`, sin cambiar movimiento, física ni estados (criterio de aceptación 6 de 8.6).


### 7.1 Qué cubre hoy lo visual para que Gemini trabaje en paralelo, y qué falta (24/11/2026)
Esta lista sale de lo registrado en este documento; el Documento Maestro no estuvo en el chat, así que puede haber más allá. Si el usuario lo adjunta, se compara.

**Cubierto:** contrato de recursos (6.1: PNG, celdas fijas, una animación por fila, pivote, orientación a la derecha); medidas y escala (6.2); manifiesto (6.3); nombres lógicos provisionales (6.5); validador y pedido formal del protagonista (6.6, 9.2); dirección artística (steampunk con LoL en pixel art duro a 320×180; Etapa 1 violetas y magentas, Etapa 2 oscuridad con focos luminosos); estilo de los personajes (blanco y dorado, la compañera con dos apariencias) y poderes (armas de luz). Camino para entregas en imagen grande (6.7). **Desde 0.11 también cubierto:** pedidos formales de armas de luz, escenario de la Etapa 1, compañera corrupta y escudo (0.5), con formatos de efectos y tilesets (6.8, a aprobar).

**Falta definir** (sin esto Gemini puede dibujar, pero Claude no puede integrar sin adivinar):

| Qué falta | Detalle | Quién decide |
|---|---|---|
| Valores exactos de color | 6.1 solo nombra las familias; el protagonista salió de una paleta tomada del concept art | Usuario, con propuesta de Gemini |
| Pedido formal de la compañera en blanco y dorado y su silla | Escrito solo el de la apariencia corrupta (`request_companion_corrupt_etapa1.md`). La entrega en hojas separadas es [PROPUESTA] (6.2). Falta el pedido de `companion_light.png` y `companion_chair.png` con sus animaciones (reposo sentada, flotar al seguir, curar, proteger) | Claude lo escribe; el usuario aprueba |
| Efectos de la v0.2 | Escudo: pedido escrito (`request_fx_shield_etapa2.md`). Falta el efecto de curación; hoy es un cambio de color de la silla y un contorno verde | Claude lo escribe; el usuario aprueba |
| Escenario de la Etapa 1 | Tileset y decorado: pedido escrito (`request_tiles_etapa1.md`). Faltan fondos y capas de profundidad (tamaños para 320×180) | Claude lo escribe; depende en parte de la decisión 11 |
| Animaciones de combate del protagonista | `attack_1` a `attack_3`, `ranged`, `dodge`, `hurt` y `defeated` (6.5) no están pedidas; las armas de luz se sincronizan con ellas | Claude lo escribe tras aprobarse el diseño de la v0.3 |
| Enemigos y jefes | Medidas "a definir" (decisiones 6 y 7) | Usuario |
| Ataques | La sincronización de golpe (6.4) sigue como propuesta, sin aprobar | Usuario |
| Interfaz | El `HUD` es provisional; no hay contrato para sprites de interfaz | Claude propone; usuario aprueba |
| Calidad de las entregas | Gemini no exporta PNG con alfa exacto: hoy cada hoja depende de la conversión de Claude (6.7) | Usuario decide si pide hojas nativas |


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
| `debug_damage` (solo desarrollo, v0.2) | T |

La tecla T es solo de depuración: hace daño al protagonista (25 de prueba) para probar curación y escudo mientras no hay enemigos.

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
- **Depuración (solo desarrollo):** F3 muestra FPS, estado y velocidad (desde la v0.2, también los estados y recargas de la compañera); F4 muestra cajas de colisión y de impacto; T resta vida al protagonista (v0.2).

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
| `src/view/PlayerPresenter.ts` | Representación del protagonista: sprite de la hoja o, si falta, rectángulo provisional (8.8) |
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
| Recurso del protagonista | rectángulo de 16 × 32 px, solo para pruebas; cambia de color por estado: blanco quieto, celeste corriendo, amarillo en el aire |

**Criterios de aceptación:**
1. El `index.html` se abre con doble clic y corre a 60 FPS.
2. A/D mueven al personaje; Espacio salta.
3. Colisiona con suelo, paredes y plataformas sin atravesarlas.
4. La cámara sigue al personaje, respeta los límites del nivel y no vibra.
5. El juego se ve nítido en cualquier tamaño de ventana, con escala entera.
6. El rectángulo se reemplaza por un sprite sin tocar movimiento, física ni estados. **Cumplido en el código el 24/11/2026** (8.8); falta verlo en pantalla.

**Limitaciones:** valores provisionales; no puedo evaluar la sensación de control; *coyote time* y *jump buffer* quedan fuera (solo se aprobó el salto variable).

**Estado de verificación (23/11/2026):**
- **Verificado en el entorno de Claude:** la lógica pura (`core/`, `logic/`, `data/`) compila sin errores y pasa las 84 pruebas, ejecutadas con un sustituto temporal de Vitest. Una simulación con el modelo de movimiento real y una colisión simple confirmó que todas las plataformas y escalones del nivel de prueba se pueden alcanzar (ventanas de despegue de 15 a 52 px) y que el techo detiene el salto.
- **Verificado por el usuario:** la parte de Phaser (`game/`, `view/`, `main.ts`) compila y funciona en su PC (Brave, Windows). Claude no pudo ejecutarla en su propio entorno.
- **Criterios de aceptación 1 a 5:** el usuario confirmó que el juego funciona completo en Brave; el detalle de cada punto de `documentation/checklist_v0.1.md` no se marcó uno por uno. El criterio 6 (cambiar el rectángulo por un sprite sin tocar la lógica) se cumplió en el código con la hoja del 24/11/2026 (8.8); falta comprobarlo en pantalla.

### 8.7 Detalle de la versión 0.2 (compañera)

**Estado:** diseño aprobado el 24/11/2026 e implementada ese día; la integración con el juego se reconstruyó en el borrador 0.8 y ya está en GitHub (0.11). Probada por el usuario en Brave (`documentation/checklist_v0.2.md`). **Cambio del 24/11/2026:** la compañera aparece desde la Etapa 2 (abajo).

**Alcance:** la compañera con recursos provisionales (dos rectángulos: uno para ella y otro para la silla de luz). Queda para después (v0.3 y v0.4): interceptar ataques, estabilizar, potenciar y habilidades combinadas.

**Cómo funciona**
- **Seguimiento:** va detrás del protagonista, sentada en la silla de luz, con un pequeño retraso para que se sienta flotando (suavizado exponencial más una oscilación leve). Al darse vuelta él, pasa al otro lado. No tiene cuerpo de física: no choca con las paredes.
- **Vida mínima del protagonista:** hace falta para probar curación y escudo. Como todavía no hay enemigos, la tecla de depuración **T** le hace daño. Con la vida en 0 no pasa nada todavía: la derrota queda para más adelante.
- **Curación (H):** la activa el jugador y recupera vida (sin pasar del máximo). Después queda en recarga. Si la vida ya está completa o la curación está en recarga, no se gasta. Puede curar aunque la vida esté en 0.
- **Escudo automático:** si llega un golpe y el escudo está listo, lo absorbe entero (la vida no cambia). Después queda en recarga.
- **Estados y recargas:** reposo, curando, escudo activo y recargando. Se ven en F3 y en una barra simple de vida y recargas (`HUD`).
  - `reposo`: todo listo y sin efecto en curso.
  - `curando` y `escudo activo`: efecto breve (0,5 s) justo después de curar o de absorber un golpe.
  - `recargando`: alguna de las dos habilidades espera su recarga.
  - La interpretación de "escudo activo" como efecto breve es de Claude; se confirma con el usuario al probar.

**Aparición por etapa: `companionEnabled` [PROPUESTA, 24/11/2026].** La compañera es la enemiga de la Etapa 1 y entra como aliada en la Etapa 2 (0.2, regla 5). La v0.2 se hizo con ella siempre presente, para probarla; se cambia así, sin tirar nada:
- **Dato:** campo `companionEnabled` (booleano) en los datos de cada nivel (`LevelData`), obligatorio y validado al arrancar. `level_test.json` en `true`; los niveles de la Etapa 1, en `false`.
- **En `false`:** `Level` no crea la `Companion`, su presenter ni la parte de curación y escudo del `SupportSystem`. La vida del protagonista sigue existiendo y el daño la baja directo. H no hace nada. El `HUD` muestra solo la barra de vida y oculta las filas de curación y escudo.
- **En `true`:** funciona como en la v0.2.
- **No cambia:** `Player` no conoce a la compañera; `CompanionModel`, `CompanionFollow` y `HealthModel` no se tocan. La tecla T sigue dañando al protagonista.
- **Criterios de aceptación:** (1) en un nivel con `false` no hay compañera, ni barras de curación y escudo, ni efecto de H; (2) un golpe de T baja la vida en 25 sin absorción; (3) en un nivel con `true` todo sigue como en los criterios 1 a 6 de más abajo; (4) un nivel sin el campo falla la validación con un mensaje claro; (5) las pruebas del `SupportSystem` cubren el caso sin compañera.
- **Fuera de alcance:** la enemiga de la Etapa 1 no usa este sistema. Es un enemigo de la v0.5, con su propia lógica.

**Valores de prueba [PROPUESTA: aprobados solo para probar; el balance real es la decisión 12, abierta].** Viven en `src/data/companion_stats.json`, que se cambia sin tocar código. El juego revisa el archivo al arrancar y avisa si algún valor es inválido.

| Parámetro | Valor de prueba |
|---|---|
| Vida máxima | 100 |
| Curación | +40, recarga de 12 s |
| Escudo | absorbe 1 golpe, recarga de 8 s |
| Daño de la tecla T | 25 |

Otros valores del archivo, solo visuales y de seguimiento (no son de balance): duración del efecto 0,5 s; distancia detrás del protagonista 20 px; altura de la silla 8 px; rapidez de seguimiento 6; oscilación de 1,5 px a 1,2 Hz. Los tamaños de los rectángulos provisionales (ella 12 × 26 px, silla 18 × 4 px) están en `CompanionPresenter`.

Alternativas planteadas y no adoptadas por ahora: que el escudo absorba una cantidad fija de daño en vez de un golpe, y que la curación consuma energía. El escudo ya admite más de un golpe cambiando `hitsAbsorbed`.

**Archivos**

| Archivo | Función |
|---|---|
| `src/logic/health/HealthModel.ts` | Vida: crear, dañar, curar (lógica pura) |
| `src/logic/combat/DamageResolution.ts` | Resuelve un golpe: primero el escudo, después la vida (lógica pura) |
| `src/logic/companion/CompanionModel.ts` | Curación, escudo, recargas, estados y validación de datos (lógica pura) |
| `src/logic/companion/CompanionFollow.ts` | Seguimiento con retraso (lógica pura) |
| `src/data/companion_stats.json` | Valores de prueba ajustables |
| `src/game/systems/SupportSystem.ts` | Une la vida con la compañera, aplica golpes y curaciones, emite eventos (sin Phaser) |
| `src/game/entities/companion/Companion.ts` | Posición de la compañera (sin Phaser) |
| `src/view/CompanionPresenter.ts` | Representación provisional: ella, la silla y el contorno de efecto |
| `src/game/scenes/HUD.ts` | Barras de vida, curación y escudo, en paralelo a `Level` |
| `src/core/GameEvents.ts`, `src/core/actions.ts`, `src/data/keymap.json` | Eventos nuevos (`health:changed`, `damage:dealt`, `companion:healed`, `companion:shieldAbsorbed`, `companion:stateChanged`) y acción `debug_damage` (T) |
| Cambios en `Level`, `main`, `DebugOverlay` | Integración (reconstruida en 0.8): `Level` crea la vida (`HealthState`), el `SupportSystem`, la `Companion` y su presenter, lanza el `HUD` y pasa las teclas H y T al sistema; `main` registra el `HUD`; F3 suma vida, estado y recargas. `Player` no cambió: no conoce la vida ni a la compañera |
| `tests/` | 50 pruebas nuevas (134 en total): vida, daño, compañera, seguimiento y `SupportSystem` |

**Criterios de aceptación:**
1. La compañera sigue al protagonista por detrás con retraso, cambia de lado al darse vuelta y no choca con nada.
2. La tecla T hace 25 de daño: el primer golpe lo absorbe el escudo y los siguientes bajan la vida.
3. H cura 40 (sin pasar de 100) y deja la curación en recarga de 12 s. No se gasta con la vida completa.
4. El escudo se recupera a los 8 s.
5. F3 y el `HUD` muestran vida, estados y recargas.
6. La compañera se reemplaza por un sprite tocando solo `CompanionPresenter`.

**Estado de verificación (24/11/2026):**
- **Verificado en el entorno de Claude:** la lógica pura y `SupportSystem` / `Companion` (sin Phaser) pasan las 134 pruebas, ejecutadas con un sustituto temporal de Vitest. `tsc` compila todo el proyecto con Phaser tipado como `any`.
- **Verificado por el usuario después (24/11/2026):** que `HUD`, `CompanionPresenter` y los cambios en `Level` funcionan con Phaser 4.2.1, `npm run typecheck` y `npm test`, según informó (sin detalle). **Sin comentarios todavía:** cómo se sienten los valores.
- **Verificado por el usuario (capturas del 24/11/2026, 0.9):** la compañera (rectángulo rojo con marca oscura) se ve detrás del protagonista sobre su silla; el primer golpe de T lo absorbe el escudo y el segundo baja la vida (75/100); el escudo queda en recarga ("8 s") y vuelve a "lista"; H cura hasta 100/100 y deja la curación en "12 s"; el contorno celeste (escudo) y el verde (curación) aparecen alrededor del protagonista, y la silla cambia de color. Criterios 2, 3 y 4 cumplidos a la vista; el 1 y el 5 solo en parte (falta el cambio de lado, F3 y la caída).
- **Reconstrucción de la integración (0.8):** `npm run typecheck` da 0 errores en todo el proyecto con los tipos reales de Phaser (antes, 20) y pasan las 142 pruebas. `Level`, `HUD`, `DebugOverlay` y `main` no se ejecutaron.

**Entrega:** código en el repositorio, `documentation/checklist_v0.2.md` y estado actualizado en la sección 0.


### 8.8 Integración de la hoja del protagonista (24/11/2026)

**Alcance:** reemplazar el rectángulo por el sprite de la hoja, con las cuatro animaciones del manifiesto. Nada de movimiento, física, estados ni `Level` cambia.

| Archivo | Función |
|---|---|
| `assets/final/protagonist.png`, `protagonist.json` | Hoja provisional (384×256, celdas 64×64, 15 colores, alfa 0/255) y su manifiesto (6.3) |
| `src/logic/assets/PlayerAnimation.ts` | Lógica pura: `playerAnimationName(state, vy)`, `frameRange(row, frames, columns)`, `animationKey` |
| `src/game/scenes/Preload.ts` | Lee el manifiesto con `parseManifest`, carga la hoja con `load.spritesheet` y crea una animación de Phaser por entrada del manifiesto |
| `src/view/PlayerPresenter.ts` | Sprite con origen (0,5; 1) en (`feetX`, `feetY`), animación según el estado, espejado con `setFlipX` |
| `src/vite-env.d.ts` | Tipos de Vite para importar el PNG y el JSON |
| `tests/PlayerAnimation.test.ts` | 8 pruebas, incluida la validación de la hoja real |

**Cómo funciona:**
- `idle` y `run` salen del estado del protagonista. En el aire, subiendo (`vy` < 0) es `jump_up` y en el punto más alto o bajando es `fall`.
- Los cuadros se numeran por fila (6 columnas): `idle` 0–3, `run` 6–11, `jump_up` 12–13, `fall` 18–19. Los fps y los bucles salen del manifiesto (`jump_up` no hace bucle).
- El pivote (32, 64) coincide con el origen (0,5; 1) del sprite, así que los pies quedan en `feetY`. El cuerpo de física sigue siendo 16×32; el sprite mide hasta 36 px.
- Si el manifiesto no es válido, el juego avisa por consola y sigue con el rectángulo. Si faltan los archivos de `assets/final/`, **el build falla** (los importa `Preload`).
- Las posiciones se redondean al píxel (`roundPixels` y `pixelArt` ya estaban activos en `main.ts`).

**Estado de verificación (24/11/2026):**
- **Verificado en el entorno de Claude:** validador oficial (compilado con `tsc`, ejecutado con node) sobre la hoja y el manifiesto: 0 errores, 0 avisos. `tsc` sin errores nuevos en los archivos tocados. 142 pruebas ok con un sustituto de Vitest (134 previas + 8 nuevas). Las medidas de la hoja se revisaron con un script propio: altura de 36 px en `idle`, de 25 a 33 en el resto, pies en la fila 64.
- **Verificado por el usuario (captura del 24/11/2026):** `npm run build` funciona, Vite incrusta el PNG en el `index.html` único y el sprite aparece sobre la plataforma, a escala (unos 35 px frente a tiles de 20), con los pies en el suelo y bordes nítidos.
- **Verificado por el usuario después (24/11/2026):** `run`, salto, caída y espejado, según informó (sin detalle). Sin comentarios todavía: si la capa hace "bailar" al personaje entre cuadros.

**Lista para probar en Brave:**
1. `npm run typecheck`, `npm test` (deben ser 142) y `npm run build`.
2. Abrir `dist/index.html`: el protagonista aparece como personaje, no como rectángulo.
3. Quieto: se anima `idle`. Corriendo: `run`, y al ir a la izquierda se espeja.
4. Saltando: `jump_up` al subir y `fall` al bajar. Los pies no flotan ni se hunden en el suelo.
5. Tamaño y legibilidad sobre el fondo del nivel. Decir si el personaje se ve demasiado chico, si la capa lo hace "bailar" entre cuadros y si el arte se entiende a ese tamaño.

---

## 9. Parte de Gemini

### 9.1 Qué hacés y qué no
**Sí:** sprites, hojas, animaciones, diseños de enemigos y jefes, escenarios, efectos de luz, proyectiles, impactos, escudos, curación, elementos de interfaz.
**No:** programar comportamiento, decidir tiempos de combate, ni fijar por tu cuenta ninguna de las decisiones pendientes. Podés **proponer** alternativas visuales; el usuario aprueba.

### 9.2 Cómo te pide Claude un recurso
Cada pedido trae: nombre del archivo, tamaño de celda, cantidad de filas y cuadros por animación, pivote, orientación, fps sugerido y, en ataques, cuántos cuadros deben ser de impacto. Ejemplo para la primera entrega:

> **Pedido v0.1 — `protagonist.png`** (decisiones 2 y 4 cerradas; el pedido formal, autocontenido, va en `documentation/asset_requests/request_protagonist_v0.1.md`)
> Celda 64×64, pivote (32, 64), mirando a la derecha. Filas: `idle` (4 cuadros, 6 fps, bucle), `run` (6 cuadros, 10 fps, bucle), `jump_up` (2 cuadros, sin bucle), `fall` (2 cuadros, bucle). Más `protagonist.json` según 6.3.
> Cantidades de cuadros y fps son **sugeridos**; podés proponer otros si el diseño lo pide, y se actualiza el manifiesto.

Pedidos escritos hasta ahora (`documentation/asset_requests/`): `request_protagonist_v0.1.md` (entregado), `request_fx_light_weapons_v0.3.md`, `request_tiles_etapa1.md`, `request_companion_corrupt_etapa1.md` y `request_fx_shield_etapa2.md`. Todos siguen el mismo formato y son autocontenidos.

### 9.3 Qué podés empezar ya
Las decisiones 1, 2 y 3 se cerraron el 24/11/2026 (resumen en 0.1, paleta en 6.1, medidas y estilo en 6.2). Ya no hace falta proponer alternativas para ellas: se produce según lo decidido.
- **Hoja del protagonista:** entregada como arte y convertida por Claude (6.7, 8.8). Opcional: una versión dibujada nativamente a 36 px, con celdas de 64×64, escala común entre cuadros y pies en el borde inferior, para reemplazar la conversión. Si no podés exportar un PNG con alfa exacto, entregá los cuadros en filas sobre fondo transparente, sin reescalarlos uno por uno.
- **Pedidos listos para trabajar (0.5, en este orden sugerido):** (1) armas de luz y proyectil, (2) escenario de la Etapa 1, (3) compañera corrupta, (4) escudo. Los formatos de efectos y tilesets (6.8) son propuesta hasta que el usuario los apruebe, pero no cambian lo que hay que dibujar.
- **Más adelante, según la sección 7:** compañera en blanco y dorado, silla de luz y efecto de curación (Etapa 2); animaciones de combate del protagonista (v0.3).

Nada se integra al juego hasta que el usuario lo apruebe.

### 9.4 Lo que no debés asumir
- Las medidas están cerradas (6.2); cualquier cambio lo pide el usuario.
- Ningún origen ni naturaleza de la sombra (decisión 8): su aspecto no debe explicarla.
- La apariencia corrupta de la compañera (rojo y negro) **no** tiene estética demoníaca (decisión 2).
- La apariencia utópica del primer mundo es la **percepción del protagonista**, no una simulación ni una dimensión artificial.

---

## 10. Decisiones

### 10.1 Pendientes del Documento Maestro (nadie las toma salvo el usuario)
1. ~~Manifestación visual de los poderes del protagonista.~~ **Cerrada el 24/11/2026** (armas de luz forjadas al instante; ver 0.1).
2. ~~Diseño físico definitivo de ambos personajes.~~ **Cerrada el 24/11/2026** (estilo Genshin Impact, blanco y dorado; la compañera con dos apariencias; ver 0.1).
3. ~~Paletas de colores definitivas.~~ **Cerrada el 24/11/2026** (Etapa 1 Opción A, Etapa 2 Opción B; ver 0.1 y 6.1).
4. ~~Resolución y dimensiones definitivas de sprites.~~ **Cerrada el 23/11/2026** (320×180 y medidas de 6.2).
5. Sistema de progresión.
6. Diseño y variedad de enemigos.
7. Diseño de jefes.
8. Origen y naturaleza de la sombra.
9. Historia completa del pasado.
10. Desenlace definitivo.
11. Diseño de niveles.
12. Balance de vida, energía, daño y recargas. (Abierta; la v0.2 usa valores de prueba, ver 8.7.) **Dividida el 24/11/2026 en dos partes**, porque la compañera entra recién en la Etapa 2: **12a, Etapa 1** (solo el protagonista: vida, daño, energía; se afina jugando la v0.3) y **12b, Etapa 2** (con compañera: curación, escudo y recargas; hoy +40 con 12 s y 1 golpe con 8 s, de prueba). Alternativas planteadas y no adoptadas: escudo que absorbe una cantidad fija de daño en vez de un golpe, y curación que consume energía.

**Cerradas:** 1, 2, 3 y 4. **Las que más desbloquean ahora:** 12a (balance de la Etapa 1) y, para la v0.3, la 6 (enemigos; para probar el combate alcanzan los dos enemigos provisionales de 10.2, fila Q, que no son el diseño final).

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
| K | Valores de prueba de la compañera en `companion_stats.json` (8.7) | [PROPUESTA] (aprobados el 24/11/2026 solo para probar; sujetos a la decisión 12) |
| L | Tecla de depuración T: daño al protagonista, solo desarrollo (8.1) | [PROPUESTA] |
| M | Hoja del protagonista provisional (conversión de Claude, 8.8) aceptada como versión inicial porque pasa el validador oficial sin errores | [DELEGADO] (criterio fijado por el usuario el 24/11/2026; vista en pantalla y aprobada) |
| N | `companionEnabled` por nivel: la compañera, su curación, su escudo y sus barras solo existen donde el nivel lo habilita; aparece desde la Etapa 2 (8.7) | [PROPUESTA] (regla de la Etapa 2 dada por el usuario el 24/11/2026; el mecanismo falta aprobar) |
| O | Las dos apariencias de la compañera en hojas separadas (`companion_corrupt.png`, `companion_light.png`) y la silla en `companion_chair.png` (6.2) | [PROPUESTA] |
| P | Formatos de efectos (`fx_*`) y de tilesets (`tiles_*`, `props_*`) y anclajes de 6.8 | [PROPUESTA] |
| Q | Dos enemigos provisionales de prueba para la v0.3 (cuerpo a cuerpo que patrulla; a distancia que dispara), rectángulos descartables, sin ser el diseño final de la decisión 6 | [PROPUESTA] |

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
| Hoja convertida desde un raster | Pierde detalle a 36 px y la capa puede hacer "bailar" al personaje entre cuadros | Reemplazarla por una hoja nativa a 36 px sin tocar código (6.7) |
| El repositorio no tenía todos los cambios de la v0.2 | `typecheck` fallaba y el juego no mostraba la compañera | Reconstruido en 0.8; subir todo a GitHub con `git add -A` tras aplicar los patches (0.4) |
| Phaser no se pudo ejecutar en el entorno de Claude | Errores de integración que no se vieron al escribir la v0.1 | El usuario compila y prueba; los mensajes de error vuelven a Claude |
| El validador no cubre efectos ni tilesets | Los avisos `PIVOT_FEET` y `ANIM_NAME` en efectos confunden, y los tilesets no tienen ninguna comprobación | Fase C de 0.4 antes de la primera entrega; hasta entonces, revisión manual de Claude (6.8) |
| La compañera existe en todos los niveles en el código actual | Contradice la regla de la Etapa 2 y confundiría el balance de la Etapa 1 | `companionEnabled` por nivel (8.7, fase B de 0.4) |
| Los colores de la enemiga (rojo y negro) y del protagonista pueden perderse sobre violetas y magentas | Mala lectura en la Etapa 1 | Los pedidos exigen probarlo y entregar una imagen de referencia sobre el fondo |

---

## 12. Fuentes consultadas

- Phaser, README oficial (tamaños de las compilaciones): https://github.com/phaserjs/phaser
- Phaser 4.2.1, README publicado (versión estable y tamaños gzip): https://unpkg.com/phaser@4.2.1/README.md
- Godot, documentación de exportación web (WebGL 2.0 y Safari): https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html
- Medición del tamaño de una exportación web de Godot 4: https://dev.to/ziva/how-to-export-a-godot-game-to-the-web-and-share-a-playable-link-2g88

Los tamaños son valores publicados por esas fuentes y deben volver a medirse en este proyecto.

**FIN DEL DOCUMENTO TÉCNICO**
