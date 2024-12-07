FROM postgres:17-alpine

WORKDIR /db

COPY init.sql /docker-entrypoint-initdb.d/init.template.sql

RUN envsubst '${REPLICATOR_PASSWORD}' < /docker-entrypoint-initdb.d/init.template.sql > /docker-entrypoint-initdb.d/init.sql

COPY postgresql.conf /etc/postgresql/postgresql.conf

CMD ["postgres", "-c", "config_file=/etc/postgresql/postgresql.conf"]