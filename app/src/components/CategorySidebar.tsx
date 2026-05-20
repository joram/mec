import React, { useEffect, useState } from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Collapse,
  Typography,
  Skeleton,
} from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { itemsApi, CategoryNode } from "../api/client";

interface TreeNodeProps {
  node: CategoryNode;
  depth: number;
  selected: string | null;
  onSelect: (cat: string) => void;
  /** Nodes whose name matches an ancestor of `selected` start expanded */
  initiallyOpen?: boolean;
}

function CategoryTreeNode({ node, depth, selected, onSelect, initiallyOpen = false }: TreeNodeProps) {
  const hasChildren = node.children.length > 0;
  const isSelected = selected === node.name;

  // Auto-expand if this node or any descendant is selected
  const [open, setOpen] = useState(() => initiallyOpen || isSelectedDescendant(node, selected));

  // Re-check when selection changes
  useEffect(() => {
    if (isSelectedDescendant(node, selected)) setOpen(true);
  }, [selected]);

  const handleClick = () => {
    onSelect(node.name);
    if (hasChildren) setOpen((o) => !o);
  };

  const indent = 8 + depth * 14;

  return (
    <>
      <ListItemButton
        selected={isSelected}
        onClick={handleClick}
        dense
        sx={{
          pl: `${indent}px`,
          pr: 1,
          borderRadius: "4px",
          mb: "1px",
          minHeight: 32,
          "& .MuiListItemIcon-root": { minWidth: 20 },
        }}
      >
        {/* Leaf dot / expand-collapse chevron */}
        <ListItemIcon>
          {hasChildren ? (
            open ? (
              <ExpandLessIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            ) : (
              <ExpandMoreIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            )
          ) : (
            <FiberManualRecordIcon
              sx={{ fontSize: 5, color: isSelected ? "primary.main" : "text.disabled" }}
            />
          )}
        </ListItemIcon>

        <ListItemText
          primary={node.name}
          primaryTypographyProps={{
            variant: "body2",
            noWrap: true,
            fontWeight: isSelected ? 700 : depth === 0 ? 600 : 400,
            color: isSelected ? "primary.main" : "text.primary",
            fontSize: depth === 0 ? "0.85rem" : "0.8rem",
          }}
        />
      </ListItemButton>

      {hasChildren && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List disablePadding>
            {node.children.map((child) => (
              <CategoryTreeNode
                key={child.name}
                node={child}
                depth={depth + 1}
                selected={selected}
                onSelect={onSelect}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
}

function isSelectedDescendant(node: CategoryNode, selected: string | null): boolean {
  if (!selected) return false;
  if (node.name === selected) return true;
  return node.children.some((c) => isSelectedDescendant(c, selected));
}

interface Props {
  selected: string | null;
  onSelect: (cat: string | null) => void;
}

export default function CategorySidebar({ selected, onSelect }: Props) {
  const [tree, setTree] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    itemsApi
      .categoryTree()
      .then(setTree)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Typography
        variant="overline"
        sx={{ px: "8px", color: "text.secondary", fontWeight: 700, display: "block", mb: 0.5 }}
      >
        Categories
      </Typography>

      <List dense disablePadding>
        {/* All Products reset */}
        <ListItemButton
          selected={selected === null}
          onClick={() => onSelect(null)}
          dense
          sx={{ pl: "8px", borderRadius: "4px", mb: "1px", minHeight: 32 }}
        >
          <ListItemText
            primary="All Products"
            primaryTypographyProps={{ variant: "body2", fontWeight: selected === null ? 700 : 600, fontSize: "0.85rem" }}
          />
        </ListItemButton>

        {loading
          ? Array.from({ length: 10 }).map((_, i) => (
              <Box key={i} sx={{ px: 1, py: "3px" }}>
                <Skeleton width={`${55 + (i % 4) * 10}%`} height={18} />
              </Box>
            ))
          : tree.map((root) => (
              <CategoryTreeNode
                key={root.name}
                node={root}
                depth={0}
                selected={selected}
                onSelect={onSelect}
              />
            ))}
      </List>
    </Box>
  );
}
