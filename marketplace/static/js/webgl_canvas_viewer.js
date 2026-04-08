document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("aam-webgl-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;

  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, "#0ea5e9");
  grad.addColorStop(0.5, "#7c3aed");
  grad.addColorStop(1, "#22c55e");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "20px Arial";
  ctx.fillText("AAM Real-Time World Viewer Scaffold", 20, 40);

  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.fillRect(40, 90, 160, 220);
  ctx.fillRect(250, 130, 180, 180);
  ctx.fillRect(470, 80, 220, 230);

  ctx.fillStyle = "#0f172a";
  ctx.fillText("Avatar Preview", 55, 120);
  ctx.fillText("Zone A", 300, 160);
  ctx.fillText("Transport Hub", 505, 110);
});
