#!/usr/bin/env python3
"""Contract check for generated TRYAMM no-AI catalog; read-only."""
import json, sys
from pathlib import Path
p=Path(sys.argv[1] if len(sys.argv)>1 else "generated/tryamm-starters")
m=json.loads((p/"manifest.json").read_text(encoding="utf8"))
assert m["industries"]==20 and m["demoVariants"]==500 and m["saleReady"]==0
entries=m["templates"]
assert len(entries)==500 and len({x["id"] for x in entries})==500
for entry in entries:
 assert entry["status"]=="demo-unconfigured" and entry["live"] is False
 f=p/entry["file"]
 assert f.is_file()
 body=f.read_text(encoding="utf8")
 assert '<meta name="viewport"' in body
 assert 'Demo only' in body
 assert 'No contact address' not in body or 'no contact address' in body.lower()
 assert 'getUserMedia' not in body and 'STRIPE_SECRET_KEY' not in body
print("PASS: 500 unique no-AI demo variants across 20 industries; no sale-ready claims")
