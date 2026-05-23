#!/bin/sh
# Idempotent catalogue seed.  Handles three states:
#   1. Brand-new empty volume  → schema + data via seed.sql
#   2. Schema exists, < 100 items → truncate + reimport via items_seed.sql
#   3. Schema exists, >= 100 items → skip (already seeded)
set -e

echo "db-seed: waiting for postgres..."
until psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; do
  sleep 2
done

# Check whether the items table exists yet
TABLE_EXISTS=$(psql "$DATABASE_URL" -t -c \
  "SELECT COUNT(*) FROM information_schema.tables \
   WHERE table_schema='public' AND table_name='items';" \
  | tr -d ' \n')

if [ "$TABLE_EXISTS" = "0" ]; then
  echo "db-seed: schema not found — running full seed.sql..."
  psql "$DATABASE_URL" -f /seed.sql
  NEW=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM items;" | tr -d ' \n')
  echo "db-seed: done — $NEW items loaded from seed.sql"
  exit 0
fi

COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM items;" | tr -d ' \n')
echo "db-seed: item count = $COUNT"

if [ "$COUNT" -lt 100 ]; then
  echo "db-seed: catalogue sparse — reseeding via items_seed.sql..."
  psql "$DATABASE_URL" -f /items_seed.sql
  NEW=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM items;" | tr -d ' \n')
  echo "db-seed: done — $NEW items loaded"
else
  echo "db-seed: catalogue already loaded ($COUNT items), skipping"
fi
