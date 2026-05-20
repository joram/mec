import React from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ItemSummary, itemsApi } from "../api/client";

interface Props {
  item: ItemSummary;
}

export default function ItemCard({ item }: Props) {
  const navigate = useNavigate();

  const imageUrl = item.primary_image_id
    ? itemsApi.imageUrl(item.id, item.primary_image_id)
    : null;

  const topCategory = item.categories.at(-1) ?? "";

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardActionArea
        onClick={() => navigate(`/items/${item.id}`)}
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "stretch" }}
      >
        <Box
          sx={{
            position: "relative",
            paddingTop: "75%",
            bgcolor: "#f0f0f0",
            overflow: "hidden",
          }}
        >
          {imageUrl ? (
            <CardMedia
              component="img"
              image={imageUrl}
              alt={item.name}
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "contain",
                p: 1,
              }}
            />
          ) : (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#bbb",
                fontSize: "3rem",
              }}
            >
              🏕️
            </Box>
          )}
        </Box>

        <CardContent sx={{ flexGrow: 1, pt: 1.5, pb: 1.5 }}>
          {topCategory && (
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em" }}
            >
              {topCategory}
            </Typography>
          )}
          <Typography
            variant="body1"
            fontWeight={600}
            sx={{
              mt: 0.25,
              lineHeight: 1.3,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item.name}
          </Typography>
          <Box sx={{ mt: 1 }}>
            {item.price != null ? (
              <Typography variant="h6" color="primary.main" fontWeight={700} fontSize="1.05rem">
                ${item.price.toFixed(2)}
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Price unavailable
              </Typography>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
