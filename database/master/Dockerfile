FROM postgres:17-alpine

COPY postgresql.conf /etc/postgresql/
COPY pg_hba.conf /etc/postgresql/
COPY repuser.sql /docker-entrypoint-initdb.d/repuser.sql
