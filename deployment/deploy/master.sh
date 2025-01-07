#!/bin/bash
cd /home/azureuser/orkestro/
source .env

cat > database/tables_test.sql << EOT
CREATE DATABASE test_orkestrodb;
\c test_orkestrodb

EOT
sed -e "s/test_orkestrodb/test_${POSTGRES_DB}/g" database/tables_test.sql
cat database/tables.sql >> database/tables_test.sql

sudo docker compose up orkestro-db-master -d

sleep 10 # while ! sudo docker exec -it orkestro-db-master pg_isready -U ${POSTGRES_USER} ; do sleep 1; done TODO:
