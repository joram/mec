import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
  Alert,
  Breadcrumbs,
  Link,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import { itemsApi, ItemDetail, ItemImage } from "../api/client";
import { useCartStore } from "../store/useCartStore";
import { useAuthStore } from "../store/useAuthStore";

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { user } = useAuthStore();

  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [adding, setAdding] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: "success" | "error" }>({
    open: false,
    msg: "",
    severity: "success",
  });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    itemsApi
      .get(id)
      .then((data) => {
        setItem(data);
        setSelectedImageIdx(0);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!item) return;
    setAdding(true);
    try {
      await addItem(item.id);
      setSnack({ open: true, msg: "Added to cart!", severity: "success" });
    } catch {
      setSnack({ open: true, msg: "Failed to add to cart", severity: "error" });
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!item) {
    return (
      <Box sx={{ textAlign: "center", pt: 8 }}>
        <Typography variant="h5">Product not found</Typography>
      </Box>
    );
  }

  const images = item.images.sort((a, b) => a.sort_order - b.sort_order);
  const selectedImage = images[selectedImageIdx];
  const imageUrl = selectedImage
    ? itemsApi.imageUrl(item.id, selectedImage.id)
    : null;

  const breadcrumbs = item.categories.slice(-3);

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 4 } }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }} aria-label="breadcrumb">
        <Link component={RouterLink} to="/" color="inherit" underline="hover">
          Shop
        </Link>
        {breadcrumbs.map((cat, i) => (
          <Link
            key={cat}
            component={RouterLink}
            to={`/?category=${encodeURIComponent(cat)}`}
            color={i === breadcrumbs.length - 1 ? "text.primary" : "inherit"}
            underline="hover"
          >
            {cat}
          </Link>
        ))}
      </Breadcrumbs>

      <Grid container spacing={4}>
        {/* Image gallery */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              position: "relative",
              bgcolor: "#f5f5f5",
              borderRadius: 2,
              overflow: "hidden",
              aspectRatio: "1 / 1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={item.name}
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", padding: 16 }}
              />
            ) : (
              <Typography variant="h1">🏕️</Typography>
            )}

            {images.length > 1 && (
              <>
                <IconButton
                  onClick={() => setSelectedImageIdx((i) => Math.max(0, i - 1))}
                  disabled={selectedImageIdx === 0}
                  sx={{ position: "absolute", left: 8, bgcolor: "rgba(255,255,255,0.8)" }}
                  size="small"
                >
                  <ArrowBackIosNewIcon fontSize="small" />
                </IconButton>
                <IconButton
                  onClick={() => setSelectedImageIdx((i) => Math.min(images.length - 1, i + 1))}
                  disabled={selectedImageIdx === images.length - 1}
                  sx={{ position: "absolute", right: 8, bgcolor: "rgba(255,255,255,0.8)" }}
                  size="small"
                >
                  <ArrowForwardIosIcon fontSize="small" />
                </IconButton>
              </>
            )}
          </Box>

          {/* Thumbnails */}
          {images.length > 1 && (
            <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
              {images.map((img, i) => (
                <Box
                  key={img.id}
                  onClick={() => setSelectedImageIdx(i)}
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 1,
                    overflow: "hidden",
                    border: "2px solid",
                    borderColor: i === selectedImageIdx ? "primary.main" : "divider",
                    cursor: "pointer",
                    bgcolor: "#f5f5f5",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={itemsApi.imageUrl(item.id, img.id)}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </Grid>

        {/* Product info */}
        <Grid item xs={12} md={6}>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.1em" }}>
            {item.categories.at(-1)}
          </Typography>
          <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5, mb: 1 }}>
            {item.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            SKU: {item.product_code}
          </Typography>

          <Divider sx={{ my: 2 }} />

          {item.price != null ? (
            <Typography variant="h4" color="primary.main" fontWeight={700}>
              ${item.price.toFixed(2)}
            </Typography>
          ) : (
            <Typography variant="body1" color="text.secondary">
              Price unavailable
            </Typography>
          )}

          <Button
            variant="contained"
            size="large"
            startIcon={<AddShoppingCartIcon />}
            onClick={handleAddToCart}
            disabled={adding}
            fullWidth
            sx={{ mt: 3, py: 1.5 }}
          >
            {adding ? "Adding…" : "Add to Cart"}
          </Button>

          {!user && (
            <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={1}>
              Sign in to save your cart
            </Typography>
          )}

          {/* Description */}
          {item.description && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {item.description}
              </Typography>
            </Box>
          )}

          {/* Categories */}
          {item.categories.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 2 }}>
              {item.categories.map((cat) => (
                <Chip
                  key={cat}
                  label={cat}
                  size="small"
                  variant="outlined"
                  onClick={() => navigate(`/?category=${encodeURIComponent(cat)}`)}
                />
              ))}
            </Box>
          )}

          {/* Tech specs */}
          {Object.keys(item.tech_specs).length > 0 && (
            <Accordion disableGutters elevation={0} sx={{ mt: 3, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={600}>Technical Specifications</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {Object.entries(item.tech_specs).map(([key, values]) => (
                      <tr key={key}>
                        <Box
                          component="td"
                          sx={{ py: 0.75, pr: 2, fontWeight: 600, fontSize: "0.875rem", verticalAlign: "top", width: "40%", borderBottom: "1px solid", borderColor: "divider" }}
                        >
                          {key}
                        </Box>
                        <Box
                          component="td"
                          sx={{ py: 0.75, fontSize: "0.875rem", color: "text.secondary", borderBottom: "1px solid", borderColor: "divider" }}
                        >
                          {Array.isArray(values) ? values.join(", ") : String(values)}
                        </Box>
                      </tr>
                    ))}
                  </tbody>
                </Box>
              </AccordionDetails>
            </Accordion>
          )}

          {item.source_url && (
            <Typography variant="caption" display="block" mt={2}>
              <Link href={item.source_url} target="_blank" rel="noopener" color="text.secondary">
                View on MEC.ca
              </Link>
            </Typography>
          )}
        </Grid>
      </Grid>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
