#!/data/data/com.termux/files/usr/bin/bash
set -e
cd "$(dirname "$0")/../services/api-gateway"
npm install
npm run dev
