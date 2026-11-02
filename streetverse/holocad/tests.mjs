import fs from "node:fs"; import assert from "node:assert/strict"; import {validate,clampIndoor} from "./validator.mjs";
const m=JSON.parse(fs.readFileSync(new URL("./taylor-apartment.json",import.meta.url)));
assert.equal(validate(m),true);
assert.deepEqual(clampIndoor(200,200,m.collision.bounds,m.collision.playerRadius),[11.15,7.15]);
for (const mutate of [m=>m.rooms[0].floor=99,m=>m.systems.water.edges.push(["unknown","sink"]),m=>m.elevator.floors=[1,4],m=>m.script="alert(1)"]) {const bad=structuredClone(m);mutate(bad);assert.throws(()=>validate(bad))}
console.log("HoloCAD model validation passed");
