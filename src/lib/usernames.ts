// --- LOCAL STORE ---

const STORAGE_KEY = "4l_username_stock";
const COOLDOWN_KEY = "4l_cooldown_until";
const CLAIMED_KEY = "4l_last_claimed";

// Default username pool — replace with real data from Firebase
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

function initStock(): void {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_POOL));
  }
}

export function getStock(): string[] {
  initStock();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function getStockCount(): number {
  return getStock().length;
}

export function claimUsername(): string | null {
  const stock = getStock();
  if (stock.length === 0) return null;
  const idx = Math.floor(Math.random() * stock.length);
  const claimed = stock[idx];
  const remaining = stock.filter((_, i) => i !== idx);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
  localStorage.setItem(CLAIMED_KEY, claimed);
  return claimed;
}

export function getLastClaimed(): string | null {
  return localStorage.getItem(CLAIMED_KEY);
}

export function getCooldownUntil(): number {
  return parseInt(localStorage.getItem(COOLDOWN_KEY) || "0", 10);
}

export function setCooldown(seconds: number): void {
  localStorage.setItem(COOLDOWN_KEY, String(Date.now() + seconds * 1000));
}

export function getRemainingCooldown(): number {
  const until = getCooldownUntil();
  const remaining = Math.ceil((until - Date.now()) / 1000);
  return remaining > 0 ? remaining : 0;
}

export function clearStock(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
}

export function setStock(usernames: string[]): void {
  const clean = usernames
    .map((u) => u.trim().toLowerCase())
    .filter((u) => u.length > 0);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
}
