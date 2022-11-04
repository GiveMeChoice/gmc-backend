#!/bin/bash

echo 'CONNECTED TO gmc_db'
docker exec -i gmc_postgres psql -U postgres gmc_db