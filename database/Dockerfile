# This dockerfile is for the master db
FROM postgres:17-alpine

ARG POSTGRES_DB
ARG INCLUDE_TEST_DATA

COPY tables.sql /docker-entrypoint-initdb.d/1.sql
COPY data.sql /docker-entrypoint-initdb.d/2.sql
COPY tables_test.sql /docker-entrypoint-initdb.d/3.sql

RUN sed -e "s/test_orkestrodb/test_${POSTGRES_DB}/g" /docker-entrypoint-initdb.d/3.sql
RUN cat /docker-entrypoint-initdb.d/1.sql >> /docker-entrypoint-initdb.d/3.sql
RUN if [ "$INCLUDE_TEST_DATA" == "false" ] ; then rm /docker-entrypoint-initdb.d/2.sql ; fi
