# Load environment variables
Get-Content .env | ForEach-Object {
    $name, $value = $_ -split '=', 2
    Set-Item -Path "env:\$name" -Value $value
}

# Start the database container
docker compose up orkestro-db-master -d

# Wait for PostgreSQL to be ready
while (-not (docker exec -it orkestro-db-master sh -c "pg_isready -d $env:POSTGRES_DB")) {
    Start-Sleep -Seconds 1
}

# Run backend migration
docker compose up orkestro-backend-migrate
docker compose down orkestro-backend-migrate --rmi all

# Create replication user
docker exec -it orkestro-db-master psql -U $env:POSTGRES_MASTER_USER -d $env:POSTGRES_DB -c "CREATE USER $env:POSTGRES_SLAVE_USER WITH REPLICATION LOGIN PASSWORD '$env:POSTGRES_SLAVE_PASSWORD';"
docker exec -it orkestro-db-master psql -U $env:POSTGRES_MASTER_USER -d $env:POSTGRES_DB -c "GRANT pg_read_all_data TO $env:POSTGRES_SLAVE_USER;"

# Update PostgreSQL configuration
docker exec -it orkestro-db-master sh -c "echo 'host replication $env:POSTGRES_SLAVE_USER 0.0.0.0/0 scram-sha-256' >> /var/lib/postgresql/data/pg_hba.conf"
docker exec -it orkestro-db-master sh -c "echo 'wal_log_hints = on' >> /var/lib/postgresql/data/postgresql.conf"
docker exec -it orkestro-db-master sh -c "echo 'hot_standby = on' >> /var/lib/postgresql/data/postgresql.conf"

# Reload PostgreSQL configuration
docker exec -it orkestro-db-master psql -U $env:POSTGRES_MASTER_USER -d $env:POSTGRES_DB -c "SELECT pg_reload_conf();"
