import { useState, useCallback } from "react";
import ParticleBlob from "@/components/ParticleBlob";
import UsernameCard from "@/components/UsernameCard";
import NeonDivider from "@/components/NeonDivider";
import DevPanel from "@/components/DevPanel";

export default function HomePage() {
  const [stockVersion, setStockVersion] = useState(0);
  const refreshStock = useCallback(() => setStockVersion((v) => v + 1), []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      <ParticleBlob />

      {/* ─── MAIN CONTENT ─── */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(32px, 6vw, 80px) clamp(16px, 5vw, 40px)",
          position: "relative",
          zIndex: 1,
          gap: "clamp(40px, 7vw, 64px)",
        }}
      >
        {/* ─── HERO ─── */}
        <div style={{ textAlign: "center", maxWidth: "640px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(168,85,247,0.08)",
              border: "1px solid rgba(168,85,247,0.2)",
              borderRadius: "100px",
              padding: "6px 16px",
              marginBottom: "24px",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#a855f7",
                boxShadow: "0 0 8px #a855f7",
                animation: "pulse-glow 2s ease-in-out infinite",
                display: "inline-block",
              }}
            />
            <span
              style={{
                fontSize: "12px",
                color: "#a855f7",
                fontWeight: 600,
                letterSpacing: "0.06em",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              EXCLUSIVE DROP
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(38px, 8vw, 72px)",
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              marginBottom: "16px",
            }}
          >
            <span
              style={{
                background: "linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Rare 4-Letter
            </span>
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #a855f7 0%, #06b6d4 60%, #3b82f6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                backgroundSize: "200% auto",
                animation: "shimmer 4s linear infinite",
              }}
            >
              Usernames
            </span>
          </h1>

          <p
            style={{
              fontSize: "clamp(14px, 2.5vw, 17px)",
              color: "#64748b",
              lineHeight: 1.7,
              maxWidth: "460px",
              margin: "0 auto",
            }}
          >
            Claim your unique 4-character handle before it's gone.
            Each username is removed from the pool permanently once claimed.
          </p>
        </div>

        {/* ─── CLAIM CARD ─── */}
        <div style={{ width: "100%", display: "flex", justifyContent: "center", animation: "slide-up 0.6s ease" }}>
          <UsernameCard key={stockVersion} />
        </div>

        {/* ─── STATS ROW ─── */}
        <StatsRow />
      </main>

      {/* ─── NEON DIVIDER + FOOTER ─── */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <NeonDivider />
        <footer
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            padding: "16px 20px",
            background: "rgba(0,0,0,0.3)",
          }}
        >
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "13px",
              color: "#475569",
              fontWeight: 500,
              letterSpacing: "0.02em",
            }}
          >
            Made by{" "}
            <span style={{ color: "#a855f7", fontWeight: 600 }}>@9wp9</span>
          </span>

          <DevPanel onStockChange={refreshStock} />
        </footer>
      </div>
    </div>
  );
}

function StatsRow() {
  const items = [
    { label: "Username Length", value: "4 chars" },
    { label: "Cooldown", value: "40 sec" },
    { label: "Once Claimed", value: "Gone forever" },
  ];

  return (
    <div
      style={{
        display: "flex",
        gap: "clamp(12px, 3vw, 20px)",
        flexWrap: "wrap",
        justifyContent: "center",
        width: "100%",
        maxWidth: "480px",
      }}
    >
      {items.map(({ label, value }) => (
        <div
          key={label}
          style={{
            flex: "1 1 120px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "12px",
            padding: "14px 16px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "clamp(14px, 2.5vw, 16px)",
              fontWeight: 600,
              color: "#e2e8f0",
              marginBottom: "4px",
            }}
          >
            {value}
          </p>
          <p style={{ fontSize: "11px", color: "#475569", fontWeight: 500 }}>{label}</p>
        </div>
      ))}
    </div>
  );
}
