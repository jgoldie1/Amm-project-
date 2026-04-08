#!/data/data/com.termux/files/usr/bin/bash
cd ~/marketplace || exit 1
NAME="$1"
if [ -z "$NAME" ]; then
  echo "Usage: ./verified_merges/save_verified_merge.sh feature_name"
  exit 1
fi
cp app.py "verified_merges/${NAME}.py"
echo "Saved verified merge: verified_merges/${NAME}.py"
