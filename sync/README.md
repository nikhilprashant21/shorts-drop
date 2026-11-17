# Engineers Without Sleep — Shorts folder

This folder holds every short made for the **Engineers Without Sleep** channel and a spreadsheet tracking where each one is posted. If you are an AI assistant in a new chat, read this first, then keep the folder and the spreadsheet up to date as described below.

## Folder layout

```
Engineers Without Sleep Shorts/
├── README.md              ← this file
├── Shorts Tracker.xlsx    ← one row per video: where it's posted, with links
├── 01 - How a windmill makes electricity/
│   ├── how-a-windmill-makes-electricity.mp4
│   └── cover.jpg
├── 02 - How a plane can fly/
│   └── ...
└── ...
```

- **One folder per video**, named `NN - Title` and numbered in order (01, 02, …). Use the next unused number.
- Leave out characters Windows doesn't allow in names (`? : * " < > | / \`), for example `Why does hot air rise?` → `09 - Why does hot air rise`.
- Inside each folder:
  - the final video, named in lowercase with hyphens (`how-a-jet-engine-works.mp4`)
  - `cover.jpg`, the frame or image used as the thumbnail
- If a video has more than one version, keep them all in the same folder and give the extra ones a suffix (`...-2d.mp4`). Note in the tracker which one was posted.

## Adding a new video

1. Create the next numbered folder, `NN - Title`.
2. Put the final `.mp4` and `cover.jpg` in it.
3. Add a row to `Shorts Tracker.xlsx` (see below).
4. After it's posted anywhere, tick that platform in the tracker and paste the link.

## The tracker (`Shorts Tracker.xlsx`)

Columns: `#`, `Title`, `Format` (Portrait / Landscape), `Instagram`, `YouTube`, `Facebook`, `Folder`, `Length (s)`, `Instagram link`, `YouTube link`, `Channel`.

- **One numbering for everything.** Videos are made in two places (Claude on this PC, and Claude in the cloud). Both share this one list, numbered in the order the videos were made. Before adding a video, check the highest `#` in the tracker AND the highest folder number here, and use the next one. A video with two formats (e.g. 19, portrait + landscape) keeps one number and gets one row per format.
- The master copy of this tracker is the shared Claude sheet "Shorts Tracker"; this .xlsx is a synced copy.

- **Add new videos as new rows directly above the "Total posted" row**, in number order, copying the formatting of the row above.
- `Folder` is the exact folder name. `Length (s)` is the video length in seconds, one decimal place.
- Platform cells hold **✓** (posted) or **☐** (not posted), chosen from a dropdown. New rows must keep that dropdown and the green/grey colouring: extend the data-validation and conditional-formatting ranges to cover them.
- When something is posted, tick the platform and fill in its link. Instagram Reel links can be read back with the Windsor.ai connector (`get_data`, fields `media_id` and `media_permalink`).
- The **"Total posted"** row counts ticks with formulas like `=COUNTIF(D5:D42,"✓")&" / "&COUNTA(D5:D42)`. When you add rows, **extend these ranges** so the new rows are counted.
- Keep the note below the totals up to date (for example, which videos aren't posted yet).
- Save the file as `.xlsx`; never overwrite the formulas with fixed numbers.
