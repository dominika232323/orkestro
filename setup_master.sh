. ./.env

docker compose up orkestro-db-master -d

docker exec -it orkestro-db-master /bin/sh -c "until pg_isready -d ${POSTGRES_DB} ; do sleep 1 ; done"

docker compose up orkestro-backend-migrate
docker compose down orkestro-backend-migrate --rmi all

docker exec -it orkestro-db-master psql -U ${POSTGRES_MASTER_USER} -d ${POSTGRES_DB} -c "CREATE USER ${POSTGRES_SLAVE_USER} WITH REPLICATION LOGIN PASSWORD '${POSTGRES_SLAVE_PASSWORD}';"
docker exec -it orkestro-db-master psql -U ${POSTGRES_MASTER_USER} -d ${POSTGRES_DB} -c "GRANT pg_read_all_data TO ${POSTGRES_SLAVE_USER};"

docker exec -it orkestro-db-master /bin/sh -c "echo \"host replication ${POSTGRES_SLAVE_USER} 0.0.0.0/0 scram-sha-256\" >> /var/lib/postgresql/data/pg_hba.conf"
docker exec -it orkestro-db-master /bin/sh -c "echo \"wal_log_hints = on\" >> /var/lib/postgresql/data/postgresql.conf"
docker exec -it orkestro-db-master /bin/sh -c "echo \"hot_standby = on\" >> /var/lib/postgresql/data/postgresql.conf"

docker exec -it orkestro-db-master psql -U ${POSTGRES_MASTER_USER} -d ${POSTGRES_DB} -c "SELECT pg_reload_conf()"
