#!/usr/bin/env python3
"""Install already recovered, checksum-verified GLBs from handoff ZIP. Never substitute placeholders."""
from pathlib import Path
import hashlib,zipfile,sys
EXPECTED={'BJ_STUBBS_V15_RECOVERED.glb':'122e77b243bb9feac9c6e835a500207d034ef8ee710f52751a89ee917e685258','LaTeasia_RIGGED_DIAGNOSTIC.glb':'96faef46205295d16cdf6c8d21a0e216438141f053cf0601800d62d3020998af'}
repo=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else Path.cwd()
source=Path(sys.argv[2]).resolve() if len(sys.argv)>2 else repo/'StreetVerse_Nov15_Verified_Asset_Handoff.zip'
app=repo/'amm-omniverse'
if not (app/'package.json').is_file():raise SystemExit('ERROR: first argument must be Amm-project- repository root')
if not source.is_file():raise SystemExit('ERROR: recovered asset handoff ZIP not found')
target=app/'public/assets/characters'
target.mkdir(parents=True,exist_ok=True)
with zipfile.ZipFile(source) as archive:
 for filename,expected in EXPECTED.items():
  candidates=('assets/'+filename,'amm-omniverse/public/assets/characters/'+filename)
  member=next((item for item in candidates if item in archive.namelist()),None)
  if member is None:raise SystemExit('ERROR: verified asset missing from ZIP: '+filename)
  raw=archive.read(member)
  if hashlib.sha256(raw).hexdigest()!=expected:raise SystemExit('ERROR: SHA256 mismatch for '+filename)
  (target/filename).write_bytes(raw)
  print('INSTALLED VERIFIED',filename,len(raw),'bytes')
print('BJ runtime URL: /assets/characters/BJ_STUBBS_V15_RECOVERED.glb')
