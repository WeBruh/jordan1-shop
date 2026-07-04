import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth, db, signInWithGoogle } from "../firebase";
import { signOut } from "firebase/auth";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import Settings from "./Settings";
import "../app.css";

export default function Navbar({ user, cartCount }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close the mobile menu automatically whenever the route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Real-time notifications for this customer (order delivered/cancelled updates)
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const openNotifications = () => {
    setShowNotifDropdown((v) => !v);
    // Mark all as read once opened
    notifications.forEach((n) => {
      if (!n.read) {
        updateDoc(doc(db, "notifications", n.id), { read: true }).catch((err) =>
          console.error("Failed to mark notification read:", err)
        );
      }
    });
  };

  const login = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
    }
  };

  const logout = async () => {
    setShowDropdown(false);
    await signOut(auth);
    navigate("/");
  };

  return (
    <nav className="navbar" style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: "var(--surface)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid var(--border)",
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
          color: "var(--text)"
        }}>
          J's <span style={{ color: "var(--red)" }}>Shop</span>
        </span>
      </Link>

      {/* Nav Links (desktop) */}
      <div className="nav-links">
        {["Home", "Shop", "Cart"].map((item) => (
          <Link
            key={item}
            to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "var(--text-muted)",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => e.target.style.color = "var(--red)"}
            onMouseLeave={(e) => e.target.style.color = "var(--text-muted)"}
          >
            {item}
          </Link>
        ))}
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Hamburger (mobile only) */}
        <button
          className="hamburger-btn"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <span />
          <span />
          <span />
        </button>

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

        {/* Notifications */}
        {user && (
          <div style={{ position: "relative" }}>
            <button onClick={openNotifications} className="orb-btn grey" style={{ position: "relative" }}>
              🔔
              {unreadCount > 0 && (
                <span style={{
                  position: "absolute", top: -2, right: -2,
                  background: "var(--red)", color: "white",
                  borderRadius: "50%", minWidth: 18, height: 18,
                  fontSize: 10, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "0 4px",
                }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <>
                <div onClick={() => setShowNotifDropdown(false)} style={{ position: "fixed", inset: 0, zIndex: 1050 }} />
                <div className="dropdown-menu" style={{ width: 300, maxHeight: 360, overflowY: "auto" }}>
                  <div style={{ padding: "6px 10px 10px", borderBottom: "1px solid var(--border)", marginBottom: 6, fontSize: 13, fontWeight: 700 }}>
                    Notifications
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: "20px 10px", fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} style={{ padding: "10px 10px", borderRadius: 10 }}>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>
                          {n.status === "Delivered" ? "📦 " : "❌ "}{n.message}
                        </div>
                        {n.createdAt && (
                          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                            {n.createdAt.toDate ? n.createdAt.toDate().toLocaleString() : ""}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Auth */}
        {user ? (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowDropdown((v) => !v)}
              style={{
                background: "transparent", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8, padding: 0,
              }}
            >
              <img
                src={user.photoURL}
                alt="avatar"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "2px solid var(--red)"
                }}
              />
            </button>

            {showDropdown && (
              <>
                <div
                  onClick={() => setShowDropdown(false)}
                  style={{ position: "fixed", inset: 0, zIndex: 1050 }}
                />
                <div className="dropdown-menu">
                  <div style={{ padding: "8px 14px 12px", borderBottom: "1px solid var(--border)", marginBottom: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{user.displayName}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{user.email}</div>
                  </div>
                  <button
                    className="dropdown-item"
                    onClick={() => { setShowDropdown(false); setShowSettings(true); }}
                  >
                    ⚙️ Settings
                  </button>
                  <button className="dropdown-item" onClick={logout}>
                    🚪 Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <button className="btn-red" onClick={login}
            style={{ padding: "8px 20px", fontSize: 13 }}>
            Sign in with Google
          </button>
        )}
      </div>

      {/* Mobile menu panel */}
      {mobileMenuOpen && (
        <>
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{ position: "fixed", inset: 0, top: 74, zIndex: 998 }}
          />
          <div className="mobile-menu-panel">
            {["Home", "Shop", "Cart"].map((item) => (
              <Link
                key={item}
                to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </Link>
            ))}
          </div>
        </>
      )}

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </nav>
  );
}