# Build stage based on dhi.io/python
FROM dhi.io/python:3.13-dev as build-stage
USER root
RUN apt-get update && apt-get install -y curl ca-certificates && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Production stage based on dhi.io/python (running Node serve)
FROM dhi.io/python:3.13-dev as production-stage
USER root

# Install Node and serve package
RUN apt-get update && apt-get install -y curl ca-certificates && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g serve && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dist
COPY --from=build-stage /app/dist /app/dist

# Permissions
RUN chown -R nonroot:nonroot /app

USER nonroot
EXPOSE 8080

CMD ["serve", "-s", "dist", "-l", "8080"]
