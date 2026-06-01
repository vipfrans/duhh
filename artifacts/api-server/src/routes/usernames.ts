import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.resolve(__dirname, "../../data/usernames.json");

// Default pool loaded once if no data file exists
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

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readStock(): string[] {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) {
    writeStock(DEFAULT_POOL);
    return [...DEFAULT_POOL];
  }
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return [];
  }
}

function writeStock(usernames: string[]) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(usernames), "utf8");
}

// GET /api/usernames — get current stock count
router.get("/", (_req, res) => {
  const stock = readStock();
  res.json({ count: stock.length });
});

// GET /api/usernames/list — get full list (for dev panel)
router.get("/list", (_req, res) => {
  const stock = readStock();
  res.json({ usernames: stock, count: stock.length });
});

// POST /api/usernames/claim — claim one username
router.post("/claim", (_req, res) => {
  const stock = readStock();
  if (stock.length === 0) {
    res.status(410).json({ error: "Out of stock" });
    return;
  }
  const idx = Math.floor(Math.random() * stock.length);
  const claimed = stock[idx];
  const remaining = stock.filter((_, i) => i !== idx);
  writeStock(remaining);
  res.json({ username: claimed, remaining: remaining.length });
});

// PUT /api/usernames — set stock (dev panel)
router.put("/", (req, res) => {
  const { usernames } = req.body as { usernames: string[] };
  if (!Array.isArray(usernames)) {
    res.status(400).json({ error: "usernames must be an array" });
    return;
  }
  const clean = usernames.map((u) => String(u).trim().toLowerCase()).filter(Boolean);
  writeStock(clean);
  res.json({ count: clean.length });
});

// DELETE /api/usernames — clear all stock (dev panel)
router.delete("/", (_req, res) => {
  writeStock([]);
  res.json({ count: 0 });
});

export default router;
