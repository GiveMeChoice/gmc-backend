#!/bin/bash
set -e

SERVER="gmc_rabbitmq"

echo "stop & remove old container [$SERVER] and starting new fresh instance"
(docker kill $SERVER || :) && \
  (docker rm $SERVER || :) && \
docker run -itd --name $SERVER -p 5672:5672 -p 15672:15672 rabbitmq:3-management

# wait for rmq to start
echo "wait for rmq-broker [$SERVER] to start"
sleep 6;

#show status
docker exec $SERVER rabbitmqctl status