const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { registerHolo5dxRoutes } = require("./lib/holo5dx-routes");
const { createFreeTvManager } = require("./lib/free-tv-manager");
const { registerFreeTvRoutes } = require("./lib/free-tv-routes");
const { createNewsManager } = require("./lib/news-manager");
const { registerNewsRoutes } = require("./lib/news-routes");
const { createOmniNewsOracleManager } = require("./lib/omni-news-oracle-manager");
const { registerOmniNewsOracleRoutes } = require("./lib/omni-news-oracle-routes");
const HOLO_MENU = require("./data/holo-menu.json");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const freeTv = createFreeTvManager();
const news = createNewsManager();
const omniNewsOracle = createOmniNewsOracleManager();

app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));
registerHolo5dxRoutes({ app });
registerFreeTvRoutes({ app, manager: freeTv });
registerNewsRoutes({ app, manager: news });
registerOmniNewsOracleRoutes({ app, manager: omniNewsOracle });
app.get('/api/holo-menu', (_req, res) => res.json(HOLO_MENU));

let hearts = 0;
let gifts = 0;

io.on("connection", (socket) => {
  console.log("User connected");
  socket.emit("init", { hearts, gifts });
  socket.on("chat", (msg) => io.emit("chat", msg));
  socket.on("heart", () => { hearts++; io.emit("heart", hearts); });
  socket.on("gift", () => { gifts++; io.emit("gift", gifts); });
});

server.listen(process.env.PORT || 10000, () => {
  console.log("Server running");
});
