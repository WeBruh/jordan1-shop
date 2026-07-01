import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{
      background: "#0a0b0e",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: "64px 60px 32px",
      marginTop: "auto",
    }}>
      <div style={{
        maxWidth: 1400,
        margin: "0 auto",
      }}>

        {/* Top row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr",
          gap: 48,
          marginBottom: 56,
        }}>

          {/* Brand */}
          <div>
            <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <img
                src="/logo.png"
                alt="logo"
                style={{ width: 32, height: 32, objectFit: "contain" }}
              />
              <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.5px", color: "white" }}>
                J's <span style={{ color: "#e63329" }}>Shop</span>
              </span>
            </Link>
            <p style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.4)",
              lineHeight: 1.8,
              maxWidth: 280,
              marginBottom: 24,
            }}>
              The most exclusive Jordan colorways, guaranteed authentic. From Chicago to Bred — every pair tells a story.
            </p>

            {/* Social icons */}
            <div style={{ display: "flex", gap: 12 }}>
              {[
                { label: "Instagram", icon: "📸" },
                { label: "Twitter", icon: "🐦" },
                { label: "TikTok", icon: "🎵" },
              ].map((s) => (
                <button
                  key={s.label}
                  title={s.label}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: 15,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#e63329";
                    e.currentTarget.style.background = "rgba(230,51,41,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  {s.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Shop links */}
          <div>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "3px",
              color: "#e63329",
              textTransform: "uppercase",
              marginBottom: 20,
            }}>
              Shop
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "All Jordans", to: "/shop" },
                { label: "Jordan 1", to: "/shop" },
                { label: "Jordan 4", to: "/shop" },
                { label: "Jordan 11", to: "/shop" },
                { label: "New Arrivals", to: "/shop" },
              ].map((l) => (
                <Link
                  key={l.label}
                  to={l.to}
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.5)",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => e.target.style.color = "white"}
                  onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.5)"}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Help links */}
          <div>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "3px",
              color: "#e63329",
              textTransform: "uppercase",
              marginBottom: 20,
            }}>
              Help
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {["Sizing Guide", "Shipping Info", "Returns", "Track Order", "Contact Us"].map((l) => (
                <a
                  key={l}
                  href="#"
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.5)",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => e.target.style.color = "white"}
                  onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.5)"}
                >
                  {l}
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "3px",
              color: "#e63329",
              textTransform: "uppercase",
              marginBottom: 20,
            }}>
              Stay Updated
            </div>
            <p style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.4)",
              lineHeight: 1.7,
              marginBottom: 16,
            }}>
              Get early access to new drops and exclusive deals.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input
                type="email"
                placeholder="your@email.com"
                style={{
                  background: "#111318",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  color: "white",
                  fontSize: 13,
                  outline: "none",
                  width: "100%",
                }}
                onFocus={(e) => e.target.style.borderColor = "#e63329"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
              />
              <button
                className="btn-red"
                style={{ width: "100%", padding: "10px", fontSize: 13, borderRadius: 10 }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{
          height: 1,
          background: "rgba(255,255,255,0.06)",
          marginBottom: 28,
        }} />

        {/* Bottom row */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
            © {year} J's Shop. All rights reserved.
          </div>

          <div style={{ display: "flex", gap: 24 }}>
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((l) => (
              <a
                key={l}
                href="#"
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.3)",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => e.target.style.color = "rgba(255,255,255,0.7)"}
                onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.3)"}
              >
                {l}
              </a>
            ))}
          </div>

          <div style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}>
            {["💳", "🏦", "🍎", "🔵"].map((icon, i) => (
              <div
                key={i}
                style={{
                  width: 36,
                  height: 24,
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                }}
              >
                {icon}
              </div>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
