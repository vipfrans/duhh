import { useState, useEffect, useCallback } from "react";
import {
  getStockCount,
  claimUsername,
  setCooldown,
  getRemainingCooldown,
  getLastClaimed,
} from "@/lib/usernames";

export default function UsernameCard() {
  const [stock, setStock] = useState<number>(getStockCount());
  const [claimed, setClaimed] = useState<string | null>(getLastClaimed());
  const [cooldown, setCooldownState] = useState<number>(getRemainingCooldown());
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Tick cooldown every second
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => {
      const r = getRemainingCooldown();
      setCooldownState(r);
      if (r <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const handleClaim = useCallback(async () => {
    if (cooldown > 0 || isLoading || stock === 0) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600)); // small UX delay

    const username = claimUsername();
    if (!username) {
      setIsLoading(false);
      return;
    }

    setClaimed(username);
    setStock(getStockCount());
    setCooldown(40);
    setCooldownState(40);
    setIsLoading(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  }, [cooldown, isLoading, stock]);

  const isDisabled = cooldown > 0 || isLoading || stock === 0;

  const buttonLabel = () => {
    if (isLoading) return "Fetching...";
    if (stock === 0) return "Out of Stock";
    if (cooldown > 0) return `Wait ${cooldown}s`;
    return "Claim";
  };

  const cooldownPct = cooldown > 0 ? ((40 - cooldown) / 40) * 100 : 100;

  return (
    <div
      className="username-card"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderRadius: "20px",
        padding: "clamp(24px, 5vw, 40px)",
        width: "100%",
        maxWidth: "480px",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 8px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Corner glow accent */}
      <div style={{
        position: "absolute",
        top: "-40px",
        right: "-40px",
        width: "120px",
        height: "120px",
        background: "radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Scan line animation */}
      <div style={{
        position: "absolute",
        left: 0,
        right: 0,
        height: "2px",
        background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.4), transparent)",
        animation: "scan-line 4s linear infinite",
        pointerEvents: "none",
      }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
        <div style={{
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          background: "linear-gradient(135deg, #a855f7, #3b82f6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          fontWeight: 700,
          boxShadow: "0 0 20px rgba(168,85,247,0.4)",
          flexShrink: 0,
        }}>
          4L
        </div>
        <div>
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(16px, 3vw, 20px)",
            fontWeight: 700,
            color: "#f1f5f9",
            letterSpacing: "-0.02em",
          }}>
            4L — users
          </h2>
          <p style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
            4-letter username drops
          </p>
        </div>

        {/* Live dot */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            background: stock > 0 ? "#10b981" : "#ef4444",
            boxShadow: stock > 0 ? "0 0 8px #10b981" : "0 0 8px #ef4444",
            animation: "pulse-glow 2s ease-in-out infinite",
          }} />
          <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 500, whiteSpace: "nowrap" }}>
            {stock > 0 ? "Live" : "Sold Out"}
          </span>
        </div>
      </div>


      {/* Stock count */}
      <div style={{
        background: "rgba(168,85,247,0.06)",
        border: "1px solid rgba(168,85,247,0.15)",
        borderRadius: "12px",
        padding: "16px 20px",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 500 }}>Available Stock</span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "clamp(22px, 4vw, 28px)",
          fontWeight: 700,
          background: "linear-gradient(135deg, #a855f7, #06b6d4)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          {stock.toLocaleString()}
        </span>
      </div>

      {/* Claimed username display */}
      {claimed && (
        <div style={{
          background: showSuccess
            ? "rgba(16,185,129,0.08)"
            : "rgba(255,255,255,0.03)",
          border: showSuccess
            ? "1px solid rgba(16,185,129,0.25)"
            : "1px solid rgba(255,255,255,0.06)",
          borderRadius: "12px",
          padding: "14px 18px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          transition: "all 0.4s ease",
          animation: showSuccess ? "slide-up 0.4s ease" : undefined,
        }}>
          <div>
            <p style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px", fontWeight: 500 }}>
              {showSuccess ? "✓ Claimed!" : "Last Claimed"}
            </p>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "clamp(18px, 3.5vw, 22px)",
              fontWeight: 600,
              color: showSuccess ? "#10b981" : "#e2e8f0",
              letterSpacing: "0.08em",
            }}>
              @{claimed}
            </span>
          </div>
          <button
            onClick={() => navigator.clipboard?.writeText(claimed)}
            title="Copy username"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              padding: "8px 10px",
              color: "#64748b",
              cursor: "pointer",
              fontSize: "14px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#a855f7";
              e.currentTarget.style.borderColor = "rgba(168,85,247,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#64748b";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
            }}
          >
            ⎘
          </button>
        </div>
      )}

      {/* Cooldown progress bar */}
      {cooldown > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <div style={{
            height: "3px",
            background: "rgba(255,255,255,0.06)",
            borderRadius: "2px",
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${cooldownPct}%`,
              background: "linear-gradient(90deg, #a855f7, #3b82f6)",
              borderRadius: "2px",
              transition: "width 1s linear",
              boxShadow: "0 0 8px rgba(168,85,247,0.6)",
            }} />
          </div>
        </div>
      )}

      {/* Claim button */}
      <button
        onClick={handleClaim}
        disabled={isDisabled}
        style={{
          width: "100%",
          padding: "clamp(12px, 2.5vw, 15px) 24px",
          borderRadius: "12px",
          border: "none",
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "clamp(14px, 2.5vw, 16px)",
          fontWeight: 600,
          letterSpacing: "0.04em",
          cursor: isDisabled ? "not-allowed" : "pointer",
          position: "relative",
          overflow: "hidden",
          transition: "all 0.3s ease",
          ...(isDisabled
            ? {
                background: "rgba(255,255,255,0.04)",
                color: "#475569",
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "none",
              }
            : {
                background: "linear-gradient(135deg, #a855f7, #3b82f6)",
                color: "#fff",
                boxShadow: "0 0 30px rgba(168,85,247,0.35), 0 4px 20px rgba(0,0,0,0.3)",
              }),
        }}
        onMouseEnter={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 0 50px rgba(168,85,247,0.5), 0 8px 30px rgba(0,0,0,0.4)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 0 30px rgba(168,85,247,0.35), 0 4px 20px rgba(0,0,0,0.3)";
          }
        }}
      >
        {isLoading ? (
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <span style={{
              width: "14px",
              height: "14px",
              border: "2px solid rgba(255,255,255,0.2)",
              borderTopColor: "#fff",
              borderRadius: "50%",
              display: "inline-block",
              animation: "countdown-spin 0.8s linear infinite",
            }} />
            Fetching...
          </span>
        ) : (
          buttonLabel()
        )}
      </button>

    </div>
  );
}
