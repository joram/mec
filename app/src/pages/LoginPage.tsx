import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Tab,
  Tabs,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register, loading } = useAuthStore();
  const [tab, setTab] = useState(0);
  const [error, setError] = useState("");

  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ username: "", email: "", password: "", confirm: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(loginForm.username, loginForm.password);
      navigate(-1);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Login failed");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (registerForm.password !== registerForm.confirm) {
      setError("Passwords do not match");
      return;
    }
    try {
      await register(registerForm.username, registerForm.email, registerForm.password);
      navigate("/");
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(Array.isArray(detail) ? detail.map((d: any) => d.msg).join(", ") : (detail ?? "Registration failed"));
    }
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Paper sx={{ p: { xs: 3, sm: 4 }, maxWidth: 420, width: "100%", borderRadius: 2 }} elevation={2}>
        <Typography variant="h5" fontWeight={700} textAlign="center" gutterBottom>
          GOS Account
        </Typography>

        <Tabs value={tab} onChange={(_, v) => { setTab(v); setError(""); }} variant="fullWidth" sx={{ mb: 3 }}>
          <Tab label="Sign In" />
          <Tab label="Register" />
        </Tabs>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {tab === 0 ? (
          <Box component="form" onSubmit={handleLogin} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Username"
              value={loginForm.username}
              onChange={(e) => setLoginForm((f) => ({ ...f, username: e.target.value }))}
              required
              autoFocus
              autoComplete="username"
            />
            <TextField
              label="Password"
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
              required
              autoComplete="current-password"
            />
            <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ mt: 1 }}>
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleRegister} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Username"
              value={registerForm.username}
              onChange={(e) => setRegisterForm((f) => ({ ...f, username: e.target.value }))}
              required
              autoFocus
              autoComplete="username"
            />
            <TextField
              label="Email"
              type="email"
              value={registerForm.email}
              onChange={(e) => setRegisterForm((f) => ({ ...f, email: e.target.value }))}
              required
              autoComplete="email"
            />
            <TextField
              label="Password"
              type="password"
              value={registerForm.password}
              onChange={(e) => setRegisterForm((f) => ({ ...f, password: e.target.value }))}
              required
              autoComplete="new-password"
              inputProps={{ minLength: 6 }}
            />
            <TextField
              label="Confirm Password"
              type="password"
              value={registerForm.confirm}
              onChange={(e) => setRegisterForm((f) => ({ ...f, confirm: e.target.value }))}
              required
              autoComplete="new-password"
            />
            <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ mt: 1 }}>
              {loading ? "Creating account…" : "Create Account"}
            </Button>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />
        <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
          By signing in you agree to GOS's terms of service.
        </Typography>
      </Paper>
    </Box>
  );
}
