const feed = document.getElementById("feed");
const stage = document.getElementById("holoCore");
const sceneList = document.getElementById("sceneList");
const playerName = document.getElementById("playerName");
const chatText = document.getElementById("chatText");
const sendMove = document.getElementById("sendMove");
const sendChat = document.getElementById("sendChat");

function logFeed(text) {
  const div = document.createElement("div");
  div.className = "feed-item";
  div.textContent = text;
  feed.prepend(div);
}

async function loadScenes() {
  const res = await fetch("/api/scenes");
  const db = await res.json();
  sceneList.innerHTML = "";
  db.scenes.forEach((scene) => {
    const card = document.createElement("div");
    card.className = "scene-card";
    card.innerHTML = `
      <h3>${scene.title}</h3>
      <div><strong>Zone:</strong> ${scene.zone}</div>
      <div><strong>Scripture:</strong> ${scene.scripture}</div>
      <div>${scene.summary}</div>
      <button data-scene="${scene.id}">Trigger Hologram</button>
    `;
    card.querySelector("button").onclick = async () => {
      await fetch("/api/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sceneId: scene.id,
          triggeredBy: playerName.value || "James"
        })
      });
    };
    sceneList.appendChild(card);
  });
}

const proto = location.protocol === "https:" ? "wss" : "ws";
const ws = new WebSocket(`${proto}://${location.host}`);

ws.onopen = () => logFeed("Connected to multiplayer stream");
ws.onmessage = (evt) => {
  const data = JSON.parse(evt.data);
  if (data.type === "welcome") {
    logFeed(data.message);
  }
  if (data.type === "scene_triggered") {
    stage.innerHTML = `
      <h2>${data.title}</h2>
      <div>Hologram Level: ${data.hologramLevel || "standard"}</div>
      <div>Triggered By: ${data.player || data.triggeredBy || "system"}</div>
    `;
    logFeed(`Scene triggered: ${data.title}`);
  }
  if (data.type === "player_move") {
    logFeed(`${data.player} moved in ${data.zone} to (${data.x}, ${data.y})`);
  }
  if (data.type === "chat") {
    logFeed(`${data.player}: ${data.text}`);
  }
};

sendMove.onclick = () => {
  ws.send(JSON.stringify({
    type: "player_move",
    player: playerName.value || "James",
    x: Math.floor(Math.random() * 100),
    y: Math.floor(Math.random() * 100),
    zone: "Galilee"
  }));
};

sendChat.onclick = () => {
  ws.send(JSON.stringify({
    type: "chat",
    player: playerName.value || "James",
    text: chatText.value || "Peace be with you"
  }));
  chatText.value = "";
};

loadScenes();
