import assert from "node:assert/strict";
import fs from "node:fs";
export function validate(m) {
  assert.equal(m.schemaVersion, 1);
  assert.match(m.id, /^[a-z0-9.-]{4,80}$/);
  assert.ok(Number.isInteger(m.floors) && m.floors >= 1 && m.floors <= 80);
  assert.ok(Number.isFinite(m.floorHeight) && m.floorHeight >= 2 && m.floorHeight <= 10);
  assert.ok(Array.isArray(m.rooms) && m.rooms.length > 0 && m.rooms.length <= 300);
  const ids = new Set();
  for (const room of m.rooms) {
    assert.equal(typeof room.id, "string");
    assert.ok(!ids.has(room.id)); ids.add(room.id);
    assert.ok(Number.isInteger(room.floor) && room.floor >= 1 && room.floor <= m.floors);
    assert.ok(Array.isArray(room.rect) && room.rect.length === 4 && room.rect.every(Number.isFinite) && room.rect[2] > 0 && room.rect[3] > 0);
  }
  const b = m.collision?.bounds;
  assert.ok(Array.isArray(b) && b.length === 4 && b.every(Number.isFinite) && b[0] < b[1] && b[2] < b[3]);
  assert.ok(Number.isFinite(m.collision.playerRadius) && m.collision.playerRadius >= .2 && m.collision.playerRadius <= 1);
  for (const d of m.doors || []) {
    assert.ok(Number.isInteger(d.floor) && d.floor >= 1 && d.floor <= m.floors);
    assert.ok(ids.has(d.destination));
    assert.ok(Array.isArray(d.position) && d.position.length === 2 && d.position.every(Number.isFinite));
  }
  if (m.elevator) assert.ok(Array.isArray(m.elevator.floors) && m.elevator.floors.length > 0 && m.elevator.floors.every(f => Number.isInteger(f) && f >= 1 && f <= m.floors));
  if (m.stairs) assert.ok(m.stairs.from >= 1 && m.stairs.to <= m.floors && m.stairs.from < m.stairs.to);
  for (const [name, sys] of Object.entries(m.systems || {})) {
    assert.ok(["water","electrical","hvac","gas"].includes(name));
    const nodes = new Set();
    for (const n of sys.nodes || []) { assert.ok(!nodes.has(n.id) && n.floor >= 1 && n.floor <= m.floors); nodes.add(n.id); }
    for (const [a,b] of sys.edges || []) assert.ok(nodes.has(a) && nodes.has(b));
    if (name === "gas") assert.equal(sys.fictionalOnly, true);
  }
  for (const mission of m.missions || []) {
    assert.ok(ids.has(mission.room) && mission.floor >= 1 && mission.floor <= m.floors);
    assert.ok(Number.isFinite(mission.rewardXP) && mission.rewardXP >= 0 && mission.rewardXP <= 1000);
  }
  assert.ok(!("script" in m) && !("code" in m), "Executable fields not allowed");
  return true;
}
export function clampIndoor(x,z,bounds,radius) {
  const [xmin,xmax,zmin,zmax] = bounds;
  assert.ok(xmax-xmin >= radius*2 && zmax-zmin >= radius*2);
  return [Math.max(xmin+radius,Math.min(xmax-radius,x)),Math.max(zmin+radius,Math.min(zmax-radius,z))];
}
if (process.argv[1] && process.argv[1].endsWith("validator.mjs")) for (const f of process.argv.slice(2)) { validate(JSON.parse(fs.readFileSync(f))); console.log("PASS",f); }
