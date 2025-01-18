cd ../..
. ./.env

docker compose up orkestro-db-slave-setup
docker compose down orkestro-db-slave-setup --rmi all
docker compose up orkestro-db-slave -d
