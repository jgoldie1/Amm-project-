export type ReachProbeStatus = 'ok' | 'slow' | 'failed' | 'unknown';

export type GlobalReachReport = {
  generatedAt: string;
  locale: string;
  timezone?: string;
  online: boolean;
  connectionType?: string;
  effectiveType?: string;
  downlinkMbps?: number;
  rttMs?: number;
  probes: Array<{ name: string; url: string; status: ReachProbeStatus; latencyMs?: number; error?: string }>;
  recommendations: string[];
};

async function probe(name: string, url: string, timeoutMs = 8000) {
  const started = performance.now();
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    await fetch(url, { method: 'HEAD', mode: 'no-cors', cache: 'no-store', signal: controller.signal });
    const latencyMs = Math.round(performance.now() - started);
    return { name, url, status: latencyMs > 2500 ? 'slow' as const : 'ok' as const, latencyMs };
  } catch (error) {
    return { name, url, status: 'failed' as const, error: error instanceof Error ? error.message : String(error) };
  } finally {
    window.clearTimeout(timer);
  }
}

export async function runGlobalReachDiagnostics(extraUrls: string[] = []): Promise<GlobalReachReport> {
  const nav = navigator as Navigator & { connection?: { type?: string; effectiveType?: string; downlink?: number; rtt?: number } };
  const locale = navigator.language || 'unknown';
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const origin = window.location.origin;
  const urls = [origin, `${origin}/favicon.ico`, ...extraUrls].filter((v, i, a) => a.indexOf(v) === i);
  const probes = await Promise.all(urls.map((url, i) => probe(i === 0 ? 'app-origin' : `asset-${i}`, url)));
  const recommendations: string[] = [];
  if (!navigator.onLine) recommendations.push('Device reports offline connectivity.');
  if (probes.some(p => p.status === 'failed')) recommendations.push('One or more public app/assets probes failed; inspect DNS, TLS, CSP/CORS, provider status and ISP reachability.');
  if (probes.some(p => p.status === 'slow')) recommendations.push('High latency detected; serve static assets from a global CDN and minimize first-load JavaScript/video.');
  if ((nav.connection?.effectiveType === '2g' || nav.connection?.effectiveType === 'slow-2g')) recommendations.push('Low-bandwidth connection detected; use lightweight mode, compressed media, lazy loading and reduced autoplay.');
  recommendations.push('Do not geo-block Nigeria or other countries unless required by law/product policy.');
  recommendations.push('Provide a custom domain plus CDN/failover path so users are not dependent on a single hosting hostname.');
  return {
    generatedAt: new Date().toISOString(), locale, timezone, online: navigator.onLine,
    connectionType: nav.connection?.type, effectiveType: nav.connection?.effectiveType,
    downlinkMbps: nav.connection?.downlink, rttMs: nav.connection?.rtt,
    probes, recommendations,
  };
}

export function isLikelyNigeriaLocale(locale = navigator.language, timezone = Intl.DateTimeFormat().resolvedOptions().timeZone) {
  return /(^|[-_])NG$/i.test(locale) || /Lagos/i.test(timezone);
}
