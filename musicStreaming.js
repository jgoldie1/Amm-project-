const chartRules = {
  name: "The All American Billboard",
  refreshCadence: "weekly",
  minimumQualifiedPlaySeconds: 30,
  fraudControls: [
    "Exclude bot and datacenter traffic",
    "Rate-limit repeated plays",
    "Detect device and account farms",
    "Hold suspicious activity for review",
    "Publish corrections and appeals"
  ],
  rankingSignals: {
    qualifiedStreams: 45,
    uniqueListeners: 20,
    savesAndPlaylists: 10,
    verifiedPurchases: 10,
    liveEngagement: 10,
    editorialAndCommunityDiscovery: 5
  },
  charts: [
    "All Genres Top 100",
    "Independent Top 50",
    "R&B and Soul",
    "Rap and Hip-Hop",
    "Gospel and Set Apart",
    "Jazz",
    "Rock",
    "Afrobeats",
    "Caribbean",
    "Global Breakthrough",
    "Youth-Safe",
    "Holographic Performances"
  ]
};

const musicConfig = {
  status: "foundation",
  artistRights: "Artists retain ownership unless a separate signed agreement says otherwise.",
  monetization: ["Subscriptions", "Ads", "Tips and gifts", "Music purchases", "Tickets", "Merchandise", "Holographic performances", "Fan memberships"],
  requiredRightsData: ["Artist and contributor names", "ISRC", "UPC or release ID", "Composition ownership", "Master ownership", "Split sheets", "Explicit-content status", "Territories", "Release date"],
  playbackRequirements: ["HLS or DASH delivery", "Signed media URLs", "Audio fingerprinting", "Loudness normalization", "Offline-license controls", "Captions and transcripts where applicable"],
  payoutRequirements: ["Immutable stream ledger", "Fraud-adjusted qualified streams", "Territory and plan-rate accounting", "Statements", "Tax records", "Dispute workflow"]
};

function createMusicRouter(express, crypto, requireAdmin) {
  const router = express.Router();
  const releases = new Map();
  const streamEvents = new Map();

  router.get("/config", (_req, res) => res.json({ musicConfig, chartRules }));
  router.get("/releases", (_req, res) => res.json({ releases: [...releases.values()] }));
  router.post("/admin/releases", requireAdmin, (req, res) => {
    const title = String(req.body?.title || "").trim().slice(0, 120);
    const artistName = String(req.body?.artistName || "").trim().slice(0, 120);
    const genre = String(req.body?.genre || "").trim().slice(0, 60);
    if (!title || !artistName || !genre) return res.status(400).json({ error: "title, artistName, and genre are required." });
    const release = { id: crypto.randomUUID(), title, artistName, genre, status: "draft", explicit: req.body?.explicit === true, createdAt: new Date().toISOString(), qualifiedStreams: 0, uniqueListeners: 0 };
    releases.set(release.id, release);
    res.status(201).json({ release });
  });
  router.post("/streams", (req, res) => {
    const release = releases.get(String(req.body?.releaseId || ""));
    const listenerReference = String(req.body?.listenerReference || "").trim().slice(0, 100);
    const listenedSeconds = Number(req.body?.listenedSeconds);
    if (!release || !listenerReference || !Number.isFinite(listenedSeconds) || listenedSeconds < 0) return res.status(400).json({ error: "Valid releaseId, listenerReference, and listenedSeconds are required." });
    const qualified = listenedSeconds >= chartRules.minimumQualifiedPlaySeconds;
    const event = { id: crypto.randomUUID(), releaseId: release.id, listenerReference, listenedSeconds, qualified, fraudStatus: "pending", createdAt: new Date().toISOString() };
    streamEvents.set(event.id, event);
    res.status(201).json({ event, note: "Qualified status remains provisional until fraud review and ledger reconciliation." });
  });
  router.get("/charts", (_req, res) => {
    const ranked = [...releases.values()].sort((a, b) => b.qualifiedStreams - a.qualifiedStreams).slice(0, 100);
    res.json({ chart: chartRules.name, methodology: chartRules.rankingSignals, entries: ranked });
  });

  return router;
}

module.exports = { chartRules, musicConfig, createMusicRouter };
