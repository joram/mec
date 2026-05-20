import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Grid,
  Chip,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";
import { useParams, useNavigate } from "react-router-dom";
import { invoicesApi, InvoiceDetail, itemsApi } from "../api/client";

const STATUS_COLORS: Record<string, "success" | "info" | "warning" | "error" | "default"> = {
  completed: "success",
  shipped: "info",
  processing: "warning",
  cancelled: "error",
};

export default function InvoicePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    invoicesApi.get(id).then(setInvoice).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}><CircularProgress /></Box>;
  }

  if (!invoice) {
    return (
      <Box sx={{ textAlign: "center", pt: 8 }}>
        <Typography variant="h5">Invoice not found</Typography>
        <Button sx={{ mt: 2 }} onClick={() => navigate("/purchases")}>Back to Purchases</Button>
      </Box>
    );
  }

  const addr = invoice.shipping_address;

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: { xs: 2, md: 4 } }}>
      {/* Top bar */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/purchases")} variant="text">
          Purchases
        </Button>
        <Button startIcon={<PrintIcon />} onClick={() => window.print()} variant="outlined" size="small">
          Print
        </Button>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
        {/* Invoice header */}
        <Box sx={{ p: 3, bgcolor: "primary.main", color: "primary.contrastText" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Box>
              <Typography variant="h5" fontWeight={800} letterSpacing="0.04em">MEC</Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>My Equipment Closet</Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="h6" fontWeight={700}>Invoice</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontFamily: "monospace" }}>
                #{invoice.id.slice(0, 8).toUpperCase()}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          {/* Meta row */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Typography variant="overline" color="text.secondary">Date</Typography>
              <Typography variant="body1" fontWeight={500}>
                {new Date(invoice.created_at).toLocaleDateString("en-CA", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="overline" color="text.secondary">Status</Typography>
              <Box>
                <Chip
                  label={invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  color={STATUS_COLORS[invoice.status] ?? "default"}
                  size="small"
                />
              </Box>
            </Grid>
            {Object.keys(addr).length > 0 && (
              <Grid item xs={12} sm={4}>
                <Typography variant="overline" color="text.secondary">Ship to</Typography>
                <Typography variant="body2">{addr.name}</Typography>
                <Typography variant="body2">{addr.line1}</Typography>
                <Typography variant="body2">{addr.city}, {addr.province} {addr.postal}</Typography>
              </Grid>
            )}
          </Grid>

          <Divider sx={{ mb: 2 }} />

          {/* Line items */}
          <Table size="small">
            <TableHead>
              <TableRow sx={{ "& th": { fontWeight: 700, color: "text.secondary", borderBottom: "2px solid", borderColor: "divider" } }}>
                <TableCell>Item</TableCell>
                <TableCell align="center">Qty</TableCell>
                <TableCell align="right">Unit Price</TableCell>
                <TableCell align="right">Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoice.line_items.map((li) => {
                const imgUrl = li.item_id && li.primary_image_id
                  ? itemsApi.imageUrl(li.item_id, li.primary_image_id)
                  : null;
                return (
                  <TableRow key={li.id} sx={{ "&:last-child td": { border: 0 } }}>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 44, height: 44, borderRadius: 1, flexShrink: 0,
                            bgcolor: "#f5f5f5", overflow: "hidden",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >
                          {imgUrl ? (
                            <img src={imgUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                          ) : (
                            <Typography fontSize="1.2rem">🏕️</Typography>
                          )}
                        </Box>
                        <Box>
                          <Typography
                            variant="body2"
                            fontWeight={500}
                            sx={{ cursor: li.item_id ? "pointer" : "default", "&:hover": li.item_id ? { color: "primary.main" } : {} }}
                            onClick={() => li.item_id && navigate(`/items/${li.item_id}`)}
                          >
                            {li.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{li.product_code}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">{li.quantity}</TableCell>
                    <TableCell align="right">${li.price.toFixed(2)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      ${(li.price * li.quantity).toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Totals */}
          <Divider sx={{ mt: 1, mb: 2 }} />
          <Box sx={{ ml: "auto", maxWidth: 260 }}>
            {[
              ["Subtotal", invoice.subtotal],
              ["Tax (12%)", invoice.tax],
              ["Shipping", invoice.shipping],
            ].map(([label, val]) => (
              <Box key={label as string} sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
                <Typography variant="body2" color="text.secondary">{label}</Typography>
                <Typography variant="body2">
                  {(val as number) === 0 ? "Free" : `$${(val as number).toFixed(2)}`}
                </Typography>
              </Box>
            ))}
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography fontWeight={700}>Total</Typography>
              <Typography fontWeight={700} fontSize="1.1rem">${invoice.total.toFixed(2)}</Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
