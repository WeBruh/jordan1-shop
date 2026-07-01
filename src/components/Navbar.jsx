import { Link, useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import "../app.css";

export default function Navbar({ user, cartCount }) {
  const navigate = useNavigate();

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error(err);
    }
  };

  const logout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <nav style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "18px 60px",
      background: "rgba(5,6,8,0.85)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img
          src="/logo.jpg"
          alt="logo"
          style={{ width: 100, height: 40, objectFit: "contain" }}
        />
        <span style={{
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: "-0.5px",
          color: "white"
        }}>
          J's <span style={{ color: "#e63329" }}>Shop</span>
        </span>
      </Link>

      {/* Nav Links */}
      <div style={{ display: "flex", gap: 36, alignItems: "center" }}>
        {["Home", "Shop", "Cart"].map((item) => (
          <Link
            key={item}
            to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "rgba(255,255,255,0.7)",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => e.target.style.color = "#e63329"}
            onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.7)"}
          >
            {item}
          </Link>
        ))}
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Cart */}
        <Link to="/cart" style={{ position: "relative" }}>
          <button className="orb-btn grey">🛒</button>
          {cartCount > 0 && (
            <span style={{
              position: "absolute",
              top: -4,
              right: -4,
              background: "#e63329",
              color: "white",
              borderRadius: "50%",
              width: 18,
              height: 18,
              fontSize: 10,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              {cartCount}
            </span>
          )}
        </Link>

        {/* Auth */}
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img
              src={user.photoURL}
              alt="avatar"
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "2px solid #e63329"
              }}
            />
            <button className="btn-ghost" onClick={logout}
              style={{ padding: "8px 18px", fontSize: 13 }}>
              Sign out
            </button>
          </div>
        ) : (
          <button className="btn-red" onClick={login}
            style={{ padding: "8px 20px", fontSize: 13 }}>
            Sign in with Google
          </button>
        )}
      </div>
    </nav>
  );
}