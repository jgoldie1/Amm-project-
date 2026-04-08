document.addEventListener("DOMContentLoaded", function () {
  const mapCanvas = document.getElementById("immersive-map-canvas");
  if (mapCanvas) {
    const ctx = mapCanvas.getContext("2d");
    if (ctx) {
      const w = mapCanvas.width;
      const h = mapCanvas.height;

      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = "#1d4ed8";
      ctx.fillRect(40, 50, 180, 110);
      ctx.fillStyle = "#22c55e";
      ctx.fillRect(270, 60, 170, 100);
      ctx.fillStyle = "#7c3aed";
      ctx.fillRect(480, 40, 180, 120);
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(120, 220, 160, 90);
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(360, 230, 210, 100);

      ctx.fillStyle = "white";
      ctx.font = "16px Arial";
      ctx.fillText("Creator District", 60, 105);
      ctx.fillText("Marketplace", 300, 110);
      ctx.fillText("VIP / Event Zone", 505, 105);
      ctx.fillText("Transport Hub", 140, 270);
      ctx.fillText("Wildlife / XR Zone", 390, 285);
    }
  }

  const avatarEl = document.getElementById("avatar-move-status");
  if (avatarEl) {
    document.addEventListener("keydown", function (e) {
      const key = e.key.toLowerCase();
      if (["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright"].includes(key)) {
        avatarEl.innerText = "Movement input detected: " + key;
      }
    });
  }
});
