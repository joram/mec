#!/usr/bin/env bash
# Regenerate seed files from a running mec-db-1 container.
#
# Outputs two files:
#   db/seed.sql        – full schema + data dump for fresh (empty) databases.
#                        Postgres loads this automatically via initdb when the
#                        pgdata volume is brand-new.
#   db/items_seed.sql  – items-only idempotent dump.
#                        Truncates item tables then re-inserts, safe to run on
#                        an existing DB that already has the schema.  Used by
#                        the db-seed docker-compose service on every startup.
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
CONTAINER="${1:-mec-db-1}"

# ── seed.sql (full dump for fresh volumes) ────────────────────────────────────
OUT_FULL="$DIR/seed.sql"
echo "▸ Dumping full schema + data (excluding item_images blobs)..."
docker exec "$CONTAINER" pg_dump \
  -U mec --no-owner --no-acl \
  --exclude-table-data=item_images \
  mec > "$OUT_FULL"

{
  printf "\n-- item_images metadata: blobs are NULL and lazy-loaded on first image request\n"
  printf "COPY public.item_images (id, item_id, url, data, content_type, is_primary, sort_order) FROM stdin;\n"
  docker exec "$CONTAINER" psql -U mec -t -A -c \
    "COPY (SELECT id::text, item_id::text, url, NULL::bytea, content_type, is_primary::text, sort_order::text FROM item_images ORDER BY sort_order) TO STDOUT"
  printf "\\\\.\n\n"
} >> "$OUT_FULL"
echo "✓ full dump: $(wc -l < "$OUT_FULL") lines · $(du -sh "$OUT_FULL" | cut -f1)"

# ── items_seed.sql (idempotent items-only, for existing schemas) ──────────────
OUT_ITEMS="$DIR/items_seed.sql"
echo "▸ Generating idempotent items_seed.sql..."
{
  echo "-- Idempotent items + image-metadata seed."
  echo "-- Safe to run on any DB that already has the schema."
  echo "-- Clears item-related tables then re-imports all catalogue data."
  echo ""

  printf "BEGIN;\n\n"

  # Truncate in dependency order (item_images + cart/invoice lines reference items)
  printf "TRUNCATE public.item_images, public.invoice_items, public.cart_items, public.items CASCADE;\n\n"

  # Items rows
  printf "COPY public.items (id, product_code, name, description, categories, tech_specs, img_urls, price, source_url) FROM stdin;\n"
  docker exec "$CONTAINER" psql -U mec -t -A -c \
    "COPY (SELECT id::text, product_code, name, description, categories::text, tech_specs::text, img_urls::text, price::text, source_url FROM items ORDER BY name) TO STDOUT"
  printf "\\\\.\n\n"

  # item_images metadata (no blobs)
  printf "COPY public.item_images (id, item_id, url, data, content_type, is_primary, sort_order) FROM stdin;\n"
  docker exec "$CONTAINER" psql -U mec -t -A -c \
    "COPY (SELECT id::text, item_id::text, url, NULL::bytea, content_type, is_primary::text, sort_order::text FROM item_images ORDER BY sort_order) TO STDOUT"
  printf "\\\\.\n\n"

  printf "COMMIT;\n"
} > "$OUT_ITEMS"
echo "✓ items dump: $(wc -l < "$OUT_ITEMS") lines · $(du -sh "$OUT_ITEMS" | cut -f1)"
