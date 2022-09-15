#!/bin/bash

migration_name=${1:-entity}

echo Generating Migrations: $migration_name
npm rum typeorm migration:create ./libs/database/migrations/Seed-$migration_name