#!/bin/bash

set -e

# Czekamy aż master będzie gotowy
until pg_isready -h "$REPLICATE_FROM" -U "$REP_USER" > /dev/null 2>&1; do
    echo "Czekam na dostępność mastera..."
    sleep 2
done

echo "$REP_PASS"

export PGPASSWORD=$REP_PASS
pg_basebackup -h $REPLICATE_FROM -D $PGDATA -U $REP_USER -Fp -Xs -P -R

