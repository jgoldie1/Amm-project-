#!/usr/bin/env python3
"""Verify recovered BJ/LaTeasia GLBs; install only with --install.

Usage:
  python scripts/verify_streetverse_original_heroes.py SOURCE.zip --repo .
  python scripts/verify_streetverse_original_heroes.py SOURCE.zip --repo . --install

The source archive is private until its rights-owner approves publication.
Default mode never writes files. --install copies into the app's PUBLIC assets;
do not run it without explicit publication authorization for both characters.
"""
import argparse
import hashlib
import os
import sys
import tempfile
import zipfile
from pathlib import Path

EXPECTED = {
    'BJ_STUBBS_V15_RECOVERED.glb': (
        6214772,
        '122e77b243bb9feac9c6e835a500207d034ef8ee710f52751a89ee917e685258',
    ),
    'LaTeasia_RIGGED_DIAGNOSTIC.glb': (
        871880,
        '96faef46205295d16cdf6c8d21a0e216438141f053cf0601800d62d3020998af',
    ),
}
TARGET = Path('amm-omniverse/public/assets/characters')

def verify_archive(path: Path):
    """Read only exact expected GLBs; support both old and recovered ZIP layouts."""
    with zipfile.ZipFile(path) as archive:
        if archive.testzip() is not None:
            raise ValueError('Archive failed ZIP integrity verification')
        by_basename = {}
        for entry in archive.infolist():
            if entry.is_dir():
                continue
            basename = Path(entry.filename).name
            if basename in EXPECTED:
                by_basename.setdefault(basename, []).append(entry)
        result = {}
        for name, (size, digest) in EXPECTED.items():
            matches = by_basename.get(name, [])
            if len(matches) != 1:
                raise ValueError(f'Expected exactly one {name}; got {len(matches)}')
            raw = archive.read(matches[0])
            if len(raw) != size or hashlib.sha256(raw).hexdigest() != digest:
                raise ValueError(f'Byte size or SHA-256 mismatch: {name}')
            if len(raw) < 20 or raw[:4] != b'glTF' or int.from_bytes(raw[4:8], 'little') != 2:
                raise ValueError(f'Invalid GLB 2 header: {name}')
            result[name] = raw
        return result

def main():
    ap = argparse.ArgumentParser(description='Verify BJ V15 and LaTeasia original GLBs')
    ap.add_argument('archive', type=Path, help='Original StreetVerse asset recovery ZIP')
    ap.add_argument('--repo', type=Path, default=Path.cwd(), help='Amm-project- repository root')
    ap.add_argument('--install', action='store_true', help='Explicitly copy originals into public game asset path')
    args = ap.parse_args()
    repo = args.repo.resolve()
    if not (repo/'amm-omniverse/package.json').is_file():
        ap.error('Invalid repository root; amm-omniverse/package.json must exist')
    try:
        data = verify_archive(args.archive.resolve())
    except (OSError, zipfile.BadZipFile, ValueError, KeyError) as exc:
        raise SystemExit('Verification FAILED: '+str(exc))
    for name, raw in data.items():
        print(f'VERIFIED {name}: {len(raw)} bytes; SHA256 {hashlib.sha256(raw).hexdigest()}')
    if not args.install:
        print('VERIFY ONLY — no files were written. To publish assets, obtain approval and pass --install.')
        return
    target = repo/TARGET
    target.mkdir(parents=True, exist_ok=True)
    for name, raw in data.items():
        output = target/name
        if output.exists() and output.read_bytes() != raw:
            raise SystemExit(f'Won\'t overwrite different existing asset: {output}')
    for name, raw in data.items():
        output = target/name
        fd, temp = tempfile.mkstemp(prefix='.'+name+'.', dir=target)
        try:
            with os.fdopen(fd, 'wb') as handle:
                handle.write(raw)
                handle.flush()
                os.fsync(handle.fileno())
            os.replace(temp, output)
        finally:
            if os.path.exists(temp):
                os.unlink(temp)
        print('INSTALLED', output)
    print('WARNING: These are diagnostic assets. Human visual likeness, rigging and public distribution rights are NOT certified.')

if __name__ == '__main__':
    main()
