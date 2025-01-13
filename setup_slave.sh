. ./.env

#docker compose build orkestro-db-slave
#docker build -t orkestro-db-slave -f ./database/dockerfile_master . # put in args
#
#docker run --name orkestro-db-slave --entrypoint "/usr/local/bin/docker-entrypoint.sh" -d \
#    -e "POSTGRES_DB=${POSTGRES_DB}" \
#    -e "POSTGRES_USER=${POSTGRES_SLAVE_USER}" \
#    -e "POSTGRES_PASSWORD=${POSTGRES_SLAVE_PASSWORD}" \
#    orkestro-db-slave
#
#docker exec -it orkestro-db-slave /bin/sh -c "until pg_isready -d ${POSTGRES_DB} ; do sleep 1 ; done"
#docker exec -it orkestro-db-slave /bin/sh -c "echo \"primary_conninfo = 'host=${DJANGO_DB_MASTER_HOST} port=${DJANGO_DB_MASTER_PORT} \
#    user=${POSTGRES_SLAVE_USER} password=${POSTGRES_SLAVE_PASSWORD}'\" >> /var/lib/postgresql/data/postgresql.conf"
#
#docker compose down orkestro-db-slave
#
## build image,
## TODO: migrate db ?
#
#ENTRYPOINT chmod -R 0700 /var/lib/postgresql/data ; \
#           until pg_basebackup -D /var/lib/postgresql/data -h ${DJANGO_DB_MASTER_HOST} -p ${DJANGO_DB_MASTER_PORT} \
#               -U ${POSTGRES_SLAVE_USER} -w -X stream -R -C -S replication_slot ; \
#           do echo 'Connecting to master' ; sleep 1 ; done ; \
#           postgres

docker compose up orkestro-db-slave-setup -d

docker exec -it orkestro-db-slave /bin/sh -c "until pg_isready -d ${POSTGRES_DB} ; do sleep 1 ; done"
docker exec -it orkestro-db-slave /bin/sh -c "chmod -R 0700 /var/lib/postgresql/data"
docker exec -it orkestro-db-slave /bin/sh -c "echo \"primary_conninfo = 'host=${DJANGO_DB_MASTER_HOST} port=${DJANGO_DB_MASTER_PORT} \
    user=${POSTGRES_SLAVE_USER} password=${POSTGRES_SLAVE_PASSWORD}'\" >> /var/lib/postgresql/data/postgresql.conf"
#docker exec -it orkestro-db-slave /bin/sh -c "mkdir -p /home/postgres"
#docker exec -it orkestro-db-slave /bin/sh -c "echo ${DJANGO_DB_MASTER_HOST}:${DJANGO_DB_MASTER_PORT}:replication:${POSTGRES_SLAVE_USER}:${POSTGRES_SLAVE_PASSWORD} > /home/postgres/.pgdata"

# dbname=${POSTGRES_DB}

docker compose stop orkestro-db-slave-setup
docker compose up orkestro-db-slave-setup -d

docker exec -it orkestro-db-slave /bin/sh -c "until pg_basebackup -h ${DJANGO_DB_MASTER_HOST} -p ${DJANGO_DB_MASTER_PORT} \
    -D /var/lib/postgresql/data -U ${POSTGRES_SLAVE_USER} -w -X stream -R -C -S replication_slot ; \
    do echo 'Connecting to master' ; sleep 1 ; done ;"

docker compose stop orkestro-db-slave-setup
# docker compose down orkestro-db-slave-setup --rmi all
