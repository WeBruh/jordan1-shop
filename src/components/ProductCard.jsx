import { useState } from "react";

export default function ProductCard({ product, addToCart, user }) {
  const [selectedSize, setSelectedSize] = useState(null);
  const [wishlist, setWishlist] = useState(false);
  const [added, setAdded] = useState(false);

  const sizes = [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12];

  const handleAddToCart = () => {
    if (!user) return alert("Please sign in to add to cart!");
    if (!selectedSize) return alert("Please select a size!");
    addToCart(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="product-card" style={{ display: "flex", flexDirection: "column" }}>
      
      {/* Image */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <img
          src={product.image}
          alt={product.name}
          style={{
            width: "100%",
            height: 220,
            objectFit: "cover",
            transition: "transform 0.4s ease",
          }}
          onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
          onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
        />

        {/* Wishlist button */}
        <button
          onClick={() => setWishlist(!wishlist)}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "rgba(0,0,0,0.6)",
            border: "none",
            borderRadius: "50%",
            width: 36,
            height: 36,
            cursor: "pointer",
            fontSize: 16,
            backdropFilter: "blur(10px)",
          }}
        >
          {wishlist ? "❤️" : "🤍"}
        </button>

        {/* Badge */}
        {product.badge && (
          <div style={{
            position: "absolute",
            top: 12,
            left: 12,
            background: "#e63329",
            color: "white",
            fontSize: 10,
            fontWeight: 700,
            padding: "4px 10px",
            borderRadius: 99,
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}>
            {product.badge}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "18px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        
        <div>
          <div style={{ fontSize: 11, color: "#e63329", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 4 }}>
            {product.model}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{product.name}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{product.colorway}</div>
        </div>

        {/* Sizes */}
        <div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>SELECT SIZE</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSize(s)}
                style={{
                  width: 38,
                  height: 28,
                  borderRadius: 6,
                  border: selectedSize === s ? "1px solid #e63329" : "1px solid rgba(255,255,255,0.1)",
                  background: selectedSize === s ? "rgba(230,51,41,0.15)" : "transparent",
                  color: selectedSize === s ? "#e63329" : "rgba(255,255,255,0.6)",
                  fontSize: 11,
                  cursor: "pointer",
                  fontWeight: 600,
                  transition: "all 0.2s",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Price + Add to cart */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "white" }}>${product.price}</div>
            {product.originalPrice && (
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "line-through" }}>
                ${product.originalPrice}
              </div>
            )}
          </div>

          <button
            className="btn-red"
            onClick={handleAddToCart}
            style={{ padding: "10px 18px", fontSize: 13 }}
          >
            {added ? "Added ✓" : "Add to Cart"}
          </button>
        </div>

      </div>
    </div>
  );
}