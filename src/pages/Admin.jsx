import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";

const ADMIN_EMAIL = "genorgaadriangabriel@gmail.com"; // change to your Google account email

const INITIAL_PRODUCTS = [
  { id: 1, model: "Jordan 1", name: "AJ1 Chicago", colorway: "White/Black-Varsity Red", price: 180, originalPrice: 220, image: "https://images.stockx.com/images/Air-Jordan-1-Retro-High-OG-Chicago-Lost-Found.jpg", badge: "Iconic", stock: 12 },
  { id: 2, model: "Jordan 1", name: "AJ1 Bred", colorway: "Black/Red", price: 200, image: "https://images.stockx.com/images/Air-Jordan-1-Retro-High-OG-Bred-2016.jpg", badge: "Hot", stock: 8 },
  { id: 3, model: "Jordan 1", name: "AJ1 Royal Blue", colorway: "Black/Royal Blue", price: 195, image: "https://images.stockx.com/images/Air-Jordan-1-Retro-High-OG-Royal-Blue-2017.jpg", badge: "", stock: 5 },
  { id: 4, model: "Jordan 4", name: "AJ4 Bred", colorway: "Black/Cement Grey-Fire Red", price: 220, image: "https://images.stockx.com/images/Air-Jordan-4-Retro-Bred-2019.jpg", badge: "Hot", stock: 3 },
  { id: 5, model: "Jordan 11", name: "AJ11 Bred", colorway: "Black/Varsity Red-White", price: 225, image: "https://images.stockx.com/images/Air-Jordan-11-Retro-Bred-2019.jpg", badge: "Iconic", stock: 6 },
];

// Formats a Firestore Timestamp (or missing value, right after write before server confirms) into a readable string
function formatDate(ts) {
  if (!ts) return "Just now";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString(undefined, {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const MODELS = ["Jordan 1", "Jordan 2", "Jordan 3", "Jordan 4", "Jordan 5",
  "Jordan 6", "Jordan 7", "Jordan 8", "Jordan 9", "Jordan 10",
  "Jordan 11", "Jordan 12", "Jordan 13", "Jordan 14", "Jordan 18"];

const BADGES = ["", "Iconic", "Hot", "Limited", "New", "Classic", "Collab"];

const STATUS_COLORS = {
  Delivered: { bg: "rgba(74,222,128,0.1)", color: "#4ade80", border: "rgba(74,222,128,0.2)" },
  Shipped: { bg: "rgba(96,165,250,0.1)", color: "#60a5fa", border: "rgba(96,165,250,0.2)" },
  Processing: { bg: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "rgba(251,191,36,0.2)" },
  Cancelled: { bg: "rgba(230,51,41,0.1)", color: "#e63329", border: "rgba(230,51,41,0.2)" },
};

const emptyForm = {
  model: "Jordan 1", name: "", colorway: "", price: "",
  originalPrice: "", image: "", badge: "", stock: "",
};

export default function Admin({ user }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const isFirstOrderLoad = useRef(true);

  // Ask permission once for real desktop notifications (works even if tab isn't focused)
  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Real-time orders feed + purchase notifications
  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) return;
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));

      // Skip notifying for the initial batch of pre-existing orders on first load
      if (isFirstOrderLoad.current) {
        isFirstOrderLoad.current = false;
        return;
      }

      snap.docChanges().forEach((change) => {
        if (change.type === "added") {
          const o = { id: change.doc.id, ...change.doc.data() };
          const itemLabel = o.items?.length
            ? `${o.items[0].name}${o.items.length > 1 ? ` +${o.items.length - 1} more` : ""}`
            : "a shoe";
          showToast(`🛒 New order from ${o.userName}! $${(o.total || 0).toFixed(2)}`);
          setNotifications((prev) => [
            { id: o.id, text: `${o.userName} purchased ${itemLabel}`, amount: o.total || 0, time: new Date() },
            ...prev,
          ]);
          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            new Notification("New Order! 🛒", {
              body: `${o.userName} just placed an order — $${(o.total || 0).toFixed(2)}`,
            });
          }
        }
      });
    });
    return () => unsub();
  }, [user]);

  // Real-time users/customers feed
  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) return;
    const q = query(collection(db, "users"), orderBy("lastLogin", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setCustomers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  const updateOrderStatus = async (order, status) => {
    try {
      await updateDoc(doc(db, "orders", order.id), { status });
      showToast(`Order marked ${status}.`);

      // Notify the customer when their order is delivered or cancelled
      if (status === "Delivered" || status === "Cancelled") {
        const itemLabel = order.items?.length
          ? `${order.items[0].name}${order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}`
          : "your shoe";
        await addDoc(collection(db, "notifications"), {
          userId: order.userId,
          orderId: order.id,
          status,
          message: status === "Delivered"
            ? `Your order (${itemLabel}) has been delivered! 🎉`
            : `Your order (${itemLabel}) was cancelled.`,
          read: false,
          createdAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to update order status.", "error");
    }
  };

  // Access guard
  if (!user) {
    return (
      <div style={{
        paddingTop: 90, minHeight: "100vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 16,
      }}>
        <div style={{ fontSize: 64 }}>🔒</div>
        <h2 style={{ fontSize: 24, fontWeight: 900 }}>Access Denied</h2>
        <p style={{ color: "var(--text-muted)" }}>Please sign in to access the admin panel.</p>
        <button className="btn-red" onClick={() => navigate("/")} style={{ padding: "12px 32px" }}>
          Go Home
        </button>
      </div>
    );
  }

  if (user.email !== ADMIN_EMAIL) {
    return (
      <div style={{
        paddingTop: 90, minHeight: "100vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 16,
      }}>
        <div style={{ fontSize: 64 }}>⛔</div>
        <h2 style={{ fontSize: 24, fontWeight: 900 }}>Admins Only</h2>
        <p style={{ color: "var(--text-muted)" }}>You don't have permission to view this page.</p>
        <button className="btn-red" onClick={() => navigate("/")} style={{ padding: "12px 32px" }}>
          Go Home
        </button>
      </div>
    );
  }

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openAdd = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditingProduct(p);
    setForm({
      model: p.model, name: p.name, colorway: p.colorway,
      price: p.price, originalPrice: p.originalPrice || "",
      image: p.image, badge: p.badge || "", stock: p.stock,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name || !form.price || !form.colorway) {
      showToast("Please fill in all required fields.", "error");
      return;
    }
    if (editingProduct) {
      setProducts((prev) => prev.map((p) =>
        p.id === editingProduct.id
          ? { ...p, ...form, price: Number(form.price), originalPrice: form.originalPrice ? Number(form.originalPrice) : null, stock: Number(form.stock) }
          : p
      ));
      showToast("Product updated successfully.");
    } else {
      const newProduct = {
        ...form,
        id: Date.now(),
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        stock: Number(form.stock) || 0,
      };
      setProducts((prev) => [...prev, newProduct]);
      showToast("Product added successfully.");
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirm(null);
    showToast("Product deleted.");
  };

  // Stats
  const totalRevenue = orders.reduce((a, o) => a + o.total, 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const lowStock = products.filter((p) => p.stock <= 3).length;

  const inputStyle = {
    background: "var(--bg2)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: "10px 14px",
    color: "white",
    fontSize: 13,
    outline: "none",
    width: "100%",
  };

  return (
    <div style={{ paddingTop: 90, minHeight: "100vh" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 100, right: 24, zIndex: 9999,
          background: toast.type === "error" ? "rgba(230,51,41,0.95)" : "rgba(74,222,128,0.95)",
          color: "white", borderRadius: 12, padding: "12px 20px",
          fontSize: 13, fontWeight: 600,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          animation: "slideIn 0.3s ease",
        }}>
          {toast.type === "error" ? "❌" : "✅"} {toast.msg}
        </div>
      )}

      <div style={{ padding: "40px 60px 80px", maxWidth: 1400, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "4px", color: "var(--red)", marginBottom: 8, textTransform: "uppercase" }}>
            Admin Panel
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900, letterSpacing: "-1px" }}>
              Dashboard
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>

              {/* Notification bell */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowNotifDropdown((v) => !v)}
                  style={{
                    background: "var(--surface)", border: "1px solid var(--border)",
                    borderRadius: "50%", width: 44, height: 44, cursor: "pointer",
                    fontSize: 18, position: "relative",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  🔔
                  {notifications.length > 0 && (
                    <span style={{
                      position: "absolute", top: -2, right: -2,
                      background: "var(--red)", color: "white",
                      borderRadius: "50%", minWidth: 18, height: 18,
                      fontSize: 10, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      padding: "0 4px",
                    }}>
                      {notifications.length > 9 ? "9+" : notifications.length}
                    </span>
                  )}
                </button>

                {showNotifDropdown && (
                  <>
                    <div onClick={() => setShowNotifDropdown(false)} style={{ position: "fixed", inset: 0, zIndex: 1050 }} />
                    <div className="dropdown-menu" style={{ width: 320, maxHeight: 360, overflowY: "auto" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px 10px", borderBottom: "1px solid var(--border)", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>Notifications</span>
                        {notifications.length > 0 && (
                          <button
                            onClick={() => setNotifications([])}
                            style={{ background: "none", border: "none", color: "var(--red)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                      {notifications.length === 0 ? (
                        <div style={{ padding: "20px 10px", fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>
                          No new notifications
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id + n.time} style={{ padding: "10px 10px", borderRadius: 10 }}>
                            <div style={{ fontSize: 12, fontWeight: 600 }}>{n.text}</div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                              ${n.amount.toFixed(2)} · {n.time.toLocaleTimeString()}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Profile (static, no dropdown per request) */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <img src={user.photoURL} alt="avatar" style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid var(--red)" }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{user.displayName}</div>
                  <div style={{ fontSize: 11, color: "var(--red)" }}>Administrator</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 20,
          marginBottom: 40,
        }}>
          {[
            { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: "💰", color: "#4ade80" },
            { label: "Total Orders", value: totalOrders, icon: "📦", color: "#60a5fa" },
            { label: "Total Products", value: totalProducts, icon: "👟", color: "var(--red)" },
            { label: "Low Stock", value: lowStock, icon: "⚠️", color: "#fbbf24" },
          ].map((s) => (
            <div key={s.label} style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: 24,
            }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{s.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: s.color, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 32, background: "var(--surface)", borderRadius: 12, padding: 4, width: "fit-content" }}>
          {["products", "orders", "customers"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "10px 24px",
                borderRadius: 10,
                border: "none",
                background: tab === t ? "var(--red)" : "transparent",
                color: tab === t ? "white" : "var(--text-muted)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                textTransform: "capitalize",
                transition: "all 0.2s",
              }}
            >
              {t === "products" ? `👟 Products` : t === "orders" ? `📦 Orders` : `👥 Customers`}
            </button>
          ))}
        </div>

        {/* PRODUCTS TAB */}
        {tab === "products" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{products.length} Products</div>
              <button className="btn-red" onClick={openAdd} style={{ padding: "10px 24px", fontSize: 13 }}>
                + Add Product
              </button>
            </div>

            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              overflow: "hidden",
            }}>
              {/* Table header */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "60px 1fr 1fr 80px 80px 80px 100px",
                padding: "14px 20px",
                borderBottom: "1px solid var(--border)",
                fontSize: 11,
                fontWeight: 700,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}>
                <span>Image</span>
                <span>Name</span>
                <span>Model</span>
                <span>Price</span>
                <span>Stock</span>
                <span>Badge</span>
                <span style={{ textAlign: "right" }}>Actions</span>
              </div>

              {products.map((p, i) => (
                <div
                  key={p.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "60px 1fr 1fr 80px 80px 80px 100px",
                    padding: "16px 20px",
                    alignItems: "center",
                    borderBottom: i < products.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <img src={p.image} alt={p.name} style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 8 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.colorway}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.model}</div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>${p.price}</div>
                  <div style={{
                    fontSize: 13, fontWeight: 700,
                    color: p.stock <= 3 ? "#fbbf24" : "#4ade80",
                  }}>
                    {p.stock}
                  </div>
                  <div>
                    {p.badge ? (
                      <span style={{
                        fontSize: 10, fontWeight: 700,
                        background: "rgba(230,51,41,0.15)",
                        color: "var(--red)",
                        border: "1px solid rgba(230,51,41,0.3)",
                        borderRadius: 99,
                        padding: "3px 8px",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                      }}>
                        {p.badge}
                      </span>
                    ) : <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>—</span>}
                  </div>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button
                      onClick={() => openEdit(p)}
                      style={{
                        padding: "6px 14px", borderRadius: 8, border: "1px solid var(--border)",
                        background: "transparent", color: "rgba(255,255,255,0.6)", fontSize: 12,
                        cursor: "pointer", transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "white"; e.currentTarget.style.color = "white"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(p.id)}
                      style={{
                        padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(230,51,41,0.2)",
                        background: "transparent", color: "var(--red)", fontSize: 12,
                        cursor: "pointer", transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(230,51,41,0.1)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {tab === "orders" && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
              {orders.length} Orders
              <span style={{ fontSize: 11, fontWeight: 600, color: "#4ade80", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 99, padding: "3px 10px" }}>
                ● Live
              </span>
            </div>

            {orders.length === 0 ? (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
                No orders yet. They'll appear here in real time as customers check out.
              </div>
            ) : (
              <div style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                overflow: "hidden",
              }}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 1fr 100px 120px",
                  padding: "14px 20px",
                  borderBottom: "1px solid var(--border)",
                  fontSize: 11, fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase", letterSpacing: "1px",
                }}>
                  <span>Customer</span>
                  <span>Items</span>
                  <span>Payment</span>
                  <span>Date</span>
                  <span>Total</span>
                  <span>Status</span>
                </div>

                {orders.map((o, i) => {
                  const sc = STATUS_COLORS[o.status] || STATUS_COLORS.Processing;
                  return (
                    <div
                      key={o.id}
                      onClick={() => setViewingOrder(o)}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr 1fr 100px 120px",
                        padding: "16px 20px",
                        alignItems: "center",
                        cursor: "pointer",
                        borderBottom: i < orders.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {o.userPhoto && <img src={o.userPhoto} alt="" style={{ width: 28, height: 28, borderRadius: "50%" }} />}
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{o.userName}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{o.userEmail}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {o.items?.map((it) => it.name).join(", ")}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{o.paymentMethod}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{formatDate(o.createdAt)}</div>
                      <div style={{ fontSize: 14, fontWeight: 800 }}>${(o.total || 0).toFixed(2)}</div>
                      <span style={{
                        fontSize: 11, fontWeight: 700,
                        background: sc.bg, color: sc.color,
                        border: `1px solid ${sc.border}`,
                        borderRadius: 99, padding: "4px 10px",
                        textTransform: "uppercase", letterSpacing: "1px",
                        width: "fit-content",
                      }}>
                        {o.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* CUSTOMERS TAB */}
        {tab === "customers" && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
              {customers.length} Customers
              <span style={{ fontSize: 11, fontWeight: 600, color: "#4ade80", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 99, padding: "3px 10px" }}>
                ● Live
              </span>
            </div>

            {customers.length === 0 ? (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
                No one has signed in yet.
              </div>
            ) : (
              <div style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                overflow: "hidden",
              }}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 100px",
                  padding: "14px 20px",
                  borderBottom: "1px solid var(--border)",
                  fontSize: 11, fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase", letterSpacing: "1px",
                }}>
                  <span>Customer</span>
                  <span>Email</span>
                  <span>Last Login</span>
                  <span>Orders</span>
                </div>

                {customers.map((c, i) => {
                  const orderCount = orders.filter((o) => o.userId === c.uid).length;
                  return (
                    <div
                      key={c.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr 100px",
                        padding: "16px 20px",
                        alignItems: "center",
                        borderBottom: i < customers.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {c.photo && <img src={c.photo} alt="" style={{ width: 32, height: 32, borderRadius: "50%" }} />}
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name || "—"}</div>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.email}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{formatDate(c.lastLogin)}</div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{orderCount}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 2000,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20,
        }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            padding: 36,
            width: "100%",
            maxWidth: 560,
            maxHeight: "90vh",
            overflowY: "auto",
          }}>
            <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 28 }}>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Model */}
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 6 }}>Model *</label>
                <select value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
                  {MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {/* Name */}
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 6 }}>Name *</label>
                <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. AJ1 Chicago" />
              </div>

              {/* Colorway */}
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 6 }}>Colorway *</label>
                <input style={inputStyle} value={form.colorway} onChange={(e) => setForm({ ...form, colorway: e.target.value })} placeholder="e.g. White/Black-Varsity Red" />
              </div>

              {/* Price row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 6 }}>Price ($) *</label>
                  <input style={inputStyle} type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="180" />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 6 }}>Original Price ($)</label>
                  <input style={inputStyle} type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} placeholder="220" />
                </div>
              </div>

              {/* Stock + Badge */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 6 }}>Stock</label>
                  <input style={inputStyle} type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="10" />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 6 }}>Badge</label>
                  <select value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
                    {BADGES.map((b) => <option key={b} value={b}>{b || "None"}</option>)}
                  </select>
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 6 }}>Image URL</label>
                <input style={inputStyle} value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
                {form.image && (
                  <img src={form.image} alt="preview" style={{ marginTop: 10, width: "100%", height: 140, objectFit: "cover", borderRadius: 10, border: "1px solid var(--border)" }} />
                )}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
              <button className="btn-red" onClick={handleSave} style={{ flex: 1, padding: "12px", fontSize: 14 }}>
                {editingProduct ? "Save Changes" : "Add Product"}
              </button>
              <button className="btn-ghost" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "12px", fontSize: 14 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteConfirm && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 2000,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            background: "var(--surface)",
            border: "1px solid rgba(230,51,41,0.3)",
            borderRadius: 20, padding: 36, maxWidth: 400, width: "90%", textAlign: "center",
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🗑️</div>
            <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 10 }}>Delete Product?</h3>
            <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 28 }}>
              This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn-red" onClick={() => handleDelete(deleteConfirm)} style={{ flex: 1, padding: "12px" }}>
                Delete
              </button>
              <button className="btn-ghost" onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: "12px" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER DETAIL MODAL */}
      {viewingOrder && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 2000,
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setViewingOrder(null); }}
        >
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            padding: 36,
            width: "100%",
            maxWidth: 620,
            maxHeight: "90vh",
            overflowY: "auto",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 6 }}>Order Details</h3>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{formatDate(viewingOrder.createdAt)}</div>
              </div>
              <select
                value={viewingOrder.status}
                onChange={(e) => {
                  updateOrderStatus(viewingOrder, e.target.value);
                  setViewingOrder({ ...viewingOrder, status: e.target.value });
                }}
                style={{
                  ...inputStyle, width: "auto", cursor: "pointer",
                  background: (STATUS_COLORS[viewingOrder.status] || STATUS_COLORS.Processing).bg,
                  color: (STATUS_COLORS[viewingOrder.status] || STATUS_COLORS.Processing).color,
                  border: `1px solid ${(STATUS_COLORS[viewingOrder.status] || STATUS_COLORS.Processing).border}`,
                  fontWeight: 700,
                }}
              >
                {Object.keys(STATUS_COLORS).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Customer */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, padding: 16, background: "var(--bg2)", borderRadius: 12 }}>
              {viewingOrder.userPhoto && <img src={viewingOrder.userPhoto} alt="" style={{ width: 44, height: 44, borderRadius: "50%" }} />}
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{viewingOrder.userName}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{viewingOrder.userEmail}</div>
              </div>
            </div>

            {/* Shipping + Payment */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              <div>
                <div style={labelStyleAdmin}>Shipping Address</div>
                <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                  {viewingOrder.shippingAddress?.fullName}<br />
                  {viewingOrder.shippingAddress?.phone}<br />
                  {viewingOrder.shippingAddress?.address}<br />
                  {viewingOrder.shippingAddress?.city}, {viewingOrder.shippingAddress?.zip}
                </div>
              </div>
              <div>
                <div style={labelStyleAdmin}>Payment Method</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{viewingOrder.paymentMethod}</div>
              </div>
            </div>

            {/* Items */}
            <div style={labelStyleAdmin}>Items ({viewingOrder.items?.length || 0})</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {viewingOrder.items?.map((it, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: 14, background: "var(--bg2)", borderRadius: 12, padding: 12 }}>
                  <img src={it.image} alt={it.name} style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{it.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{it.model} · Size US {it.size} · Qty {it.qty}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>${(it.price * it.qty).toFixed(2)}</div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-muted)" }}>
                <span>Subtotal</span><span>${(viewingOrder.subtotal || 0).toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-muted)" }}>
                <span>Tax</span><span>${(viewingOrder.tax || 0).toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-muted)" }}>
                <span>Shipping</span><span>{viewingOrder.shipping ? `$${viewingOrder.shipping.toFixed(2)}` : "FREE"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 900 }}>
                <span>Total</span><span style={{ color: "var(--red)" }}>${(viewingOrder.total || 0).toFixed(2)}</span>
              </div>
            </div>

            <button
              className="btn-ghost"
              onClick={() => setViewingOrder(null)}
              style={{ width: "100%", padding: "12px", fontSize: 14, marginTop: 24 }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyleAdmin = {
  fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase",
  letterSpacing: "1px", marginBottom: 8, fontWeight: 700,
};
