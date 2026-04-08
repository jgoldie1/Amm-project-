AAM JESUS LIFE GAME MODULE
Created: 20260404_200611

WHAT THIS MODULE DOES
- Serves a playable browser-based game shell
- Hosts hologram scene data for the life of Jesus
- Exposes REST APIs:
  /health
  /api/scenes
  /api/game-map
  /api/trigger
  /aam-entry
- Provides WebSocket multiplayer event sync
- Can be reverse proxied or linked into All American Marketplace

TO START
cd "/data/data/com.termux/files/home/marketplace/aam_jesus_life_game"
./scripts/start_game.sh

THEN OPEN
http://127.0.0.1:5090

TO STOP
cd "/data/data/com.termux/files/home/marketplace/aam_jesus_life_game"
./scripts/stop_game.sh

SUGGESTED AAM INTEGRATION
- Add menu tile: "Jesus Life Game"
- Point tile to http://127.0.0.1:5090
- Or reverse proxy /jesus-life-game to this service
