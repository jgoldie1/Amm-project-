#!/data/data/com.termux/files/usr/bin/bash
cd ~/marketplace || exit 1
python - <<'PY'
from pathlib import Path
import re
from collections import Counter

text = Path("app.py").read_text()
funcs = re.findall(r'^\s*def\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(', text, flags=re.MULTILINE)
dupes = [name for name, count in Counter(funcs).items() if count > 1]
if dupes:
    print("DUPLICATE_DEF_NAMES_FOUND")
    for name in dupes[:100]:
        print(name)
else:
    print("NO_DUPLICATE_DEF_NAMES")
PY
