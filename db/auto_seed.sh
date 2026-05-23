#!/bin/sh
# Idempotent catalogue seed.
# Runs at startup: checks item count, seeds only when catalogue is sparse.
set -e

echo "db-seed: waiting for postgres..."
until psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; do
  sleep 2
done

COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM items;" 2>/dev/null | tr -d ' \n' || echo 0)
echo "db-seed: item count = $COUNT"

if [ "$COUNT" -lt 100 ]; then
  echo "db-seed: seeding catalogue from items_seed.sql..."
  psql "$DATABASE_URL" -f /items_seed.sql
  NEW=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM items;" | tr -d ' \n')
  echo "db-seed: done — $NEW items loaded"
else
  echo "db-seed: catalogue already loaded ($COUNT items), skipping"
fi
