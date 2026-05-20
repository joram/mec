import React, { useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Divider,
  IconButton,
  Grid,
  Paper,
  CircularProgress,
  Avatar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";
import { useAuthStore } from "../store/useAuthStore";
import { itemsApi } from "../api/client";

export default function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { cart, loading, fetchCart, updateItem, removeItem, clearCart } = useCartStore();

  useEffect(() => {
    if (user) fetchCart();
  }, [user]);

  if (!user) {
    return (
      <Box sx={{ textAlign: "center", py: 10 }}>
        <ShoppingBagOutlinedIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
        <Typography variant="h5" gutterBottom>Sign in to view your cart</Typography>
        <Button variant="contained" onClick={() => navigate("/login")} sx={{ mt: 1 }}>
          Sign In
        </Button>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 10 }}>
        <ShoppingBagOutlinedIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
        <Typography variant="h5" gutterBottom>Your cart is empty</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Discover great gear for your next adventure.
        </Typography>
        <Button variant="contained" onClick={() => navigate("/")} sx={{ mt: 2 }}>
          Shop Now
        </Button>
      </Box>
    );
  }

  const subtotal = cart.items.reduce((sum, ci) => {
    return sum + (ci.item.price ?? 0) * ci.quantity;
  }, 0);

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Shopping Cart
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {cart.total_items} item{cart.total_items !== 1 ? "s" : ""}
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Cart items */}
        <Grid item xs={12} md={8}>
          <Paper variant="outlined" sx={{ borderRadius: 2 }}>
            {cart.items.map((ci, idx) => {
              const imageUrl = ci.item.primary_image_id
                ? itemsApi.imageUrl(ci.item.id, ci.item.primary_image_id)
                : null;
              return (
                <React.Fragment key={ci.id}>
                  <Box sx={{ display: "flex", gap: 2, p: 2, alignItems: "flex-start" }}>
                    <Box
                      onClick={() => navigate(`/items/${ci.item.id}`)}
                      sx={{
                        width: 80,
                        height: 80,
                        flexShrink: 0,
                        bgcolor: "#f5f5f5",
                        borderRadius: 1,
                        overflow: "hidden",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {imageUrl ? (
                        <img src={imageUrl} alt={ci.item.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      ) : (
                        <Typography fontSize="1.8rem">🏕️</Typography>
                      )}
                    </Box>

                    <Box sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="body1"
                        fontWeight={600}
                        sx={{ cursor: "pointer", "&:hover": { color: "primary.main" } }}
                        onClick={() => navigate(`/items/${ci.item.id}`)}
                      >
                        {ci.item.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        SKU: {ci.item.product_code}
                      </Typography>

                      <Box sx={{ display: "flex", alignItems: "center", mt: 1.5, gap: 2 }}>
                        {/* Quantity */}
                        <Box sx={{ display: "flex", alignItems: "center", border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => updateItem(ci.id, ci.quantity - 1)}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <Typography sx={{ px: 1.5, minWidth: 28, textAlign: "center" }}>
                            {ci.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => updateItem(ci.id, ci.quantity + 1)}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Box>

                        <IconButton
                          size="small"
                          color="default"
                          onClick={() => removeItem(ci.id)}
                          sx={{ color: "text.secondary" }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>

                        <Typography variant="body1" fontWeight={700} sx={{ ml: "auto" }}>
                          {ci.item.price != null
                            ? `$${(ci.item.price * ci.quantity).toFixed(2)}`
                            : "—"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  {idx < cart.items.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </Paper>

          <Button
            variant="text"
            color="error"
            size="small"
            onClick={clearCart}
            sx={{ mt: 1 }}
          >
            Clear cart
          </Button>
        </Grid>

        {/* Order summary */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Order Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Subtotal</Typography>
              <Typography variant="body2">${subtotal.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Shipping</Typography>
              <Typography variant="body2" color="success.main">Free</Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
              <Typography fontWeight={700}>Total</Typography>
              <Typography fontWeight={700} fontSize="1.2rem">${subtotal.toFixed(2)}</Typography>
            </Box>

            <Button variant="contained" fullWidth size="large" sx={{ py: 1.5 }}>
              Proceed to Checkout
            </Button>
            <Button
              variant="text"
              fullWidth
              onClick={() => navigate("/")}
              sx={{ mt: 1 }}
            >
              Continue Shopping
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
