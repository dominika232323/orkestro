#!/bin/bash

set -e

# Czekamy aż master będzie gotowy
until pg_isready -h "$REPLICATE_FROM" -U "$REP_USER" > /dev/null 2>&1; do
    echo "Czekam na dostępność mastera..."
    sleep 2
done

pg_basebackup -h $REPLICATE_FROM -D /var/lib/postgresql/data -U $REP_USER -Fp -Xs -P -R

