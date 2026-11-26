#!/bin/bash
# resumable render: 8 s segments, skips finished ones, then joins + adds the full mix
P=$1; cd ~/faceless-shorts/$P || exit 1
export SOFTWARE_GL=1 QS='&res=0.6&aa=0&shadow=1024' FPS=24
D=$(python3 -c "import json;print(json.load(open('data/cues.json'))['duration'])")
mkdir -p renders/seg; i=0; t=0
while python3 -c "import sys;sys.exit(0 if $t < $D else 1)"; do
  t1=$(python3 -c "print(min($t+8,$D))"); f=$(printf "renders/seg/s%03d.mp4" $i)
  if [ ! -f $f ]; then node tools/capture.mjs video renders/seg/tmp.mp4 $t $t1 > review/seg.log 2>&1 && mv renders/seg/tmp.mp4 $f || exit 1; fi
  echo "seg $i done ($t1 / $D s)" > review/progress.txt; i=$((i+1)); t=$t1
done
ls renders/seg/s*.mp4 | sed "s/^/file '$(pwd | sed 's/\//\\\//g')\//; s/$/'/" > renders/seg/list.txt
ffmpeg -v error -y -f concat -safe 0 -i renders/seg/list.txt -i data/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart renders/raw.mp4 && echo "ALL DONE" > review/progress.txt
