import fs from "fs";

// ---------------------------------------------------------------------------
// Storage layer — uses Vercel KV (Redis) when env vars are present,
// falls back to /tmp file for local dev or cold-start safety.
//
// Vercel KV env vars (auto-injected when you connect a KV store):
//   KV_REST_API_URL   — e.g. https://xxx.kv.vercel-storage.com
//   KV_REST_API_TOKEN — your read/write token
// ---------------------------------------------------------------------------

// Supports both Upstash direct and legacy Vercel KV env var names
const KV_URL   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const KV_KEY   = "4l-usernames";
const TMP_FILE = "/tmp/4l-usernames.json";

const DEFAULT_POOL: string[] = [
  "zx9k", "q7vr", "mp4n", "tr2w", "bx5f", "ky8d", "jv3s", "hl6p",
  "wn0t", "cg1e", "df4y", "su7b", "rx2a", "lo9m", "pk3z", "ev6c",
  "ub8h", "yn5i", "gt0f", "aq4j", "xd7n", "fm2w", "cs9r", "it6k",
  "nw3v", "be5o", "hz8s", "rp1t", "vk4g", "mj7l", "oc0d", "ly2e",
  "sa6n", "dq9b", "hw4f", "ur7x", "pg3c", "tk8z", "fb1m", "en5a",
  "gx2y", "jd9p", "lv0s", "wc7h", "qi4t", "nb6r", "yo3k", "mk8w",
  "at5j", "rz1n", "sx9g", "fh4b", "pm2l", "de7v", "gu0e", "cl3s",
  "kw6a", "vy8f", "tn1d", "ib4r", "oq7z", "bp5m", "xj2k", "hf9c",
  "wr3t", "sg0n", "al6p", "dz4y", "ce8w", "kn7j", "mv1b", "uo5x",
  "rt2h", "fl9s", "bk4g", "yw0e", "ni3d", "qa6c", "tx8m", "sr1z",
  "gp4f", "ed7k", "vl2n", "mh5r", "oa9t", "jb3w", "cu0s", "ny6j",
  "dp8a", "fx1e", "wl4v", "ko9b", "tb7c", "rg2p", "sf5n", "hm0k",
  "al3z", "bv8d", "ex6t", "qm1f", "yw4r", "nk9s", "pc2w", "gz7h",
];

// ── KV helpers (Upstash-compatible REST API, used by Vercel KV) ──────────

async function kvRead(): Promise<string[] | null> {
  if (!KV_URL || !KV_TOKEN) return null;
  try {
    const res = await fetch(`${KV_URL}/get/${KV_KEY}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` },
    });
    const data = await res.json() as { result?: string };
    if (data.result == null) return null;
    return JSON.parse(data.result) as string[];
  } catch { return null; }
}

async function kvWrite(usernames: string[]): Promise<void> {
  if (!KV_URL || !KV_TOKEN) return;
  try {
    await fetch(`${KV_URL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KV_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["SET", KV_KEY, JSON.stringify(usernames)]),
    });
  } catch { /* best effort */ }
}

// ── /tmp fallback (same-instance persistence when KV not available) ───────

let _cache: string[] | null = null;

function tmpRead(): string[] {
  if (_cache !== null) return _cache;
  try {
    if (fs.existsSync(TMP_FILE)) {
      _cache = JSON.parse(fs.readFileSync(TMP_FILE, "utf8"));
      return _cache!;
    }
  } catch { /* fallthrough */ }
  _cache = [...DEFAULT_POOL];
  tmpWrite(_cache);
  return _cache;
}

function tmpWrite(usernames: string[]): void {
  _cache = usernames;
  try { fs.writeFileSync(TMP_FILE, JSON.stringify(usernames), "utf8"); } catch { /* read-only */ }
}

// ── Unified read/write ────────────────────────────────────────────────────

async function readStock(): Promise<string[]> {
  // If KV is configured, it is the ONLY source of truth.
  // Return [] when the key doesn't exist yet — the dev panel sets the stock.
  if (KV_URL && KV_TOKEN) {
    const kv = await kvRead();
    if (kv !== null) {
      _cache = kv;
      return kv;
    }
    // Key not set yet → empty stock (dev panel will populate it)
    return [];
  }
  // No KV — local dev fallback
  return tmpRead();
}

async function writeStock(usernames: string[]): Promise<void> {
  await kvWrite(usernames); // persist to KV
  tmpWrite(usernames);      // update local cache too
}

// ── Body parser ───────────────────────────────────────────────────────────

async function parseBody(req: any): Promise<any> {
  if (req.body !== undefined) return req.body;
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk: any) => { raw += chunk; });
    req.on("end", () => { try { resolve(JSON.parse(raw)); } catch { resolve({}); } });
  });
}

// ── Main handler ──────────────────────────────────────────────────────────

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") { res.status(200).end(); return; }

  const rawUrl: string = req.url || "";
  const subPath = rawUrl.replace(/^\/api\/usernames\/?/, "").split("?")[0];
  const method  = (req.method || "GET").toUpperCase();

  // GET /api/usernames — stock count
  if (subPath === "" && method === "GET") {
    const stock = await readStock();
    return res.end(JSON.stringify({ count: stock.length }));
  }

  // GET /api/usernames/list — full list (dev panel)
  if (subPath === "list" && method === "GET") {
    const stock = await readStock();
    return res.end(JSON.stringify({ usernames: stock, count: stock.length }));
  }

  // POST /api/usernames/claim — claim one username
  if (subPath === "claim" && method === "POST") {
    const stock = await readStock();
    if (stock.length === 0) {
      res.statusCode = 410;
      return res.end(JSON.stringify({ error: "Out of stock" }));
    }
    const idx     = Math.floor(Math.random() * stock.length);
    const claimed = stock[idx];
    const remaining = stock.filter((_, i) => i !== idx);
    await writeStock(remaining);
    return res.end(JSON.stringify({ username: claimed, remaining: remaining.length }));
  }

  // PUT /api/usernames — set stock (dev panel)
  if (subPath === "" && method === "PUT") {
    const body  = await parseBody(req);
    const raw: unknown[] = Array.isArray(body?.usernames) ? body.usernames : [];
    const clean = raw.map((u) => String(u).trim().toLowerCase()).filter(Boolean);
    await writeStock(clean);
    return res.end(JSON.stringify({ count: clean.length }));
  }

  // DELETE /api/usernames — clear all (dev panel)
  if (subPath === "" && method === "DELETE") {
    await writeStock([]);
    return res.end(JSON.stringify({ count: 0 }));
  }

  res.statusCode = 404;
  return res.end(JSON.stringify({ error: "Not found" }));
}
