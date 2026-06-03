import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.resolve(__dirname, "../../data/usernames.json");

// ── Upstash KV (shared storage — same instance used by Vercel) ─────────────
const KV_URL   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const KV_KEY   = "4l-usernames-v3";

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
      headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(["SET", KV_KEY, JSON.stringify(usernames)]),
    });
  } catch { /* best effort */ }
}

// ── File fallback (local dev only, when KV not configured) ─────────────────

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function fileRead(): string[] {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) { fileWrite([]); return []; }
  try { return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")); } catch { return []; }
}

function fileWrite(usernames: string[]) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(usernames), "utf8");
}

// ── Unified read/write ──────────────────────────────────────────────────────

async function readStock(): Promise<string[]> {
  if (KV_URL && KV_TOKEN) {
    const kv = await kvRead();
    return kv !== null ? kv : [];   // empty = no stock yet
  }
  return fileRead();
}

async function writeStock(usernames: string[]): Promise<void> {
  if (KV_URL && KV_TOKEN) {
    await kvWrite(usernames);
  } else {
    fileWrite(usernames);
  }
}

// ── Routes ──────────────────────────────────────────────────────────────────

// GET /api/usernames — get current stock count
router.get("/", async (_req, res) => {
  const stock = await readStock();
  res.json({ count: stock.length });
});

// GET /api/usernames/list — get full list (for dev panel)
router.get("/list", async (_req, res) => {
  const stock = await readStock();
  res.json({ usernames: stock, count: stock.length });
});

// POST /api/usernames/claim — claim one username
router.post("/claim", async (_req, res) => {
  const stock = await readStock();
  if (stock.length === 0) {
    res.status(410).json({ error: "Out of stock" });
    return;
  }
  const idx = Math.floor(Math.random() * stock.length);
  const claimed = stock[idx];
  const remaining = stock.filter((_, i) => i !== idx);
  await writeStock(remaining);
  res.json({ username: claimed, remaining: remaining.length });
});

// PUT /api/usernames — set stock (dev panel)
router.put("/", async (req, res) => {
  const { usernames } = req.body as { usernames: string[] };
  if (!Array.isArray(usernames)) {
    res.status(400).json({ error: "usernames must be an array" });
    return;
  }
  const clean = usernames.map((u) => String(u).trim().toLowerCase()).filter(Boolean);
  await writeStock(clean);
  res.json({ count: clean.length });
});

// DELETE /api/usernames — clear all stock (dev panel)
router.delete("/", async (_req, res) => {
  await writeStock([]);
  res.json({ count: 0 });
});

export default router;
