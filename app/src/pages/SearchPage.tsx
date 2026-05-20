import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Pagination,
  Skeleton,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { itemsApi, ItemsPage } from "../api/client";
import ItemCard from "../components/ItemCard";

const PAGE_SIZE = 36;

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [data, setData] = useState<ItemsPage | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    setPage(1);
    itemsApi
      .search(q, 1, PAGE_SIZE)
      .then(setData)
      .finally(() => setLoading(false));
  }, [q]);

  useEffect(() => {
    if (!q || page === 1) return;
    setLoading(true);
    itemsApi
      .search(q, page, PAGE_SIZE)
      .then(setData)
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: "auto" }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Search results for "{q}"
      </Typography>
      {data && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {data.total.toLocaleString()} results
        </Typography>
      )}
      <Divider sx={{ mb: 3 }} />

      {loading ? (
        <Grid container spacing={1.5}>
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <Grid item xs={6} sm={4} md={3} lg={2} xl={2} key={i}>
              <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 1 }} />
            </Grid>
          ))}
        </Grid>
      ) : data && data.items.length > 0 ? (
        <Grid container spacing={1.5}>
          {data.items.map((item) => (
            <Grid item xs={6} sm={4} md={3} lg={2} xl={2} key={item.id}>
              <ItemCard item={item} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No results found for "{q}"
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try different keywords or browse all products.
          </Typography>
        </Box>
      )}

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
  );
}
