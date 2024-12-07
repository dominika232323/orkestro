FROM postgres:17-alpine

COPY postgresql.conf /etc/postgresql/
COPY pg_hba.conf /etc/postgresql/

COPY init-slave.sh /docker-entrypoint-initdb.d/init-slave.sh
RUN chmod +x /docker-entrypoint-initdb.d/init-slave.sh