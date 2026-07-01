import { useState } from "react";
import ProductCard from "../components/ProductCard";

// AJ1s
import aj1Bred from "../assets/products/AJ1 bred.jpg";
import aj1RoyalBlue from "../assets/products/AJ1 Royal blue.jpg";
import aj1Shadow from "../assets/products/AJ1 shadow.jpg";
import aj1SatinBlackToe from "../assets/products/AJ1 Satin Black Toe.jpg";
// AJ2s
import aj2WhiteRed from "../assets/products/AJ1 white red.jpg";
import aj2JustDonBeach from "../assets/products/AJ2 just don beach.jpg";
// AJ3s
import aj3BlackCement from "../assets/products/AJ3 black cement.jpg";
import aj3WhiteCement from "../assets/products/AJ3 white cement.jpg";
// AJ4s
import aj4Bred from "../assets/products/AJ4 bred.jpg";
import aj4WhiteCement from "../assets/products/Nike Air Jordan 4 Retro 'White Cement'.jpg";
import aj4MilitaryBlue from "../assets/products/AJ4 military blue.jpg";
// AJ5s
import aj5FireRed from "../assets/products/Jordan Shoes _ White And Red High-Top Sneakers _ Color_ Red_White _ Size_ 11.jpg";
import aj5Metallic from "../assets/products/AJ5 Metallic.jpg";
// AJ6s
import aj6Carmine from "../assets/products/AJ6 Carmine.jpg";
import aj6BlackInfrared from "../assets/products/AJ6  Black Infrared.jpg";
// AJ7s
import aj7Hare from "../assets/products/AJ7 Hare.jpg";
import aj7Bordeaux from "../assets/products/The 6 Sneakers Michael Jordan Wore When He Became a Champion.jpg";
// AJ8s
import aj8Bred from "../assets/products/Jordan 8 'Playoffs' US 7.jpg";
import aj8Aqua from "../assets/products/Nike Air Jordan 8 Retro 'Aqua'.jpg";
// AJ9s
import aj9Bred from "../assets/products/AJ9 bred.jpg";
import aj9SpaceJam from "../assets/products/Jordan Air Retro Space Jam Sneakers - Black _ Editorialist.jpg";
// AJ10
import aj10Chicago from "../assets/products/Jordan 9 OG Chicago.jpg";
// AJ11s
import aj11Bred from "../assets/products/AJ11 Bred.jpg";
import aj11Concord from "../assets/products/Jordan 11 Retro Concord).jpg";
import aj11SpaceJam from "../assets/products/AJ11 space jam.jpg";
// AJ12
import aj12FluGame from "../assets/products/AJ12  Flu game.jpg";
// AJ13
import aj13Bred from "../assets/products/AJ13 Bred.jpg";
// AJ14
import aj14LastShot from "../assets/products/Jordan 14 Retro Last Shot.jpg";
// AJ18
import aj18 from "../assets/products/Air Jordan 18.jpg";

const ALL_PRODUCTS = [
  // JORDAN 1s
  { id: 1, model: "Jordan 1", name: "AJ1 Chicago", colorway: "White/Black-Varsity Red", price: 180, originalPrice: 220, image: "https://images.stockx.com/360/Air-Jordan-1-Retro-High-OG-Chicago-Reimagined/Images/Air-Jordan-1-Retro-High-OG-Chicago-Reimagined/Lv2/img01.jpg?w=576&q=60&dpr=1&updated_at=1665692308&h=384", badge: "Limited" },
  { id: 2, model: "Jordan 1", name: "AJ1 Bred", colorway: "Black/Red", price: 200, image: aj1Bred, badge: "Limited" },
  { id: 3, model: "Jordan 1", name: "AJ1 Royal Blue", colorway: "Black/Royal Blue", price: 195, image: aj1RoyalBlue, badge: "Limited" },
  { id: 4, model: "Jordan 1", name: "AJ1 Shadow", colorway: "Black/Medium Grey", price: 175, image: aj1Shadow, badge: "Limited" },
  { id: 5, model: "Jordan 1", name: "AJ1 Satin Black Toe", colorway: "Black/White-Varsity Red", price: 210, image: aj1SatinBlackToe, badge: "Limited" },

  // JORDAN 2s
  { id: 6, model: "Jordan 2", name: "AJ2 White Red", colorway: "White/Varsity Red", price: 165, image: aj2WhiteRed },
  { id: 7, model: "Jordan 2", name: "AJ2 Just Don Beach", colorway: "Beach/Metallic Gold", price: 350, image: aj2JustDonBeach, badge: "Collab" },

  // JORDAN 3s
  { id: 8, model: "Jordan 3", name: "AJ3 Black Cement", colorway: "Black/Cement Grey", price: 190, image: aj3BlackCement, badge: "Classic" },
  { id: 9, model: "Jordan 3", name: "AJ3 White Cement", colorway: "White/Cement Grey", price: 185, image: aj3WhiteCement },

  // JORDAN 4s
  { id: 10, model: "Jordan 4", name: "AJ4 Bred", colorway: "Black/Cement Grey-Fire Red", price: 220, image: aj4Bred, badge: "Hot" },
  { id: 11, model: "Jordan 4", name: "AJ4 White Cement", colorway: "White/Cement Grey", price: 215, image: aj4WhiteCement },
  { id: 12, model: "Jordan 4", name: "AJ4 Military Blue", colorway: "White/Military Blue", price: 230, image: aj4MilitaryBlue, badge: "New" },

  // JORDAN 5s
  { id: 13, model: "Jordan 5", name: "AJ5 Fire Red", colorway: "White/Fire Red-Black", price: 195, image: aj5FireRed },
  { id: 14, model: "Jordan 5", name: "AJ5 Metallic", colorway: "Black/Metallic Silver", price: 200, image: aj5Metallic, badge: "Classic" },

  // JORDAN 6s
  { id: 15, model: "Jordan 6", name: "AJ6 Carmine", colorway: "White/Carmine-Black", price: 185, image: aj6Carmine },
  { id: 16, model: "Jordan 6", name: "AJ6 Black Infrared", colorway: "Black/Infrared", price: 200, image: aj6BlackInfrared, badge: "Iconic" },

  // JORDAN 7s
  { id: 17, model: "Jordan 7", name: "AJ7 Hare", colorway: "White/Light Silver", price: 190, image: aj7Hare },
  { id: 18, model: "Jordan 7", name: "AJ7 Bordeaux", colorway: "Dark Charcoal/Bordeaux", price: 185, image: aj7Bordeaux },

  // JORDAN 8s
  { id: 19, model: "Jordan 8", name: "AJ8 Bred", colorway: "Black/True Red-White", price: 195, image: aj8Bred, badge: "New" },
  { id: 20, model: "Jordan 8", name: "AJ8 Aqua", colorway: "Black/Bright Concord-Aqua Tone", price: 180, image: aj8Aqua },

  // JORDAN 9s
  { id: 21, model: "Jordan 9", name: "AJ9 Bred", colorway: "Black/Varsity Red", price: 175, image: aj9Bred },
  { id: 22, model: "Jordan 9", name: "AJ9 Space Jam", colorway: "Black/True Red-White", price: 210, image: aj9SpaceJam, badge: "Limited" },

  // JORDAN 10s
  { id: 23, model: "Jordan 10", name: "AJ10 Chicago", colorway: "White/Black-Light Steel Grey", price: 185, image: aj10Chicago },

  // JORDAN 11s
  { id: 24, model: "Jordan 11", name: "AJ11 Bred", colorway: "Black/Varsity Red-White", price: 225, image: aj11Bred, badge: "Iconic" },
  { id: 25, model: "Jordan 11", name: "AJ11 Concord", colorway: "White/Black-Dark Concord", price: 220, image: aj11Concord },
  { id: 26, model: "Jordan 11", name: "AJ11 Space Jam", colorway: "Black/Dark Concord-White", price: 235, image: aj11SpaceJam, badge: "Hot" },

  // JORDAN 12s
  { id: 27, model: "Jordan 12", name: "AJ12 Flu Game", colorway: "Black/Varsity Red", price: 200, image: aj12FluGame, badge: "Iconic" },

  // JORDAN 13s
  { id: 28, model: "Jordan 13", name: "AJ13 Bred", colorway: "Black/True Red-White", price: 195, image: aj13Bred },

  // JORDAN 14s
  { id: 29, model: "Jordan 14", name: "AJ14 Last Shot", colorway: "Black/Varsity Red-White", price: 190, image: aj14LastShot, badge: "Classic" },

  // JORDAN 18s
  { id: 30, model: "Jordan 18", name: "AJ18 OG Black Sport Royal", colorway: "Black/Sport Royal", price: 185, image: aj18 },
];

const MODELS = ["All", "Jordan 1", "Jordan 2", "Jordan 3", "Jordan 4", "Jordan 5",
  "Jordan 6", "Jordan 7", "Jordan 8", "Jordan 9", "Jordan 10",
  "Jordan 11", "Jordan 12", "Jordan 13", "Jordan 14", "Jordan 18"];

export default function Shop({ user, addToCart }) {
  const [activeModel, setActiveModel] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState(500);

  const filtered = ALL_PRODUCTS
    .filter((p) => activeModel === "All" || p.model === activeModel)
    .filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.colorway.toLowerCase().includes(search.toLowerCase())
    )
    .filter((p) => p.price <= maxPrice)
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div style={{ paddingTop: 90, minHeight: "100vh" }}>
      <div style={{ padding: "40px 60px 0", maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "4px", color: "#e63329", marginBottom: 8, textTransform: "uppercase" }}>
          Our Collection
        </div>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, letterSpacing: "-1px", marginBottom: 8 }}>
          Shop All Jordans
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15 }}>
          {filtered.length} pairs available
        </p>
      </div>

      <div style={{ padding: "32px 60px", maxWidth: 1400, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <input
            placeholder="Search by name or colorway..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 240, background: "#111318", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 18px", color: "white", fontSize: 14, outline: "none" }}
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ background: "#111318", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 18px", color: "white", fontSize: 14, outline: "none", cursor: "pointer" }}
          >
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name: A-Z</option>
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap" }}>
            Max Price: <span style={{ color: "white", fontWeight: 700 }}>${maxPrice}</span>
          </span>
          <input type="range" min={100} max={500} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} style={{ flex: 1, accentColor: "#e63329" }} />
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {MODELS.map((m) => (
            <button key={m} onClick={() => setActiveModel(m)} style={{ padding: "8px 16px", borderRadius: 99, border: activeModel === m ? "1px solid #e63329" : "1px solid rgba(255,255,255,0.1)", background: activeModel === m ? "rgba(230,51,41,0.15)" : "transparent", color: activeModel === m ? "#e63329" : "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
              {m}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 60px 80px", maxWidth: 1400, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 }}>
        {filtered.length === 0 ? (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 80, color: "rgba(255,255,255,0.3)", fontSize: 18 }}>
            No shoes found 👟
          </div>
        ) : (
          filtered.map((product) => (
            <ProductCard key={product.id} product={product} addToCart={addToCart} user={user} />
          ))
        )}
      </div>
    </div>
  );
}
