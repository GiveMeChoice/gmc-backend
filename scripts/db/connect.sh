#!/bin/bash
echo 'CONNECTED TO gmc_db'
docker exec -i gmc_database_server psql -U postgres gmc_db