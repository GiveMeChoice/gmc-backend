#!/bin/bash
set -e

SERVER="gmc_database_server";
PW="password";
DB="gmc_db";

echo "starting database server instance [$SERVER]";
docker start $SERVER

# wait for pg to start
sleep 3;

# show existing schema
docker exec -i $SERVER psql -U postgres $DB -c "\dt"

echo "DATABASE $DB STARTED"