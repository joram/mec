#!/usr/bin/env bash
# Regenerate db/seed.sql from a running mec-db-1 container.
# Dumps all data EXCEPT image blobs — those are lazy-loaded on first request.
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
OUT="$DIR/seed.sql"
CONTAINER="${1:-mec-db-1}"

echo "▸ Dumping schema + data (excluding item_images blobs)..."
docker exec "$CONTAINER" pg_dump \
  -U mec --no-owner --no-acl \
  --exclude-table-data=item_images \
  mec > "$OUT"

echo "▸ Appending item_images metadata rows (url/sort_order/flags, blobs omitted)..."
{
  printf "\n-- item_images metadata: blobs are NULL and lazy-loaded on first image request\n"
  printf "COPY public.item_images (id, item_id, url, data, content_type, is_primary, sort_order) FROM stdin;\n"
  # NULL bytea serialises as \N in Postgres COPY text format
  docker exec "$CONTAINER" psql -U mec -t -A -c \
    "COPY (SELECT id::text, item_id::text, url, NULL::bytea, content_type, is_primary::text, sort_order::text FROM item_images ORDER BY sort_order) TO STDOUT"
  printf "\\\\.\n\n"
} >> "$OUT"

echo "✓ $(wc -l < "$OUT") lines · $(du -sh "$OUT" | cut -f1)  →  $OUT"
