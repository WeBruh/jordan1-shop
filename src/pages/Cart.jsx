import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const PAYMENT_METHODS = ["Cash on Delivery", "GCash", "Credit/Debit Card", "PayPal"];

export default function Cart({ cart, removeFromCart, setCart, user }) {
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    paymentMethod: "Cash on Delivery",
  });

  const total = cart.reduce((a, i) => a + i.price * i.qty, 0);
  const itemCount = cart.reduce((a, i) => a + i.qty, 0);
  const shipping = total >= 200 ? 0 : 15;
  const tax = total * 0.08;
  const grandTotal = total + tax + shipping;

  const updateQty = (id, size, delta) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.id === id && i.size === size
            ? { ...i, qty: i.qty + delta }
            : i
        )
        .filter((i) => i.qty > 0)
    );
  };

  const openCheckout = () => {
    if (!user) {
      alert("Please sign in to checkout!");
      return;
    }
    setForm((f) => ({ ...f, fullName: f.fullName || user.displayName || "" }));
    setShowCheckout(true);
  };

  const handlePlaceOrder = async () => {
    if (!form.fullName || !form.phone || !form.address || !form.city || !form.zip) {
      alert("Please fill in all shipping details.");
      return;
    }
    setPlacing(true);
    try {
      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        userName: user.displayName || form.fullName,
        userEmail: user.email,
        userPhoto: user.photoURL || "",
        items: cart.map((i) => ({
          id: i.id,
          name: i.name,
          model: i.model,
          image: i.image,
          size: i.size,
          qty: i.qty,
          price: i.price,
        })),
        subtotal: total,
        tax,
        shipping,
        total: grandTotal,
        paymentMethod: form.paymentMethod,
        shippingAddress: {
          fullName: form.fullName,
          phone: form.phone,
          address: form.address,
          city: form.city,
          zip: form.zip,
        },
        status: "Processing",
        createdAt: serverTimestamp(),
      });
      setShowCheckout(false);
      setCart([]);
      navigate("/");
      alert(`Order placed! Total: $${grandTotal.toFixed(2)}\nThank you ${user.displayName}! 🎉`);
    } catch (err) {
      console.error("Failed to place order:", err);
      alert("Something went wrong placing your order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div style={{
        paddingTop: 90,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
      }}>
        <div style={{ fontSize: 80 }}>👟</div>
        <h2 style={{ fontSize: 28, fontWeight: 900 }}>Your cart is empty</h2>
        <p style={{ color: "rgba(255,255,255,0.5)" }}>
          Add some Jordans to get started!
        </p>
        <button
          className="btn-red"
          onClick={() => navigate("/shop")}
          style={{ padding: "14px 36px", fontSize: 15, marginTop: 8 }}
        >
          Shop Now →
        </button>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 90, minHeight: "100vh" }}>
      <div style={{
        padding: "40px 60px 80px",
        maxWidth: 1200,
        margin: "0 auto",
      }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "4px",
            color: "#e63329",
            marginBottom: 8,
            textTransform: "uppercase",
          }}>
            Your Cart
          </div>
          <h1 style={{
            fontSize: "clamp(28px, 5vw, 48px)",
            fontWeight: 900,
            letterSpacing: "-1px",
          }}>
            {itemCount} {itemCount === 1 ? "Item" : "Items"}
          </h1>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 360px",
          gap: 32,
          alignItems: "start",
        }}>

          {/* Cart Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {cart.map((item) => (
              <div
                key={`${item.id}-${item.size}`}
                style={{
                  background: "#111318",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 16,
                  padding: 20,
                  display: "flex",
                  gap: 20,
                  alignItems: "center",
                }}
              >
                {/* Image */}
                <img
                  src={item.image}
                  alt={item.name}
                  style={{
                    width: 100,
                    height: 100,
                    objectFit: "cover",
                    borderRadius: 12,
                    flexShrink: 0,
                  }}
                />

                {/* Details */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 11,
                    color: "#e63329",
                    fontWeight: 600,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    marginBottom: 4,
                  }}>
                    {item.model}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
                    Size: US {item.size}
                  </div>

                  {/* Qty controls */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button
                      onClick={() => updateQty(item.id, item.size, -1)}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        border: "1px solid rgba(255,255,255,0.15)",
                        background: "transparent",
                        color: "white",
                        fontSize: 16,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      −
                    </button>
                    <span style={{ fontSize: 15, fontWeight: 700, minWidth: 20, textAlign: "center" }}>
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, item.size, 1)}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        border: "1px solid rgba(255,255,255,0.15)",
                        background: "transparent",
                        color: "white",
                        fontSize: 16,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Price + Remove */}
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 12,
                }}>
                  <div style={{ fontSize: 20, fontWeight: 900 }}>
                    ${(item.price * item.qty).toFixed(2)}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id, item.size)}
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.4)",
                      borderRadius: 8,
                      padding: "6px 12px",
                      fontSize: 12,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#e63329";
                      e.currentTarget.style.color = "#e63329";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                      e.currentTarget.style.color = "rgba(255,255,255,0.4)";
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div style={{
            background: "#111318",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            padding: 28,
            position: "sticky",
            top: 100,
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 24 }}>
              Order Summary
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
                <span>Subtotal ({itemCount} items)</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
                <span>Shipping</span>
                <span style={{ color: "#4ade80" }}>
                  {total >= 200 ? "FREE" : "$15.00"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
                <span>Tax (8%)</span>
                <span>${(total * 0.08).toFixed(2)}</span>
              </div>

              <div style={{
                height: 1,
                background: "rgba(255,255,255,0.08)",
                margin: "4px 0",
              }} />

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 800 }}>
                <span>Total</span>
                <span style={{ color: "#e63329" }}>
                  ${(total * 1.08 + (total >= 200 ? 0 : 15)).toFixed(2)}
                </span>
              </div>
            </div>

            {total >= 200 && (
              <div style={{
                background: "rgba(74,222,128,0.1)",
                border: "1px solid rgba(74,222,128,0.2)",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 12,
                color: "#4ade80",
                marginBottom: 20,
                textAlign: "center",
              }}>
                🎉 You qualify for free shipping!
              </div>
            )}

            <button
              className="btn-red"
              onClick={openCheckout}
              style={{ width: "100%", padding: "14px", fontSize: 15, borderRadius: 12 }}
            >
              Checkout →
            </button>

            <button
              className="btn-ghost"
              onClick={() => navigate("/shop")}
              style={{ width: "100%", padding: "12px", fontSize: 14, borderRadius: 12, marginTop: 12 }}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>

      {/* CHECKOUT MODAL */}
      {showCheckout && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 2000,
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20,
          }}
          onClick={(e) => { if (e.target === e.currentTarget && !placing) setShowCheckout(false); }}
        >
          <div style={{
            background: "#111318",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 20,
            padding: 36,
            width: "100%",
            maxWidth: 480,
            maxHeight: "90vh",
            overflowY: "auto",
          }}>
            <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 6 }}>Shipping & Payment</h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>
              Total: <strong style={{ color: "#e63329" }}>${grandTotal.toFixed(2)}</strong>
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input style={inputStyle} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Juan Dela Cruz" />
              </div>
              <div>
                <label style={labelStyle}>Phone Number *</label>
                <input style={inputStyle} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="09XX XXX XXXX" />
              </div>
              <div>
                <label style={labelStyle}>Street Address *</label>
                <input style={inputStyle} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Sneaker St." />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={labelStyle}>City *</label>
                  <input style={inputStyle} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Talavera" />
                </div>
                <div>
                  <label style={labelStyle}>ZIP Code *</label>
                  <input style={inputStyle} value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} placeholder="3114" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Payment Method *</label>
                <select
                  style={{ ...inputStyle, cursor: "pointer" }}
                  value={form.paymentMethod}
                  onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                >
                  {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
              <button
                className="btn-red"
                onClick={handlePlaceOrder}
                disabled={placing}
                style={{ flex: 1, padding: "12px", fontSize: 14, opacity: placing ? 0.6 : 1 }}
              >
                {placing ? "Placing Order..." : "Place Order"}
              </button>
              <button
                className="btn-ghost"
                onClick={() => !placing && setShowCheckout(false)}
                style={{ flex: 1, padding: "12px", fontSize: 14 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = {
  fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase",
  letterSpacing: "1px", display: "block", marginBottom: 6,
};

const inputStyle = {
  background: "#0d0f12",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10,
  padding: "10px 14px",
  color: "white",
  fontSize: 13,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};