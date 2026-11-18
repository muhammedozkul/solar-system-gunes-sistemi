**English** · [Türkçe](README.tr.md)

# Solar System · Güneş Sistemi

An explorable 3D Solar System that runs in the browser. Written in plain HTML, CSS and JavaScript; no build step, no npm, no framework. 3D rendering uses Three.js (r160), which ships with the repository, so no internet connection is needed.

🪐 **Open in your browser:** https://muhammedozkul.github.io/solar-system-gunes-sistemi/

No installation required; works in Chrome, Edge, Safari or Firefox on Windows, macOS and phones.

## Running it

**macOS:** Double-click `Güneş Sistemi.command`. A local server starts and `http://localhost:8773` opens in the browser. If the server is already running, only the browser opens. To stop it, press `Ctrl+C` in the Terminal window that opened.

**Windows:** Double-click `Güneş Sistemi.bat`. [Python 3](https://www.python.org) must be installed (tick "Add python.exe to PATH" during setup). To stop it, close the black window that opened. If you don't want to install Python, use the live link above.

**Manually:**

```bash
cd solar-system-gunes-sistemi
python3 -m http.server 8773
# then in the browser: http://localhost:8773
```

Opening `index.html` directly does not work, because ES modules can't be loaded over `file://`; a local server is required.

## Controls

| Action | How |
| --- | --- |
| Rotate | Drag |
| Zoom in / out | Mouse wheel or two fingers |
| Pan (overview) | Right-click drag |
| Fly to a body | Click the body, its label or the menu at the bottom |
| Sun / planets | `0` / `1`–`8` |
| Pluto / Halley | `9` / `H` |
| Previous / next | `←` / `→` |
| Pause / play | `Space` |
| Overview | `Esc` |
| Orbits / labels | `O` / `L` |
| Auto tour | `T` |
| Language (Turkish / English) | TR · EN button at the top right; the choice is remembered, and on first visit it follows the browser language |

When you fly to a body, the camera follows it along its orbit; you can still rotate around it and zoom. Chips in a planet's info panel take you to its moons (Moon, Phobos, Deimos, Io, Europa, Ganymede, Callisto, Titan, Charon).

**Shareable links:** Selecting a body updates the address bar (e.g. `…/#saturn`, `…/#halley`). Anyone opening that link flies straight to that body.

**On phones:** The info panel opens small from the bottom so the body stays visible. Swipe up or tap the text to expand it. Swipe down to shrink it, then close it.

## Features

- A boiling, corona-wrapped Sun (custom shader + bloom)
- Earth: city lights on the night side, ocean glint, normal map, separately rotating clouds with cloud shadows, atmospheric glow
- Saturn: textured rings, ring shadow on the planet and planet shadow on the rings
- Real axial tilts, eccentric and inclined orbits, real period ratios
- Pluto and its moon Charon (dwarf planet; an eccentric orbit that crosses Neptune's)
- Halley's Comet: at its current position (≈ 35 AU) from real orbital elements. As it nears the Sun, a coma and two tails appear: a blue ion tail pointing directly away from the Sun and a curved dust tail that lags along the orbit. The **Watch it approach the Sun** button in the panel jumps time to just before its 2061 passage.
- Asteroid belt (3,000 rocks, InstancedMesh), Kuiper belt, the Milky Way and twinkling stars
- Time control (1 hour/s – 2 years/s), auto tour, Turkish and English interface and info panels

## About the scale

At true proportions the planets would be invisible on screen, so the scale is compressed while order and size relationships are preserved:

- Radius: `(R / R_earth)^0.55` (Earth = 1 unit, Jupiter ≈ 3.7 units; the Sun is fixed at 9 units)
- Distance from the Sun: `18 + 56·√AU`
- Orbital periods are real. Spin and moon motion advance at a capped rate so they don't turn into flicker at high speeds; moon periods are compressed with a square root.
- At start, planets are at their approximate current positions, computed from J2000 mean orbital elements. Positions come from a numerical solution of Kepler's equation.
- On Halley's very eccentric orbit, position is computed in real AU and only the distance from the Sun is compressed with the same formula; the nucleus is enlarged so it stays visible.
- Solar System Scope has no Pluto texture; Pluto and Charon are shown with a tinted Moon texture.

## File structure

```
index.html            Page skeleton and importmap
css/style.css         Interface styles
js/main.js            Renderer, postprocessing, camera flight/follow, interaction
js/scene.js           Sun, planets, moons, rings, belts, sky
js/shaders.js         Custom GLSL shaders
js/ui.js              Menu, info panel, time control, help
js/i18n.js            Language selection, t() translation function, number formatting
js/metin-tr.js        Turkish interface and body texts
js/metin-en.js        English interface and body texts
js/data.js            Planet, Pluto and Halley data (numeric), scale formulas
textures/             Planet textures
vendor/three/         Three.js r160
```

## Credits

- Textures: [Solar System Scope](https://www.solarsystemscope.com/textures/) — CC BY 4.0
- [Three.js](https://threejs.org) r160 — MIT
- Simplex noise: Ian McEwan / Ashima Arts — MIT
- Physical data: NASA Planetary Fact Sheet and NASA Solar System Exploration
- Halley orbital elements: JPL Small-Body Database
