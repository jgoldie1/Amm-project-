let users = {};
let admins = {};
let followers = {};
let reports = [];

const MAX_ADMINS_BASE = 5;
const MAX_ADMINS_MAX = 20;

function getMaxAdmins() {
  const totalUsers = Object.keys(users).length;
  if (totalUsers < 20) return 5;
  if (totalUsers < 50) return 10;
  if (totalUsers < 100) return 15;
  return MAX_ADMINS_MAX;
}

io.on("connection", (socket) => {

  socket.on("join", (username) => {
    users[socket.id] = username;
    followers[socket.id] = 0;

    // dynamic admin scaling
    if (Object.keys(admins).length < getMaxAdmins()) {
      admins[socket.id] = true;
      socket.emit("admin", true);
    }

    io.emit("chat", `🔥 ${username} joined`);
  });

  socket.on("chat", (msg) => {
    if (socket.muted) return;

    const name = users[socket.id];
    io.emit("chat", `${name}: ${msg}`);
  });

  socket.on("like", () => {
    followers[socket.id]++;
    io.emit("likesUpdate", followers[socket.id]);
  });

  // 🔇 MUTE SYSTEM (3,5,10 mins)
  socket.on("muteUser", ({ id, time }) => {
    if (!admins[socket.id]) return;

    io.to(id).emit("muted", time);

    const target = io.sockets.sockets.get(id);
    if (target) {
      target.muted = true;

      setTimeout(() => {
        target.muted = false;
        target.emit("unmuted");
      }, time * 60000);
    }
  });

  // ❌ KICK
  socket.on("kickUser", (id) => {
    if (admins[socket.id]) {
      io.to(id).disconnect(true);
    }
  });

  // 🚫 BLOCK (local user block list)
  socket.on("blockUser", (id) => {
    socket.emit("blocked", id);
  });

  // 📢 REPORT SYSTEM
  socket.on("reportUser", ({ id, reason }) => {
    reports.push({
      reported: users[id],
      by: users[socket.id],
      reason
    });

    // send to all admins
    Object.keys(admins).forEach(adminId => {
      io.to(adminId).emit("report", reports);
    });
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    delete admins[socket.id];
    delete followers[socket.id];
  });
});
app.get("/reels", (req, res) => {
  res.json([
    { user: "Host", video: "sample.mp4" }
  ]);
});
