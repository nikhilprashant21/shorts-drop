# Engineers Without Sleep — video kit

> **GitHub copy (branch `kit` of nikhilprashant21/shorts-drop).** Mirror of `D:\Engineers Without Sleep Shorts\_kit\`
> for chats where the PC is offline. It holds only the templates copied so far (ship, clipper, engine4, transformer, wankel, heli, gps, solar); the PC copy is the
> master. Clone: `git clone --depth 1 -b kit https://github.com/nikhilprashant21/shorts-drop kit`


Reusable code for the **beat explainer** shorts and the **music bed**, so a new video doesn't have to be written from scratch. If you are Claude in a new chat: read this, copy the closest template, and change only what the new topic needs.

## What's here

```
_kit/
├── README.md        ← this file
├── package.json     ← three.js + the two pixel fonts
├── tools/
│   ├── tracker_add.py ← add/update rows in Shorts Tracker.xlsx (no spreadsheet skill needed)
│   └── bed.py       ← beat-matched background music bed (beat-music-bed skill)
└── templates/
    ├── ship/        ← BEST STARTING POINT. High quality: hall + engine exterior, cutaway cylinder
    │                  with crank/piston/valve/injector, turbo cutaway with flow particles,
    │                  flywheel + shaft + propeller, sea + container ship. 102 BPM.
    ├── miata/       ← High quality: NA Miata model (miata_model.js), 14-cyl engine exterior,
    │                  stacks/rows of cars, pixel sprite grid, police lights, crush. 102 BPM.
    ├── rotary/      ← Older, chunky low-res toon look: Wankel rotor/housing/gears. 120 BPM.
                       Reuse its rotor geometry, but port it into the ship/miata renderer.
    ├── liion/       ← Lithium-ion battery charge explainer.
    ├── printer/     ← High quality: CoreXY 3D printer on a workshop bench (fixed nozzle, bed drops per layer),
    │                  drive gears + stripe-textured filament, x-ray hot end, branded spool, live LCD,
    │                  toolpath-accurate part (walls/infill/skin as instanced beads, split for a cutaway). 120 BPM.
    ├── clipper/     ← High quality: gold hair clipper on a velvet pedestal in a throne room, x-ray body
    │                  (glowing edges), motor + off-centre pin + fork + moving/fixed blades, hair strands that
    │                  get snipped, falling crown, stroke counter, oscilloscope. 136 BPM (50X/100X/200X
    │                  slower land on the beat). Good base for any small handheld gadget.
    ├── engine4/     ← High quality: single-cylinder 4-stroke cutaway in a garage (hatch cut faces with port holes,
    │                  piston/rod/crank, DOHC cams + valves at half crank speed, spark plug, colour-coded gas,
    │                  port flow particles, rear timing belt 2:1, firing-order 1-3-4-2 panel). 100 BPM
    │                  (8X/16X/128X slower from 800 rpm idle land on the beat). Music in A minor: the bed misread Em-C-G-D as C major.
    ├── transformer/ ← High quality: iron core + 4-turn primary + 40-turn secondary (one mesh per turn so they light up),
    │                  tank that fades to x-ray, bushings, flux arrows round the core, electron dots that jiggle (AC) or
    │                  drift (DC), scope / volts-x-amps / heat panels, mini pylon line with power pulses. 120 BPM
    │                  (50X/100X/200X slower from 50 Hz). Wide subject: camAt() has per-shot distance factors (KH/KS).
    ├── wankel/      ← High quality (replaces old low-res rotary): exact Mazda epitrochoid housing (R 105 / e 15 mm),
    │                  rotor whose apexes trace it, 3 live chamber fills coloured by stroke, ports + flow dots, twin
    │                  plugs, eccentric shaft, 3:2 gears (rotor fades to x-ray), 3:1 counter, bang-rate panel.
    │                  Blended branding: embossed rotor ring, cast housing bands, stencilled crate, NOSLEEP plate. 120 BPM.
    ├── heli/        ← High quality: Robinson R44-style helicopter (metres) in a hangar on a branded helipad: 2-blade
    │                  rotor with real airfoil blades, swashplate, collective/cyclic pitch, tail rotor, instanced
    │                  downwash, lift + tail-thrust arrows, blade-frame camera, BLADE SLICE panel, torque arcs.
    │                  Livery branding (boom decal, NO-SLEEP reg, helipad ring). 100 BPM (4X/8X/16X from 400 rpm).
    ├── gps/         ← Space look: Earth globe textured from world-atlas land polygons (land.js), atmosphere, stars,
    │                  30-satellite GPS constellation (6 planes, 55 deg), branded satellite bus, light shells, distance
    │                  spheres, sphere-sphere circle, 3-sphere candidate points, phone blue dot. CONTINUOUS camera:
    │                  one Catmull-Rom spline after the hook (KEYS list) + running-sentence captions. 120 BPM.
    └── solar/       ← Two sets: sunny rooftop (sky gradient, sun sprite, 3 tilted 60-cell panels with per-cell
                       materials that light up in series, sun-ray streaks, inverter with nameplate) + an "atom scale"
                       cell cut-open far away at X0 (N/P layers, lattice atoms, spare electrons, holes, one-way wall
                       with field arrows, photon -> electron/hole, wire + lamp with flowing current). 120 BPM.
```

Each template is self-contained:

| File | What it is |
|---|---|
| `timeline.js` | All timing in beats: BPM, scenes, captions, labels, speed tags, motion functions, event lists (bangs etc.) |
| `scene.js` | Three.js scene, camera shots, 2D overlays (captions, labels, branding, dither) and `window.renderFrame(t)` |
| `index.html` | Import map for `three`, loads the fonts, then `scene.js` |
| `events.mjs` | Writes `events.json` (beats of bangs, captions, labels) for the music |
| `music.py` | Chiptune generator + this video's arrangement → `music.wav` |
| `shots.mjs` | Renders test frames: `node shots.mjs 1.5 12.3 ...` (seconds) |
| `render.mjs` | Renders every scene to `out/sceneN.mp4` and writes `out/list.txt` |
| `render_one.mjs` | Re-renders chosen scenes: `node render_one.mjs 0 5` |

## Making a new video (cheapest way)

1. Copy the closest template to a working folder, plus `package.json`; run `npm i` there.
2. Edit **`timeline.js`** (captions, beats, speeds) and only the parts of **`scene.js`** the topic needs (new models, camera shots, anchors). Keep everything else.
3. `python3 -m http.server 8123` in that folder (restart it if a paused session killed it).
4. `node shots.mjs <seconds...>` → check ONE contact sheet.
5. `node events.mjs && python3 music.py` → `music.wav` (edit only the arrangement block for the new story).
6. `nohup node render.mjs > render.log 2>&1 &` and poll; then
   `ffmpeg -f concat -safe 0 -i out/list.txt -c copy video.mp4` and
   `ffmpeg -i video.mp4 -i music.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest final.mp4`.
7. When using the beat-music-bed skill, apply it to the rendered explainer and deliver one final MP4 with the bed integrated: `python3 -I tools/bed.py render.mp4 final.mp4 --style ambient`. Treat the rendered explainer as an intermediate; do not keep or deliver a second, unprocessed MP4.
8. Save to a new numbered video folder and update the tracker (see the README one level up).

Settings via environment variables: `PORT` (default 8123), `CHROME` (default `/usr/bin/google-chrome`).

## Running on your own PC (no AI credits)

Install Node.js, Python 3 (with numpy), ffmpeg and Chrome. In a template copy: `npm i`, `npm i playwright`, then set `CHROME` to your Chrome path (for example `C:\Program Files\Google\Chrome\Application\chrome.exe`) and run the steps above. With a graphics card you can drop the `--use-angle=swiftshader` flags in `render.mjs` / `shots.mjs` for much faster renders.

## Rules that every template already follows

- Branding: `@ENGINEERSWITHOUTSLEEP` on every frame (bottom centre), "ENGINEERS WITHOUT SLEEP" built into the scene.
- Fast first (REAL SPEED cuts on every beat), then slower speed tags while explaining.
- Every event (bang, pop, step) is computed once in `timeline.js` on the beat grid and used by both the picture and the music.
