#!/bin/bash

migration_name=${1:-generated}

echo Generating Migrations: $migration_name
npm run typeorm-d migration:generate -- ./database/migrations/$migration_name