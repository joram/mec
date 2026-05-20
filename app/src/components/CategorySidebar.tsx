import React, { useEffect, useState } from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Skeleton,
} from "@mui/material";
import { itemsApi } from "../api/client";

interface Props {
  selected: string | null;
  onSelect: (cat: string | null) => void;
}

export default function CategorySidebar({ selected, onSelect }: Props) {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    itemsApi
      .categories()
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Typography variant="overline" sx={{ px: 2, color: "text.secondary", fontWeight: 700 }}>
        Categories
      </Typography>
      <List dense disablePadding>
        <ListItemButton
          selected={selected === null}
          onClick={() => onSelect(null)}
          sx={{ borderRadius: 1 }}
        >
          <ListItemText primary="All Products" />
        </ListItemButton>

        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <Box key={i} sx={{ px: 2, py: 0.5 }}>
                <Skeleton width="80%" />
              </Box>
            ))
          : categories.map((cat) => (
              <ListItemButton
                key={cat}
                selected={selected === cat}
                onClick={() => onSelect(cat)}
                sx={{ borderRadius: 1, pl: 2 }}
              >
                <ListItemText
                  primary={cat}
                  primaryTypographyProps={{ variant: "body2", noWrap: true }}
                />
              </ListItemButton>
            ))}
      </List>
    </Box>
  );
}
