export default function NeonDivider() {
  return (
    <div style={{ position: "relative", width: "100%", height: "2px", margin: "0" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(90deg, transparent 0%, #a855f7 20%, #06b6d4 50%, #a855f7 80%, transparent 100%)",
          boxShadow: "0 0 20px rgba(168,85,247,0.8), 0 0 40px rgba(168,85,247,0.4), 0 0 80px rgba(6,182,212,0.3)",
          animation: "neon-flicker 6s infinite",
        }}
      />
    </div>
  );
}
