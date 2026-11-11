// CampusVerse dorm foundation: pure functions, no external dependencies.
// Server must authenticate playerId and persist returned state transactionally.
export const DORM_WINGS = Object.freeze(["male", "female"]);
export const DEFAULT_ROOMS = Object.freeze([
  { id: "M-101", wing: "male", beds: 1 },
  { id: "M-102", wing: "male", beds: 1 },
  { id: "F-101", wing: "female", beds: 1 },
  { id: "F-102", wing: "female", beds: 1 },
]);
const assertId = (value, label) => {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]{1,64}$/.test(value)) {
    throw new TypeError(`Invalid ${label}`);
  }
};
export function createDormState(rooms = DEFAULT_ROOMS) {
  const ids = new Set();
  for (const room of rooms) {
    assertId(room.id, "room ID");
    if (ids.has(room.id) || !DORM_WINGS.includes(room.wing) ||
        !Number.isInteger(room.beds) || room.beds < 1) throw new Error("Invalid room definition");
    ids.add(room.id);
  }
  return { version: 1, rooms: rooms.map(r => ({ ...r })), assignments: {}, guestAccess: {} };
}
export function assignDorm(state, { playerId, roomId }) {
  assertId(playerId, "player ID"); assertId(roomId, "room ID");
  if (state.assignments[playerId]) throw new Error("Player already assigned");
  const room = state.rooms.find(r => r.id === roomId);
  if (!room) throw new Error("Room not found");
  if (Object.values(state.assignments).filter(id => id === roomId).length >= room.beds)
    throw new Error("Room is full");
  return { ...state, assignments: { ...state.assignments, [playerId]: roomId } };
}
export function grantGuestAccess(state, { residentId, guestId }) {
  assertId(residentId, "resident ID"); assertId(guestId, "guest ID");
  const roomId = state.assignments[residentId];
  if (!roomId) throw new Error("Resident has no room");
  if (residentId === guestId) throw new Error("Resident already has access");
  const guests = state.guestAccess[roomId] ?? [];
  return { ...state, guestAccess: { ...state.guestAccess,
    [roomId]: [...new Set([...guests, guestId])] } };
}
export function canEnterRoom(state, { playerId, roomId }) {
  assertId(playerId, "player ID"); assertId(roomId, "room ID");
  if (!state.rooms.some(r => r.id === roomId)) return false;
  return state.assignments[playerId] === roomId ||
    (state.guestAccess[roomId] ?? []).includes(playerId);
}
export function revokeGuestAccess(state, { residentId, guestId }) {
  const roomId = state.assignments[residentId];
  if (!roomId) throw new Error("Resident has no room");
  return { ...state, guestAccess: { ...state.guestAccess,
    [roomId]: (state.guestAccess[roomId] ?? []).filter(id => id !== guestId) } };
}
export function createBirthdayGift(state, { playerId, editionNumber }) {
  assertId(playerId, "player ID");
  if (!state.assignments[playerId]) throw new Error("Player requires a dorm assignment");
  if (!Number.isInteger(editionNumber) || editionNumber < 1) throw new Error("Invalid edition");
  return { ownerId: playerId, roomId: state.assignments[playerId],
    itemId: "greenville-letterman-birthday", editionNumber, claimed: false };
}
