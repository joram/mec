import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import ItemDetailPage from "./pages/ItemDetailPage";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/LoginPage";
import { useAuthStore } from "./store/useAuthStore";
import { useCartStore } from "./store/useCartStore";

export default function App() {
  const { fetchMe, user } = useAuthStore();
  const { fetchCart } = useCartStore();

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    if (user) fetchCart();
  }, [user]);

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/items/:id" element={<ItemDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </Box>
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 4,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          mt: "auto",
        }}
      >
        <Box sx={{ maxWidth: 1200, mx: "auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Box component="span" sx={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "0.04em" }}>
              MEC
            </Box>
            <Box sx={{ fontSize: "0.8rem", opacity: 0.75, mt: 0.5 }}>
              Mountain Equipment Company
            </Box>
          </Box>
          <Box sx={{ fontSize: "0.8rem", opacity: 0.7 }}>
            © {new Date().getFullYear()} Mountain Equipment Company
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
