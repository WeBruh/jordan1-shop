import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithGoogle } from "../firebase";
import "../app.css";

import hero1 from "../assets/hero/hero-1.jpg";
import hero2 from "../assets/hero/hero-2.jpg";
import hero3 from "../assets/hero/hero-3.jpg";
import hero4 from "../assets/hero/hero-4.jpg";
import hero5 from "../assets/hero/hero-5.jpg";
import hero6 from "../assets/hero/hero-6.jpg";
import hero7 from "../assets/hero/hero-7.jpg";

// Slides 2 & 3 swapped per request, plus 2 new slides added at the end
const HERO_IMAGES = [hero1, hero3, hero2, hero4, hero5, hero6, hero7];

export default function Home({ user }) {
  const navigate = useNavigate();
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSlideIndex((i) => (i + 1) % HERO_IMAGES.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const login = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ paddingTop: 0 }}>

      {/* HERO SECTION */}
      <div style={{
        position: "relative",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}>
        {/* Background slideshow */}
        <div
          key={slideIndex}
          className="hero-slide"
          style={{ backgroundImage: `url(${HERO_IMAGES[slideIndex]})` }}
        />

        {/* Red glow */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "60%",
          height: "40%",
          background: "radial-gradient(ellipse, var(--red-glow) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Hero content */}
        <div style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          padding: "0 20px",
        }}>
          {/* Logo */}
          <img
            src="/new-logo.jpg"
            alt="logo"
            style={{
              width: 70,
              height: 70,
              aspectRatio: "1 / 1",
              objectFit: "cover",
              objectPosition: "center",
              marginBottom: 24,
              filter: "drop-shadow(0 0 20px var(--red-glow))",
              borderRadius: "50%",
              hover: "transform: scale(5.05); transition: transform 0.3s ease;",
            }}
          />

          <div style={{
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "4px",
            color: "var(--red)",
            marginBottom: 16,
            textTransform: "uppercase",
          }}>
            Exclusive Collection
          </div>

          <h1 style={{
            fontSize: "clamp(42px, 8vw, 90px)",
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: "-2px",
            marginBottom: 20,
          }}>
            JORDAN <br />
            <span style={{
              color: "var(--red)",
              textShadow: "0 0 40px var(--red-glow)",
            }}>
              LEGACY
            </span>
          </h1>


          <p style={{
            fontSize: 16,
            color: "rgba(255,255,255,0.6)",
            maxWidth: 480,
            margin: "0 auto 36px",
            lineHeight: 1.7,
          }}>
            Shop the most exclusive Jordan colorways from 
            Jordan 1 to Jordan 18. Authentic. Premium. Yours.
          </p>

          {/* Buttons */}
          <div style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
            flexWrap: "wrap",
          }}>
            <button
              className="btn-red"
              onClick={() => navigate("/shop")}
              style={{ padding: "14px 36px", fontSize: 15 }}
            >
              Shop Now →
            </button>

            {!user && (
              <button
                className="btn-ghost"
                onClick={login}
                style={{ padding: "14px 36px", fontSize: 15 }}
              >
                Sign in with Google
              </button>
            )}

            {user && (
              <button
                className="btn-ghost"
                onClick={() => navigate("/shop")}
                style={{ padding: "14px 36px", fontSize: 15 }}
              >
                Welcome, {user.displayName?.split(" ")[0]} 👋
              </button>
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: "absolute",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          color: "rgba(255,255,255,0.4)",
          fontSize: 12,
          letterSpacing: "2px",
        }}>
          <span>SCROLL</span>
          <div style={{
            width: 1,
            height: 40,
            background: "linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)",
          }} />
        </div>
      </div>

      {/* FEATURES SECTION */}
      <div className="section">
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 24,
        }}>
          {[
            { icon: "✅", title: "100% Authentic", desc: "Every pair verified and guaranteed authentic" },
            { icon: "🚚", title: "Free Shipping", desc: "Free shipping on all orders over $200" },
            { icon: "🔄", title: "Easy Returns", desc: "30-day hassle free return policy" },
            { icon: "🔒", title: "Secure Payment", desc: "Your payment info is always protected" },
          ].map((f) => (
            <div key={f.title} style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: 28,
              textAlign: "center",
              transition: "all 0.3s ease",
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--red)";
                e.currentTarget.style.boxShadow = "0 8px 30px var(--red-glow)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{f.title}</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* COLLECTIONS SECTION */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "4px",
            color: "var(--red)",
            marginBottom: 12,
            textTransform: "uppercase",
          }}>
            Our Collection
          </div>
          <h2 style={{
            fontSize: "clamp(28px, 5vw, 48px)",
            fontWeight: 900,
            letterSpacing: "-1px",
          }}>
            Shop By Model
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 16,
        }}>
          {[
            "Jordan 1", "Jordan 2", "Jordan 3",
            "Jordan 4", "Jordan 5", "Jordan 6",
          ].map((model) => (
            <div
              key={model}
              onClick={() => navigate("/shop")}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "24px 16px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--red)";
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 30px var(--red-glow)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 10 }}>👟</div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{model}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 36 }}>
          <button
            className="btn-red"
            onClick={() => navigate("/shop")}
            style={{ padding: "14px 40px", fontSize: 15 }}
          >
            View All Jordans →
          </button>
        </div>
      </div>

    </div>
  );
}