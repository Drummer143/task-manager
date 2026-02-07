#!/bin/bash
set -e

echo 'Creating uuid-ossp extension...'
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EOSQL

echo 'Creating authentik user and database...'
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER authentik WITH PASSWORD 'authentik';
    CREATE DATABASE authentik OWNER authentik;
    GRANT ALL PRIVILEGES ON DATABASE authentik TO authentik;
EOSQL

echo 'DB init complete'
