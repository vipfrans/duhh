import fs from "fs";

// ---------------------------------------------------------------------------
// Persistent storage via /tmp (survives within a warm serverless instance).
// For production with true cross-instance persistence, swap this for
// Vercel KV: https://vercel.com/docs/storage/vercel-kv
// ---------------------------------------------------------------------------

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

// Module-level cache — shared across requests in the same warm instance
let _stock: string[] | null = null;

function readStock(): string[] {
  if (_stock !== null) return _stock;
  try {
    if (fs.existsSync(TMP_FILE)) {
      _stock = JSON.parse(fs.readFileSync(TMP_FILE, "utf8"));
      return _stock!;
    }
  } catch { /* fallthrough */ }
  _stock = [...DEFAULT_POOL];
  writeStock(_stock);
  return _stock;
}

function writeStock(usernames: string[]): void {
  _stock = usernames;
  try { fs.writeFileSync(TMP_FILE, JSON.stringify(usernames), "utf8"); } catch { /* read-only fs */ }
}

async function parseBody(req: any): Promise<any> {
  // Vercel may already have parsed the body, or we parse it manually
  if (req.body !== undefined) return req.body;
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk: any) => { raw += chunk; });
    req.on("end", () => { try { resolve(JSON.parse(raw)); } catch { resolve({}); } });
  });
}

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") { res.status(200).end(); return; }

  // Determine sub-path from the original URL
  // e.g. /api/usernames       → ""
  //      /api/usernames/claim → "claim"
  //      /api/usernames/list  → "list"
  const rawUrl: string = req.url || "";
  const subPath = rawUrl.replace(/^\/api\/usernames\/?/, "").split("?")[0];
  const method = (req.method || "GET").toUpperCase();

  // ── GET /api/usernames ── stock count
  if (subPath === "" && method === "GET") {
    return res.end(JSON.stringify({ count: readStock().length }));
  }

  // ── GET /api/usernames/list ── full list (dev panel)
  if (subPath === "list" && method === "GET") {
    const stock = readStock();
    return res.end(JSON.stringify({ usernames: stock, count: stock.length }));
  }

  // ── POST /api/usernames/claim ── claim one username
  if (subPath === "claim" && method === "POST") {
    const stock = readStock();
    if (stock.length === 0) {
      res.statusCode = 410;
      return res.end(JSON.stringify({ error: "Out of stock" }));
    }
    const idx = Math.floor(Math.random() * stock.length);
    const claimed = stock[idx];
    const remaining = stock.filter((_, i) => i !== idx);
    writeStock(remaining);
    return res.end(JSON.stringify({ username: claimed, remaining: remaining.length }));
  }

  // ── PUT /api/usernames ── set stock (dev panel)
  if (subPath === "" && method === "PUT") {
    const body = await parseBody(req);
    const raw: unknown[] = Array.isArray(body?.usernames) ? body.usernames : [];
    const clean = raw.map((u) => String(u).trim().toLowerCase()).filter(Boolean);
    writeStock(clean);
    return res.end(JSON.stringify({ count: clean.length }));
  }

  // ── DELETE /api/usernames ── clear all (dev panel)
  if (subPath === "" && method === "DELETE") {
    writeStock([]);
    return res.end(JSON.stringify({ count: 0 }));
  }

  res.statusCode = 404;
  return res.end(JSON.stringify({ error: "Not found" }));
}
