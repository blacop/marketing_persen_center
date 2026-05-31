#!/bin/bash
# 将项目 Hermes skill 同步到 ~/.hermes/skills/beukay/
# 新成员克隆项目后执行一次即可

set -e

SKILL_SRC="$(dirname "$0")/skills"
SKILL_DST="$HOME/.hermes/skills/beukay"

echo ">>> Syncing Hermes skills to $SKILL_DST ..."
mkdir -p "$SKILL_DST"

for skill in "$SKILL_SRC"/*/; do
    name=$(basename "$skill")
    dst="$SKILL_DST/$name"
    mkdir -p "$dst"
    cp "$skill/SKILL.md" "$dst/SKILL.md"
    echo "    ✓ $name"
done

echo ">>> Done. Verify with: hermes skills list --source local"
