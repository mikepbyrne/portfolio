// Portfolio visit tracker — Cloudflare Worker
// - POST /track  — receives a visit beacon, stores in KV bucketed by IP for 30 min
// - Cron (every 2 min) — finds expired buckets and emails a summary via Resend
// - GET /healthz — health check

interface Env {
  VISITS: KVNamespace;
  RESEND_API_KEY: string;
  EMAIL_TO: string;
  EMAIL_FROM: string;
}

type VisitEvent = {
  ts: number;
  page: string;
  referrer?: string;
  ua?: string;
  vp?: string;
  lang?: string;
  tz?: string;
  ip?: string;
  geo?: {
    country?: string;
    region?: string;
    city?: string;
    asn?: number;
    asOrg?: string;
  };
};

type Bucket = {
  ip: string;
  firstSeen: number;
  lastSeen: number;
  events: VisitEvent[];
};

const BUCKET_TTL_MS = 30 * 60 * 1000; // 30 min idle = session ends

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function bucketKey(ip: string) {
  return `bucket:${ip}`;
}

function pendingKey(ip: string) {
  return `pending:${ip}`;
}

async function handleTrack(req: Request, env: Env): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }
  if (req.method !== 'POST') {
    return new Response('method not allowed', { status: 405, headers: corsHeaders() });
  }

  let body: any = {};
  try { body = await req.json(); } catch {}

  const cf: any = (req as any).cf || {};
  const ip = req.headers.get('cf-connecting-ip') || 'unknown';
  const ua = req.headers.get('user-agent') || '';
  const event: VisitEvent = {
    ts: Date.now(),
    page: String(body.page || '/'),
    referrer: String(body.referrer || ''),
    ua,
    vp: String(body.vp || ''),
    lang: String(body.lang || ''),
    tz: String(body.tz || ''),
    ip,
    geo: {
      country: cf.country,
      region: cf.region,
      city: cf.city,
      asn: cf.asn,
      asOrg: cf.asOrganization,
    },
  };

  const key = bucketKey(ip);
  const existing = await env.VISITS.get<Bucket>(key, 'json');
  const bucket: Bucket = existing
    ? { ...existing, lastSeen: event.ts, events: [...existing.events, event].slice(-50) }
    : { ip, firstSeen: event.ts, lastSeen: event.ts, events: [event] };

  // Store with TTL = session window. Each new event extends TTL via overwrite.
  await env.VISITS.put(key, JSON.stringify(bucket), {
    expirationTtl: 60 * 60, // 1 hour cap
  });
  // Also write a "pending" sentinel keyed by IP that the cron checks
  await env.VISITS.put(pendingKey(ip), String(event.ts), {
    expirationTtl: 60 * 60,
  });

  return new Response('ok', { status: 200, headers: corsHeaders() });
}

function fmtUA(ua: string) {
  if (!ua) return 'unknown';
  // Basic browser/OS sniff
  const browser = /Edg\//.test(ua) ? 'Edge'
    : /Chrome\//.test(ua) ? 'Chrome'
    : /Firefox\//.test(ua) ? 'Firefox'
    : /Safari\//.test(ua) ? 'Safari'
    : 'Other';
  const os = /Mac OS X/.test(ua) ? 'macOS'
    : /Windows NT/.test(ua) ? 'Windows'
    : /iPhone|iPad/.test(ua) ? 'iOS'
    : /Android/.test(ua) ? 'Android'
    : /Linux/.test(ua) ? 'Linux'
    : '';
  return `${browser}${os ? ' / ' + os : ''}`;
}

function bestGuessIdentity(b: Bucket): string {
  const e0 = b.events[0] || {};
  const org = e0.geo?.asOrg || '';
  const city = [e0.geo?.city, e0.geo?.region, e0.geo?.country].filter(Boolean).join(', ');
  const refs = [...new Set(b.events.map(e => e.referrer).filter(r => r && !/^https?:\/\/(localhost|127\.|mikepbyrne\.github\.io)/.test(r as string)))];

  // Heuristics
  const lower = org.toLowerCase();
  const isResidential = /comcast|spectrum|verizon|at&t|t-mobile|charter|cox|frontier|centurylink|google fiber|wow|altice/.test(lower);
  const isCloud = /amazon|google cloud|microsoft|digitalocean|linode|vultr|hetzner|ovh|cloudflare/.test(lower);
  const isMobile = /t-mobile|verizon wireless|at&t mobility|mobile/.test(lower);

  let guess = 'Unknown';
  if (org && !isResidential && !isCloud) {
    guess = `Likely **${org}** (corporate network)`;
  } else if (isCloud) {
    guess = `Cloud / VPN — ${org}`;
  } else if (isMobile) {
    guess = `Mobile — ${org}, ${city}`;
  } else if (isResidential) {
    guess = `Residential ISP — ${org}, ${city}`;
  } else if (city) {
    guess = `Residential, ${city}`;
  }

  if (refs.length) {
    const r = refs[0] as string;
    guess += `\n  Referrer: ${r}`;
    if (/linkedin\.com/.test(r)) guess += '  ← LinkedIn click';
    else if (/google\.com|bing\.com|duckduckgo/.test(r)) guess += '  ← search';
    else if (/mail\.google|outlook\.|gmail/.test(r)) guess += '  ← email';
  }

  return guess;
}

function renderEmail(b: Bucket): { subject: string; text: string; html: string } {
  const e0 = b.events[0] || ({} as VisitEvent);
  const dur = Math.max(0, b.lastSeen - b.firstSeen);
  const minutes = Math.round(dur / 60000);
  const seconds = Math.round(dur / 1000);
  const guess = bestGuessIdentity(b);
  const pages = b.events.map(e => e.page);
  const uniquePages = [...new Set(pages)];

  const start = new Date(b.firstSeen).toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
  const subject = `Portfolio visit — ${(e0.geo?.asOrg || e0.geo?.city || 'visitor')} — ${uniquePages.length} page${uniquePages.length === 1 ? '' : 's'}`;

  const text = [
    `Portfolio visit summary`,
    `=======================`,
    ``,
    `When:        ${start} PT`,
    `Duration:    ${minutes >= 1 ? minutes + ' min' : seconds + ' sec'}`,
    `Pages:       ${b.events.length} (${uniquePages.length} unique)`,
    ``,
    `IP:          ${b.ip}`,
    `Location:    ${[e0.geo?.city, e0.geo?.region, e0.geo?.country].filter(Boolean).join(', ') || 'unknown'}`,
    `Network:     ${e0.geo?.asOrg || 'unknown'} (AS${e0.geo?.asn || '?'})`,
    `Browser:     ${fmtUA(e0.ua || '')}`,
    `Time zone:   ${e0.tz || 'unknown'}`,
    `Language:    ${e0.lang || 'unknown'}`,
    `Viewport:    ${e0.vp || 'unknown'}`,
    ``,
    `Best guess:  ${guess}`,
    ``,
    `Page sequence:`,
    ...b.events.map((e, i) => `  ${String(i + 1).padStart(2, '0')}. [${new Date(e.ts).toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles' })}]  ${e.page}`),
    ``,
  ].join('\n');

  const html = `<!doctype html><html><body style="font-family: ui-monospace, SF Mono, Menlo, monospace; font-size:13px; color:#111; background:#f4f1ea; padding:24px; max-width:680px;">
    <h2 style="font-family: Georgia, serif; font-style:italic; font-weight:400; font-size:24px; margin:0 0 16px;">Portfolio visit</h2>
    <table cellpadding="4" style="border-collapse:collapse;">
      <tr><td style="color:#8a8680;">When</td><td>${start} PT</td></tr>
      <tr><td style="color:#8a8680;">Duration</td><td>${minutes >= 1 ? minutes + ' min' : seconds + ' sec'}</td></tr>
      <tr><td style="color:#8a8680;">Pages</td><td>${b.events.length} (${uniquePages.length} unique)</td></tr>
      <tr><td style="color:#8a8680;">IP</td><td>${b.ip}</td></tr>
      <tr><td style="color:#8a8680;">Location</td><td>${[e0.geo?.city, e0.geo?.region, e0.geo?.country].filter(Boolean).join(', ') || 'unknown'}</td></tr>
      <tr><td style="color:#8a8680;">Network</td><td><strong>${e0.geo?.asOrg || 'unknown'}</strong> (AS${e0.geo?.asn || '?'})</td></tr>
      <tr><td style="color:#8a8680;">Browser</td><td>${fmtUA(e0.ua || '')}</td></tr>
      <tr><td style="color:#8a8680;">Time zone</td><td>${e0.tz || 'unknown'}</td></tr>
    </table>
    <p style="margin-top:16px;"><strong style="color:#ff4a1c;">Best guess:</strong> ${guess.replace(/\n/g, '<br>')}</p>
    <h3 style="margin-top:24px; margin-bottom:8px; font-family: Georgia, serif; font-weight:400;">Page sequence</h3>
    <ol style="margin:0; padding-left:20px;">
      ${b.events.map(e => `<li><code>${new Date(e.ts).toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles' })}</code> &nbsp;${e.page}</li>`).join('')}
    </ol>
  </body></html>`;

  return { subject, text, html };
}

async function sendEmail(env: Env, b: Bucket): Promise<boolean> {
  const { subject, text, html } = renderEmail(b);
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [env.EMAIL_TO],
      subject,
      text,
      html,
    }),
  });
  return r.ok;
}

async function flushExpired(env: Env, ctx: ExecutionContext): Promise<number> {
  // List pending sentinels
  let cursor: string | undefined;
  let sent = 0;
  const now = Date.now();
  do {
    const list = await env.VISITS.list({ prefix: 'pending:', cursor });
    for (const k of list.keys) {
      const ip = k.name.slice('pending:'.length);
      const tsStr = await env.VISITS.get(k.name);
      const ts = tsStr ? Number(tsStr) : 0;
      if (!ts) { await env.VISITS.delete(k.name); continue; }
      if (now - ts < BUCKET_TTL_MS) continue; // session still active
      const bucket = await env.VISITS.get<Bucket>(bucketKey(ip), 'json');
      if (bucket) {
        const ok = await sendEmail(env, bucket);
        if (ok) sent++;
        await env.VISITS.delete(bucketKey(ip));
      }
      await env.VISITS.delete(k.name);
    }
    cursor = list.list_complete ? undefined : (list as any).cursor;
  } while (cursor);
  return sent;
}

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === '/track') return handleTrack(req, env);
    if (url.pathname === '/healthz') return new Response('ok');
    return new Response('not found', { status: 404 });
  },
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(flushExpired(env, ctx));
  },
};
