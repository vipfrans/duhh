// --- SERVER-BACKED STORE ---
// All data lives on the API server (persistent for every visitor).

const COOLDOWN_KEY = "4l_cooldown_until";
const CLAIMED_KEY  = "4l_last_claimed";

export async function getStockCount(): Promise<number> {
  try {
    const res = await fetch("/api/usernames");
    if (!res.ok) return 0;
    const data = await res.json();
    return data.count ?? 0;
  } catch {
    return 0;
  }
}

export async function claimUsername(): Promise<{ username: string; remaining: number } | null> {
  try {
    const res = await fetch("/api/usernames/claim", { method: "POST" });
    if (!res.ok) return null;
    const data = await res.json();
    localStorage.setItem(CLAIMED_KEY, data.username);
    return data;
  } catch {
    return null;
  }
}

export async function clearStock(): Promise<void> {
  await fetch("/api/usernames", { method: "DELETE" });
}

export async function setStock(usernames: string[]): Promise<number> {
  const clean = usernames.map((u) => u.trim().toLowerCase()).filter(Boolean);
  const res = await fetch("/api/usernames", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usernames: clean }),
  });
  const data = await res.json();
  return data.count ?? 0;
}

export async function getStockList(): Promise<string[]> {
  try {
    const res = await fetch("/api/usernames/list");
    if (!res.ok) return [];
    const data = await res.json();
    return data.usernames ?? [];
  } catch {
    return [];
  }
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
