#!/bin/sh
set -e

# If command starts with an option, prepend postgres
if [ "${1:0:1}" = '-' ]; then
	set -- postgres "$@"
fi

if [ "$1" = 'postgres' ]; then
    # Initialize DB if not exists
    if [ ! -s "/var/lib/postgresql/data/PG_VERSION" ]; then
        echo "Initializing Database..."
        initdb -D /var/lib/postgresql/data
        
        # Configure to listen on all interfaces
        echo "host all  all    0.0.0.0/0  md5" >> /var/lib/postgresql/data/pg_hba.conf
        echo "listen_addresses='*'" >> /var/lib/postgresql/data/postgresql.conf
        
        # Start temp server to create user/db
        pg_ctl -D /var/lib/postgresql/data -o "-c listen_addresses=''" -w start
        
        echo "Creating User and Database..."
        psql -v ON_ERROR_STOP=1 --username "postgres" <<-EOSQL
            ALTER USER postgres WITH PASSWORD '$POSTGRES_PASSWORD';
            CREATE DATABASE $POSTGRES_DB;
            GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DB TO postgres;
EOSQL
        
        pg_ctl -D /var/lib/postgresql/data -m fast -w stop
    fi
fi

exec "$@"
