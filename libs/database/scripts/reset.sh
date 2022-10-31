#!/bin/bash

set -e

SERVER="gmc_database_server";
PW="password";
DB="gmc_db";

echo "stop & remove old docker [$SERVER] and starting new fresh instance of [$SERVER]"
(docker kill $SERVER || :) && \
  (docker rm $SERVER || :) && \
  docker run --name $SERVER -e POSTGRES_PASSWORD=$PW \
  -e PGPASSWORD=$PW \
  -p 5432:5432 \
  -d postgres

# wait for pg to start
echo "wait for pg-server [$SERVER] to start";
sleep 3;

# create the db 
echo "CREATE DATABASE $DB ENCODING 'UTF-8';" | docker exec -i $SERVER psql -U postgres
echo "\l" | docker exec -i $SERVER psql -U postgres
docker exec -i $SERVER psql -U postgres $DB -c "\dt"

# show result
echo "DATABASE $DB RESET"

# generate initial migrations file
echo "GENERATING init MIGRATIONS"
bash ./libs/database/scripts/migration-generate.sh init