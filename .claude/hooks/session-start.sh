#!/bin/bash
# SessionStart (только облако): ставит зависимости и печатает короткую сводку для новой сессии.
set -euo pipefail
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then exit 0; fi
cd "${CLAUDE_PROJECT_DIR:-.}"
LOG=/tmp/session-start-install.log
if [ -d reels ]; then
  hashes=reels/node_modules/.session-start.sha256
  if ! sha256sum --check --status "$hashes" 2>/dev/null; then
    rm -f "$hashes"
    (cd reels && npm install --no-audit --no-fund) >>"$LOG" 2>&1
    sha256sum .claude/hooks/session-start.sh reels/package.json reels/package-lock.json 2>/dev/null > "$hashes" || rm -f "$hashes"
  fi
fi
b=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "?")
echo "=== СВОДКА СТАРТА СЕССИИ ==="
echo "Прочитай сам: CLAUDE.md, reels/docs/STYLE_PASSPORT.md (стиль), reels/docs/SCRIPT_STANDARD.md (сценарий), reels/docs/CAPTION_FORMAT.md, reels/docs/COVER_GUIDE.md."
echo "Ветка сессии: $b. В конце: обновить «Состояние» в CLAUDE.md, закоммитить, запушить, напомнить слить в main (PR только по просьбе)."
