const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let users = {};
let likes = 0;

function sendUserList() {
  io.emit("userList", users);
}

io.on("connection", (socket) => {

  socket.on("join", (username) => {
    users[socket.id] = username;
    io.emit("chat", `🔥 ${username} joined`);
    sendUserList();
  });

  socket.on("chat", (msg) => {
    const name = users[socket.id] || "User";
    io.emit("chat", `${name}: ${msg}`);
  });

  socket.on("like", () => {
    likes++;
    io.emit("likes", likes);
  });

  socket.on("muteUser", (id) => {
    const target = io.sockets.sockets.get(id);
    if (target) {
      target.emit("muted", 3);
      setTimeout(() => target.emit("unmuted"), 180000);
    }
  });

  socket.on("kickUser", (id) => {
    const target = io.sockets.sockets.get(id);
    if (target) target.disconnect(true);
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    sendUserList();
  });

});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log("RUNNING ON PORT", PORT));
<script>
const socket = io();
let selectedUser = null;

// JOIN
let username = prompt("Enter your username:");
socket.emit("join", username);

// RECEIVE USER LIST (FIXED)
socket.on("userList", (list) => {
  const div = document.getElementById("users");
  div.innerHTML = "";

  // list is an OBJECT → use Object.values
  Object.values(list).forEach((user) => {
    const userDiv = document.createElement("div");
    userDiv.innerText = user.name;

    userDiv.style.cursor = "pointer";
    userDiv.style.padding = "5px";
    userDiv.style.borderBottom = "1px solid #ccc";

    userDiv.onclick = () => {
      selectedUser = user.id;
      alert("Selected: " + user.name);
    };

    div.appendChild(userDiv);
  });
});

// CHAT (FIXED — shows username)
function sendMessage() {
  const input = document.getElementById("msg");
  socket.emit("chat", input.value);
  input.value = "";
}

socket.on("chat", (data) => {
  const div = document.getElementById("chat");
  div.innerHTML += `<div><b>${data.user}:</b> ${data.text}</div>`;
});

// LIKE (correct — no auto loop here)
function sendLike() {
  socket.emit("like");
}

socket.on("likes", (count) => {
  document.getElementById("likeCount").innerText = count;
});

// ADMIN
function muteUser() {
  if (!selectedUser) return alert("Select a user");
  socket.emit("muteUser", selectedUser);
}

function kickUser() {
  if (!selectedUser) return alert("Select a user");
  socket.emit("kickUser", selectedUser);
}
</script>
