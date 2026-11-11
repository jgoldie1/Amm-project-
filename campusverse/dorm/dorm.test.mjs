import test from "node:test";
import assert from "node:assert/strict";
import { createDormState, assignDorm, grantGuestAccess, canEnterRoom,
  revokeGuestAccess, createBirthdayGift } from "./dorm.mjs";
test("unique assignments and room capacity", () => {
  let s = createDormState();
  s = assignDorm(s, { playerId: "jacobie", roomId: "M-101" });
  assert.equal(s.assignments.jacobie, "M-101");
  assert.throws(() => assignDorm(s, { playerId: "other", roomId: "M-101" }), /full/);
  assert.throws(() => assignDorm(s, { playerId: "jacobie", roomId: "F-101" }), /already/);
});
test("rooms stay private unless a resident grants access", () => {
  let s = assignDorm(createDormState(), { playerId: "jacobie", roomId: "M-101" });
  assert.equal(canEnterRoom(s, { playerId: "jacobie", roomId: "M-101" }), true);
  assert.equal(canEnterRoom(s, { playerId: "friend", roomId: "M-101" }), false);
  s = grantGuestAccess(s, { residentId: "jacobie", guestId: "friend" });
  assert.equal(canEnterRoom(s, { playerId: "friend", roomId: "M-101" }), true);
  s = revokeGuestAccess(s, { residentId: "jacobie", guestId: "friend" });
  assert.equal(canEnterRoom(s, { playerId: "friend", roomId: "M-101" }), false);
});
test("dorm and birthday gift records can survive save and reload", () => {
  const s = assignDorm(createDormState(), { playerId: "jacobie", roomId: "M-101" });
  const restored = JSON.parse(JSON.stringify(s));
  assert.equal(restored.assignments.jacobie, "M-101");
  const gift = createBirthdayGift(restored, { playerId: "jacobie", editionNumber: 1 });
  assert.equal(gift.roomId, "M-101");
  assert.equal(gift.editionNumber, 1);
});
