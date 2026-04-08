const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 5090;
const HOST = process.env.HOST || "0.0.0.0";
const DATA_DIR = path.join(__dirname, "data");
const SCENES_FILE = path.join(DATA_DIR, "scenes.json");

app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

function loadScenes() {
  try {
    return JSON.parse(fs.readFileSync(SCENES_FILE, "utf8"));
  } catch (e) {
    return { scenes: [] };
  }
}

function broadcast(payload) {
  const msg = JSON.stringify(payload);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "aam-jesus-life-game",
    scenes_count: loadScenes().scenes.length,
    port: PORT
  });
});

app.get("/api/scenes", (req, res) => {
  res.json(loadScenes());
});

app.get("/api/game-map", (req, res) => {
  const scenes = loadScenes().scenes.map((s) => ({
    id: s.id,
    title: s.title,
    zone: s.zone,
    scripture: s.scripture
  }));
  res.json({ ok: true, scenes });
});

app.post("/api/trigger", (req, res) => {
  const { sceneId, triggeredBy = "system" } = req.body || {};
  if (!sceneId) {
    return res.status(400).json({ ok: false, error: "sceneId required" });
  }
  const db = loadScenes();
  const scene = db.scenes.find((s) => s.id === sceneId);
  if (!scene) {
    return res.status(404).json({ ok: false, error: "scene not found" });
  }
  const payload = {
    type: "scene_triggered",
    sceneId: scene.id,
    title: scene.title,
    hologramLevel: scene.hologramLevel,
    triggeredBy,
    ts: new Date().toISOString()
  };
  broadcast(payload);
  res.json({ ok: true, payload });
});

app.get("/aam-entry", (req, res) => {
  res.json({
    ok: true,
    title: "Jesus Life Game",
    route: "/",
    multiplayer_ws: "/ws",
    notes: "Module ready for All American Marketplace embedding"
  });
});

wss.on("connection", (ws) => {
  ws.send(JSON.stringify({
    type: "welcome",
    service: "aam-jesus-life-game",
    message: "Connected to multiplayer event stream"
  }));

  ws.on("message", (message) => {
    let data;
    try {
      data = JSON.parse(message.toString());
    } catch (e) {
      ws.send(JSON.stringify({ type: "error", error: "invalid json" }));
      return;
    }

    if (data.type === "player_move") {
      broadcast({
        type: "player_move",
        player: data.player || "unknown",
        x: data.x || 0,
        y: data.y || 0,
        zone: data.zone || "unknown",
        ts: new Date().toISOString()
      });
    }

    if (data.type === "chat") {
      broadcast({
        type: "chat",
        player: data.player || "unknown",
        text: data.text || "",
        ts: new Date().toISOString()
      });
    }

    if (data.type === "trigger_scene") {
      const db = loadScenes();
      const scene = db.scenes.find((s) => s.id === data.sceneId);
      if (scene) {
        broadcast({
          type: "scene_triggered",
          sceneId: scene.id,
          title: scene.title,
          scripture: scene.scripture,
          hologramLevel: scene.hologramLevel,
          player: data.player || "unknown",
          ts: new Date().toISOString()
        });
      }
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log(`[AAM JESUS LIFE GAME] http://${HOST}:${PORT}`);
});
