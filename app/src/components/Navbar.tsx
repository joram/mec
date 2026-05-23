import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  InputBase,
  IconButton,
  Badge,
  Box,
  Button,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Drawer,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from "@mui/icons-material/Person";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { styled, alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useCartStore } from "../store/useCartStore";
import { gravatarUrl } from "../utils/gravatar";
import { useThemeMode } from "../context/ThemeContext";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": { backgroundColor: alpha(theme.palette.common.white, 0.25) },
  marginLeft: theme.spacing(2),
  width: "auto",
  flexGrow: 1,
  maxWidth: 480,
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  display: "flex",
  alignItems: "center",
  pointerEvents: "none",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    width: "100%",
  },
}));

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { cart } = useCartStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { mode, toggleTheme } = useThemeMode();

  const [searchVal, setSearchVal] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const cartCount = cart?.total_items ?? 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  const handleUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    handleCloseMenu();
    navigate("/");
  };

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ gap: 1 }}>
        {isMobile && (
          <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
            <MenuIcon />
          </IconButton>
        )}

        <Typography
          variant="h6"
          component="a"
          onClick={() => navigate("/")}
          sx={{
            fontWeight: 800,
            fontSize: "1.3rem",
            letterSpacing: "0.04em",
            cursor: "pointer",
            color: "inherit",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          GOS
        </Typography>

        <form onSubmit={handleSearch} style={{ flexGrow: 1, maxWidth: 480, marginLeft: 16 }}>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search gear…"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              inputProps={{ "aria-label": "search" }}
            />
          </Search>
        </form>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, ml: "auto" }}>
          {!isMobile && (
            <>
              <Button color="inherit" size="small" onClick={() => navigate("/")}>
                Shop
              </Button>
            </>
          )}

          <IconButton color="inherit" onClick={toggleTheme} title={`Switch to ${mode === "light" ? "dark" : "light"} mode`}>
            {mode === "light" ? <Brightness4Icon /> : <Brightness7Icon />}
          </IconButton>

          <IconButton color="inherit" onClick={() => navigate("/cart")}>
            <Badge badgeContent={cartCount} color="secondary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>

          {user ? (
            <>
              <IconButton color="inherit" onClick={handleUserMenu} sx={{ p: 0.5 }}>
                <Avatar
                  src={gravatarUrl(user.email, 56)}
                  alt={user.username}
                  sx={{ width: 30, height: 30, border: "2px solid rgba(255,255,255,0.4)" }}
                />
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}
                PaperProps={{ sx: { minWidth: 220 } }}
              >
                {/* User identity header */}
                <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Avatar src={gravatarUrl(user.email, 80)} alt={user.username} sx={{ width: 40, height: 40 }} />
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{user.username}</Typography>
                    <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                  </Box>
                </Box>
                <Divider />
                <MenuItem onClick={() => { handleCloseMenu(); navigate("/purchases"); }}>
                  <ListItemIcon><ReceiptLongIcon fontSize="small" /></ListItemIcon>
                  Purchases
                </MenuItem>
                <MenuItem onClick={() => { handleCloseMenu(); navigate("/settings"); }}>
                  <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                  Settings
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
                  <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                  Sign out
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              color="inherit"
              startIcon={<PersonIcon />}
              onClick={() => navigate("/login")}
              size="small"
            >
              {!isMobile && "Sign in"}
            </Button>
          )}
        </Box>
      </Toolbar>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 240, pt: 2 }}>
          <Typography variant="h6" sx={{ px: 2, pb: 1, fontWeight: 800, color: "primary.main" }}>
            GOS
          </Typography>
          <MenuItem onClick={() => { navigate("/"); setDrawerOpen(false); }}>Shop All</MenuItem>
          <MenuItem onClick={() => { navigate("/cart"); setDrawerOpen(false); }}>Cart ({cartCount})</MenuItem>
          {!user && (
            <MenuItem onClick={() => { navigate("/login"); setDrawerOpen(false); }}>Sign In</MenuItem>
          )}
        </Box>
      </Drawer>
    </AppBar>
  );
}
