import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Admin from "./pages/Admin";

function App() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      // Save/update a record for every user who logs in, real-time visible in Admin
      if (u) {
        try {
          await setDoc(
            doc(db, "users", u.uid),
            {
              uid: u.uid,
              name: u.displayName || "",
              email: u.email || "",
              photo: u.photoURL || "",
              lastLogin: serverTimestamp(),
            },
            { merge: true }
          );
        } catch (err) {
          console.error("Failed to save user record:", err);
        }
      }
    });
    return () => unsub();
  }, []);

  const addToCart = (product, size) => {
    setCart((prev) => {
      const exists = prev.find(
        (i) => i.id === product.id && i.size === size
      );
      if (exists) {
        return prev.map((i) =>
          i.id === product.id && i.size === size
            ? { ...i, qty: i.qty + 1 }
            : i
        );
      }
      return [...prev, { ...product, size, qty: 1 }];
    });
  };

  const removeFromCart = (id, size) => {
    setCart((prev) => prev.filter(
      (i) => !(i.id === id && i.size === size)
    ));
  };

  const cartCount = cart.reduce((a, i) => a + i.qty, 0);

  return (
    <BrowserRouter>
      <Navbar user={user} cartCount={cartCount} />
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/shop" element={
          <Shop user={user} addToCart={addToCart} />
        } />
        <Route path="/cart" element={
          <Cart
            cart={cart}
            removeFromCart={removeFromCart}
            setCart={setCart}
            user={user}
          />
        } />
        <Route path="/admin" element={<Admin user={user} />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;