const express = require("express");
const http = require("http");
const https = require("https");
const { Server } = require("socket.io");
const GAMEVERSE = require("./data/gameverse.json");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const SITE_URL = (process.env.SITE_URL || "https://tryamm.online").replace(/\/$/, "");

app.use(express.json({ limit: "100kb" }));
app.use(express.static("public", {
  extensions: ["html"],
  setHeaders(res, filePath) {
    if (filePath.endsWith(".html")) {
      res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
    }
  },
}));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "tryamm", site: SITE_URL });
});

app.get("/api/social-links", (_req, res) => {
  const links = {
    facebook: process.env.FACEBOOK_URL || "",
    instagram: process.env.INSTAGRAM_URL || "",
    tiktok: process.env.TIKTOK_URL || "",
  };

  const configured = Object.fromEntries(
    Object.entries(links).filter(([, value]) => typeof value === "string" && /^https:\/\//i.test(value))
  );

  res.json(configured);
});

// Authoritative GameVerse registry. This establishes the product/system foundation,
// not a claim that all games are already production-playable.
app.get("/api/gameverse", (_req, res) => {
  res.json(GAMEVERSE);
});

app.get("/api/gameverse/status", (_req, res) => {
  const totals = GAMEVERSE.games.reduce((acc, game) => {
    acc[game.status] = (acc[game.status] || 0) + 1;
    return acc;
  }, {});

  res.json({
    platform: GAMEVERSE.platform,
    livingGameWorld: GAMEVERSE.world.status,
    gameCount: GAMEVERSE.games.length,
    totals,
    productionPlayableCount: GAMEVERSE.games.filter((game) => game.status === "production").length,
    note: "Foundation status does not mean a title is fully playable, tested or deployed.",
  });
});

app.get("/api/gameverse/games/:id", (req, res) => {
  const game = GAMEVERSE.games.find((item) => item.id === req.params.id);
  if (!game) return res.status(404).json({ error: "Game not found" });
  res.json(game);
});

app.post("/api/indexnow", async (req, res) => {
  try {
    const key = process.env.INDEXNOW_KEY;
    const internalSecret = process.env.INTERNAL_PUBLISH_WEBHOOK_SECRET;

    if (!key) {
      return res.status(503).json({ error: "IndexNow is not configured" });
    }

    if (internalSecret) {
      const auth = req.get("authorization");
      if (auth !== `Bearer ${internalSecret}`) {
        return res.status(401).json({ error: "Unauthorized" });
      }
    }

    const requestedUrls = Array.isArray(req.body?.urls) ? req.body.urls : [];
    const siteOrigin = new URL(SITE_URL).origin;
    const urls = requestedUrls
      .filter((value) => typeof value === "string")
      .filter((value) => {
        try {
          return new URL(value).origin === siteOrigin;
        } catch {
          return false;
        }
      })
      .slice(0, 10000);

    if (!urls.length) {
      return res.status(400).json({ error: "No valid TryAMM URLs supplied" });
    }

    const payload = JSON.stringify({
      host: new URL(SITE_URL).host,
      key,
      keyLocation: `${SITE_URL}/${key}.txt`,
      urlList: urls,
    });

    const request = https.request(
      "https://api.indexnow.org/indexnow",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (indexNowResponse) => {
        indexNowResponse.resume();
        res.status(indexNowResponse.statusCode >= 200 && indexNowResponse.statusCode < 300 ? 200 : 502).json({
          ok: indexNowResponse.statusCode >= 200 && indexNowResponse.statusCode < 300,
          status: indexNowResponse.statusCode,
          submitted: urls.length,
        });
      }
    );

    request.on("error", () => {
      res.status(502).json({ error: "IndexNow submission failed" });
    });

    request.write(payload);
    request.end();
  } catch {
    res.status(500).json({ error: "IndexNow submission failed" });
  }
});

let hearts = 0;
let gifts = 0;

io.on("connection", (socket) => {
  console.log("User connected");

  socket.emit("init", { hearts, gifts });

  socket.on("chat", (msg) => {
    io.emit("chat", msg);
  });

  socket.on("heart", () => {
    hearts++;
    io.emit("heart", hearts);
  });

  socket.on("gift", () => {
    gifts++;
    io.emit("gift", gifts);
  });
});

server.listen(process.env.PORT || 10000, () => {
  console.log(`Server running for ${SITE_URL}`);
});
