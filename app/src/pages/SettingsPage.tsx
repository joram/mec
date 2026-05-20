import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Slider,
  Alert,
  Divider,
  CircularProgress,
} from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { useNavigate } from "react-router-dom";
import { invoicesApi } from "../api/client";
import { useAuthStore } from "../store/useAuthStore";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  if (!user) {
    return (
      <Box sx={{ textAlign: "center", py: 10 }}>
        <Typography variant="h5" gutterBottom>Sign in to access settings</Typography>
        <Button variant="contained" onClick={() => navigate("/login")}>Sign In</Button>
      </Box>
    );
  }

  const handleSeedInvoices = async () => {
    setLoading(true);
    setResult(null);
    try {
      const created = await invoicesApi.seedFake(count);
      setResult({ ok: true, msg: `Created ${created.length} fake invoice${created.length !== 1 ? "s" : ""}!` });
    } catch (e: any) {
      const detail = e?.response?.data?.detail ?? "Something went wrong";
      setResult({ ok: false, msg: detail });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 640, mx: "auto", p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Settings</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Signed in as <strong>{user.username}</strong> ({user.email})
      </Typography>

      {/* Seed invoices */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <ReceiptLongIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>Seed fake purchases</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Generate sample order history using random items from the catalogue.
          Useful for testing the Purchases page.
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            Number of invoices: <strong>{count}</strong>
          </Typography>
          <Slider
            value={count}
            onChange={(_, v) => setCount(v as number)}
            min={1}
            max={20}
            step={1}
            marks={[
              { value: 1, label: "1" },
              { value: 5, label: "5" },
              { value: 10, label: "10" },
              { value: 20, label: "20" },
            ]}
            valueLabelDisplay="auto"
            sx={{ maxWidth: 360 }}
          />
        </Box>

        {result && (
          <Alert severity={result.ok ? "success" : "error"} sx={{ mb: 2 }}
            action={result.ok && (
              <Button size="small" color="inherit" onClick={() => navigate("/purchases")}>
                View
              </Button>
            )}
          >
            {result.msg}
          </Alert>
        )}

        <Button
          variant="contained"
          onClick={handleSeedInvoices}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ReceiptLongIcon />}
        >
          {loading ? "Generating…" : `Generate ${count} invoice${count !== 1 ? "s" : ""}`}
        </Button>
      </Paper>

      <Divider sx={{ my: 3 }} />
      <Typography variant="caption" color="text.secondary">
        More settings coming soon.
      </Typography>
    </Box>
  );
}
