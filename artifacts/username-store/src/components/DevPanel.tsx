import { useState, useEffect, useRef } from "react";
import { getStockList, clearStock, setStock } from "@/lib/usernames";

const DEV_KEY = "LarpAxtonJaJa";

interface DevPanelProps {
  onStockChange: () => void;
}

export default function DevPanel({ onStockChange }: DevPanelProps) {
  const [phase, setPhase] = useState<"closed" | "key" | "panel">("closed");
  const [keyInput, setKeyInput] = useState("");
  const [keyError, setKeyError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [text, setText] = useState("");
  const [applyMsg, setApplyMsg] = useState<{ ok: boolean; msg: string } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [loadingPanel, setLoadingPanel] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load current stock list from server when panel opens
  useEffect(() => {
    if (phase === "panel") {
      setLoadingPanel(true);
      getStockList().then((list) => {
        setText(list.join("\n"));
        setLoadingPanel(false);
      });
    }
  }, [phase]);

  // Focus key input
  useEffect(() => {
    if (phase === "key") {
      setTimeout(() => inputRef.current?.focus(), 80);
      setKeyInput(""); setKeyError(false);
    }
  }, [phase]);

  function handleKeySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (keyInput === DEV_KEY) {
      setPhase("panel");
    } else {
      setKeyError(true); setShaking(true);
      setTimeout(() => setShaking(false), 500);
      setTimeout(() => setKeyError(false), 1800);
    }
  }

  async function handleApply() {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const count = await setStock(lines);
    onStockChange();
    setApplyMsg({ ok: true, msg: `✓ ${count} usernames applied to stock` });
    setTimeout(() => setApplyMsg(null), 3000);
  }

  async function handleClearAll() {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    await clearStock();
    setText("");
    onStockChange();
    setConfirmClear(false);
    setApplyMsg({ ok: false, msg: "Stock cleared — 0 usernames remaining" });
    setTimeout(() => setApplyMsg(null), 3000);
  }

  function handleClose() {
    setPhase("closed"); setConfirmClear(false); setApplyMsg(null);
  }

  const lineCount = text.split("\n").filter((l) => l.trim()).length;

  return (
    <>
      {/* HAMMER BUTTON */}
      <button
        onClick={() => setPhase("key")}
        title="Developer Panel"
        style={{
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "10px", padding: "8px 14px", cursor: "pointer",
          fontSize: "18px", color: "#475569", transition: "all 0.2s", lineHeight: 1,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "#a855f7"; e.currentTarget.style.borderColor = "rgba(168,85,247,0.3)"; e.currentTarget.style.background = "rgba(168,85,247,0.06)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "#475569"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
      >🔨</button>

      {/* OVERLAY */}
      {phase !== "closed" && (
        <div onClick={handleClose} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(6px)", zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
        }}>

          {/* KEY PROMPT */}
          {phase === "key" && (
            <div onClick={(e) => e.stopPropagation()} style={{
              background: "#0d1120", border: "1px solid rgba(168,85,247,0.25)",
              borderRadius: "18px", padding: "clamp(24px, 5vw, 36px)",
              width: "100%", maxWidth: "380px",
              boxShadow: "0 0 60px rgba(168,85,247,0.15), 0 20px 60px rgba(0,0,0,0.6)",
              animation: shaking ? "shake 0.45s ease" : "slide-up 0.3s ease",
            }}>
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <div style={{ fontSize: "32px", marginBottom: "10px", filter: "drop-shadow(0 0 12px rgba(168,85,247,0.6))" }}>🔒</div>
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "18px", fontWeight: 700, color: "#f1f5f9", marginBottom: "6px" }}>Developer Panel</h2>
                <p style={{ fontSize: "13px", color: "#64748b" }}>Enter your access key to continue</p>
              </div>
              <form onSubmit={handleKeySubmit}>
                <input
                  ref={inputRef} type="password" value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="Access key..."
                  style={{
                    width: "100%", background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${keyError ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"}`,
                    borderRadius: "10px", padding: "12px 16px", color: "#f1f5f9",
                    fontFamily: "'JetBrains Mono', monospace", fontSize: "14px",
                    outline: "none", marginBottom: "8px", transition: "border-color 0.2s", boxSizing: "border-box",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(168,85,247,0.5)"; }}
                  onBlur={(e) => { if (!keyError) e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                />
                {keyError && <p style={{ fontSize: "12px", color: "#ef4444", marginBottom: "12px", textAlign: "center" }}>✗ Wrong access key</p>}
                <button type="submit" style={{
                  width: "100%", padding: "12px",
                  background: "linear-gradient(135deg, #a855f7, #3b82f6)", border: "none",
                  borderRadius: "10px", color: "#fff", fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "14px", fontWeight: 600, cursor: "pointer",
                  marginTop: keyError ? "0" : "8px", boxShadow: "0 0 20px rgba(168,85,247,0.3)",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                >Unlock</button>
              </form>
            </div>
          )}

          {/* DEVELOPER PANEL */}
          {phase === "panel" && (
            <div onClick={(e) => e.stopPropagation()} style={{
              background: "#0d1120", border: "1px solid rgba(168,85,247,0.2)",
              borderRadius: "18px", width: "100%", maxWidth: "560px", maxHeight: "90vh",
              display: "flex", flexDirection: "column",
              boxShadow: "0 0 80px rgba(168,85,247,0.12), 0 30px 80px rgba(0,0,0,0.7)",
              overflow: "hidden", animation: "slide-up 0.3s ease",
            }}>
              {/* Header */}
              <div style={{
                padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center", gap: "10px",
                background: "rgba(168,85,247,0.04)", flexShrink: 0,
              }}>
                <span style={{ fontSize: "18px" }}>🔨</span>
                <div>
                  <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "15px", fontWeight: 700, color: "#f1f5f9" }}>Developer Panel</h2>
                  <p style={{ fontSize: "11px", color: "#64748b" }}>Manage username stock</p>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: "12px",
                    color: lineCount > 0 ? "#a855f7" : "#475569",
                    background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.15)",
                    borderRadius: "6px", padding: "3px 10px",
                  }}>{lineCount} usernames</span>
                  <button onClick={handleClose} style={{
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px", padding: "5px 10px", color: "#64748b",
                    cursor: "pointer", fontSize: "16px", lineHeight: 1, transition: "all 0.2s",
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "#64748b"; }}
                  >✕</button>
                </div>
              </div>

              {/* Body */}
              <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", padding: "16px 20px", gap: "10px" }}>
                <p style={{ fontSize: "12px", color: "#475569" }}>
                  One username per line. Press <strong style={{ color: "#94a3b8" }}>Apply</strong> to save — changes apply for ALL visitors instantly.
                </p>
                {loadingPanel ? (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{
                      width: "24px", height: "24px",
                      border: "2px solid rgba(168,85,247,0.2)", borderTopColor: "#a855f7",
                      borderRadius: "50%", display: "inline-block",
                      animation: "countdown-spin 0.8s linear infinite",
                    }} />
                  </div>
                ) : (
                  <textarea
                    value={text} onChange={(e) => setText(e.target.value)}
                    placeholder={"abcd\nefgh\nxk7z\n..."} spellCheck={false}
                    style={{
                      flex: 1, minHeight: "280px",
                      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "12px", padding: "14px 16px", color: "#e2e8f0",
                      fontFamily: "'JetBrains Mono', monospace", fontSize: "13px",
                      lineHeight: 1.8, resize: "vertical", outline: "none", transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(168,85,247,0.4)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                  />
                )}
                {applyMsg && (
                  <div style={{
                    padding: "10px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: 500,
                    background: applyMsg.ok ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
                    border: `1px solid ${applyMsg.ok ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
                    color: applyMsg.ok ? "#10b981" : "#ef4444", animation: "slide-up 0.3s ease",
                  }}>{applyMsg.msg}</div>
                )}
              </div>

              {/* Actions */}
              <div style={{
                padding: "14px 20px", borderTop: "1px solid rgba(255,255,255,0.06)",
                display: "flex", gap: "10px", flexShrink: 0, flexWrap: "wrap",
              }}>
                <button onClick={handleClearAll} style={{
                  flex: "1 1 120px", padding: "11px 16px", borderRadius: "10px",
                  border: confirmClear ? "1px solid rgba(239,68,68,0.6)" : "1px solid rgba(255,255,255,0.08)",
                  background: confirmClear ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.04)",
                  color: confirmClear ? "#ef4444" : "#64748b",
                  fontFamily: "'Space Grotesk', sans-serif", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                }}
                  onMouseEnter={(e) => { if (!confirmClear) { e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)"; e.currentTarget.style.color = "#ef4444"; } }}
                  onMouseLeave={(e) => { if (!confirmClear) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#64748b"; } }}
                >{confirmClear ? "⚠ Confirm Clear?" : "🗑 Clear All"}</button>

                <button onClick={handleApply} style={{
                  flex: "2 1 160px", padding: "11px 20px", borderRadius: "10px", border: "none",
                  background: "linear-gradient(135deg, #a855f7, #3b82f6)", color: "#fff",
                  fontFamily: "'Space Grotesk', sans-serif", fontSize: "14px", fontWeight: 700,
                  cursor: "pointer", boxShadow: "0 0 24px rgba(168,85,247,0.35)",
                  transition: "opacity 0.2s, transform 0.15s", letterSpacing: "0.03em",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
                >✓ Apply</button>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </>
  );
}
