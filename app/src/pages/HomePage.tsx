import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Grid,
  Typography,
  Pagination,
  CircularProgress,
  Skeleton,
  Divider,
  useMediaQuery,
  useTheme,
  Drawer,
  IconButton,
  Button,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { itemsApi, ItemSummary, ItemsPage } from "../api/client";
import ItemCard from "../components/ItemCard";
import CategorySidebar from "../components/CategorySidebar";

const PAGE_SIZE = 24;

export default function HomePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [data, setData] = useState<ItemsPage | null>(null);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const load = useCallback(async (pg: number, cat: string | null) => {
    setLoading(true);
    try {
      const result = await itemsApi.list(pg, PAGE_SIZE, cat ?? undefined);
      setData(result);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page, category);
  }, [page, category, load]);

  const handleCategoryChange = (cat: string | null) => {
    setCategory(cat);
    setPage(1);
    setFilterDrawerOpen(false);
  };

  const sidebar = (
    <CategorySidebar selected={category} onSelect={handleCategoryChange} />
  );

  return (
    <Box sx={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
      {/* Desktop sidebar */}
      {!isMobile && (
        <Box
          component="nav"
          sx={{
            width: 220,
            flexShrink: 0,
            borderRight: "1px solid",
            borderColor: "divider",
            py: 3,
            bgcolor: "background.paper",
          }}
        >
          {sidebar}
        </Box>
      )}

      {/* Mobile filter drawer */}
      <Drawer
        anchor="left"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
      >
        <Box sx={{ width: 260, py: 2 }}>{sidebar}</Box>
      </Drawer>

      {/* Main content */}
      <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
        {/* Header row */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
          {isMobile && (
            <Button
              startIcon={<FilterListIcon />}
              variant="outlined"
              size="small"
              onClick={() => setFilterDrawerOpen(true)}
            >
              Filters
            </Button>
          )}
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {category ?? "All Products"}
            </Typography>
            {data && (
              <Typography variant="body2" color="text.secondary">
                {data.total.toLocaleString()} products
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Grid */}
        {loading ? (
          <Grid container spacing={2}>
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <Grid item xs={6} sm={4} md={3} lg={3} key={i}>
                <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 1 }} />
              </Grid>
            ))}
          </Grid>
        ) : data && data.items.length > 0 ? (
          <Grid container spacing={2}>
            {data.items.map((item) => (
              <Grid item xs={6} sm={4} md={3} lg={3} key={item.id}>
                <ItemCard item={item} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No products found
            </Typography>
          </Box>
        )}

        {/* Pagination */}
        {data && data.total > PAGE_SIZE && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Pagination
              count={Math.ceil(data.total / PAGE_SIZE)}
              page={page}
              onChange={(_, p) => setPage(p)}
              color="primary"
              size={isMobile ? "small" : "medium"}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
