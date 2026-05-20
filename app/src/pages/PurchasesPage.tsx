import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Button,
} from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { useNavigate } from "react-router-dom";
import { invoicesApi, InvoiceSummary } from "../api/client";
import { useAuthStore } from "../store/useAuthStore";

const STATUS_COLORS: Record<string, "success" | "info" | "warning" | "error" | "default"> = {
  completed: "success",
  shipped: "info",
  processing: "warning",
  cancelled: "error",
};

export default function PurchasesPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    invoicesApi
      .list()
      .then(setInvoices)
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <Box sx={{ textAlign: "center", py: 10 }}>
        <Typography variant="h5" gutterBottom>Sign in to view your purchases</Typography>
        <Button variant="contained" onClick={() => navigate("/login")}>Sign In</Button>
      </Box>
    );
  }

  if (loading) {
    return <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Purchases</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Your order history
      </Typography>

      {invoices.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <ReceiptLongIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" gutterBottom>No orders yet</Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Head to Settings to generate some sample orders, or start shopping!
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 2 }}>
            <Button variant="contained" onClick={() => navigate("/")}>Shop Now</Button>
            <Button variant="outlined" onClick={() => navigate("/settings")}>Settings</Button>
          </Box>
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ "& th": { fontWeight: 700, bgcolor: "grey.50" } }}>
                <TableCell>Order #</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow
                  key={inv.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate(`/purchases/${inv.id}`)}
                >
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace" color="text.secondary">
                      #{inv.id.slice(0, 8).toUpperCase()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(inv.created_at).toLocaleDateString("en-CA", {
                      year: "numeric", month: "short", day: "numeric",
                    })}
                  </TableCell>
                  <TableCell>{inv.item_count} item{inv.item_count !== 1 ? "s" : ""}</TableCell>
                  <TableCell>
                    <Chip
                      label={inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                      color={STATUS_COLORS[inv.status] ?? "default"}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={600}>${inv.total.toFixed(2)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Button size="small" variant="text">View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
