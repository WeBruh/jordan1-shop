import { useTheme, ACCENT_PRESETS } from "../context/ThemeContext";

export default function Settings({ onClose }) {
  const { mode, setMode, accent, setAccent } = useTheme();

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 3000,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 20,
        padding: 32,
        width: "100%",
        maxWidth: 420,
        color: "var(--text)",
      }}>
        <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 24 }}>Settings</h3>

        {/* Appearance */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>
            Appearance
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => setMode("dark")}
              style={{
                flex: 1, padding: "12px", borderRadius: 12, fontSize: 13, fontWeight: 700,
                cursor: "pointer",
                border: mode === "dark" ? `2px solid ${accent}` : "1px solid var(--border)",
                background: mode === "dark" ? `${accent}1a` : "transparent",
                color: "var(--text)",
              }}
            >
              🌙 Dark
            </button>
            <button
              onClick={() => setMode("light")}
              style={{
                flex: 1, padding: "12px", borderRadius: 12, fontSize: 13, fontWeight: 700,
                cursor: "pointer",
                border: mode === "light" ? `2px solid ${accent}` : "1px solid var(--border)",
                background: mode === "light" ? `${accent}1a` : "transparent",
                color: "var(--text)",
              }}
            >
              ☀️ Light
            </button>
          </div>
        </div>

        {/* Accent color */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>
            Accent Color
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
            {Object.entries(ACCENT_PRESETS).map(([name, hex]) => (
              <button
                key={name}
                onClick={() => setAccent(hex)}
                title={name}
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: hex, cursor: "pointer",
                  border: accent.toLowerCase() === hex.toLowerCase() ? "3px solid var(--text)" : "3px solid transparent",
                  boxShadow: accent.toLowerCase() === hex.toLowerCase() ? `0 0 0 2px ${hex}` : "none",
                }}
              />
            ))}
          </div>

          <label style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 10 }}>
            Custom color
            <input
              type="color"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              style={{
                width: 44, height: 32, borderRadius: 8, border: "1px solid var(--border)",
                background: "transparent", cursor: "pointer", padding: 0,
              }}
            />
          </label>
        </div>

        <button
          className="btn-red"
          onClick={onClose}
          style={{ width: "100%", padding: "12px", fontSize: 14, marginTop: 24 }}
        >
          Done
        </button>
      </div>
    </div>
  );
}
