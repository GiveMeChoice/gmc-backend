#!/bin/bash
set -e

SERVER="gmc_rabbitmq"

echo "starting rabbitmq broker instance "
docker start $SERVER

#wait for rmq to start
sleep 6;

#show status
docker exec $SERVER rabbitmqctl status