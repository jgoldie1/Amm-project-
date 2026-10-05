// ---------- loop ----------
let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  const rdt = Math.min(0.05, (now - last) / 1000); last = now;
  navCd -= rdt; thudCd -= rdt;
  const inp = gather();
  while (queue.length) handle(queue.shift());

  const dt = rdt * (radial.open ? 0.3 : 1);
  obstacles.length = 0;
  for (const c of cars) obstacles.push(c);
  if (!player.inCar) obstacles.push(player);

  if (!running) {
    if (!hasStarted) {
      for (const c of cars) { if (c.ai) aiDrive(c, rdt, c.cruise); syncCar(c, rdt); }
      updatePeds(rdt); titleCam(now);
    }
    renderer.render(scene, camera); return;
  }

  updateRadial();
  if (player.inCar) updatePlayerCar(dt, inp); else updateOnFoot(dt, inp);
  for (const c of cars) { if (c === player.inCar) continue; if (c.ai) aiDrive(c, dt, c.cruise); else coast(c, dt); }
  for (const c of cars) syncCar(c, dt);
  updatePeds(dt);

  trafficT += rdt;
  if (trafficT > 4) { trafficT = 0; if (cars.filter(c => c.ai).length < Q.traffic) spawnTraffic(player.pos); }

  updateCamera(rdt);
  updateWaypoint(now);
  updateHUD(rdt);
  updateAudio();
  renderer.render(scene, camera);
}
requestAnimationFrame(frame);
})();
