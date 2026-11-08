#!/usr/bin/env bash
# Final loudness master for Reels: ./scripts/master.sh in.mp4 out.mp4
# Target about -16 LUFS integrated, true peak <= -1.5 dB (reference reel measured -17 LUFS; our raw renders were about -21).
# Video stream is copied untouched; only audio is re-encoded (AAC 192k). Voice stays dominant (music/SFX levels are set in the composition).
set -euo pipefail
in="$1"; out="$2"
ffmpeg -y -loglevel error -i "$in" -c:v copy -af "loudnorm=I=-16:TP=-1.5:LRA=7" -c:a aac -b:a 192k "$out"
ffmpeg -i "$out" -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|Peak:" | tail -2
