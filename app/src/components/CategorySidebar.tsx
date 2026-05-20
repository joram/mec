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

// Two paths are equal when every segment matches.
function pathsEqual(a: string[] | null, b: string[] | null): boolean {
  if (a === null && b === null) return true;
  if (!a || !b || a.length !== b.length) return false;
  return a.every((seg, i) => seg === b[i]);
}

// True if `selected` is this node or any descendant of it (used to auto-expand).
function containsSelected(node: CategoryNode, nodePath: string[], selected: string[] | null): boolean {
  if (!selected) return false;
  if (pathsEqual(nodePath, selected)) return true;
  return node.children.some((child) =>
    containsSelected(child, [...nodePath, child.name], selected)
  );
}

interface TreeNodeProps {
  node: CategoryNode;
  /** Full path from the tree root down to (and including) this node */
  nodePath: string[];
  depth: number;
  selected: string[] | null;
  onSelect: (path: string[]) => void;
}

function CategoryTreeNode({ node, nodePath, depth, selected, onSelect }: TreeNodeProps) {
  const hasChildren = node.children.length > 0;
  const isSelected = pathsEqual(nodePath, selected);

  const [open, setOpen] = useState(() => containsSelected(node, nodePath, selected));

  useEffect(() => {
    if (containsSelected(node, nodePath, selected)) setOpen(true);
  }, [selected]);

  const handleClick = () => {
    onSelect(nodePath);
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
                nodePath={[...nodePath, child.name]}
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

interface Props {
  selected: string[] | null;
  onSelect: (path: string[] | null) => void;
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
        <ListItemButton
          selected={selected === null}
          onClick={() => onSelect(null)}
          dense
          sx={{ pl: "8px", borderRadius: "4px", mb: "1px", minHeight: 32 }}
        >
          <ListItemText
            primary="All Products"
            primaryTypographyProps={{
              variant: "body2",
              fontWeight: selected === null ? 700 : 600,
              fontSize: "0.85rem",
            }}
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
                nodePath={[root.name]}
                depth={0}
                selected={selected}
                onSelect={onSelect}
              />
            ))}
      </List>
    </Box>
  );
}
