# Odd Town kit (@oddtowntales)

One shared blocky 3D town for every "In this town…" story. Same cast, same places, tested camera angles.
Built from 6 finished videos (Counter, Knock, Bridge, Shadows, Ice). All code, no AI images.

## Start a new story (fresh chat)
```bash
git clone --depth 1 -b oddtown-kit https://github.com/nikhilprashant21/shorts-drop ~/oddtown-kit
bash <faceless-shorts SKILL>/scripts/setup.sh            # once per machine: Chrome, ffmpeg, Kokoro venv
cp -r ~/oddtown-kit/template ~/faceless-shorts/<story> && cd ~/faceless-shorts/<story>
ln -s ~/oddtown-kit/node_modules node_modules 2>/dev/null || npm i three
```
1. `script.json` (copy `script.example.json`): one line = one cut; per-line `"voice"`/`"speed"` for other characters
   (Dad/Leo = `am_michael` / `am_puck`); `"break": true` joins a line to the next sentence; `"music": "dark"` +
   `"music_sections": [[line, mode], ["t:SECONDS", mode]]`, modes full/thin/out/hit/soft/creep.
2. `~/.faceless-shorts/venv/bin/python tools/voice.py .` then `python <SKILL>/scripts/words.py .`
3. Write `src/shots.js` (see `examples/`). Build only the sets the story uses.
4. Test frames: `SOFTWARE_GL=1 QS='&res=0.35&aa=0&shadow=1024' node tools/capture.mjs frames review/f "1.5,4,..."`,
   tile them into ONE sheet ≤1600 px and look.
5. `node tools/capture.mjs cues` → `python tools/mix.py .`
6. Render RESUMABLE: `nohup bash ~/oddtown-kit/render_seg.sh <story> &` (8 s pieces; re-run to resume).
   Poll every ≤9.5 min with `cat review/progress.txt` until `ALL DONE`. Never reply/stop while it must finish:
   background jobs pause a few minutes after the turn ends.
7. Share copy: `ffmpeg -i renders/raw.mp4 -vf scale=1080:1920 -c:v libx264 -crf 21 -preset slow -c:a aac -b:a 160k -movflags +faststart out.mp4`
8. Post (only after the user says so): push mp4 to a new orphan branch of shorts-drop, check raw URL = 200,
   Windsor `instagram` `create_video_post`, account oddtowntales `17841461577987159`, share_to_feed true.

## Locations (src/core)
| set | function | what's there | coordinates |
|---|---|---|---|
| Mia's house | `knock.js` `houseSet(E)` | front door at z=0 (inside z>0: hallway, coats, lamp, kitchen table + note at (3.2,0,3.4); outside z<0: porch, porch light, pines, snow at y=-0.18) | `H.light({mode:'night'|'evening'|'day', porch, lamp, tlamp})`, `H.openDoor(a)`, `H.under({light, feet})` light strip under door, `knockK/OLD_KNOCK/NEW_KNOCK` |
| The street | `shadows.js` `streetSet(E)` | snowy street, 6 lamps at x 0,9,…,45 (z=3.2), sidewalk z=4.2, houses ×1.7 both sides, Mia's home at x≈44.4 north, Pell's house south x≈26.3 (red shut curtains), lamp 4 broken | `S.set({on, shadowAt: lampIndex, broken, dark})` — only ONE lamp casts shadows per shot |
| Mia's bedroom | `shadows.js` `bedroom(E)` | 6×6 room, bed, window, floor lamp spot throwing a big shadow on the back wall | `BR.set(k)` |
| River & bridge | `bridge.js` `riverSet(E)` | bridge deck y=2.2 along x ±13, black water, banks, Grandma's house at x≈-19.5, carved sign | `R.set({flow, mode:'night'|'morning', wind})`, `lantern()`, `paleHand()`, `windSnow()` |
| Frozen lake | `ice.js` `lakeSet(E)` | 44×44 see-through ice, shore at z=22, bench, 2 lamps, "NEVER ALONE" scratches, crack decal | `LK.set({night, at, crackAt, crackK})`, `underize(person)` upside-down copy under ice |
| Town aerial | `blocky.js` `town(E)` | the original pastel town (scaled 1.7) | `setNight(k)` |

Helpers: `ghostify(p)` invisible body that still casts a shadow, `noShadow(p)`, `B.person(look).at(x,y,z,ry).set({legs:'walk'|'run'|'stand'|'kneel'|'sit', phase, armL:[fwd°,out°], armR, mood, tilt, turn, roll})`.
Moods: neutral, warm, happy, talk, worried, scared, shocked, crying, sad, smirk, sleep.

## Hard-won rules
- Person group scale is NOT 1 (0.66 adults, ×0.74 kids). Never `group.scale.setScalar(1)`; multiply the stored base.
- Camera distances: two-shot of kids 2.6-3 m, face close-up 1.1-1.4 m (look at head y≈1.1 kids / 1.5 adults), adult medium 2.4 m.
  Closer = the camera ends up inside a body. In 9:16 the horizontal view is narrow: fov 50-58.
- Faces only exist on the front: to see a face, the camera must be in front (dot of facing dir and camera dir > 0.7).
- Check that no lamp pole / door leaf / wall sits between camera and subject (most black or blocked frames were this).
- Top-down shots: `cam.up = (0,0,-1)` or `(1,0,0)`; oblique 45° often reads better than straight down.
- Story rules: named threat, hidden mechanism, a loophole + a second rule that makes it deadly, ONE twist that the
  last line says plainly and the last shot shows. Moral only in the caption. Captions 1-3 words. Music must be felt.
