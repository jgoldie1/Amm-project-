type HealthStatus = 'healthy' | 'degraded' | 'down';

const knownRegions = new Set(['us-east', 'us-central', 'us-west', 'eu-west', 'africa-south', 'asia-east', 'auto']);

export default function handler(req: any, res: any) {
  const started = Date.now();
  const requested = String(req?.query?.region || 'auto');
  const region = knownRegions.has(requested) ? requested : 'auto';

  // This endpoint is intentionally conservative: it reports the health of the
  // web/demo launch surface only. Authoritative multiplayer, persistence,
  // payments and external providers require their own production probes.
  const maintenance = process.env.GAME_DEMO_MAINTENANCE === '1';
  const forcedDown = process.env.GAME_DEMO_FORCE_DOWN === '1';
  const forcedDegraded = process.env.GAME_DEMO_DEGRADED === '1';

  let status: HealthStatus = 'healthy';
  let message = 'Playable demo launch services are responding.';
  if (maintenance || forcedDown) {
    status = 'down';
    message = maintenance ? 'Playable demo is temporarily in maintenance.' : 'Playable demo launch services are unavailable.';
  } else if (forcedDegraded) {
    status = 'degraded';
    message = 'Playable demo is available with degraded supporting services.';
  }

  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.status(status === 'down' ? 503 : 200).json({
    region,
    status,
    latencyMs: Date.now() - started,
    checkedAt: new Date().toISOString(),
    message,
    capabilities: {
      playableDemo: status !== 'down',
      authoritativeMultiplayer: false,
      cloudPersistence: false,
      realMoney: false
    }
  });
}
