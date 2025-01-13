if [ ! -e "NOT_FIRST_STARTUP" ]; then
    touch "NOT_FIRST_STARTUP"
    docker-entrypoint.sh -c "initdb -D /var/lib/postgres/data"
    su postgres -c "pg_ctl -D /var/lib/postgresql/data -l logfile start"
    echo "CREATE USER ${POSTGRES_SLAVE_USER} WITH REPLICATION LOGIN PASSWORD '${POSTGRES_SLAVE_PASSWORD}';" >> /docker-entrypoint-initdb.d/1.sql
    su postgres -c "pg_ctl -D /var/lib/postgresql/data -l logfile stop"
    echo "host replication ${POSTGRES_SLAVE_USER} 0.0.0.0/0 scram-sha-256" >> /var/lib/postgresql/data/pg_hba.conf
    echo "wal_log_hints = on" >> /var/lib/postgresql/data/postgresql.conf
    echo "hot_standby = on" >> /var/lib/postgresql/data/postgresql.conf

fi
su postgres -c "pg_ctl -D /var/lib/postgresql/data -l logfile start"