#!/bin/bash
docker run -itd --name gmc_rabbitmq2 -p 5672:5672 -p 15672:15672 rabbitmq:3-management

docker exec gmc_rabbitmq rabbitmqctl status
