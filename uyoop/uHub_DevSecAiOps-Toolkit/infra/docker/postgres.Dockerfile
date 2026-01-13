# Hardened Postgres Image based on dhi.io/python (Debian)
FROM dhi.io/python:3.13-dev

USER root

# Install Postgres
RUN apt-get update && apt-get install -y postgresql postgresql-contrib && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Fix permissions
# Debian package creates 'postgres' user.
# Data dir
RUN mkdir -p /var/lib/postgresql/data && \
    chown -R postgres:postgres /var/lib/postgresql/data && \
    mkdir -p /run/postgresql && \
    chown -R postgres:postgres /run/postgresql

VOLUME /var/lib/postgresql/data

# Copy entrypoint
COPY infra/docker/postgres-entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

USER postgres
ENV PATH="/usr/lib/postgresql/15/bin:$PATH" 
# Note: Version 15 is explicitly added to path as 'postgresql' package usually installs latest stable.
# Depending on Debian version (Trixie), it might be 15 or 16. 
# We'll try to detect or add common paths.
ENV PATH="/usr/lib/postgresql/16/bin:/usr/lib/postgresql/15/bin:/usr/lib/postgresql/14/bin:$PATH"

EXPOSE 5432

ENTRYPOINT ["entrypoint.sh"]
CMD ["postgres"]
