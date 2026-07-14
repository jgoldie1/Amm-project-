const { AccessToken } = require('livekit-server-sdk');

async function createJoinToken({ room, identity, name, canPublish = true }) {
  if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET || !process.env.LIVEKIT_URL) {
    return { mode: 'mock', url: '', token: '', room, identity };
  }
  const token = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
    identity,
    name: name || identity,
    ttl: '1h'
  });
  token.addGrant({ roomJoin: true, room, canPublish, canSubscribe: true, canPublishData: true });
  return { mode: 'live', url: process.env.LIVEKIT_URL, token: await token.toJwt(), room, identity };
}

module.exports = { createJoinToken, connected: () => Boolean(process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET && process.env.LIVEKIT_URL) };
